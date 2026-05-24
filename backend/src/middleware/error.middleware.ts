import { ERROR_CODES } from '@helfy/shared';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, ERROR_CODES.NOT_FOUND, 'Route not found'));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: ERROR_CODES.VALIDATION_ERROR,
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON body',
      code: ERROR_CODES.VALIDATION_ERROR,
    });
    return;
  }

  logger.error(
    {
      err,
      method: req.method,
      path: req.path,
      userId: req.user?.id,
    },
    'Unhandled error',
  );

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: ERROR_CODES.INTERNAL_ERROR,
  });
}
