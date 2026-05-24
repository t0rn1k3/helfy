import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../utils/jwt.js';

const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7));
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // Optional auth — invalid token is ignored
    }
  }

  next();
}

export function getSessionId(req: Request): string | undefined {
  const raw = req.headers['x-session-id'];

  if (typeof raw !== 'string') {
    return undefined;
  }

  const sessionId = raw.trim();

  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return undefined;
  }

  return sessionId;
}
