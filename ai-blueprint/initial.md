# Helfy eCommerce — Bootstrap Prompt (initial.md)

> **You are a senior full-stack engineer working in Cursor.**
> Build a complete, production-quality eCommerce platform from this repository's AI Blueprint.
> Read every document in `ai-blueprint/` before writing code. Follow phases in order — do not skip ahead.

---

## 1. Mission

Generate a **fully functional premium eCommerce platform** inside this monorepo:

| Layer    | Stack |
| -------- | ----- |
| Frontend | React 19, Vite 6, TypeScript, Tailwind v4, shadcn/ui, Framer Motion, React Router v7, TanStack Query, Zustand, React Hook Form, Zod, Axios |
| Backend  | Node 20, Express 4, TypeScript, Drizzle ORM, mysql2, argon2, JWT, Zod, pino, helmet, cors |
| Database | MySQL 8 (Docker for local dev) |
| Shared   | `@helfy/shared` workspace — types + Zod schemas used by FE and BE |

### Deliverables (graded submission)

| # | Deliverable | Location |
| - | ----------- | -------- |
| 1 | Working codebase | `frontend/`, `backend/`, `shared/`, `database/` |
| 2 | AI Blueprint engine | `ai-blueprint/` + `.cursorrules` |
| 3 | Manual interventions log | `README.md` § Manual Interventions |
| 4 | AI interaction log | `AI-INTERACTIONS.md` (prompts, models, tools) |

### AI tool

This project uses **Cursor** (Agent/Composer), not Cline.
Hard rules auto-load from [`.cursorrules`](../.cursorrules).

---

## 2. Before You Write Any Code

1. Read [engineering-guidelines.md](./guidelines/engineering-guidelines.md) — architecture, standards, security, UI rules.
2. Read [capability-definitions.md](./capabilities/capability-definitions.md) — domain building blocks and integration patterns.
3. Read [`.cursorrules`](../.cursorrules) — hard constraints summary.
4. Inspect the repo — **do not recreate completed work** (see §3 Progress).

**Hard rules:**
- TypeScript strict mode everywhere. No `any`.
- Monorepo only — one GitHub repo, npm workspaces (`frontend`, `backend`, `shared`).
- Drizzle ORM only — never Prisma, never raw SQL in application code.
- Shared types live in `shared/` — never duplicate between packages.
- All API responses use the standard envelope (see engineering-guidelines.md).

---

## 3. Progress Tracker

Update this table as phases complete.

| Phase | Name | Status |
| ----- | ---- | ------ |
| 0 | Monorepo scaffold | ✅ Done |
| 0b | Frontend foundation (Vite + shadcn) | ✅ Done |
| 1a | `.cursorrules` | ✅ Done |
| 1b | `initial.md` (this file) | ✅ Done |
| 1c | `engineering-guidelines.md` | ✅ Done |
| 1d | `capability-definitions.md` | ✅ Done |
| **1** | **Shared workspace (`@helfy/shared`)** | ⬜ **Next** |
| 2 | Database schema + migrations + seeds | ⬜ Pending |
| 3 | Backend auth + middleware | ⬜ Pending |
| 4 | Backend domain modules | ⬜ Pending |
| 5 | Frontend data layer (hooks + API modules) | ⬜ Pending |
| 6 | Frontend pages (full UX) | ⬜ Pending |
| 7 | Polish + documentation | ⬜ Pending |

### Already built (do not recreate)

**Root:** `package.json` workspaces, `docker-compose.yml`, `.env.example`, `.cursorrules`, `.editorconfig`, Prettier config

**frontend/** (Phase 0b complete):
- Vite 7 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (new-york, dark theme)
- Layout: `Header`, `Footer`, `Container`, `PageShell`, `AppLayout`
- Routes: all pages as placeholders (`HomePage`, `CatalogPage`, `CartPage`, `CheckoutPage`, auth, account, 404)
- `api/client.ts` with JWT refresh interceptor stub
- Zustand stores: `authStore`, `cartStore`, `uiStore`
- TanStack Query + Sonner providers in `AppProviders.tsx`
- Framer Motion page transitions in `AppLayout`

**Not yet built:** `shared/`, `backend/` (empty), database migrations/seeds

---

## 4. Repository Layout (Target State)

```
helfy-assignment/
├── ai-blueprint/
│   ├── initial.md                          ← you are here
│   ├── guidelines/engineering-guidelines.md
│   └── capabilities/capability-definitions.md
├── .cursorrules                            ← Cursor hard rules
├── frontend/                               ← React + Vite (✅ scaffolded)
├── backend/                                ← Express API (⬜ empty)
├── shared/                                 ← @helfy/shared (⬜ empty)
├── database/
│   ├── migrations/
│   └── seeds/
├── docker-compose.yml
├── .env.example
├── README.md
└── AI-INTERACTIONS.md
```

---

## 5. Build Phases — Execute In Order

### Phase 0 — Monorepo scaffold ✅

Root workspaces, `docker-compose.yml`, `.env.example`, folder structure exist.
**Do not delete or relocate** without explicit instruction.

---

### Phase 0b — Frontend foundation ✅

Runnable Vite + React 19 + TypeScript app with Tailwind v4 and shadcn/ui.

Verified:
- `npm run dev -w frontend` → http://localhost:5173
- `npm run build -w frontend` → succeeds
- shadcn Button/Card render with dark theme tokens

---

### Phase 1 — Shared workspace + env wiring ⬜ NEXT

**Goal:** End-to-end type safety foundation.

**Tasks:**
- Create `shared/package.json` with name `@helfy/shared`, build to `dist/`.
- Add types in `shared/src/types/`:
  - `user.ts`, `product.ts`, `cart.ts`, `order.ts`, `address.ts`, `category.ts`, `review.ts`, `api.ts`
- Add `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationMeta`, `ErrorCode` in `api.ts`
- Add Zod schemas in `shared/src/schemas/`:
  - `loginSchema`, `signupSchema`, `addressSchema`, `checkoutShippingSchema`, `checkoutPaymentSchema`
- Export all from `shared/src/index.ts`
- Wire `frontend` and `backend` package.json to depend on `@helfy/shared`
- Configure TypeScript project references or workspace imports

**Acceptance criteria:**
- [ ] `npm run build -w shared` succeeds
- [ ] Frontend imports `{ Product, loginSchema } from '@helfy/shared'` without duplication
- [ ] Backend can import the same types (once backend exists)

---

### Phase 2 — Database schema, migrations, seeds

**Goal:** Complete MySQL schema with demo data.

**Tables (minimum):**
`users`, `addresses`, `categories`, `products`, `product_images`, `carts`, `cart_items`, `orders`, `order_items`, `product_reviews`, `refresh_tokens`

**Tasks:**
- Define Drizzle schema in `backend/src/db/schema/` (one file per table group)
- Configure `drizzle.config.ts` — migrations output to `database/migrations/`
- FULLTEXT index on `products.name` + `products.description`
- Cart: `user_id` (nullable) AND `session_id` (nullable) for guest carts
- Seeds: 5+ categories, ~30 products (Picsum URLs), demo customer + admin user
- Scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio` in backend `package.json`

**Acceptance criteria:**
- [ ] `npm run db:up && npm run db:migrate && npm run db:seed` completes without error
- [ ] Adminer at http://localhost:8080 shows populated tables

---

### Phase 3 — Backend auth + global middleware

**Goal:** Secure auth layer with JWT refresh rotation.

**Tasks:**
- `backend/src/config/env.ts` — Zod-validated env, fail fast on startup
- `AppError`, `asyncHandler`, `logger` (pino), JWT utils
- Middleware: error, validate, auth, rate limiters
- Auth module: register, login, refresh (**token rotation**), logout, logout-all
- argon2 hashing; refresh tokens hashed in `refresh_tokens` table
- Access token in JSON body; refresh token in httpOnly cookie

**Acceptance criteria:**
- [ ] Register → login → protected route → refresh → logout works via curl/Postman
- [ ] Invalid refresh token returns 401
- [ ] Auth routes rate-limited to 10 req / 15 min

**Known AI-Gap:** Refresh rotation race on parallel tabs — use token family invalidation; log hand-fix in README.

---

### Phase 4 — Backend domain modules

**Goal:** Full REST API for eCommerce domains.

**Modules:** `users`, `products`, `categories`, `cart`, `orders`, `reviews`

Each module:
```
modules/{domain}/
  routes.ts, controller.ts, service.ts, repository.ts, validators.ts, types.ts
```

**Key endpoints (`/api/v1`):**

| Domain | Endpoints |
| ------ | --------- |
| Products | `GET /products`, `GET /products/:slug` |
| Categories | `GET /categories` |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `POST /cart/merge` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id` |
| Users | `GET /me`, `PATCH /me`, addresses CRUD |
| Reviews | `GET /products/:slug/reviews`, `POST /products/:slug/reviews` |

**Acceptance criteria:**
- [ ] All endpoints return standard envelope
- [ ] Guest cart via `X-Session-Id` header
- [ ] Cart merge dedupes by `product_id`, sums quantities

---

### Phase 5 — Frontend data layer

**Goal:** Connect frontend to backend API.

**Tasks:**
- API modules: `auth.api.ts`, `products.api.ts`, `cart.api.ts`, `orders.api.ts`
- TanStack Query hooks: `useAuth`, `useProducts`, `useProduct`, `useCart`, `useOrders`
- Wire login/logout to `authStore`; cart merge on login success
- Toast on API errors via Sonner

**Acceptance criteria:**
- [ ] Login stores access token; protected routes redirect when logged out
- [ ] API errors show toast, not uncaught rejections

---

### Phase 6 — Frontend pages (full UX)

**Goal:** Complete premium shopping experience.

| Route | Page |
| ----- | ---- |
| `/` | HomePage — hero, featured products |
| `/catalog` | Search, filters, sort, pagination (URL state) |
| `/products/:slug` | Gallery, reviews, add to cart |
| `/cart` | Line items, quantity controls |
| `/checkout` | 4-step stepper |
| `/login`, `/signup` | Auth forms |
| `/account/*` | Profile, addresses, orders, order detail |

**Acceptance criteria:**
- [ ] Full journey: browse → cart → checkout → order history
- [ ] Guest cart merges on login
- [ ] Filters persist in URL

---

### Phase 7 — Polish + documentation

**Goal:** Submission-ready repo.

**Tasks:**
- Error boundaries on every page
- Optimistic cart with rollback
- Finalize `README.md` with **Manual Interventions**
- Create `AI-INTERACTIONS.md` — every prompt, Cursor model, tools used
- `npm run lint && npm run build` — zero errors

**Acceptance criteria:**
- [ ] `npm run build` succeeds for all workspaces
- [ ] End-to-end demo works with `npm run db:up && npm run dev`

---

## 6. Definition of Done (Whole Project)

- [ ] All build phase acceptance criteria pass (Phase 1–7)
- [ ] No `any` types in codebase
- [ ] No secrets committed
- [ ] `.env.example` matches all env vars in use
- [ ] Demo user completes full purchase flow
- [ ] Manual Interventions documented in README.md
- [ ] AI-INTERACTIONS.md complete (Cursor prompts + models)

---

## 7. Out of Scope

| Item | Approach |
| ---- | -------- |
| Live Stripe | Mock `PaymentService`; document plug-in point |
| Real email | Log to pino |
| S3/Cloudinary | Picsum/Unsplash URLs in seeds |
| Multi-currency | Hard-code USD |
| Admin panel | Optional stretch goal after core features |

---

## 8. When Stuck

1. Re-read [engineering-guidelines.md](./guidelines/engineering-guidelines.md).
2. Re-read the relevant section in [capability-definitions.md](./capabilities/capability-definitions.md).
3. Make the smallest correct diff — do not rewrite working modules.
4. AI-Gap? Fix by hand, log in README Manual Interventions, note in AI-INTERACTIONS.md.

---

## 9. Quick Commands

```bash
npm install                  # install all workspaces
npm run dev -w frontend      # frontend only → :5173
npm run dev                  # frontend + backend (once backend exists)
npm run db:up                # start MySQL + Adminer
npm run db:migrate           # apply migrations (Phase 2+)
npm run db:seed              # seed demo data (Phase 2+)
npm run build                # build shared → backend → frontend
```

**Start with Phase 1 (shared workspace) unless explicitly instructed otherwise.**
