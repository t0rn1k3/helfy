import type { CookieOptions, Request, Response } from 'express';

import { env } from '../../config/env.js';
import { REFRESH_TOKEN_COOKIE } from '../../config/constants.js';
import { ok } from '../../utils/response.js';
import { authService } from './service.js';
import type { LoginInput, RegisterInput } from './types.js';

function getRefreshCookieOptions(maxAgeMs?: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN,
    path: '/',
    ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
  };
}

function setRefreshCookie(res: Response, refreshToken: string): void {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions(maxAgeMs));
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshCookieOptions());
}

function sendAuthResponse(res: Response, result: Awaited<ReturnType<typeof authService.login>>) {
  setRefreshCookie(res, result.refreshToken);

  return ok(res, {
    accessToken: result.accessToken,
    user: result.user,
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = req.body as RegisterInput;
    const result = await authService.register(input);
    return sendAuthResponse(res, result);
  },

  async login(req: Request, res: Response) {
    const input = req.body as LoginInput;
    const result = await authService.login(input);
    return sendAuthResponse(res, result);
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined);
    return sendAuthResponse(res, result);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined);
    clearRefreshCookie(res);
    return ok(res, { loggedOut: true });
  },

  async logoutAll(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    await authService.logoutAll(req.user.id);
    clearRefreshCookie(res);
    return ok(res, { loggedOut: true });
  },
};
