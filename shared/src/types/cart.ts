import type { Product } from './product.js';

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
}
