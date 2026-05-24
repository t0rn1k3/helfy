export const USER_ROLES = ['customer', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Public user shape — never includes passwordHash */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}
