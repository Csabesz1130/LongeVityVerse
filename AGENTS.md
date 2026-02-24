# AGENTS.md

## Cursor Cloud specific instructions

### Overview

LongevityVerse is a Next.js 14 (App Router) health/longevity community platform built on the ShipFast boilerplate. It uses npm as its package manager (`package-lock.json`).

### Running the app

- **Dev server:** `npm run dev` (starts on `http://localhost:3000`)
- **Lint:** `npm run lint`
- **Build:** `npm run build` (see known issues below)

### Known issues (pre-existing)

- **Production build fails** due to `googleapis` (a server-only Node.js library) being imported in a client-side page (`app/auth/google-fit/callback/page.tsx`). The dev server works fine since it compiles pages on demand.
- **ESLint exits with code 1** due to pre-existing errors (unescaped entities, undefined `React`/`jest` globals in test files). These are not regressions.
- **Jest tests are not runnable** — the project has `@testing-library/react` and `@types/jest` in devDependencies but no `jest.config.js`, no `ts-jest`, and no `test` script in `package.json`.

### External services

The app connects to MongoDB Atlas, Supabase, Upstash Redis, Stripe, OpenAI, Mailgun, Google Fit, and Fitbit — all via environment variables in `.env.local`. Only `MONGODB_URI` and auth-related vars are present by default; other integrations degrade gracefully when their keys are missing.

### Gotchas

- The Longevity Hub page shows "Failed to fetch posts" when MongoDB is unreachable — this is expected without a live database connection.
- Blog pages are statically defined in `app/blog/_assets/content.tsx` and work without any database.
