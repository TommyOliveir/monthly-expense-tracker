# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

npm-workspaces + Turborepo monorepo with two apps:

- `apps/api` — NestJS 11 REST API, Prisma 6 on PostgreSQL (Neon). Deployed on Render's Free instance type (binds `0.0.0.0:$PORT`, default 3001). It spins down after 15 minutes idle, so the first request after a break waits for a cold start.
- `apps/web` — Next.js 16 (App Router) + React 19, TanStack Query, Tailwind 4, shadcn/ui (`base-nova` style on `@base-ui/react`). Deployed on Vercel.

`apps/web/CLAUDE.md` applies inside the web app: this Next.js version has breaking changes, so read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing Next.js code.

## Commands

Run from the repo root unless noted.

```bash
npm run dev              # turbo: runs api (nest --watch) and web (next dev) together
npm run build
npm run check:push       # full gate: api lint+types+tests, web lint+types+tests
npm run format           # prettier over the whole repo
```

API (`cd apps/api`):

```bash
npm run start:dev
npm run lint:check       # `npm run lint` auto-fixes
npm run typecheck
npm test                                     # jest, *.spec.ts under src/
npx jest src/budget/budget.service.spec.ts   # single file
npx jest -t "test name"                      # single test by name
npm run test:e2e                             # test/*.e2e-spec.ts
npx prisma migrate dev --name <change>       # after editing prisma/schema.prisma
npx prisma db seed                           # seeds global default categories
npm run prisma:generate
```

Web (`cd apps/web`):

```bash
npm run dev
npm run lint
npm run typecheck
npm test                       # vitest run (no config file or tests exist yet)
npx vitest run path/to/file    # single file
```

The husky pre-commit hook runs `lint-staged` (eslint --fix on staged TS in each app) and then type-checks both apps, so a type error anywhere blocks commits.

## Environment

- API: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL` (added to the CORS allowlist next to `http://localhost:3000`), `PORT`, `GOOGLE_CLIENT_ID` (audience checked when verifying Google ID tokens; `POST /auth/google` returns 500 without it). `JWT_SECRET` and `JWT_REFRESH_SECRET` are required and must differ: `loadJwtSecrets()` (`src/auth/jwt-secrets.ts`, provided as `JWT_SECRETS` in `AuthModule`) stops the API from starting otherwise.
- Web: `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (read in `src/config.ts`, typed in `env.d.ts`). The Google button is hidden when the client ID is unset.
- `apps/api/neon.ts` is Neon branch config: non-default branches get a 7-day TTL.

## API architecture

- Feature modules under `src/` (`auth`, `user`, `budget`, `category`, `expense`, `prisma`), each with controller, service, and `dto/` validated by class-validator. The global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted`, so any request field not declared on the DTO is rejected with a 400.
- `src/user` is the real user module (Prisma-backed, used by auth). `src/users` is leftover Nest scaffold with in-memory data. Don't extend it.
- Imports outside the current folder use the `@/` alias (`@/*` → `src/*`, e.g. `from '@/auth/guards/jwt-auth.guard'`), and same-folder imports use `./`. ESLint rejects `../` and `src/...` imports. The alias is defined in `tsconfig.json` and mirrored in Jest's `moduleNameMapper` (in `package.json` for unit tests, `test/jest-e2e.json` for e2e). `nest build` rewrites it to relative paths in `dist/`.
- Auth: passport-jwt bearer tokens. Protect routes with `@UseGuards(JwtAuthGuard)` and read the caller with `@GetUser('id')` (`src/auth/decorators/get-user.decorator.ts`). Both tokens carry `sid` (session id) and `type` (`access`/`refresh`). `JwtStrategy.validate` accepts only `type: 'access'` and looks up the session on every request, so logout or account deletion ends access immediately. Every user-owned query must filter by that `userId`. Google sign-in (`POST /auth/google`) verifies a Google Identity Services ID token, then finds the user by `googleId`, links by verified email, or creates a password-less user. Each login creates a row in `sessions` (one per device). The refresh token carries its id as `sid`, and only a SHA-256 hash of the current token is stored (`src/auth/refresh-token-hash.ts`; old argon2 hashes still verify once). `POST /auth/refresh` rotates it and `POST /auth/logout` deletes that one session, both taking `{ refresh_token }`. Access tokens last 15 minutes, and refresh tokens last 30 days, renewed on every refresh.
- Swagger UI is served at `/docs`.
- Data model (`prisma/schema.prisma`): `Budget` is unique per `(userId, year, month)`, and `POST /budget` upserts it. `Expense` stores denormalized `year`/`month` (derived from `date` in `ExpenseService.create`) for the `(userId, year, month)` index, so set them whenever you write `date`. Default categories exist in two forms: global rows from `prisma/seed.ts` (`userId = null`), and per-user copies that `UserService.create` makes at signup (`isDefault = true`, `userId` set). Category listing returns only the user's own rows, so the per-user copies are what users see. Expenses may reference any default, but defaults can't be edited or deleted. Money fields are `Decimal(12,2)`.
- Prisma agent skills for this project live in `apps/api/.claude/skills/` (symlinked to `.agents/skills/`). The project is on Prisma 6. The `prisma-upgrade-v7` skill describes a migration, not the current setup.

## Web architecture

- All code lives under `src/`. Imports outside the current folder use the `@/` alias (`@/*` → `src/*`), and same-folder imports use `./`. ESLint rejects `../` imports. Routes are in `src/app/` (`/`, `/login`, `/tracker`, `/about`). The data and auth layers are:
  - `src/api/client.ts`: the only fetch wrapper (`get`/`post`/`patch`/`del`/`postForm`). It attaches the bearer token and refreshes before sending when the token's `exp` has passed; on a 401 it refreshes and retries once. Refreshes are deduplicated within a tab and queued across tabs with the Web Locks API, and only a server rejection (not a network error) clears the session. Pass `{ requiresAuth: false }` for public calls.
  - `src/providers/query-provider.tsx`: the React Query cache is persisted to `localStorage["ipon-query-cache"]` for 30 days (`maxAge`), so reopening the app shows the last data while it refetches. Data is fresh for 5 minutes (`staleTime`), and `gcTime` is `Infinity`: never set a timer option above 2^31-1 ms (~24.8 days), because it overflows and fires immediately. Bump `QUERY_CACHE_VERSION` when a cached response shape changes.
  - `src/api/endpoints.ts`: central `ENDPOINTS` map. Add routes here instead of hardcoding paths.
  - `src/features/<domain>/` (`auth`, `budget`, `category`, `expense`), each split as `types/`, `queries/<x>Keys.ts` (query-key factory), `queries/<x>Queries.ts` (plain API functions), and `hooks/` (TanStack `useQuery`/`useMutation` wrappers that invalidate via the key factory). Follow this split for new features.
- Auth state: `src/features/auth/tokenStore.ts` is a module-level token store persisted to `localStorage["session"]`, synced across tabs via the `storage` event, with a subscribe API. `AuthProvider` (mounted in `src/app/layout.tsx` inside `QueryProvider`) mirrors it into React context and keeps the user object in `localStorage["user"]`. Use `useAuth()` to access it. When the tokens are cleared it also clears the React Query cache. There is no server-side auth gate: the redirect in `src/app/tracker/layout.tsx` is commented out.
- UI primitives are shadcn components in `src/components/ui/`. Add more with the shadcn CLI per `components.json`.

## Formatting

Prettier differs per app: the root config uses double quotes (applies to web), and `apps/api/.prettierrc` uses single quotes.
