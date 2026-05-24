import type { PaginationMeta } from '@helfy/shared';
import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200, message?: string): Response {
  return res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function paginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
): Response {
  return res.status(200).json({ success: true, data, pagination });
}
