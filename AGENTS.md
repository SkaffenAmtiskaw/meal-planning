# Meal Planner — Agent Guide

## Project Overview

A full-stack meal planning web app. Users sign in with Google, create meal planners, manage a recipe/bookmark library with tags, and plan daily meals on a calendar.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| UI | Mantine 8 + Tabler Icons |
| Auth | Better-auth 1.4 (Google OAuth + one-tap) |
| Database | MongoDB via Mongoose 9 |
| Validation | Zod 4 |
| Testing | Vitest |
| Linting/Formatting | Biome 2 |
| Package Manager | pnpm |

## Project Structure

```
src/
  _actions/       # Next.js server actions (auth, user, planner, saved recipes)
  _components/    # Shared React components
  _hooks/         # Custom React hooks
  _models/        # Mongoose schemas + Zod types
    planner/      # Planner, Recipe, Bookmark, Day, Tag models
    user.ts
  _utils/         # Utilities (auth client, catchify error handler)
  app/            # Next.js app directory
    page.tsx                      # Home: auth check + onboarding
    [planner]/
      layout.tsx                  # AppShell with sidebar navbar
      calendar/page.tsx           # Calendar view (WIP)
      recipes/page.tsx            # Saved recipes & bookmarks
    api/auth/[...all]/route.ts    # Better-auth API handler
  auth.ts         # Server-side Better-auth config
  _theme.ts       # Mantine theme
```

## Data Models

- **User** — `{ email, planners: [ObjectId] }`
- **Planner** — `{ calendar: [Day], saved: [Recipe|Bookmark], tags: [Tag] }`
- **Day** — `{ date, meals: [Meal] }` → **Meal** `{ name, dishes: [Dish] }` → **Dish** `{ name, source, note }`
- **Recipe** — name, ingredients, instructions, time (prep/cook/total), servings, storage, source, tags
- **Bookmark** — `{ name, url, tags }`
- **Tag** — `{ name, color }`

All models have corresponding Zod schemas for runtime validation.

## Auth Flow

1. Google one-tap or OAuth via Better-auth
2. Session checked on home page via `auth.api.getSession()`
3. First login: create User doc, redirect to planner
4. Returning user: redirect to existing planner

Environment variables needed: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DB_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

All env vars are declared and validated at startup via `@t3-oss/env-nextjs` in `src/env.ts`. Import `env` from there instead of accessing `process.env` directly — this provides Zod validation and eliminates non-null assertions.

## Error Handling

Use the `catchify` utility (`src/_utils/catchify/`) for async operations. Returns `[value]` on success or `[undefined, error]` on failure — avoids try/catch boilerplate.

## Development Commands

```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm lint     # Biome check + auto-fix
pnpm test     # Run Vitest
```

## Code Conventions

- Path alias `@/*` maps to `src/*`
- Server actions live in `src/_actions/`
- Components use Mantine primitives; avoid custom CSS where possible
- Zod schemas are co-located with their Mongoose models
- Biome enforces formatting and import order; runs automatically on commit via Lefthook
- Shared components, hooks and utilities are located at `src/_components`, `src/_hooks`, and `src/_utils` - ones that are only used in a single place should be in a directory co-located with the component that consumes them.

## Coverage

- To temporarily exclude a file from v8 coverage, wrap its entire content with `/* v8 ignore start */` and `/* v8 ignore stop */`. Do **not** use `/* v8 ignore file */` — it is not reliably supported across Node versions.
- The `coverage.exclude` array in `vitest.config.ts` is for **permanent** exclusions only (e.g. config files, route handlers that can never contain testable logic). Do not add files to it as a temporary workaround while a refactor is pending.

## Rules
- Before a task is done, you MUST successfully run `pnpm lint`