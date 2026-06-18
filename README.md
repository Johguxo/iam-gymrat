# GymRat

App personal para registrar entrenamientos: ejercicios por grupo muscular, pesos, progreso y rutina semanal.

**Stack:** Next.js 16 (App Router) · Prisma 6 · Postgres (Railway) · Tailwind 4 · Recharts.

## Grupos musculares

Pecho, Bíceps, Tríceps, Espalda, Hombros, Piernas.

## Setup

### 1. Crear la base de datos en Railway

1. Entra a [railway.app](https://railway.app) → **New Project** → **Provision PostgreSQL**.
2. Abre el servicio Postgres → pestaña **Variables** → copia `DATABASE_PUBLIC_URL` (la pública, para conectar desde tu máquina).
3. Crea un archivo `.env` en la raíz del proyecto:

```bash
DATABASE_URL="postgresql://...la-url-de-railway..."
AUTH_SECRET="generala-con: openssl rand -base64 32"
```

### 2. Migrar y arrancar

```bash
npm install
npm run db:migrate -- --name init   # crea las tablas en Railway
npm run dev
```

Abre `/registro` para crear tu cuenta (correo, contraseña, nombre, edad).
Los 7 días de la rutina se inicializan vacíos al registrarte.

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (corre `prisma generate`) |
| `npm run db:migrate` | Crear / aplicar migración en dev |
| `npm run db:deploy` | Aplicar migraciones en producción |
| `npm run db:seed` | Inicializar rutina vacía (días 0-6) |
| `npm run db:studio` | Prisma Studio (GUI para inspeccionar datos) |

## Deploy en Railway

1. Push del repo a GitHub.
2. En el mismo proyecto de Railway → **New** → **GitHub Repo** → selecciona este repo.
3. En el servicio del app, **Variables** → añade `DATABASE_URL` apuntando a `${{ Postgres.DATABASE_URL }}` (referencia interna).
4. **Settings** → Build Command: `npm run build && npm run db:deploy`.
5. Start command: `npm run start`.

## Estructura

```
prisma/
  schema.prisma         # MuscleGroup, Exercise, WorkoutSet, RoutineDay
  seed.ts
src/
  app/
    page.tsx            # Dashboard
    grupos/             # Lista de grupos + ejercicios por grupo
    ejercicios/[id]/    # Detalle: registrar set, historial, chart
    rutina/             # Editor de rutina semanal
    estadisticas/       # PRs, volumen total, volumen semanal
  lib/
    db.ts               # Cliente Prisma singleton
    muscle-groups.ts    # Labels, slugs, colores
    validation.ts       # Esquemas Zod
  components/ui.tsx     # Card, Button, Input, Label, Badge
```
