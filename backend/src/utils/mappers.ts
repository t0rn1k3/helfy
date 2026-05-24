import type {
  Address,
  Cart,
  CartItem,
  CartItemWithProduct,
  CartWithItems,
  Category,
  Order,
  OrderItem,
  OrderWithItems,
  Product,
  ProductDetail,
  ProductImage,
  Review,
  ReviewWithUser,
} from '@helfy/shared';

import type { Address as DbAddress } from '../db/schema/addresses.js';
import type { Cart as DbCart } from '../db/schema/carts.js';
import type { CartItem as DbCartItem } from '../db/schema/cart-items.js';
import type { Category as DbCategory } from '../db/schema/categories.js';
import type { Order as DbOrder } from '../db/schema/orders.js';
import type { OrderItem as DbOrderItem } from '../db/schema/order-items.js';
import type { Product as DbProduct } from '../db/schema/products.js';
import type { ProductImage as DbProductImage } from '../db/schema/product-images.js';
import type { ProductReview as DbReview } from '../db/schema/product-reviews.js';

export function toCategoryDto(category: DbCategory, productCount?: number): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    ...(productCount !== undefined ? { productCount } : {}),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toProductDto(product: DbProduct): Product {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    brand: product.brand,
    stock: product.stock,
    averageRating: Number(product.averageRating),
    reviewCount: product.reviewCount,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toProductImageDto(image: DbProductImage): ProductImage {
  return {
    id: image.id,
    productId: image.productId,
    url: image.url,
    alt: image.alt,
    sortOrder: image.sortOrder,
  };
}

export function toProductDetailDto(
  product: DbProduct,
  category: DbCategory,
  images: DbProductImage[],
  relatedProducts: DbProduct[],
): ProductDetail {
  return {
    ...toProductDto(product),
    category: toCategoryDto(category),
    images: images.map(toProductImageDto),
    variants: [],
    relatedProducts: relatedProducts.map(toProductDto),
  };
}

export function toAddressDto(address: DbAddress): Address {
  return {
    id: address.id,
    userId: address.userId,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

export function toCartDto(cart: DbCart): Cart {
  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

export function toCartItemDto(item: DbCartItem): CartItem {
  return {
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    quantity: item.quantity,
    priceSnapshot: item.priceSnapshot,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function toCartItemWithProductDto(
  item: DbCartItem,
  product: DbProduct,
): CartItemWithProduct {
  return {
    ...toCartItemDto(item),
    product: toProductDto(product),
  };
}

export function toCartWithItemsDto(
  cart: DbCart,
  items: CartItemWithProduct[],
): CartWithItems {
  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...toCartDto(cart),
    items,
    itemCount,
    subtotal,
  };
}

export function toOrderDto(order: DbOrder): Order {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    shippingAddress: order.shippingAddress as Order['shippingAddress'],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function toOrderItemDto(item: DbOrderItem): OrderItem {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    priceSnapshot: item.priceSnapshot,
    createdAt: item.createdAt.toISOString(),
  };
}

export function toOrderWithItemsDto(order: DbOrder, items: DbOrderItem[]): OrderWithItems {
  return {
    ...toOrderDto(order),
    items: items.map(toOrderItemDto),
  };
}

export function toReviewDto(review: DbReview): Review {
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    rating: review.rating,
    title: review.title,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

export function toReviewWithUserDto(
  review: DbReview,
  user: { id: string; name: string },
): ReviewWithUser {
  return {
    ...toReviewDto(review),
    user: { id: user.id, name: user.name },
  };
}
