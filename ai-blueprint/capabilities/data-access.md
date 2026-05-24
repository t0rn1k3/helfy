# Data Access Capability

> Drizzle ORM patterns, schema organization, migrations, repository rules.
> Architecture: [../guidelines/01-architecture.md](../guidelines/01-architecture.md)

---

## Purpose

Consistent, type-safe database access across all backend modules.

---

## DB Client

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

### Cold-start retry (AI-Gap)

On `ECONNREFUSED`, retry connection 5× with 2s backoff before crashing.

---

## Schema Files

```
backend/src/db/schema/
  index.ts
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

### Table requirements

- All tables: `id`, `created_at`, `updated_at`
- Cart: nullable `user_id` AND nullable `session_id`
- Products: FULLTEXT index on `name` + `description`
- Indexes: `email`, `slug`, `user_id`, `session_id`, `product_id`
- Prices stored as **integers (cents)**

---

## Repository Rules

- One repository per domain module
- Select explicit columns — never unbounded `.select()`
- Return typed results mapped to `@helfy/shared` types
- Multi-table writes use transactions:

```typescript
await db.transaction(async (tx) => {
  const order = await tx.insert(orders).values({ ... });
  await tx.insert(orderItems).values([...]);
  await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
});
```

---

## Query Patterns

```typescript
// Pagination
const offset = (page - 1) * limit;
const [items, [{ count }]] = await Promise.all([
  db.select({ ... }).from(products).limit(limit).offset(offset),
  db.select({ count: sql<number>`count(*)` }).from(products),
]);

// FULLTEXT search
.where(sql`MATCH(${products.name}, ${products.description}) AGAINST(${q} IN NATURAL LANGUAGE MODE)`)
```

---

## Migration Workflow

```bash
npm run db:generate    # drizzle-kit → database/migrations/
npm run db:migrate     # apply pending
npm run db:seed        # demo data
npm run db:studio      # visual browser
```

- Never edit applied migration files
- Seeds live in `database/seeds/`

---

## Seed Data (minimum)

| Entity | Count | Notes |
| ------ | ----- | ----- |
| Categories | 5+ | slug, name, image URL |
| Products | ~30 | Picsum images, varied prices/brands |
| Users | 2 | demo customer + admin |
| Reviews | ~10 | spread across products |

---

## Acceptance Criteria

- [ ] `npm run db:up && npm run db:migrate && npm run db:seed` succeeds
- [ ] All FK relationships enforced
- [ ] FULLTEXT search returns relevant results
- [ ] Connection pool retries on Docker cold start
