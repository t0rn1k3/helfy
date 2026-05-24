import crypto from 'crypto';

import { ERROR_CODES } from '@helfy/shared';

import { SHIPPING_RATES, TAX_RATE } from '../../config/constants.js';
import { AppError } from '../../utils/AppError.js';
import { toOrderDto, toOrderWithItemsDto } from '../../utils/mappers.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import { cartRepository } from '../cart/repository.js';
import { mockPaymentService } from './payment.service.js';
import { ordersRepository } from './repository.js';
import type { CreateOrderBody } from './types.js';

export const ordersService = {
  async createOrder(userId: string, input: CreateOrderBody) {
    const cart = await cartRepository.findByUserId(userId);

    if (!cart) {
      throw new AppError(422, ERROR_CODES.UNPROCESSABLE, 'Cannot checkout with empty cart');
    }

    const cartRows = await cartRepository.findItemsByCartId(cart.id);

    if (cartRows.length === 0) {
      throw new AppError(422, ERROR_CODES.UNPROCESSABLE, 'Cannot checkout with empty cart');
    }

    const subtotal = cartRows.reduce(
      (sum, row) => sum + row.item.priceSnapshot * row.item.quantity,
      0,
    );
    const shipping = SHIPPING_RATES[input.shippingMethod];
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + shipping + tax;

    await mockPaymentService.charge(total, input.cardholderName);

    const orderId = crypto.randomUUID();
    const orderItemsData = cartRows.map((row) => ({
      id: crypto.randomUUID(),
      productId: row.item.productId,
      productName: row.product.name,
      quantity: row.item.quantity,
      priceSnapshot: row.item.priceSnapshot,
    }));

    await ordersRepository.createOrderWithItems(
      {
        id: orderId,
        userId,
        status: 'confirmed',
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: input.shippingAddress,
      },
      orderItemsData,
      cart.id,
    );

    const order = await ordersRepository.findByIdForUser(orderId, userId);
    const items = await ordersRepository.findItemsByOrderId(orderId);

    if (!order) {
      throw new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to create order');
    }

    return toOrderWithItemsDto(order, items);
  },

  async listOrders(userId: string, page: number, limit: number) {
    const { items, total } = await ordersRepository.findByUserId(userId, page, limit);

    return {
      items: items.map(toOrderDto),
      pagination: buildPaginationMeta(page, limit, total),
    };
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await ordersRepository.findByIdForUser(orderId, userId);

    if (!order) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Order not found');
    }

    const items = await ordersRepository.findItemsByOrderId(orderId);
    return toOrderWithItemsDto(order, items);
  },
};
