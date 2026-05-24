export const SHIPPING_RATES = {
  standard: 500,
  express: 1500,
} as const;

export const TAX_RATE = 0.08;

export function calculateOrderTotals(subtotal: number, shippingMethod: keyof typeof SHIPPING_RATES) {
  const shipping = SHIPPING_RATES[shippingMethod];
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  return { subtotal, shipping, tax, total };
}
