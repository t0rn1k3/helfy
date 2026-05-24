import { z } from 'zod';

export { checkoutSchema } from '@helfy/shared';

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
