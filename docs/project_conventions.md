# Project Conventions
This doc is for anyone writing code in `src/`. It explains how the code is organized and the conventions it follows, with the reason for each. It assumes you know Next.js's App Router and React. A map of the repo's folders is in `docs/project_structure.md`.

# Naming Conventions
Files that Next.js names, such as `page.tsx` and `global-error.tsx`, keep the names Next.js gives them. Every other file name is camelCase, or UpperCamelCase for a React component's file, as is usual in JavaScript and TypeScript.

# Imports
When a path alias is shorter than the relative path, import through it, such as `@/_components` rather than `../../../../_components`. The aliases are in `tsconfig.json`, such as `@/` for `src/` and `#mocks/` for `test/mocks/`. An alias reads the same from any file, and doesn't break when the importing file moves.

# Barrel Files
A barrel file only re-exports. Coverage leaves barrel files out (see `docs/unit_tests.md`), so logic in one has no tests.

A file of server code that isn't a `'use server'` action, such as one that imports `server-only` or a package that runs only on the server, stays out of any barrel that client code imports. Client code pulls in everything a barrel re-exports, and server code there fails `pnpm build` in client code. Server code imports the file itself instead. Its types go in a `*.types.ts` file, which the barrel can re-export. This interim rule holds until server-only code moves to the planned data access layer.

# Test Mocks
Shared unit-test mocks live in `test/mocks/` (see `docs/unit_tests.md`, "Shared Mocks"), never in `src/`. Coverage counts every file in `src/` as app code, so a mock there would need tests of its own.

# Generic vs Domain-Specific Utilities
`src/_utils` holds generic utilities that know nothing about the app's domain. Each is named for what it does, such as `catchify`, rather than for a purpose in the app. A name tied to one use makes a utility look domain-specific, so the next person who needs it won't think to look for it there.

A utility that knows about the domain lives in a `_utils` directory beside the code that uses it. If several modules use it, the directory goes in the lowest common parent of all of them. A reader then finds the utility near the code that uses it, and its place shows which modules depend on it.

# Hooks and Their Supporting Components
Some components exist only to support a hook, such as a context provider or a Client Component wrapper that runs a hook for a Server Component. Such a component lives with its hook, in a directory named after the hook inside a `_hooks` directory. The two are only ever used together, so keeping them in one place means nobody has to search several directories for them. Other hooks built on the same context go in that directory too, because they need the same provider. As with utilities, the `_hooks` directory sits in the lowest common parent of the modules that use the hook.

# Architecture
## Single Concern
Single concern is a primary concern in this codebase. Each module (component, hook, utility, action) does one job. Two jobs are separate if each can be described without mentioning the other.
- When new behavior is a different job from the one an existing module does, it should be built as a new component, hook or utility. It should never be added to the existing module, even when that module is where the behavior is used.
- Existing code shouldn't be kept simply because it exists. If a module does more than one job, it should be refactored before anything new is built on it.

## Prefer Server Components
A component is a Server Component unless it needs something only the browser can do. A Server Component sends no JavaScript to the browser and fetches its data on the server, so the page stays small and its data arrives with it.

A component needs `'use client'` when it uses state, event handlers such as `onClick`, lifecycle logic such as `useEffect`, a browser-only API such as `localStorage`, or a hook built on any of these. (Next.js docs, Server and Client Components: "When to use Server and Client Components?") A loading state doesn't need it either: a `<Suspense>` boundary around a Server Component shows its fallback until the component's data arrives. A third-party component that needs the browser, and doesn't mark itself `'use client'`, is wrapped in a Client Component of the app's own, because it fails when a Server Component renders it.

**Keep the client boundary small:** add `'use client'` to the smallest component that needs it, not to a parent that only contains it, because everything a Client Component imports is sent to the browser too. For example, a mostly static layout with a search bar stays a Server Component, and only the search bar is a Client Component. (Next.js docs, Server and Client Components: "Reducing JS bundle size".)

# Planner Access in Server Actions and Reads
A server action or read that touches a planner's data, such as its meals, saved recipes, tags or members, checks the signed-in user's access before it reads or writes. Pages and layouts that load a planner's data count as reads. Without the check, anyone with a planner's id could read or change it.

The check is `checkAuth(plannerId, level)` from `@/_actions/auth/checkAuth`. It returns whether the signed-in user is a member of that planner with at least that access level, rather than throwing. So the caller stops unless the result's `type` is `'authorized'`. The level depends on the call:
- **Reading or managing the planner's settings, members or invites,** such as renaming it or listing its members: `'admin'`.
- **A change to the planner's content,** such as a meal: `'write'`.
- **Any other read, or leaving the planner:** `'read'`.

An export from a `'use server'` file is a server action, which the browser can call with any arguments, even if the app only calls it from server code. So each one checks access itself, rather than relying on its caller to have checked.

# Error Reporting
Production reports its errors to PostHog. An error that's thrown and never caught reports itself, on the server through `onRequestError` in `src/instrumentation.ts` and in the browser through `posthog-js`. The code has to report only what never reaches those two. Everywhere outside production, reporting is off, so none of the calls below send anything locally or in tests.

**Caught failures.** When server code catches a failure and returns it as a value rather than throwing it, the code reports the failure only if it was unexpected. An unexpected failure, such as a failed database query or a send that Resend refused, is reported by awaiting `reportError` from `@/_utils/reportError`. An expected one, such as a missing session, a user error from better-auth or invalid input, isn't reported. Each report can open a PostHog issue that someone then has to look into. Browser code doesn't call `reportError`: a server action that fails has already reported on the server.

**Error boundaries.** An `error.tsx` or `global-error.tsx` reports the error it catches with `posthog.captureException` from `posthog-js`, in a `useEffect` that depends on `error`. An error a boundary catches never reaches `posthog-js`'s global handler, so without that call it goes unreported.

**The relay and `proxy.ts`.** `src/app/relay/` passes `posthog-js`'s requests on to PostHog through the app's own domain, so ad blockers don't stop them. If the app adds a `proxy.ts`, its matcher should leave out `/relay`, because a matcher that includes it runs the proxy on every request `posthog-js` sends, including its request for the PostHog script.
