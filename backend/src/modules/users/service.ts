import crypto from 'crypto';

import argon2 from 'argon2';
import { ERROR_CODES } from '@helfy/shared';

import { AppError } from '../../utils/AppError.js';
import { toAddressDto } from '../../utils/mappers.js';
import { toUserDto } from '../../utils/user-mapper.js';
import { usersRepository } from './repository.js';
import type { AddressBody, ChangePasswordBody, UpdateProfileBody } from './types.js';

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }

    return toUserDto(user);
  },

  async updateProfile(userId: string, input: UpdateProfileBody) {
    if (!input.name && !input.email) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'No profile fields to update');
    }

    if (input.email) {
      const existing = await usersRepository.findByEmail(input.email.toLowerCase().trim());

      if (existing && existing.id !== userId) {
        throw new AppError(409, ERROR_CODES.CONFLICT, 'Email already in use');
      }
    }

    await usersRepository.updateProfile(userId, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.email ? { email: input.email.toLowerCase().trim() } : {}),
    });

    return usersService.getProfile(userId);
  },

  async changePassword(userId: string, input: ChangePasswordBody) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }

    const valid = await argon2.verify(user.passwordHash, input.currentPassword);

    if (!valid) {
      throw new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Current password is incorrect');
    }

    const passwordHash = await argon2.hash(input.newPassword);
    await usersRepository.updatePassword(userId, passwordHash);
  },

  async listAddresses(userId: string) {
    const rows = await usersRepository.findAddressesByUserId(userId);
    return rows.map(toAddressDto);
  },

  async createAddress(userId: string, input: AddressBody) {
    if (input.isDefault) {
      await usersRepository.clearDefaultAddresses(userId);
    }

    const id = crypto.randomUUID();

    await usersRepository.createAddress({
      id,
      userId,
      line1: input.line1.trim(),
      line2: input.line2?.trim() ?? null,
      city: input.city.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
      isDefault: input.isDefault ?? false,
    });

    const created = await usersRepository.findAddressByIdForUser(id, userId);

    if (!created) {
      throw new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to create address');
    }

    return toAddressDto(created);
  },

  async updateAddress(userId: string, addressId: string, input: AddressBody) {
    const existing = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!existing) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Address not found');
    }

    if (input.isDefault) {
      await usersRepository.clearDefaultAddresses(userId);
    }

    await usersRepository.updateAddress(addressId, {
      line1: input.line1.trim(),
      line2: input.line2?.trim() ?? null,
      city: input.city.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
      isDefault: input.isDefault ?? existing.isDefault,
    });

    const updated = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!updated) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Address not found');
    }

    return toAddressDto(updated);
  },

  async deleteAddress(userId: string, addressId: string) {
    const existing = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!existing) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Address not found');
    }

    await usersRepository.deleteAddress(addressId);
  },

  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!existing) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Address not found');
    }

    await usersRepository.clearDefaultAddresses(userId);
    await usersRepository.updateAddress(addressId, { isDefault: true });

    const updated = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!updated) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Address not found');
    }

    return toAddressDto(updated);
  },
};
