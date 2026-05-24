import crypto from 'crypto';

import argon2 from 'argon2';
import { ERROR_CODES } from '@helfy/shared';

import type { User as DbUser } from '../../db/schema/users.js';
import { AppError } from '../../utils/AppError.js';
import { hashToken } from '../../utils/hash.js';
import {
  getRefreshTokenExpiry,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import { toUserDto } from '../../utils/user-mapper.js';
import { authRepository } from './repository.js';
import type { AuthResult, LoginInput, RegisterInput } from './types.js';

async function issueTokens(user: DbUser): Promise<AuthResult> {
  const familyId = crypto.randomUUID();
  const refreshToken = signRefreshToken({
    sub: user.id,
    role: user.role,
    familyId,
  });

  await authRepository.createRefreshToken({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    familyId,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken,
    user: toUserDto(user),
  };
}

async function rotateRefreshToken(
  rawRefreshToken: string,
): Promise<AuthResult> {
  let payload;

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    await authRepository.deleteRefreshTokensByFamilyId(payload.familyId);
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Refresh token reuse detected');
  }

  if (storedToken.expiresAt.getTime() < Date.now()) {
    await authRepository.deleteRefreshTokenById(storedToken.id);
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Refresh token expired');
  }

  const user = await authRepository.findUserById(payload.sub);

  if (!user) {
    await authRepository.deleteRefreshTokensByFamilyId(payload.familyId);
    throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'User not found');
  }

  await authRepository.deleteRefreshTokenById(storedToken.id);

  const newRefreshToken = signRefreshToken({
    sub: user.id,
    role: user.role,
    familyId: storedToken.familyId,
  });

  await authRepository.createRefreshToken({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    familyId: storedToken.familyId,
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken: newRefreshToken,
    user: toUserDto(user),
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await authRepository.findUserByEmail(input.email);

    if (existing) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'Email already registered');
    }

    const passwordHash = await argon2.hash(input.password);
    const userId = crypto.randomUUID();

    await authRepository.createUser({
      id: userId,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name.trim(),
    });

    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to create user');
    }

    return issueTokens(user);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await authRepository.findUserByEmail(input.email.toLowerCase().trim());

    if (!user) {
      throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, input.password);

    if (!valid) {
      throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Invalid email or password');
    }

    return issueTokens(user);
  },

  async refresh(rawRefreshToken: string | undefined): Promise<AuthResult> {
    if (!rawRefreshToken) {
      throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Refresh token missing');
    }

    return rotateRefreshToken(rawRefreshToken);
  },

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    await authRepository.deleteRefreshTokenByHash(hashToken(rawRefreshToken));
  },

  async logoutAll(userId: string): Promise<void> {
    await authRepository.deleteRefreshTokensByUserId(userId);
  },
};
