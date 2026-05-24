import type { CartItemWithProduct, CartWithItems } from '@helfy/shared';

export function recalculateCart(cart: CartWithItems, items: CartItemWithProduct[]): CartWithItems {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

  return {
    ...cart,
    items,
    itemCount,
    subtotal,
  };
}
