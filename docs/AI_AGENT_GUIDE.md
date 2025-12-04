# AI Agent Reference Guide — Guess2

This guide equips AI code editors (e.g., Trae, Google Antigravity) to understand, modify, test, and deploy Guess2 safely and effectively.

## App Overview
- Frontend: React + Vite + TypeScript + Tailwind (`src/pages`, `src/components`)
- Backend: Express + TypeScript wired to serverless entry (`api/index.ts` → `api/app.ts` → `api/routes/*`)
- Auth/DB: Supabase Postgres with RLS and trigger-driven profile creation
- Cache: Redis (optional; used for leaderboards)
- Payments: Stripe
- Deploy: Vercel (frontend + serverless API)

## Critical Conventions
- Path alias: `@/*` → `./src/*` (see `tsconfig.json`)
- Supabase client (frontend): `@/supabase/client` — reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Server-side Supabase: `api/config/supabase.ts` — requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE`
- API base resolver: `@/utils/api` — same-origin in production; `http://localhost:3002` in local dev
- UI components: lightweight `Card`, `Button`, `Badge` under `src/components/ui/*`

## Environment & Secrets
- Do not place service role keys in frontend code.
- Required env vars:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_API_BASE_URL`
  - Backend/Serverless: `VITE_SUPABASE_URL`, `VITE_SUPABASE_SERVICE_ROLE`, `STRIPE_SECRET_KEY`
- Template provided at `.env.example`. Ensure `.env*` is ignored by git (see `.gitignore`).

## Supabase Details
- RLS enabled on `public.users` with policies:
  - Insert/Select/Update allowed for the authenticated user where `auth.uid() = id`
- Trigger `public.handle_new_user` automatically creates a `users` profile row on `auth.users` insert.
- Migration files: `supabase/migrations/*` include schema, RLS, trigger, and a daily challenge seed.

## Deployment (Vercel)
1. Create/Select Vercel project.
2. Set environment vars in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_ROLE`
   - `STRIPE_SECRET_KEY`
   - Optional `VITE_API_BASE_URL` (leave blank for same-origin `/api/*`)
3. Build command: `npm run build` (Vite)
4. Serverless API entry: `api/index.ts` (no extra config required; Vercel routes `/api/*` to this handler)
5. Verify: open preview URL, test auth, dashboard, leaderboard, and payments.

## Local Development
- Start both servers: `npm run dev`
- Frontend only: `npm run client:dev`
- Backend only: `npm run server:dev` (defaults to `http://localhost:3002`)
- Build/Preview: `npm run build`, `npm run preview`

## Testing & Utilities
- `npm run test:auth` — creates user, logs in, updates username, reads profile, cleans up
- `npm run test:rls` — verifies RLS: deny cross-user insert, allow self-update, trigger profile
- `npm run create:login-user` — creates a demo account and prints credentials
- `npm run list:users` — lists users from `public.users` (safe fields)

## Data Seeding
- Seed today’s challenge: `supabase/migrations/seed_create_today_challenge.sql`
  - Run via Supabase SQL editor or apply migration in your environment
- Fallback logic on Dashboard shows latest active non‑premium challenge if today’s is missing

## Stripe Notes
- API version pinned to `'2023-10-16'` in `api/routes/payments.ts`
- Ensure `STRIPE_SECRET_KEY` is set in backend envs

## Common Pitfalls & Fixes
- RLS insert errors on signup: rely on trigger to create `users` row; avoid client-side profile insert pre-session
- Missing env causes “supabaseUrl is required”: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Logout abort (`ERR_ABORTED`): await `supabase.auth.signOut()` then route to `/auth/login` (implemented)
- API base mismatch: use `apiUrl('/api/...')` to resolve base per environment

## Editing Guidelines (Do/Don’t)
- Do: import Supabase from `@/supabase/client` in all frontend code.
- Do: use `apiUrl('/api/...')` for backend calls; avoid hardcoded hosts.
- Do: keep path alias `@/*` for imports; don’t use deep relative paths.
- Do: prefer React hooks and simple local state; avoid introducing heavy state libs.
- Don’t: expose or use service-role keys in browser code.
- Don’t: bypass RLS by writing arbitrary rows to `public.users`; update only your own row after session.
- Don’t: change Stripe API version; keep `'2023-10-16'` unless updating server code and testing.
- Don’t: force `window.location.reload()` on auth; use router navigation.

## Common Tasks (Step-by-step)
- Add a new page
  - Create `src/pages/MyPage.tsx`, route via the app’s router, use existing UI components from `src/components/ui/*`.
  - If fetching data, call `fetch(apiUrl('/api/...'))` or use Supabase client.
- Add a new backend route
  - Add handler in `api/routes/<feature>.ts`, mount in `api/app.ts` (e.g., `app.use('/api/<feature>', featureRoutes)`).
  - Use `api/config/supabase.ts` for DB access and ensure envs exist.
- Add a Supabase SQL migration
  - Create file under `supabase/migrations/<name>.sql` with DDL/Policies.
  - Apply via Supabase SQL editor or migration tooling; ensure RLS consistency.
- Seed a challenge
  - Use `supabase/migrations/seed_create_today_challenge.sql` or create your own seed with `CURRENT_DATE` and `is_active = TRUE`.
- Update leaderboard logic
  - Frontend: `src/pages/Leaderboard.tsx` uses tabs and preview.
  - Backend: `api/routes/leaderboard.ts`; add Redis usage via `api/config/redis.ts`.
- Add a subscription plan
  - UI: `src/components/PremiumSubscription.tsx` and config in `src/config/stripe.ts`.
  - Backend: `api/routes/payments.ts`; ensure price IDs and Stripe key.

## Deployment Tips
- Serverless considerations: avoid long-running work in route handlers; use async jobs or external services.
- Env scoping: set frontend envs for Vite and backend envs for API; they are separate contexts.
- Same-origin API: in production, the frontend calls `'/api/*'` without host; local dev uses `http://localhost:3002`.

## Troubleshooting Matrix
- `supabaseUrl is required` → missing `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` in deployment.
- `new row violates row-level security` → writing to `users` without session/RLS policy; rely on trigger and update own row only.
- `ERR_ABORTED ... /logout` → don’t reload page; await `signOut()` then navigate.
- Stripe 4xx errors → verify `STRIPE_SECRET_KEY`, product/price IDs, and API version.

## File Map (Key References)
- Frontend
  - `src/pages/Dashboard.tsx` — daily challenge CTA, greeting, stats
  - `src/pages/Challenge.tsx` — gameplay flow, scoring, submission
  - `src/pages/Profile.tsx` — profile stats and subscription UI
  - `src/pages/Leaderboard.tsx` — rankings and user rank card
  - `src/pages/auth/*` — login/signup flows
  - `src/components/ui/*` — Card/Button/Badge primitives
  - `src/supabase/client.ts` — Supabase browser client
  - `src/utils/api.ts` — environment-aware API base
- Backend
  - `api/app.ts` — Express app wiring
  - `api/index.ts` — Vercel serverless entry
  - `api/routes/*` — auth/leaderboard/admin/payments endpoints
  - `api/config/supabase.ts` — server-side Supabase client
  - `api/config/redis.ts` — Redis connection helper
- Database/Migrations
  - `supabase/migrations/*` — schema, RLS, triggers, seeds

## Where to Change What
- Add pages/features: under `src/pages/*` and `src/components/*`
- Auth flows: `src/pages/auth/*` and Supabase policies/migrations
- Leaderboard: `src/pages/Leaderboard.tsx` (frontend), `api/routes/leaderboard.ts` (backend), optional Redis `api/config/redis.ts`
- Challenges gameplay: `src/pages/Challenge.tsx`, schema `supabase/migrations/*`
- Admin: `src/pages/Admin.tsx` (guard checks `users.is_admin`), `api/routes/admin.ts` (wire endpoints)

## Release Checklist
- Env vars configured (frontend + backend)
- `npm run build` succeeds
- RLS tests pass: `npm run test:rls`
- Auth tests pass: `npm run test:auth`
- Seed at least one active challenge for Dashboard CTA
- Verify payments if Stripe enabled

## Quick Commands Summary
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Tests: `npm run test:auth`, `npm run test:rls`
- Utilities: `npm run create:login-user`, `npm run list:users`

This guide is safe to keep in the repo and helps AI agents reason about environment boundaries, security constraints, data flows, and deployment.

## Build Summary
- Generated Product Requirements and Technical Architecture from a single natural-language prompt for Guess2 (roles, pages, flows, business rules, success metrics, APIs, ERD).
- Implemented frontend (React + Vite + TS + Tailwind) and backend (Express + TypeScript) with Supabase auth, Stripe payments, Redis-ready leaderboard.
- Added Supabase RLS policies and trigger (`handle_new_user`) to auto-create `users` profile rows.
- Seeded a daily challenge; added Dashboard fallback to show the latest active non‑premium challenge when today’s is missing.
- Created test scripts to verify signup/login and RLS behavior; fixed Stripe API version and UI build issues.
- Centralized env handling, removed hardcoded keys, and deployed to Vercel with serverless API routing.

## Prompts Used (Highlights)
- Initial build prompt: “Guess2 – Solo Trivia & Word Challenge Game… frontend, backend, database, authentication, deployment; roles: Guest, Registered, Premium, Admin; pages: Home, Auth, Dashboard, Challenge, Leaderboard, Profile, Admin; gameplay, scoring, leaderboards, loyalty rewards; Stripe subscription; Tech Stack: React+Next/Vite, Node+Express, Supabase Postgres, Redis, Stripe, Vercel; testing and environment. Start with documentation.”
- Follow-up prompts: implement project; deploy to Vercel; seed challenges; fix RLS violations; add tests for signup/login and RLS; create demo users and list users; fix Supabase client config; unify API base; add logout behavior; write README and AI guide.
