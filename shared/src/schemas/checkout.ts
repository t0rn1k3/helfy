import { z } from 'zod';

export const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required').max(255),
  line2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutShippingSchema = z.object({
  shippingAddress: addressSchema,
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
});

export type CheckoutShippingInput = z.infer<typeof checkoutShippingSchema>;

export const checkoutPaymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, 'Invalid card number')
    .transform((val) => val.replace(/\s/g, '')),
  expiryMonth: z.coerce.number().int().min(1).max(12),
  expiryYear: z.coerce.number().int().min(new Date().getFullYear()),
  cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  cardholderName: z.string().min(2).max(255),
});

export type CheckoutPaymentInput = z.infer<typeof checkoutPaymentSchema>;

export const checkoutSchema = checkoutShippingSchema.merge(checkoutPaymentSchema);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
