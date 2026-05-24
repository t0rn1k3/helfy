import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

import { ERROR_CODES } from '@helfy/shared';

import { AppError } from '../utils/AppError.js';

type RequestSource = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(
        new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Validation failed', result.error.flatten()),
      );
      return;
    }

    req[source] = result.data;
    next();
  };
}
