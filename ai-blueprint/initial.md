# Helfy eCommerce — Bootstrap Prompt (initial.md)

> **You are a senior full-stack engineer.** Your job is to build a complete, production-quality
> eCommerce platform from this repository's AI Blueprint. Read every document in `ai-blueprint/`
> before writing code. Follow phases in order — do not skip ahead.

---

## 1. Mission

Generate a **fully functional premium eCommerce platform** inside this monorepo:

| Layer    | Stack |
| -------- | ----- |
| Frontend | React 19, Vite 6, TypeScript, Tailwind v4, shadcn/ui, Framer Motion, React Router v7, TanStack Query, Zustand, React Hook Form, Zod, Axios |
| Backend  | Node 20, Express 4, TypeScript, Drizzle ORM, mysql2, argon2, JWT, Zod, pino, helmet, cors |
| Database | MySQL 8 (Docker for local dev) |
| Shared   | `@helfy/shared` workspace — types + Zod schemas used by FE and BE |

The deliverable is not just the app — it is the **engine** (this blueprint) plus the working code,
`README.md` (with Manual Interventions), and `AI-INTERACTIONS.md`.

---

## 2. Before You Write Any Code

1. Read [engineering-guidelines.md](./guidelines/engineering-guidelines.md) — architecture, standards, security, UI rules.
2. Read [capability-definitions.md](./capabilities/capability-definitions.md) — domain building blocks and integration patterns.
3. Read root [`.cursorrules`](../.cursorrules) — hard constraints summary.
4. Inspect existing repo structure — do not recreate what Phase 0 already scaffolded.

**Hard rules:**
- TypeScript strict mode everywhere. No `any`.
- Monorepo only — one GitHub repo, npm workspaces (`frontend`, `backend`, `shared`).
- Drizzle ORM only — never Prisma, never raw SQL in application code.
- Shared types live in `shared/` — never duplicate between packages.
- All API responses use the standard envelope (see engineering-guidelines.md).

---

## 3. Repository Layout (Target State)

```
helfy-assignment/
├── ai-blueprint/           ← you are here
├── .cursorrules
├── frontend/               ← React + Vite app
├── backend/                ← Express API
├── shared/                 ← @helfy/shared types + schemas
├── database/
│   ├── migrations/         ← Drizzle-generated SQL
│   └── seeds/              ← demo data
├── docker-compose.yml      ← MySQL 8 + Adminer
├── .env.example
├── README.md
└── AI-INTERACTIONS.md
```

---

## 4. Build Phases — Execute In Order

### Phase 0 — Monorepo scaffold ✅ (already done)

Root workspaces, `docker-compose.yml`, `.env.example`, folder structure exist.
**Do not delete or relocate** these without explicit instruction.

### Phase 0b — Frontend foundation

**Goal:** Runnable Vite + React 19 + TypeScript app with Tailwind v4 and shadcn/ui.

**Tasks:**
- Scaffold `frontend/` with Vite React-TS template (if not already present).
- Install and configure Tailwind v4 (`@tailwindcss/vite`), shadcn/ui (new-york style).
- Set up path alias `@/*` in `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`.
- Create `frontend/src/styles/globals.css` with `@import "tailwindcss"` and shadcn `@theme` tokens (dark premium feel).
- Add base layout: `Header`, `Footer`, `Container`, `PageShell`.
- Wire React Router v7 with placeholder routes.
- Configure Axios client at `frontend/src/api/client.ts` pointing to `VITE_API_BASE_URL`.
- Add TanStack Query provider, Zustand store stubs, Framer Motion page wrapper.

**Acceptance criteria:**
- `npm run dev -w frontend` starts on http://localhost:5173
- shadcn Button/Card render with correct theme tokens
- No TypeScript or ESLint errors

---

### Phase 1 — Shared workspace + env wiring

**Goal:** End-to-end type safety foundation.

**Tasks:**
- Create `shared/package.json` with name `@helfy/shared`, build to `dist/`.
- Add types: `User`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Address`, `Category`, `Review`.
- Add `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationMeta`, `ErrorCode` constants.
- Add Zod schemas: `loginSchema`, `signupSchema`, `addressSchema`, `checkoutShippingSchema`.
- Wire `frontend` and `backend` to depend on `@helfy/shared`.

**Acceptance criteria:**
- Both packages import shared types without duplication
- `npm run build -w shared` succeeds

---

### Phase 2 — Database schema, migrations, seeds

**Goal:** Complete MySQL schema with demo data.

**Tables (minimum):**
`users`, `addresses`, `categories`, `products`, `product_images`, `carts`, `cart_items`, `orders`, `order_items`, `product_reviews`, `refresh_tokens`

**Tasks:**
- Define Drizzle schema in `backend/src/db/schema/` (one file per table group).
- Configure `drizzle.config.ts` — migrations output to `database/migrations/`.
- Add FULLTEXT index on `products.name` + `products.description`.
- Cart must support `user_id` (nullable) AND `session_id` (nullable) for guest carts.
- Create seeds: 5+ categories, ~30 products with image URLs (Picsum/Unsplash), demo customer + admin user.
- Scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio` in backend package.json.

**Acceptance criteria:**
- `npm run db:up && npm run db:migrate && npm run db:seed` completes without error
- Adminer at http://localhost:8080 shows populated tables

---

### Phase 3 — Backend auth + global middleware

**Goal:** Secure, production-pattern auth layer.

**Tasks:**
- `backend/src/config/env.ts` — Zod-validated env, fail fast on missing vars.
- `AppError`, `asyncHandler`, `logger` (pino), JWT utils.
- Middleware: `error.middleware`, `validate.middleware`, `auth.middleware`, rate limiters.
- Auth module: register, login, refresh (with **token rotation**), logout, logout-all.
- argon2 password hashing; refresh tokens stored hashed in `refresh_tokens` table.
- Access token returned in JSON body; refresh token in httpOnly cookie.

**Acceptance criteria:**
- Register → login → access protected route → refresh → logout flow works via curl/Postman
- Invalid/expired refresh token returns 401
- Auth routes rate-limited to 10 req / 15 min

**Known AI-Gap:** Refresh rotation race on parallel tabs — implement DB-level token family invalidation, document fix in README if hand-tuned.

---

### Phase 4 — Backend domain modules

**Goal:** Full REST API for eCommerce domains.

**Modules:** `users`, `products`, `categories`, `cart`, `orders`, `reviews`

Each module follows:
```
modules/{domain}/
  routes.ts       ← thin Express router
  controller.ts   ← req/res only, no business logic
  service.ts      ← all business logic
  repository.ts   ← Drizzle queries only
  validators.ts   ← Zod schemas (import shared where possible)
  types.ts        ← module-local types only
```

**Key endpoints (prefix `/api/v1`):**

| Domain     | Endpoints |
| ---------- | --------- |
| Products   | `GET /products` (search, filter, sort, paginate), `GET /products/:slug` |
| Categories | `GET /categories` |
| Cart       | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `POST /cart/merge` |
| Orders     | `POST /orders`, `GET /orders`, `GET /orders/:id` |
| Users      | `GET /me`, `PATCH /me`, `GET /me/addresses`, `POST /me/addresses`, `PATCH /me/addresses/:id`, `DELETE /me/addresses/:id` |
| Reviews    | `GET /products/:slug/reviews`, `POST /products/:slug/reviews` |

**Acceptance criteria:**
- All endpoints return standard envelope
- Catalog search uses FULLTEXT; filters are query-param driven
- Guest cart works with `X-Session-Id` header or cookie
- Cart merge on login dedupes by `product_id`, sums quantities

---

### Phase 5 — Frontend foundation (data layer + routing)

**Goal:** Connected frontend shell ready for pages.

**Tasks:**
- Complete Zustand stores: `authStore`, `cartStore`, `uiStore`.
- TanStack Query hooks: `useProducts`, `useProduct`, `useCart`, `useOrders`, `useAuth`.
- API modules: `auth.api.ts`, `products.api.ts`, `cart.api.ts`, `orders.api.ts`.
- Axios interceptor: attach access token, silent refresh on 401, redirect to login on refresh failure.
- `ProtectedRoute` component; route config for all pages (placeholders OK initially).
- Toast provider (shadcn Sonner) for API errors.

**Acceptance criteria:**
- Login stores access token; protected routes redirect when logged out
- API errors show toast, not uncaught promise rejections

---

### Phase 6 — Frontend pages (full UX)

**Goal:** Complete premium shopping experience.

**Pages to build:**

| Route | Page |
| ----- | ---- |
| `/` | HomePage — hero, featured products, categories |
| `/catalog` | CatalogPage — search, filters, sort, pagination (URL state) |
| `/products/:slug` | ProductDetailPage — gallery, reviews, add to cart |
| `/cart` | CartPage — line items, quantity controls |
| `/checkout` | CheckoutPage — 4-step stepper |
| `/login`, `/signup` | Auth pages |
| `/account` | AccountLayout with nested routes |
| `/account/profile` | ProfilePage |
| `/account/addresses` | AddressesPage |
| `/account/orders` | OrdersPage |
| `/account/orders/:id` | OrderDetailPage |
| `*` | NotFoundPage |

**UX requirements:**
- Skeleton loaders on all async sections
- Empty states with helpful CTA
- Mobile-first responsive layout
- Framer Motion on route transitions and add-to-cart feedback
- shadcn components only — no raw HTML form controls

**Acceptance criteria:**
- Full user journey: browse → add to cart → checkout → view order history
- Guest can shop; cart merges on login
- All filters persist in URL

---

### Phase 7 — Polish + documentation

**Goal:** Submission-ready repo.

**Tasks:**
- Error boundaries on every page
- 404 page, loading fallbacks, optimistic cart with rollback
- Finalize `README.md`: quick-start, env vars, demo credentials, **Manual Interventions** section
- Create `AI-INTERACTIONS.md`: every prompt, model used, tools, search queries
- Run `npm run lint`, `npm run build`, fix all errors
- Optional: admin product CRUD (stretch — only after core features pass)

**Acceptance criteria:**
- `npm run build` succeeds for all workspaces
- README documents every hand-fix and why AI couldn't handle it
- App runs end-to-end with `npm run db:up && npm run dev`

---

## 5. Definition of Done (Whole Project)

- [ ] All Phase 0b–7 acceptance criteria pass
- [ ] No `any` types in codebase
- [ ] No secrets committed
- [ ] `.env.example` matches all env vars in use
- [ ] Demo user can complete full purchase flow
- [ ] Manual Interventions documented in README.md
- [ ] AI-INTERACTIONS.md complete

---

## 6. Out of Scope (Document, Do Not Build)

| Item | Approach |
| ---- | -------- |
| Live Stripe payments | Mock `PaymentService`; document Stripe plug-in point |
| Real email (SMTP/Resend) | Log to pino instead |
| S3/Cloudinary images | Use Picsum/Unsplash URLs in seeds |
| Multi-currency / i18n | Hard-code USD |
| Admin panel | Optional stretch goal only |

---

## 7. When Stuck

1. Re-read [engineering-guidelines.md](./guidelines/engineering-guidelines.md) for the rule you may be violating.
2. Re-read the relevant capability section in [capability-definitions.md](./capabilities/capability-definitions.md).
3. Prefer fixing the smallest correct diff — do not rewrite working modules.
4. If an AI-Gap is hit (see engineering-guidelines.md § AI-Gaps), fix by hand and log it in README.md Manual Interventions.

**Start with Phase 0b unless the frontend workspace is already fully scaffolded.**
