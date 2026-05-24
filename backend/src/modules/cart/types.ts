import type { AddToCartInput, UpdateCartItemInput } from '@helfy/shared';

export interface CartContext {
  userId?: string;
  sessionId?: string;
}

export type AddToCartBody = AddToCartInput;
export type UpdateCartItemBody = UpdateCartItemInput;
