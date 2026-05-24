import { eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { refreshTokens } from '../../db/schema/refresh-tokens.js';
import { users } from '../../db/schema/users.js';

export const authRepository = {
  findUserByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },

  findUserById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  createUser(data: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
  }) {
    return db.insert(users).values(data);
  },

  createRefreshToken(data: {
    id: string;
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }) {
    return db.insert(refreshTokens).values(data);
  },

  findRefreshTokenByHash(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });
  },

  deleteRefreshTokenById(id: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  },

  deleteRefreshTokenByHash(tokenHash: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  },

  deleteRefreshTokensByFamilyId(familyId: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.familyId, familyId));
  },

  deleteRefreshTokensByUserId(userId: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  },
};
