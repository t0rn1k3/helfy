# Engineering Guidelines & Constraints

> Cross-cutting rules for AI-driven development of the Helfy eCommerce platform.
> Hard-constraint summary: [`.cursorrules`](../../.cursorrules)
> Bootstrap prompt: [`initial.md`](../initial.md)

---

## Guideline Index

Read all files before generating code:

| # | File | Topics |
| - | ---- | ------ |
| 01 | [architecture.md](./01-architecture.md) | Monorepo, backend modules, frontend structure, shared workspace |
| 02 | [coding-standards.md](./02-coding-standards.md) | TypeScript, naming, stack, API design, git, env vars |
| 03 | [error-handling.md](./03-error-handling.md) | AppError, asyncHandler, error codes, FE boundaries, toasts |
| 04 | [security.md](./04-security.md) | JWT, argon2, refresh rotation, CORS, rate limits, validation |
| 05 | [ui-design-system.md](./05-ui-design-system.md) | shadcn/ui, Tailwind v4 tokens, motion, responsive, UX states |
| 06 | [testing.md](./06-testing.md) | Vitest, supertest, RTL, mocking, coverage targets |

---

## Known AI-Gaps

Fix by hand if needed — log in README § Manual Interventions:

| Gap | Expected fix |
| --- | ------------ |
| MySQL pool cold-start | Retry 5× with 2s backoff on ECONNREFUSED |
| JWT refresh race (parallel tabs) | Token family ID; invalidate siblings on rotation |
| Guest cart merge | Dedupe by `product_id`, sum qty, keep lowest price snapshot |
| Tailwind v4 + shadcn CSS vars | `@theme inline`, oklch in `:root` |
| Drizzle migration drift | Never hand-edit applied migrations |
| Optimistic cart rollback | TanStack Query `onMutate` + `onError` restore cache |

---

## AI Orchestration (Cursor)

| Artifact | Role |
| -------- | ---- |
| `.cursorrules` | Hard constraints — auto-loaded by Cursor |
| `ai-blueprint/initial.md` | Bootstrap prompt — phase-by-phase build plan |
| `ai-blueprint/guidelines/` | Long-form rules (this folder) |
| `ai-blueprint/capabilities/` | Domain building blocks |
| `AI-INTERACTIONS.md` | Prompts, models, tools log |

Point the Cursor agent at `initial.md` first when regenerating the project.

---

## Documentation Deliverables

| File | Purpose |
| ---- | ------- |
| `README.md` | Quick-start, demo credentials, **Manual Interventions** |
| `AI-INTERACTIONS.md` | Every prompt, model, tool used during build |
| `.env.example` | All env vars documented |
| `database/README.md` | Migration and seed instructions |

---

## Performance Budget

- LCP: < 2.5s on 3G (lazy-load below-fold images)
- API p95: < 200ms for catalog list (indexed queries)
- Bundle: code-split routes with `React.lazy()`
- Search debounce: 300ms
- Paginate all lists — never return unbounded arrays
