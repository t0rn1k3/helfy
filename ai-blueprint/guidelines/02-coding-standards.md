# 02 — Coding Standards

> TypeScript, naming, stack choices, API design, git conventions.
> Architecture: [01-architecture.md](./01-architecture.md)

---

## Technology Stack (Non-Negotiable)

| Concern | Use | Never use |
| ------- | --- | --------- |
| Frontend | React 19 + Vite 6 + TS 5 | CRA, Next.js |
| Styling | Tailwind v4 + shadcn/ui (new-york) | MUI, Bootstrap |
| Backend ORM | Drizzle + mysql2 | Prisma, Sequelize, raw SQL |
| Password hash | argon2 | bcrypt, SHA |
| Auth | JWT access + httpOnly refresh cookie | localStorage for refresh |
| HTTP client (FE) | Axios via `api/client.ts` | fetch in app code |
| Validation | Zod | Joi, Yup, manual checks |
| Logger (BE) | pino | console.log in prod paths |

---

## TypeScript

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- **No `any`.** Use `unknown` + Zod `.parse()` or type guards.
- Prefer `as const` objects over TypeScript enums for shared FE/BE constants.
- Explicit return types on all exported functions.
- `interface` for object shapes; `type` for unions/intersections.

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| React components / pages | PascalCase file | `ProductCard.tsx` |
| Hooks | camelCase + `use` prefix | `use-cart.ts` |
| Services, repos, utils | kebab-case | `auth.service.ts` |
| DB tables / columns | snake_case | `cart_items` |
| Env vars | SCREAMING_SNAKE_CASE | `JWT_ACCESS_SECRET` |
| Zod schemas | camelCase + `Schema` | `loginSchema` |
| API routes | kebab-case, plural | `/api/v1/cart/items` |

---

## API Design

### Response envelope

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
  code: string;
  details?: unknown;
}

// Paginated
interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
```

Define these in `@helfy/shared` — import everywhere, never re-declare.

### HTTP status codes

| Code | Use |
| ---- | --- |
| 200 | GET, PATCH, DELETE success |
| 201 | POST created |
| 400 | Malformed request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Business validation failed |
| 429 | Rate limited |
| 500 | Server error |

### Pagination

- Default `limit`: 20 | Max: 100
- Query: `?page=1&limit=20`

---

## Database Coding (Drizzle)

```typescript
// Always select explicit columns
const row = await db
  .select({ id: products.id, name: products.name, price: products.price })
  .from(products)
  .where(eq(products.slug, slug))
  .limit(1);
```

- Migrations via `drizzle-kit generate` → `database/migrations/`
- Never edit applied migration files
- All tables: `id`, `created_at`, `updated_at`
- Indexes on: `email`, `slug`, `user_id`, `session_id`, `product_id`

---

## Git & Commit Conventions

```
feat:     new feature
fix:      bug fix
refactor: no behavior change
chore:    tooling, deps, config
docs:     documentation only
test:     add or update tests
```

- One logical change per commit.
- Never commit `.env`, `node_modules/`, `dist/`.

---

## Environment Variables

- Root `.env.example` documents ALL vars.
- Backend: `backend/.env` | Frontend: `frontend/.env` (`VITE_*` only).
- Backend validates env with Zod at startup — fail fast if missing.
