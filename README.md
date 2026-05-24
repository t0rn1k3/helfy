# Helfy — AI-Blueprint-Driven eCommerce Platform

A premium full-stack eCommerce application built from an AI Blueprint (`ai-blueprint/`).
Single GitHub repo, npm workspaces (`frontend`, `backend`, `shared`).

## Stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React 19, Vite 7, TypeScript, Tailwind v4, shadcn/ui, Framer Motion, React Router v7, TanStack Query, Zustand |
| Backend  | Node 20, Express 4, TypeScript, Drizzle ORM, mysql2, JWT, argon2, Zod, pino |
| Database | MySQL 8 (Docker or local instance) |
| Shared   | `@helfy/shared` — types + Zod schemas |
| Tooling  | npm workspaces, Prettier, ESLint, Husky |

## Repo Layout

```
helfy-assignment/
├── ai-blueprint/        # AI engine — initial.md, guidelines, capabilities
├── .cursorrules         # Hard rules for Cursor agents
├── frontend/            # React SPA (:5173)
├── backend/             # Express API (:4000)
├── shared/              # Shared types + validation
├── database/            # Migrations + seeds
├── docker-compose.yml   # MySQL 8 + Adminer (optional)
├── README.md
└── AI-INTERACTIONS.md   # Prompt + model log
```

## Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 10
- MySQL 8 (via Docker **or** a local/server instance you configure manually)

### Setup

```bash
git clone <repo-url> helfy
cd helfy

npm install

# Environment — copy and edit for your MySQL host/credentials
cp .env.example backend/.env
cp frontend/.env.example frontend/.env

# Start MySQL (Docker option)
npm run db:up

# Or use your own MySQL — set DATABASE_URL in backend/.env, then:
npm run db:migrate
npm run db:seed

npm run dev
```

Open:

| Service | URL |
| ------- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000/api/v1 |
| Adminer (Docker) | http://localhost:8080 |

### Demo Credentials

Seeded by `npm run db:seed`:

| Email | Password | Role |
| ----- | -------- | ---- |
| customer@helfy.dev | password123 | customer |
| admin@helfy.dev | password123 | admin |

### Demo Flow

1. Browse `/catalog` — search, filter, paginate
2. Open a product → **Add to cart** (works as guest)
3. Sign in → guest cart merges automatically
4. `/cart` → **Proceed to checkout**
5. Complete 4-step checkout (mock payment)
6. View order at `/account/orders`

## Scripts (root)

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Backend + frontend (builds shared first) |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run build` | shared → backend → frontend |
| `npm run db:up` | Docker: MySQL + Adminer |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:seed` | Insert demo data |
| `npm run db:studio` | Drizzle Studio |
| `npm run lint` | ESLint (frontend) |
| `npm run format` | Prettier |

## AI Blueprint

Regenerate from scratch: point a Cursor agent at [`ai-blueprint/initial.md`](./ai-blueprint/initial.md)
and execute phases 0–7 in order.

See [`AI-INTERACTIONS.md`](./AI-INTERACTIONS.md) for prompts, models, and tools used.

## Manual Interventions

    I manually connected mysql database to project. All rest was done by AI agents.


