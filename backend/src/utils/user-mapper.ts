import type { User } from '@helfy/shared';

import type { User as DbUser } from '../db/schema/users.js';

export function toUserDto(user: DbUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
