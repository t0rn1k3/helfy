import { ERROR_CODES } from '@helfy/shared';

import { AppError } from '../../utils/AppError.js';
import { toProductDetailDto, toProductDto } from '../../utils/mappers.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import { categoriesRepository } from '../categories/repository.js';
import { productsRepository } from './repository.js';
import type { ProductListFilters } from './types.js';

export const productsService = {
  async listProducts(filters: ProductListFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const { items, total } = await productsRepository.findMany(filters);

    return {
      items: items.map(toProductDto),
      pagination: buildPaginationMeta(page, limit, total),
    };
  },

  async getProductBySlug(slug: string) {
    const product = await productsRepository.findBySlug(slug);

    if (!product) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product not found');
    }

    const [category, images, relatedProducts] = await Promise.all([
      categoriesRepository.findById(product.categoryId),
      productsRepository.findImagesByProductId(product.id),
      productsRepository.findRelated(product.id, product.categoryId),
    ]);

    if (!category) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product category not found');
    }

    return toProductDetailDto(product, category, images, relatedProducts);
  },
};
