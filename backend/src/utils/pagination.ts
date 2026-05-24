import type { PaginationMeta } from '@helfy/shared';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
