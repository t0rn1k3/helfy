# Database

MySQL 8 schema managed by Drizzle ORM. Migrations and seed data for the Helfy eCommerce platform.

## Prerequisites

- Docker Desktop running
- Node.js >= 20

## Quick Start

From the repo root:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Browse data at [Adminer](http://localhost:8080):
- System: MySQL
- Server: `mysql`
- Username: `helfy`
- Password: `helfy_dev_password`
- Database: `helfy_ecommerce`

## Demo Credentials (after seed)

| Email | Password | Role |
| ----- | -------- | ---- |
| customer@helfy.dev | password123 | customer |
| admin@helfy.dev | password123 | admin |

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run db:up` | Start MySQL + Adminer (Docker) |
| `npm run db:down` | Stop containers |
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Insert demo categories, products, users |
| `npm run db:studio` | Open Drizzle Studio |

## Structure

```
database/
├── migrations/          ← Drizzle-generated SQL
└── seeds/
    ├── categories.seed.ts
    ├── products.seed.ts
    └── users.seed.ts
```

Schema source: `backend/src/db/schema/`

## After Schema Changes

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

Never edit applied migration files — create a new migration instead.
