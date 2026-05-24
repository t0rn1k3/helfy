import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { ERROR_CODES } from '@helfy/shared';

import { env } from '../config/env.js';

function rateLimitHandler(_req: Request, res: Response): void {
  res.status(429).json({
    success: false,
    error: 'Too many requests, please try again later',
    code: ERROR_CODES.RATE_LIMITED,
  });
}

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
