import { toCategoryDto } from '../../utils/mappers.js';
import { categoriesRepository } from './repository.js';

export const categoriesService = {
  async listCategories() {
    const rows = await categoriesRepository.findAllWithProductCounts();
    return rows.map((row) => toCategoryDto(row.category, Number(row.productCount)));
  },
};
