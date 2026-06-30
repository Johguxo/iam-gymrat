# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js 16

This repo uses Next.js 16.2 with React 19. APIs differ from older Next.js you may have seen in training data (App Router conventions, async params, caching defaults, etc.). Before writing Next-specific code, check `node_modules/next/dist/docs/` for the current API and heed deprecation notices.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` | Runs `prisma generate` then `next build` |
| `npm run lint` | ESLint (flat config in `eslint.config.mjs`) |
| `npm run db:migrate -- --name <name>` | Create + apply a dev migration |
| `npm run db:deploy` | Apply migrations in prod |
| `npm run db:seed` | Run `prisma/seed.ts` (initializes 7 empty `RoutineDay` rows) |
| `npm run db:studio` | Prisma Studio GUI |

No test runner is configured.

Required env vars: `DATABASE_URL` (Postgres on Railway), `AUTH_SECRET` (`openssl rand -base64 32`).

## Architecture

**Domain model** (`prisma/schema.prisma`): a `User` owns `Exercise`s (each tagged with a `MuscleGroup` enum: PECHO, BICEPS, TRICEPS, ESPALDA, HOMBROS, PIERNAS). Each `Exercise` has many `WorkoutSet`s (weight, reps, sets, performedAt). A `User` also has 7 `RoutineDay` rows (composite PK `userId+dayOfWeek`) holding the muscle groups planned per weekday.

**Auth** (NextAuth v5 beta, JWT strategy):
- `src/auth.config.ts` is the edge-safe config used by `src/middleware.ts`. It enforces auth on every route except `PUBLIC_PATHS` (`/login`, `/registro`, `/olvide-contrasena`) and bounces logged-in users away from those public paths.
- `src/auth.ts` adds the Credentials provider (bcrypt against `User.passwordHash`) — must stay out of the middleware/edge bundle because of `bcryptjs` and Prisma.
- `requireUserId()` in `src/auth.ts` is the server-side helper to scope queries to the current user. All Prisma queries on user-owned data must filter by this id.

**Routing** (App Router under `src/app/`):
- `/` dashboard, `/grupos` muscle group list, `/ejercicios/[id]` exercise detail + history chart, `/rutina` weekly routine editor, `/estadisticas` PRs/volume.
- `/api/auth/[...nextauth]` is the only API route — mutations happen via Server Actions, not REST.

**Shared lib** (`src/lib/`):
- `db.ts` — Prisma singleton (reuse this; don't `new PrismaClient()` elsewhere).
- `muscle-groups.ts` — single source of truth for labels, slugs, and colors for the `MuscleGroup` enum. Reuse when rendering or routing by group.
- `validation.ts` — Zod schemas for form input.
- `utils.ts` — `cn()` Tailwind merge helper.

**UI**: Tailwind 4 (via `@tailwindcss/postcss`), shared primitives in `src/components/`. Recharts for charts. Spanish-language UI/routes (`/registro`, `/rutina`, `/ejercicios`, etc.) — keep new copy and route names in Spanish to match.
