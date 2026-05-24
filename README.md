# Helfy — AI-Blueprint-Driven eCommerce Platform

A premium full-stack eCommerce application generated end-to-end from an AI Blueprint
(`ai-blueprint/`). Single GitHub repo, monorepo via npm workspaces.

> Note: This README is a Phase 0 skeleton. The final version (with Manual
> Interventions log) is written in Phase 7 of the build.

## Stack

| Layer    | Technologies                                                                                  |
| -------- | --------------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite 6, TypeScript, Tailwind v4, shadcn/ui, Framer Motion, React Router, TanStack Query, Zustand |
| Backend  | Node 20, Express 4, TypeScript, Drizzle ORM, mysql2, JWT, argon2, Zod, pino                  |
| Database | MySQL 8 (Docker for local dev)                                                                |
| Tooling  | npm workspaces, Prettier, ESLint, Husky + lint-staged                                         |

## Repo Layout

```
helfy-assignment/
├── ai-blueprint/        # The "Engine" — initial.md + guidelines + capabilities
├── .clinerules          # Hard rules auto-loaded by Cline
├── frontend/            # React + Vite + TypeScript
├── backend/             # Express + TypeScript + Drizzle
├── database/            # Migrations + seed data
├── shared/              # End-to-end TypeScript types + Zod schemas
├── docker-compose.yml   # MySQL 8 + Adminer
├── README.md            # This file
└── AI-INTERACTIONS.md   # Prompts, models, and tools log
```

## Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker Desktop (for MySQL)

### Setup

```bash
git clone <repo-url> helfy
cd helfy

cp .env.example .env
cp .env.example backend/.env
cp .env.example frontend/.env

npm install

npm run db:up

npm run db:migrate
npm run db:seed

npm run dev
```

Open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/v1
- Adminer (DB UI): http://localhost:8080

### Demo Credentials

Populated by `npm run db:seed`. See `database/seeds/users.seed.ts` for the
generated accounts (a customer and an admin user).

## Available Scripts (root)

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start backend + frontend in parallel             |
| `npm run dev:frontend` | Start only the frontend                          |
| `npm run dev:backend`  | Start only the backend                           |
| `npm run build`        | Build all workspaces (shared → backend → frontend) |
| `npm run db:up`        | Start MySQL + Adminer in Docker                  |
| `npm run db:down`      | Stop the local DB                                |
| `npm run db:migrate`   | Apply Drizzle migrations                         |
| `npm run db:seed`      | Insert seed data                                 |
| `npm run db:studio`    | Open Drizzle Studio                              |
| `npm run lint`         | Run ESLint across workspaces                     |
| `npm run format`       | Format with Prettier                             |
| `npm run test`         | Run all workspace tests                          |

## AI Blueprint

The complete AI engine lives in `ai-blueprint/`. To regenerate the project from
scratch, point an agent at [`ai-blueprint/initial.md`](./ai-blueprint/initial.md)
and let it execute the phases.

See [`AI-INTERACTIONS.md`](./AI-INTERACTIONS.md) for the prompts, models, and
tools used during this build.

## Manual Interventions

_To be filled in during Phase 7. This section will document every fix that was
faster to do by hand than to prompt for, and explain why._

## License

Private — assignment submission.
