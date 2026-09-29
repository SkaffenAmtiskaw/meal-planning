---
type: 
status: idea
confirmed: 2026-09-29
---
# Where It Stands

Next: /shape ^status

# Notes
better-auth reads its settings from the environment instead of from the validated `src/env.ts`. Found during `/architect` on [[E2E Test Setup]], 2026-09-29. Sarah called it tech debt and kept it out of that story.

- `src/_auth/auth.ts:12` (`betterAuth({...})`) passes no `secret` or `baseURL`, so better-auth reads `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from `process.env` itself, bypassing `src/env.ts`'s validated values. It also reads `BETTER_AUTH_SECRETS`, `AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `BASE_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, and (when `BETTER_AUTH_URL` is unset) `PUBLIC_BETTER_AUTH_URL`, `NUXT_PUBLIC_BETTER_AUTH_URL` and `NUXT_PUBLIC_AUTH_URL` (`node_modules/better-auth/dist/context/create-context.mjs:71-72`, `dist/utils/url.mjs:51`, `dist/context/helpers.mjs:81`).
- `src/_utils/auth/client.ts:6` calls `createAuthClient` with no `baseURL`, so the client reads `NEXT_PUBLIC_AUTH_URL`, `NEXTAUTH_URL`, `VERCEL_URL` and the same base-URL chain (`node_modules/better-auth/dist/client/config.mjs:12-19`). Fixing it needs a `NEXT_PUBLIC_` URL variable in `src/env.ts`'s client section and a change to `src/_utils/auth/client.test.ts`.
- Nothing in the code or history explains why. Likely better-auth's default install relies on reading env vars itself.

> [!warning] Impact on [[E2E Test Setup]] (Rule 13 and the test-only auth instance `test/auth.ts`)
> Applies if this story's fix changes anything in the E2E setup: Rule 13's list of variables set nowhere (`BETTER_AUTH_SECRETS`, `AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `BASE_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `NEXT_PUBLIC_AUTH_URL`, `NEXTAUTH_URL`), or how `test/auth.ts` is configured. Sarah asked for this callout 2026-09-29. What must not break:
> - Every variable in `src/env.ts` (`server` and `client`) still has an E2E value in `playwright.config.ts` that passes the schema, and none falls back to `.env.local`.
> - No variable better-auth reads on its own is set in `.env.local` or `playwright.config.ts` unless it goes through `src/env.ts`.
> - `test/auth.ts` and the E2E server still use the same `BETTER_AUTH_URL` and the same dummy secret, so cookies from `getCookies` are accepted by the running app.
> - E2E Test Setup's Rule 13 and `docs/e2e_tests.md` still describe the code.

# Questions
