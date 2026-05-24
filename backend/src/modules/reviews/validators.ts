import { z } from 'zod';

export { createReviewSchema } from '@helfy/shared';

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
