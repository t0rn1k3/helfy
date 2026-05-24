# 06 — Testing

> Vitest setup, what to test per layer, mocking rules, coverage targets.
> Coding standards: [02-coding-standards.md](./02-coding-standards.md)

---

## Stack

| Layer | Tool |
| ----- | ---- |
| Backend unit/integration | Vitest + supertest |
| Frontend unit/component | Vitest + Testing Library |
| E2E (optional stretch) | Playwright |

---

## File Conventions

- Colocate: `*.test.ts` next to source file
- Or directory: `__tests__/` inside the module folder
- Name: `{module}.service.test.ts`, `{Component}.test.tsx`

---

## Backend Tests

### Services (unit)

Test business logic in isolation — mock repositories:

```typescript
// cart.service.test.ts
describe('mergeGuestCart', () => {
  it('dedupes by product_id and sums quantities', async () => { ... });
  it('keeps lowest price snapshot when merging', async () => { ... });
  it('deletes guest cart after merge', async () => { ... });
});
```

**Priority service tests:**
- Cart merge algorithm
- Order creation (price snapshot, cart clear)
- Auth refresh token rotation
- Product search filter parsing

### Routes (integration)

Use supertest against Express app — no server startup:

```typescript
// auth.routes.test.ts
describe('POST /api/v1/auth/login', () => {
  it('returns 200 with access token on valid credentials', async () => { ... });
  it('returns 401 on wrong password', async () => { ... });
  it('returns 429 when rate limited', async () => { ... });
  it('sets httpOnly refresh cookie', async () => { ... });
});
```

**Priority route tests:**
- Auth flow (register → login → refresh → logout)
- Response envelope shape on all endpoints
- 401 on protected routes without token
- Pagination meta on list endpoints

### Repositories

Test Drizzle queries against a test database or mocked db client.
Focus on complex queries (FULLTEXT search, cart merge SQL).

---

## Frontend Tests

### Hooks

```typescript
// use-cart.test.ts
describe('useCart', () => {
  it('returns cart items from query', async () => { ... });
  it('optimistically updates quantity on mutate', async () => { ... });
});
```

Wrap with `QueryClientProvider` test wrapper.

### Components

```typescript
// ProductCard.test.tsx
describe('ProductCard', () => {
  it('renders product name and price', () => { ... });
  it('calls addToCart on button click', async () => { ... });
  it('shows skeleton when loading', () => { ... });
});
```

**Priority component tests:**
- ProductCard add-to-cart interaction
- CheckoutStepper step validation gates
- ProtectedRoute redirect when unauthenticated
- EmptyState renders CTA button

---

## Mocking Rules

| Dependency | Mock strategy |
| ---------- | ------------- |
| Payment service | Always mock — never hit Stripe |
| Email service | Mock — assert pino log call |
| Database (unit) | Mock repository layer |
| Database (integration) | Test MySQL or in-memory |
| Axios (FE) | MSW or vi.mock on api modules |
| External images | Static URLs in test fixtures |

Never hit real external APIs in tests.

---

## Test Data Fixtures

```typescript
// shared or test/fixtures/products.ts
export const mockProduct: Product = {
  id: 'prod_1',
  name: 'Test Product',
  slug: 'test-product',
  price: 2999, // cents
  ...
};
```

Reuse fixtures — do not duplicate mock objects across test files.

---

## Scripts

```json
// backend/package.json
"test": "vitest run",
"test:watch": "vitest"

// frontend/package.json
"test": "vitest run",
"test:watch": "vitest"
```

Root: `npm run test` runs all workspace tests.

---

## Coverage Targets (guidance)

| Layer | Target | Focus |
| ----- | ------ | ----- |
| Backend services | 80%+ | Business logic |
| Backend routes | Key flows | Auth, cart, orders |
| Frontend hooks | Key hooks | useAuth, useCart |
| Frontend components | Critical paths | Checkout, cart, auth |

100% coverage is not required — prioritize business-critical paths.

---

## CI Check (Phase 7)

Before submission:
```bash
npm run test --workspaces --if-present
npm run lint
npm run build
```

All must pass with zero errors.
