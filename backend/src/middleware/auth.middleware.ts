import { ERROR_CODES } from '@helfy/shared';
import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Missing or invalid access token'));
    return;
  }

  const token = header.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, ERROR_CODES.UNAUTHORIZED, 'Invalid or expired access token'));
  }
}
