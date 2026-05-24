# Product Catalog Capability

> Search, filter, sort, paginate products. Includes product detail and reviews.
> UI patterns: [ui-composition.md](./ui-composition.md)

---

## Purpose

Searchable, filterable product discovery with rich detail pages and customer reviews.

---

## Backend Modules

- `backend/src/modules/products/`
- `backend/src/modules/categories/`
- `backend/src/modules/reviews/`

---

## Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/products` | No | List — search, filter, sort, paginate |
| GET | `/products/:slug` | No | Detail with images, category, related |
| GET | `/categories` | No | All categories with product counts |
| GET | `/products/:slug/reviews` | No | Paginated reviews |
| POST | `/products/:slug/reviews` | Yes | Create review (1 per user per product) |

---

## Query Parameters (`GET /products`)

| Param | Type | Description |
| ----- | ---- | ----------- |
| `q` | string | FULLTEXT search (name + description) |
| `category` | string | Category slug |
| `minPrice` | number | Min price in cents |
| `maxPrice` | number | Max price in cents |
| `brand` | string | Brand filter |
| `minRating` | number | Min average rating (1–5) |
| `sort` | enum | `price_asc`, `price_desc`, `newest`, `popular` |
| `page` | number | Default 1 |
| `limit` | number | Default 20, max 100 |

---

## Product Detail Shape

```typescript
interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;              // cents
  compareAtPrice?: number;
  brand: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[]; // size/color stubs
  averageRating: number;
  reviewCount: number;
  relatedProducts: Product[];
}
```

---

## Repository Methods

```typescript
findMany(filters: ProductFilters): Promise<{ items: Product[]; total: number }>
findBySlug(slug: string): Promise<ProductDetail | null>
findRelated(productId: string, limit: number): Promise<Product[]>
```

---

## Frontend Integration

| Piece | Role |
| ----- | ---- |
| `CatalogPage` | URL search params drive filters (`useSearchParams`) |
| `useProducts(filters)` | TanStack Query, `placeholderData: keepPreviousData` |
| `useDebounce(input, 300)` | Debounce before updating URL |
| `ProductCard` | Grid item in catalog |
| `ProductDetailPage` | Gallery, variants, reviews, add-to-cart |
| `ProductGallery` | Main image + thumbnails |
| `VariantSelector` | Size/color pills (UI only) |
| `ReviewList` + `ReviewForm` | Authenticated review submission |
| `RelatedProducts` | Horizontal product strip |

---

## Review Rules

- Rating: integer 1–5
- One review per user per product
- Update `average_rating` + `review_count` on product after create
- Demo mode: allow any authenticated user (production: require purchase)

---

## Acceptance Criteria

- [ ] Search debounced 300ms, reflected in URL
- [ ] Filters persist on page refresh
- [ ] Pagination with total count + page controls
- [ ] Empty state when no results
- [ ] Gallery keyboard navigation
- [ ] Add to cart works for guests and authenticated users
- [ ] Reviews paginated with average rating displayed
