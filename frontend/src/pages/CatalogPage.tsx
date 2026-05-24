import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/features/EmptyState';
import { ErrorState } from '@/components/features/ErrorState';
import { ProductGrid, ProductGridSkeleton } from '@/components/features/ProductGrid';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCatalogFilters } from '@/hooks/use-catalog-filters';
import { useDebounce } from '@/hooks/use-debounce';
import { useCategories } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';

export function CatalogPage() {
  const { filters, setFilters } = useCatalogFilters();
  const [searchInput, setSearchInput] = useState(filters.q ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const { data: categories } = useCategories();

  useEffect(() => {
    if (debouncedSearch !== (filters.q ?? '')) {
      setFilters({ q: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.q, setFilters]);

  const { data, isLoading, isError, refetch, isFetching } = useProducts(filters);
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <PageShell title="Shop" description="Browse our collection. Search, filter, and sort.">
      <div className="mb-8 grid gap-4 rounded-xl border border-border bg-card/40 p-4 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search products…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={filters.category ?? ''}
            onChange={(event) => setFilters({ category: event.target.value || undefined })}
          >
            <option value="">All categories</option>
            {(categories ?? []).map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select
            id="sort"
            value={filters.sort ?? ''}
            onChange={(event) =>
              setFilters({
                sort: (event.target.value || undefined) as typeof filters.sort,
              })
            }
          >
            <option value="">Newest</option>
            <option value="popular">Popular</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </Select>
        </div>
      </div>

      {isLoading ? <ProductGridSkeleton /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}

      {!isLoading && !isError && products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filters."
          action={
            <Button variant="outline" onClick={() => setFilters({ q: undefined, category: undefined, sort: undefined })}>
              Clear filters
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && products.length > 0 ? (
        <>
          <ProductGrid products={products} />
          {pagination ? (
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} products
                {isFetching ? ' · Updating…' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters({ page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setFilters({ page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}
