# API Contracts Capability

> REST conventions, response envelope, Axios client, API modules, TanStack Query hooks.
> Error handling: [../guidelines/03-error-handling.md](../guidelines/03-error-handling.md)

---

## Purpose

Single HTTP layer with typed contracts shared between frontend and backend via `@helfy/shared`.

---

## Base URL

```
Development: http://localhost:4000/api/v1
Env var:     VITE_API_BASE_URL (frontend), API_PREFIX (backend)
```

---

## Response Envelope

All endpoints return one of these (defined in `@helfy/shared`):

```typescript
type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiError = {
  success: false;
  error: string;
  code: string;
  details?: unknown;
};

type ApiPaginated<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
```

Backend helper:

```typescript
// utils/response.ts
export const ok = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ success: true, data });

export const paginated = <T>(res: Response, data: T[], pagination: PaginationMeta) =>
  res.status(200).json({ success: true, data, pagination });
```

---

## Axios Client

`frontend/src/api/client.ts` (already scaffolded):

- `baseURL` from `VITE_API_BASE_URL`
- `withCredentials: true` (refresh cookie)
- Request interceptor: attach `Authorization: Bearer {accessToken}`
- Response interceptor: 401 → refresh → retry once → logout on failure
- Refresh queue for parallel 401s

---

## API Module Pattern

One file per domain — no HTTP calls outside `api/`:

```typescript
// frontend/src/api/products.api.ts
import { apiClient } from './client';
import type { ApiPaginated, ApiSuccess, Product, ProductDetail } from '@helfy/shared';

export const productsApi = {
  list: (params: ProductFilters) =>
    apiClient.get<ApiPaginated<Product>>('/products', { params }),

  getBySlug: (slug: string) =>
    apiClient.get<ApiSuccess<ProductDetail>>(`/products/${slug}`),
};
```

### Modules to create

| File | Domain |
| ---- | ------ |
| `auth.api.ts` | register, login, logout, refresh |
| `products.api.ts` | list, getBySlug |
| `categories.api.ts` | list |
| `cart.api.ts` | get, addItem, updateItem, removeItem, merge |
| `orders.api.ts` | create, list, getById |
| `users.api.ts` | getProfile, updateProfile, addresses CRUD |
| `reviews.api.ts` | list, create |

---

## TanStack Query Hook Pattern

Pages never call `api` directly — use hooks:

```typescript
// hooks/use-products.ts
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

// hooks/use-auth.ts
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
      await cartApi.merge();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
```

---

## Request Headers

| Header | When |
| ------ | ---- |
| `Authorization: Bearer {token}` | Authenticated requests |
| `X-Session-Id: {uuid}` | Guest cart requests |
| `Content-Type: application/json` | All mutating requests |

---

## Error Code Mapping (Frontend)

| Code | UX |
| ---- | -- |
| `VALIDATION_ERROR` | Inline form errors from `details` |
| `UNAUTHORIZED` | Redirect to login |
| `NOT_FOUND` | 404 page or empty state |
| `RATE_LIMITED` | Toast: "Too many requests, try again later" |
| `INTERNAL_ERROR` | Toast: generic error + retry |

---

## Rules

- No `fetch()` in application code (tests excepted)
- All response types from `@helfy/shared`
- Mutations invalidate related query keys
- Optimistic updates for cart qty changes with rollback

---

## Acceptance Criteria

- [ ] All API modules typed with shared envelope types
- [ ] Silent token refresh on 401
- [ ] Guest cart sends `X-Session-Id`
- [ ] API errors surface as toasts, not uncaught rejections
