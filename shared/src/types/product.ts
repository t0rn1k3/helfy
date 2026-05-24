import type { Category } from './category.js';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  brand: string;
  stock: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail extends Product {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  relatedProducts: Product[];
}

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  minRating?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}
