# Guess2 — Solo Trivia & Word Challenge Game

A premium-feel, single-player trivia/word web app featuring asynchronous challenges, daily/weekly leaderboards, user streaks, loyalty points, achievements, and optional subscriptions.

## Overview
- Frontend: React + Vite + TypeScript + Tailwind (`src/pages/*`)
- Backend: Express + TypeScript (`api/*`)
- Auth & DB: Supabase Postgres (+ RLS policies) (`supabase/migrations/*`)
- Cache: Redis (leaderboards/realtime)
- Payments: Stripe
- Deploy: Vercel (frontend) + Node server

## Quick Start
- Install: `npm install`
- Dev servers: `npm run dev` (runs `vite` and `nodemon` concurrently)
- Frontend only: `npm run client:dev`
- Backend only: `npm run server:dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Environment Variables
Set these locally and in production (do not expose service keys to the browser):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (frontend)
- `VITE_SUPABASE_SERVICE_ROLE` (backend only)
- `STRIPE_SECRET_KEY` (backend only)
- Optional: `REDIS_URL`

Note: Move hardcoded Supabase keys from `src/supabase/config.ts` and `api/config/supabase.ts` into environment variables before publishing.

## Useful Commands
- `npm run dev` — start frontend and backend in development
- `npm run client:dev` — start Vite dev server
- `npm run server:dev` — start Express dev server
- `npm run build` — type-check and build production assets
- `npm run preview` — preview production build
- `npm run check` — TypeScript no-emit check
- `npm run lint` — ESLint
- `npm run test:auth` — end-to-end auth workflow (create user, login, update username, read profile, cleanup)
- `npm run test:rls` — validate Supabase RLS policies (deny cross-user writes, allow own updates)
- `npm run create:login-user` — create a demo login user and print credentials
- `npm run list:users` — list users from `public.users` (safe fields)

## App Pages
- `Home` — pitch, features, CTA
- `Auth` — signup/login, password reset
- `Dashboard` — daily challenge, streaks, points, achievements, past attempts
- `Challenge` — timed solo round (MCQ/word), scoring, submit results
- `Leaderboard` — daily/weekly/all-time rankings (Redis backed)
- `Profile` — stats, achievements, subscription status
- `Admin` — challenges/questions CRUD, users, analytics

## Backend API
- Base: `http://localhost:3002`
- Example routes: `api/routes/*`
  - Auth: handled via Supabase
  - Leaderboard: `api/routes/leaderboard.ts`
  - Payments: `api/routes/payments.ts` (`apiVersion: '2023-10-16'`)

## Database & Migrations
Schema tables include `users`, `challenges`, `questions`, `answers`, `user_challenges`, `user_answers`, `achievements`, `user_achievements`, `subscriptions`.

RLS & Trigger:
- `supabase/migrations/rls_users_policies.sql` enables RLS and policies for `users`
- `supabase/migrations/update_handle_new_user.sql` ensures a `users` row is auto-inserted on `auth.users` creation with a default `password_hash='supabase_auth'`

Seeding Daily Challenge:
- `supabase/migrations/seed_create_today_challenge.sql` inserts today’s challenge (5 questions) with `is_active = TRUE`
- Run via Supabase SQL editor (paste file contents) or apply as a migration

## Auth Workflow
- Signup (`/auth/signup`): creates `auth.users`; app signs in and updates `users.username`
- Dashboard greeting uses `users.username`; falls back to email when username not set; shows “Guest” for unauthenticated
- RLS denies cross-user writes; allows select/update on own row; trigger creates `users` profile automatically

## Stripe
- Configure secret key on backend (`STRIPE_SECRET_KEY`)
- UI plans defined in `src/components/PremiumSubscription.tsx`; ensure price IDs are set in `config/stripe`
- API version pinned to `'2023-10-16'` in `api/routes/payments.ts`

## Leaderboards
- Frontend preview section on `Dashboard`
- Backend routes designed for Redis-backed rankings; ensure `REDIS_URL` configured when using Redis

## Deployment
- Frontend: Vercel
  - Build: `npm run build`
  - Preview URL example: `https://traek5sjvv0f.vercel.app`
- Backend: Deploy Node server (Vercel serverless or separate service)
- Set environment variables in deployment provider dashboards

## Troubleshooting
- RLS error on signup/profile insert: ensure trigger and policies are applied; remove client-side inserts during signup; sign in after signup to establish session, then update `users.username`
- “Start Challenge” not visible: seed today’s challenge or let fallback logic load the latest active non-premium challenge
- Email confirmation: if required, show “check your email” message; otherwise proceed with immediate sign-in in dev

## Demo Accounts (for QA)
- `demo+1764805053687@example.com` / `DemoPass123!1764805053687`
- `demo+1764805059419@example.com` / `DemoPass123!1764805059419`

Promote to Admin:
- In Supabase SQL editor: `UPDATE users SET is_admin = true WHERE email = '<email>';`
- Visit `/admin` after promotion

## Project Structure
- `src/pages/*` — pages
- `src/components/*` — UI components
- `api/*` — Express routes/config
- `supabase/migrations/*` — SQL migrations (schema, RLS, triggers, seed)
- `scripts/*` — utility scripts (tests, user mgmt)

## Notes
- Do not commit or expose service role keys in frontend code; use environment variables and server-side usage only.
