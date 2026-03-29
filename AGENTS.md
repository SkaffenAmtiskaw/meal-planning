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
- An underscore prefix (e.g. `_components`, `_utils`) means the directory is only consumed within its parent directory and its descendants — never from above. `src/_components` is used throughout `src/` but not outside it; a `_components` folder inside `src/app/[planner]/recipes/` would be used only within that route. A directory without an underscore prefix (e.g. `_models/utils/`) is consumed outside its parent directory.
- Shared components, hooks and utilities are located at `src/_components`, `src/_hooks`, and `src/_utils` — ones that are only used in a single place should be in a directory co-located with the component that consumes them.
- Components receive data props and import server actions directly — do not pass pre-bound actions as props (e.g. prefer `email={email}` over `action={createUser.bind(null, email)}`).
- Minimize client components (`'use client'`). Keep pages and layout components as server components; only extract the smallest necessary interactive piece into a dedicated client component (e.g. a single button, not a whole list).

## Coverage

**100% unit test coverage is required.** All source files must have 100% line, function, branch, and statement coverage. `pnpm test:coverage` enforces this via thresholds and will fail the build if coverage drops. Lefthook also runs coverage on pre-commit whenever `src/` files are staged.

- To temporarily exclude a file from v8 coverage, wrap its entire content with `/* v8 ignore start */` and `/* v8 ignore stop */`. Do **not** use `/* v8 ignore file */` — it is not reliably supported across Node versions.
- The `coverage.exclude` array in `vitest.config.ts` is for **permanent** exclusions only (e.g. config files, route handlers that can never contain testable logic). Do not add files to it as a temporary workaround while a refactor is pending.

## Rules
- Before a task is done, you MUST successfully run `pnpm lint`
- Work left intentionally unfinished should be indicated with a `TODO` comment

## Notes
- the `notes/` directory contains an obsidian vault
- all `.md` files in it use Obsidian-flavored Markdown
- when told to plan or build something - check the notes directory to see if any plans exist
- planned work in notes are considered to be minimum requirements for a feature to be considered complete - they will not always have every detail
- often planned work will need to be broken further out