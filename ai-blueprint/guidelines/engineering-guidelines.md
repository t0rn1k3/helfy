# Engineering Guidelines & Constraints

> Cross-cutting rules for AI-driven development of the Helfy eCommerce platform.
> These guidelines apply to **every file** generated in `frontend/`, `backend/`, and `shared/`.
> Hard-constraint summary: [`.cursorrules`](../../.cursorrules)

---

## 1. Architecture Principles

### 1.1 Monorepo (Single Repository)

- One GitHub repository contains frontend, backend, shared types, database migrations, and AI blueprint.
- npm workspaces: `frontend`, `backend`, `shared`.
- Never create separate repos for FE/BE.
- Never place application source at the repo root.

### 1.2 Layered Backend (Domain Modules)

Each bounded context is a self-contained module:

```
backend/src/modules/{domain}/
  routes.ts        ← Express router, mounts paths only
  controller.ts    ← HTTP in/out, calls service, no DB access
  service.ts       ← Business logic, orchestration, validation of domain rules
  repository.ts    ← Drizzle queries only, no HTTP concepts
  validators.ts    ← Zod schemas for this module's inputs
  types.ts         ← Module-local types (not shared cross-package)
```

**Dependency direction:** `routes → controller → service → repository → db`

Controllers must NOT:
- Query the database directly
- Contain business rules (price calculation, cart merge logic, etc.)

Services must NOT:
- Access `req` / `res` objects
- Return HTTP status codes

### 1.3 Frontend Architecture

```
pages/       ← route-level components, compose features + layout
components/
  ui/        ← shadcn primitives ONLY (never custom-styled duplicates)
  layout/    ← Header, Footer, shell components
  features/  ← domain UI: ProductCard, CheckoutStepper, etc.
api/         ← Axios calls ONLY (no fetch elsewhere)
store/       ← client UI state (Zustand)
hooks/       ← reusable logic combining api + store + query
routes/      ← router config, ProtectedRoute
lib/         ← pure utilities (cn, formatPrice, motion variants)
```

**State ownership:**
| State type | Tool |
| ---------- | ---- |
| Server data (products, orders) | TanStack Query |
| Auth session + access token | Zustand `authStore` |
| Cart UI state (optimistic) | Zustand `cartStore` + TanStack Query invalidation |
| Modal/toast/loading UI | Zustand `uiStore` |

### 1.4 Shared Workspace

- Package name: `@helfy/shared`
- Contains: TypeScript interfaces, `as const` constants, Zod schemas used by both FE and BE.
- Build order: `shared` → `backend` → `frontend`.
- Import path: `import { Product, loginSchema } from '@helfy/shared'`

---

## 2. Technology Stack (Non-Negotiable)

| Concern | Choice | Never use |
| ------- | ------ | --------- |
| Frontend runtime | React 19 + Vite 6 + TS 5 | CRA, Next.js |
| Styling | Tailwind v4 + shadcn/ui | MUI, Bootstrap, inline styles |
| Backend ORM | Drizzle + mysql2 | Prisma, Sequelize, raw SQL |
| Password hash | argon2 | bcrypt, SHA |
| Auth tokens | JWT access + httpOnly refresh cookie | localStorage for refresh tokens |
| HTTP client (FE) | Axios | fetch (except in tests) |
| Validation | Zod everywhere | Joi, Yup, manual checks |
| Logger (BE) | pino | console.log in production paths |

---

## 3. TypeScript Standards

```json
// tsconfig.json — all packages
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false
  }
}
```

- **No `any`.** Use `unknown` + Zod `.parse()` or type guards.
- Prefer `as const` objects over TypeScript enums for values shared FE/BE.
- Use TypeScript enums only when a library requires them.
- All function return types explicit on exported functions.
- Use `interface` for object shapes, `type` for unions/intersections.

---

## 4. Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| React components / pages | PascalCase file | `ProductCard.tsx` |
| Hooks | camelCase, `use` prefix | `use-cart.ts` |
| Services, repos, utils | kebab-case | `auth.service.ts` |
| DB tables / columns | snake_case | `cart_items`, `created_at` |
| Env vars | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| Zod schemas | camelCase + `Schema` suffix | `loginSchema` |
| API routes | kebab-case, plural nouns | `/api/v1/products`, `/api/v1/cart/items` |

---

## 5. API Design

### 5.1 Versioning

All routes prefixed: `/api/v1`

### 5.2 Response Envelope

Every endpoint returns one of these shapes:

```typescript
// Success
interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

// Error
interface ApiError {
  success: false;
  error: string;
  code: string;       // machine-readable, e.g. 'VALIDATION_ERROR'
  details?: unknown;  // field errors, never stack traces
}

// Paginated
interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 5.3 HTTP Status Codes

| Code | When |
| ---- | ---- |
| 200 | Successful GET, PATCH, DELETE |
| 201 | Successful POST creating resource |
| 400 | Malformed request |
| 401 | Missing or invalid auth |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, stale cart) |
| 422 | Valid JSON but failed business validation |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

### 5.4 Pagination Defaults

- Default `limit`: 20
- Maximum `limit`: 100
- Query params: `?page=1&limit=20`

---

## 6. Error Handling

### 6.1 Backend

```typescript
// utils/AppError.ts
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

// utils/asyncHandler.ts — wrap every async controller method
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

- All errors flow to `error.middleware.ts`.
- Production: never expose stack traces or internal error messages.
- Log full error with pino at `error` level including `req.id`.

### 6.2 Frontend

- React Error Boundary wraps each page route.
- API errors → toast notification (shadcn Sonner).
- Form validation errors → inline field messages (React Hook Form).
- Network failures → retry button in toast.

---

## 7. Security

| Rule | Implementation |
| ---- | -------------- |
| Password storage | argon2id, never log passwords |
| JWT access | 15 min expiry, returned in response body, stored in memory |
| JWT refresh | 7 day expiry, httpOnly + SameSite=Strict cookie |
| Refresh rotation | New refresh issued on every refresh; old token hash invalidated in DB |
| Input validation | Zod middleware on every mutating route |
| SQL injection | Drizzle parameterized queries only |
| CORS | Whitelist from `CORS_ORIGINS` env var |
| Rate limiting | Auth: 10/15min; General: 100/15min |
| Helmet | Enabled on all responses |
| Secrets | Never commit `.env`; validate all required vars at startup |

---

## 8. Database Guidelines

### 8.1 Schema Rules

- All tables: `id` (UUID or BIGINT auto-increment — pick one, be consistent), `created_at`, `updated_at`.
- Soft delete: optional `deleted_at` on user-facing entities.
- Foreign keys with explicit `onDelete` behavior documented in schema comments.
- Indexes on: `email`, `slug`, `user_id`, `session_id`, `product_id`.

### 8.2 Drizzle Patterns

```typescript
// repository.ts — always select explicit columns
const product = await db
  .select({
    id: products.id,
    name: products.name,
    price: products.price,
    slug: products.slug,
  })
  .from(products)
  .where(eq(products.slug, slug))
  .limit(1);
```

- Migrations generated via `drizzle-kit generate`, stored in `database/migrations/`.
- Never edit applied migration files — create new migrations for changes.

### 8.3 Connection Pool

- mysql2 pool: `connectionLimit: 10` for local dev, configurable via env.
- Implement retry on connection refused (Docker cold start) — max 5 retries, 2s backoff.

---

## 9. UI / UX Design System

### 9.1 shadcn/ui + Tailwind v4

- Style: **new-york**
- All colors via CSS custom properties: `bg-background`, `text-foreground`, `border-border`, `text-primary`.
- **Never** use raw palette classes: ~~`bg-slate-900`~~, ~~`text-indigo-500`~~.
- Theme defined in `frontend/src/styles/globals.css` using `@theme inline` (Tailwind v4).

### 9.2 Premium Feel Checklist

- [ ] Dark theme default with subtle contrast hierarchy
- [ ] Generous whitespace, max-width container (~1280px)
- [ ] Skeleton loaders on every async block
- [ ] Empty states with icon + message + action button
- [ ] Hover + focus-visible on all interactive elements
- [ ] Framer Motion page transitions (`AnimatePresence` in layout)
- [ ] Motion variants in `lib/motion.ts` — not inline

### 9.3 Responsive Breakpoints

Mobile-first. Design at 375px, then:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 10. Testing Standards

| Layer | Tool | What to test |
| ----- | ---- | ------------ |
| Backend services | Vitest | Business logic, cart merge, price calc |
| Backend routes | Vitest + supertest | Auth flow, response envelope, status codes |
| Frontend hooks | Vitest + RTL | Query hooks, form validation |
| Frontend components | Vitest + RTL | User interactions, empty/loading states |

- Tests colocated: `*.test.ts` next to source or in `__tests__/`.
- Mock external services (payment, email) — never hit real APIs in tests.

---

## 11. Git & Commit Conventions

```
feat:     new feature
fix:      bug fix
refactor: code change, no behavior change
chore:    tooling, deps, config
docs:     documentation only
test:     add or update tests
```

- One logical change per commit.
- Never commit `.env`, `node_modules/`, `dist/`, or `database/migrations/` meta junk.

---

## 12. Environment Variables

- Root `.env.example` documents ALL vars.
- Backend reads `backend/.env`.
- Frontend reads `frontend/.env` (only `VITE_*` vars exposed to browser).
- Validate backend env at startup with Zod — crash with clear message if missing.

---

## 13. Known AI-Gaps (Document in README Manual Interventions)

These are problems AI consistently gets wrong. Fix by hand if needed, then log why:

| Gap | Expected fix |
| --- | ------------ |
| MySQL pool cold-start | Retry connection 5× with 2s backoff on ECONNREFUSED |
| JWT refresh race (parallel tabs) | Token family ID; invalidate all siblings on rotation |
| Guest cart merge | Dedupe by `product_id`, sum qty, keep lowest price snapshot |
| Tailwind v4 + shadcn CSS vars | Use `@theme inline`, wrap colors in `hsl()` in `:root` |
| Drizzle migration drift | Never hand-edit applied migrations |
| Optimistic cart rollback | TanStack Query `onMutate` + `onError` restore previous cache |

---

## 14. AI Orchestration (Cursor)

This project uses **Cursor** (Agent/Composer) as the AI development tool — not Cline.

| Artifact | Role |
| -------- | ---- |
| `.cursorrules` | Hard constraints — auto-loaded by Cursor on every request |
| `ai-blueprint/initial.md` | Bootstrap prompt — phase-by-phase build plan |
| `ai-blueprint/guidelines/` | Long-form engineering rules (this file) |
| `ai-blueprint/capabilities/` | Domain building blocks |
| `AI-INTERACTIONS.md` | Log of prompts, models, plugins, and search queries |

When regenerating or extending the project, point the Cursor agent at `initial.md` first.

---

## 15. Documentation Deliverables

| File | Purpose |
| ---- | ------- |
| `README.md` | Quick-start, env setup, demo credentials, **Manual Interventions** |
| `AI-INTERACTIONS.md` | Every prompt, model, tool, search query used during build |
| `.env.example` | All env vars with comments |
| `database/README.md` | How to run migrations and seeds |

---

## 16. Performance Budget

- LCP target: < 2.5s on 3G (lazy-load below-fold images)
- API p95: < 200ms for catalog list (indexed queries)
- Bundle: code-split routes with `React.lazy()`
- Debounce search: 300ms
- Paginate all lists — never return unbounded arrays
