import type { AuthTokens } from '@helfy/shared';

export type AuthResult = AuthTokens & {
  refreshToken: string;
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
