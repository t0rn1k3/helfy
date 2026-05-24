# Capability Definitions

> Functional building blocks the AI composes when generating the Helfy eCommerce platform.
> Each capability defines: **purpose**, **inputs/outputs**, **integration patterns**, and **acceptance criteria**.
> Cross-cutting rules: [engineering-guidelines.md](../guidelines/engineering-guidelines.md)

---

## Capability Map

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Auth      │────▶│   Users      │────▶│  Account    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                        │
       ▼                                        ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Cart      │◀───▶│  Products    │────▶│  Checkout   │
└─────────────┘     │  Catalog     │     └─────────────┘
       │            └──────────────┘            │
       │                   │                   ▼
       └───────────────────┴────────────▶┌─────────────┐
                                          │   Orders    │
                                          └─────────────┘
```

---

## 1. Auth Capability

### Purpose
Secure user identity with JWT access + refresh token rotation.

### Backend Module
`backend/src/modules/auth/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Issue tokens |
| POST | `/auth/refresh` | Cookie | Rotate refresh, issue new access |
| POST | `/auth/logout` | Yes | Invalidate current refresh token |
| POST | `/auth/logout-all` | Yes | Invalidate all user refresh tokens |

### Token Strategy

```
Login/Register
  → accessToken (JSON body, 15m, store in authStore memory)
  → refreshToken (httpOnly cookie, 7d, hashed in refresh_tokens table)

API Request
  → Authorization: Bearer {accessToken}

401 Response
  → Axios interceptor calls POST /auth/refresh
  → On success: retry original request with new accessToken
  → On failure: clear authStore, redirect /login
```

### Shared Schemas (`@helfy/shared`)
- `signupSchema`: email, password (min 8), name
- `loginSchema`: email, password

### Frontend Integration
- `authStore`: `{ user, accessToken, isAuthenticated, setAuth, clearAuth }`
- `useAuth` hook: login, register, logout mutations via TanStack Query
- `ProtectedRoute`: redirect to `/login?redirect={currentPath}` if not authenticated

### Acceptance Criteria
- [ ] Refresh token rotated on every `/auth/refresh` call
- [ ] Old refresh token rejected after rotation
- [ ] Password never returned in any response
- [ ] Auth endpoints rate-limited

---

## 2. Product Catalog Capability

### Purpose
Searchable, filterable, paginated product discovery.

### Backend Module
`backend/src/modules/products/` + `categories/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/products` | No | List with search, filter, sort, paginate |
| GET | `/products/:slug` | No | Single product with images + category |
| GET | `/categories` | No | All categories with product counts |

### Query Parameters (`GET /products`)

| Param | Type | Description |
| ----- | ---- | ----------- |
| `q` | string | FULLTEXT search on name + description |
| `category` | string | Category slug filter |
| `minPrice` | number | Minimum price (cents) |
| `maxPrice` | number | Maximum price (cents) |
| `brand` | string | Brand filter |
| `minRating` | number | Minimum average rating (1-5) |
| `sort` | enum | `price_asc`, `price_desc`, `newest`, `popular` |
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 20, max 100) |

### Repository Pattern
```typescript
// products.repository.ts
findMany(filters: ProductFilters): Promise<{ items: Product[]; total: number }>
findBySlug(slug: string): Promise<ProductDetail | null>
findRelated(productId: string, limit: number): Promise<Product[]>
```

### Frontend Integration
- `CatalogPage`: URL search params drive filters (`useSearchParams`)
- `useProducts(filters)`: TanStack Query with `keepPreviousData: true`
- `useDebounce(searchInput, 300)` before updating URL param
- `ProductCard` feature component in grid layout

### Acceptance Criteria
- [ ] Search debounced 300ms, reflected in URL
- [ ] Filters persist on page refresh
- [ ] Pagination shows total count and page controls
- [ ] Empty state when no results match filters

---

## 3. Product Detail Capability

### Purpose
Rich single-product view driving add-to-cart conversion.

### Backend
Uses `GET /products/:slug` + reviews module.

### Product Detail Shape
```typescript
interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;          // cents
  compareAtPrice?: number;
  brand: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];  // size/color stubs
  averageRating: number;
  reviewCount: number;
  relatedProducts: Product[];
}
```

### Frontend Components
- `ProductGallery` — main image + thumbnail strip
- `VariantSelector` — size/color pills (UI only, no inventory)
- `ReviewList` + `ReviewForm` (authenticated only)
- `AddToCartButton` — Framer Motion scale feedback on click
- `RelatedProducts` — horizontal scroll grid

### Acceptance Criteria
- [ ] Gallery supports keyboard navigation
- [ ] Add to cart works for guests and authenticated users
- [ ] Reviews paginated, average rating displayed

---

## 4. Cart Capability

### Purpose
Persistent shopping cart for guests and authenticated users with merge-on-login.

### Backend Module
`backend/src/modules/cart/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/cart` | Optional | Get cart (user or session) |
| POST | `/cart/items` | Optional | Add item `{ productId, quantity }` |
| PATCH | `/cart/items/:itemId` | Optional | Update quantity |
| DELETE | `/cart/items/:itemId` | Optional | Remove item |
| POST | `/cart/merge` | Yes | Merge guest cart into user cart |

### Guest vs Authenticated

| User type | Cart key | Storage |
| --------- | -------- | ------- |
| Guest | `session_id` (UUID) | Generated on first visit, stored in localStorage + sent as `X-Session-Id` header |
| Authenticated | `user_id` | DB `carts` table |

### Merge Algorithm (POST /cart/merge)
```
Input: guest session_id (from header/body)
For each guest cart item:
  If user cart has same product_id:
    quantity = user.qty + guest.qty
    price_snapshot = min(user.price_snapshot, guest.price_snapshot)
  Else:
    copy guest item to user cart
Delete guest cart after merge
Return merged cart
```

### Frontend Integration
- `cartStore`: optimistic updates for qty changes
- `useCart`: TanStack Query keyed by auth state
- Header `CartBadge`: item count from cart query
- On login success: call `POST /cart/merge` then invalidate cart query

### Acceptance Criteria
- [ ] Guest cart survives page refresh (localStorage session_id)
- [ ] Merge dedupes and sums quantities correctly
- [ ] Optimistic update rolls back on API error
- [ ] Cart badge updates without full page reload

---

## 5. Checkout Capability

### Purpose
Multi-step purchase flow from cart to confirmed order.

### Steps

| Step | Name | Data collected |
| ---- | ---- | -------------- |
| 1 | Shipping | Address (select saved or enter new) |
| 2 | Payment | Card fields (mocked — no real charge) |
| 3 | Review | Order summary, confirm |
| 4 | Confirmation | Order ID, estimated delivery |

### Backend Module
`backend/src/modules/orders/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/orders` | Yes | Create order from cart |
| GET | `/orders` | Yes | Paginated order history |
| GET | `/orders/:id` | Yes | Order detail with timeline |

### Payment Service Interface (Mocked)
```typescript
// backend/src/modules/orders/payment.service.ts
interface PaymentService {
  charge(amount: number, method: PaymentMethod): Promise<PaymentResult>;
}

// MockPaymentService — always succeeds, logs to pino
// Document: swap for StripePaymentService in production
```

### Order Creation Flow
```
1. Validate cart not empty
2. Snapshot product prices into order_items (never use live price)
3. MockPaymentService.charge(total)
4. Create order + order_items in transaction
5. Clear user cart
6. Return order with status PENDING → CONFIRMED
```

### Shared Schemas
- `checkoutShippingSchema`: addressId OR inline address fields
- `checkoutPaymentSchema`: cardNumber, expiry, cvc (validated format only)

### Frontend Components
- `CheckoutStepper` — progress indicator, step validation gates
- `ShippingStep`, `PaymentStep`, `ReviewStep`, `ConfirmationStep`
- Cannot proceed to next step if current step invalid

### Acceptance Criteria
- [ ] Order stores price snapshot at time of purchase
- [ ] Cart cleared after successful order
- [ ] Payment step shows card UI but no real API call
- [ ] Confirmation page shows order ID and link to order detail

---

## 6. Account Capability

### Purpose
Authenticated user profile, addresses, and order history.

### Backend Modules
`users/` (profile + addresses), `orders/` (history)

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/me` | Yes | Current user profile |
| PATCH | `/me` | Yes | Update name, email |
| PATCH | `/me/password` | Yes | Change password (requires current) |
| GET | `/me/addresses` | Yes | List addresses |
| POST | `/me/addresses` | Yes | Create address |
| PATCH | `/me/addresses/:id` | Yes | Update address |
| DELETE | `/me/addresses/:id` | Yes | Delete address |
| PATCH | `/me/addresses/:id/default` | Yes | Set default shipping address |

### Frontend Structure
```
/account          → AccountLayout (sidebar nav)
/account/profile  → ProfilePage
/account/addresses→ AddressesPage
/account/orders   → OrdersPage
/account/orders/:id → OrderDetailPage
```

### Order Status Timeline
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                  ↘ CANCELLED
```

Display as vertical stepper on `OrderDetailPage`.

### Acceptance Criteria
- [ ] All `/account/*` routes protected
- [ ] Address CRUD with default address indicator
- [ ] Order history paginated with status badges
- [ ] Order detail shows line items + shipping address + timeline

---

## 7. Data Access Capability

### Purpose
Consistent Drizzle ORM patterns across all repositories.

### DB Client Setup
```typescript
// backend/src/db/client.ts
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  connectionLimit: 10,
  waitForConnections: true,
});

export const db = drizzle(pool, { schema, mode: 'default' });
```

### Schema File Organization
```
backend/src/db/schema/
  index.ts          ← re-exports all tables
  users.ts
  addresses.ts
  categories.ts
  products.ts
  product-images.ts
  carts.ts
  cart-items.ts
  orders.ts
  order-items.ts
  product-reviews.ts
  refresh-tokens.ts
```

### Repository Rules
- One repository class/file per domain module
- Methods return typed results, never raw Drizzle rows with extra columns
- Transactions for multi-table writes (order creation, cart merge)
- Use `db.transaction(async (tx) => { ... })` for atomic operations

### Migration Workflow
```bash
# After schema change:
npm run db:generate   # drizzle-kit generate → database/migrations/
npm run db:migrate    # apply pending migrations
npm run db:seed       # insert demo data
npm run db:studio     # browse DB visually
```

---

## 8. UI Composition Capability

### Purpose
Reusable frontend patterns for consistent premium UX.

### Page Shell Pattern
```tsx
// Every page wraps content in PageShell
<PageShell title="Catalog" description="Browse our collection">
  {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={data} />}
</PageShell>
```

### Required UI States (Every Data-Driven Component)

| State | Component | When |
| ----- | --------- | ---- |
| Loading | `*Skeleton` | TanStack Query `isLoading` |
| Empty | `EmptyState` | `data.length === 0` |
| Error | `ErrorState` | Query `isError` — retry button |
| Success | Feature component | `data` available |

### shadcn Components to Install (minimum)
`button`, `card`, `input`, `label`, `form`, `dialog`, `dropdown-menu`, `badge`, `skeleton`, `separator`, `tabs`, `toast` (sonner), `select`, `checkbox`, `avatar`, `sheet` (mobile nav)

### Motion Variants (`lib/motion.ts`)
```typescript
export const pageTransition = { initial, animate, exit };
export const fadeInUp = { ... };
export const scaleOnTap = { whileTap: { scale: 0.95 } };
export const staggerContainer = { ... };
```

### Layout Components
- `Header` — logo, nav links, search icon, cart badge, auth buttons
- `Footer` — links, copyright
- `MobileNav` — sheet drawer for mobile menu
- `Container` — max-w-7xl mx-auto px-4

---

## 9. API Client Capability

### Purpose
Centralized HTTP layer with auth interceptors.

### Axios Instance (`frontend/src/api/client.ts`)
```typescript
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // send refresh cookie
});

// Request interceptor: attach Authorization header
// Response interceptor: on 401 → refresh → retry once → logout on failure
```

### API Module Pattern
```typescript
// products.api.ts
export const productsApi = {
  list: (params: ProductFilters) =>
    client.get<ApiPaginated<Product>>('/products', { params }),
  getBySlug: (slug: string) =>
    client.get<ApiSuccess<ProductDetail>>(`/products/${slug}`),
};
```

### Rules
- No `fetch()` or `axios` calls outside `frontend/src/api/`
- All response types imported from `@helfy/shared`
- TanStack Query hooks wrap api modules — pages never call api directly

---

## 10. Reviews Capability

### Purpose
Social proof on product detail pages.

### Backend Module
`backend/src/modules/reviews/`

### Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/products/:slug/reviews` | No | Paginated reviews |
| POST | `/products/:slug/reviews` | Yes | Create review (one per user per product) |

### Rules
- User must have purchased product to review (check orders) — or allow all authenticated users for demo
- Rating: integer 1-5
- Update product `average_rating` and `review_count` on create

---

## 11. Integration Checklist (End-to-End)

Use this to verify all capabilities work together:

```
[ ] Guest browses catalog, adds items, cart persists on refresh
[ ] Guest registers/logs in → cart merges correctly
[ ] Authenticated user completes 4-step checkout
[ ] Order appears in /account/orders with correct items and prices
[ ] User updates profile and manages addresses
[ ] User logs out → protected routes redirect
[ ] Token refresh works silently during long session
[ ] Search + filters work and survive page refresh
[ ] Mobile layout usable at 375px width
[ ] All API errors show toast, no white screen crashes
```

---

## 12. Optional: Admin Capability (Stretch Goal)

Build only after Integration Checklist passes.

### Scope
- `GET/POST/PATCH/DELETE /admin/products` — CRUD
- Protected by `role: 'admin'` check in auth middleware
- Simple table UI at `/admin/products`

Not required for assignment submission.
