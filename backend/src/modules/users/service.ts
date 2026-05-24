import { ERROR_CODES } from '@helfy/shared';

import { AppError } from '../../utils/AppError.js';
import { toUserDto } from '../../utils/user-mapper.js';
import { usersRepository } from './repository.js';

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'User not found');
    }

    return toUserDto(user);
  },
};
