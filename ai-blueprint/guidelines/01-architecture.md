# 01 — Architecture

> Monorepo layout, layered backend, frontend structure, shared workspace.
> Hard constraints: [`.cursorrules`](../../.cursorrules)

---

## Monorepo (Single Repository)

- One GitHub repository: frontend, backend, shared, database, ai-blueprint.
- npm workspaces: `frontend`, `backend`, `shared`.
- Never create separate repos for FE/BE.
- Never place application source at the repo root.

```
helfy-assignment/
├── frontend/       React 19 + Vite + TypeScript
├── backend/        Express + Drizzle + MySQL
├── shared/         @helfy/shared types + Zod schemas
├── database/       migrations/ + seeds/
├── ai-blueprint/   AI engine docs
└── .cursorrules    Cursor hard rules
```

**Build order:** `shared` → `backend` → `frontend`

---

## Backend — Domain Modules

Each bounded context is self-contained:

```
backend/src/modules/{domain}/
  routes.ts        ← Express router, mounts paths only
  controller.ts    ← HTTP in/out, calls service
  service.ts       ← ALL business logic
  repository.ts    ← Drizzle queries only
  validators.ts    ← Zod schemas for inputs
  types.ts         ← module-local types only
```

**Dependency direction:** `routes → controller → service → repository → db`

| Layer | Allowed | Forbidden |
| ----- | ------- | --------- |
| Controller | Parse req, call service, send res | DB queries, business rules |
| Service | Business logic, orchestration | req/res objects, HTTP status codes |
| Repository | Drizzle queries, transactions | HTTP concepts, business rules |

**Domains:** `auth`, `users`, `products`, `categories`, `cart`, `orders`, `reviews`

### Backend root structure

```
backend/src/
  modules/
  db/client.ts + db/schema/
  middleware/     auth, error, validate, rateLimit
  config/         env.ts, constants.ts
  utils/          AppError, asyncHandler, jwt, logger
  app.ts          Express composition
  server.ts       HTTP bootstrap
```

---

## Frontend Architecture

```
frontend/src/
  pages/            route-level components
  components/
    ui/             shadcn primitives ONLY
    layout/         Header, Footer, PageShell
    features/       ProductCard, CheckoutStepper…
  api/              Axios modules (no fetch elsewhere)
  store/            Zustand (authStore, cartStore, uiStore)
  hooks/            useAuth, useCart, useProducts…
  routes/           router, ProtectedRoute, AppProviders
  lib/              cn(), formatPrice(), motion variants
  styles/           globals.css (Tailwind v4 @theme)
  types/            frontend-only types (NOT in shared/)
```

### State ownership

| State | Tool |
| ----- | ---- |
| Server data (products, orders) | TanStack Query |
| Auth session + access token | Zustand `authStore` |
| Cart optimistic UI | Zustand `cartStore` + Query invalidation |
| Modals / toasts | Zustand `uiStore` + Sonner |

---

## Shared Workspace (`@helfy/shared`)

- TypeScript interfaces + Zod schemas used by **both** FE and BE.
- Import: `import { Product, loginSchema } from '@helfy/shared'`
- Never duplicate types between `frontend/` and `backend/`.

```
shared/src/
  types/       user, product, cart, order, address, category, review, api
  schemas/     login, signup, address, checkout…
  index.ts     re-exports all
```

---

## Database Layout

- Drizzle schema: `backend/src/db/schema/`
- Generated SQL migrations: `database/migrations/`
- Seed scripts: `database/seeds/`
- Local MySQL via `docker-compose.yml`

---

## API Versioning

All backend routes prefixed: `/api/v1`

See [03-error-handling.md](./03-error-handling.md) for response envelope.
