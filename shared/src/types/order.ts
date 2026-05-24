import type { Address } from './address.js';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address | Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  priceSnapshot: number;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
