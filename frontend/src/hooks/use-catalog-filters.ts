import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductFilters } from '@helfy/shared';

const DEFAULT_LIMIT = 20;

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const page = Number(searchParams.get('page') ?? '1');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');

    return {
      q: searchParams.get('q') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      sort: (searchParams.get('sort') as ProductFilters['sort']) ?? undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: DEFAULT_LIMIT,
      ...(minPrice ? { minPrice: Number(minPrice) } : {}),
      ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
      ...(minRating ? { minRating: Number(minRating) } : {}),
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);

        const apply = (key: string, value: string | number | undefined) => {
          if (value === undefined || value === '' || value === null) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        };

        if ('q' in updates) apply('q', updates.q);
        if ('category' in updates) apply('category', updates.category);
        if ('brand' in updates) apply('brand', updates.brand);
        if ('sort' in updates) apply('sort', updates.sort);
        if ('minPrice' in updates) apply('minPrice', updates.minPrice);
        if ('maxPrice' in updates) apply('maxPrice', updates.maxPrice);
        if ('minRating' in updates) apply('minRating', updates.minRating);
        if ('page' in updates) apply('page', updates.page);

        if (!('page' in updates) && Object.keys(updates).length > 0) {
          next.set('page', '1');
        }

        return next;
      });
    },
    [setSearchParams],
  );

  return { filters, setFilters };
}
