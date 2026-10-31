---
type: pattern
status: idea
blocked-by:
  - "decision needed: the data access layer's scope, access checks and DTO types"
confirmed: 2026-10-31
---
# Where It Stands

3 open decisions. Next: /decide ^status

Server-only code is moving to a data access layer. Until it's built, server-only code is imported by file path, and the interim rule for `docs/project_conventions.md` waits in [[Docs Updates]].

# Inbox

# Purpose
Server-only code (reads and helpers marked `import 'server-only'` rather than `'use server'`) keeps being reached through domain barrels like `@/_actions/sharing` that client components also import. The build then fails, or mongoose models get pulled into client bundles. This story gives server-only code a home of its own, a data access layer as Next.js recommends, which client code never imports. It sets the conventions for that layer and moves the existing server-only code into it.

Found 2026-09-27 while making `getUserInvites` server-only. Sarah said it's not the first time this has come up.

# Symptoms
- [ ] `pnpm build` (Next 16.2.9, Turbopack) fails with "'server-only' cannot be imported from a Client Component module" whenever a `server-only` file is re-exported from a barrel that a `'use client'` file imports.
- [ ] The build trace shows the barrel pulling the server-only file's mongoose models into client bundles.

# Root Cause
- Each domain folder in `src/_actions/` has one barrel (`index.ts`, `export * from './...'`) that mixes callable server actions with everything else in the folder. Client components import server actions through that barrel, so everything it re-exports becomes part of the client module graph.
- `docs/project_conventions.md` "Barrel Files" says only that barrels have no logic. Nothing says what a barrel that client code imports may re-export.
- The placement rule decided in [[Domain-Specific Code Locations]] (Rules) puts a function consumed across `src/` as a plain file in its domain folder. It doesn't say how that file is exported, so a server-only read there ends up in the same barrel as the client-called actions.

Current temporary fix (made 2026-09-27 when `getUserInvites` became server-only): `getUserInvites` was taken out of `src/_actions/sharing/index.ts`. Its two server callers, `src/_components/UserMenu/InviteBadge.tsx:7` and `src/app/settings/_components/InvitesSettings.tsx`, import `@/_actions/sharing/getUserInvites` directly. Its types moved to `src/_actions/sharing/invite.types.ts`, which stays in the barrel. Its mock moved to `test/mocks/@/_actions/sharing/getUserInvites.ts`, a folder next to the `test/mocks/@/_actions/sharing.ts` barrel mock.

# Open Decisions
1. Where do server-only exports live, relative to a barrel that client code imports? Starting points to research, not proposals:
	- direct file imports (today's temporary fix)
	- a second, server-only entry point per domain folder (e.g. `sharing/server.ts`)
	- a separate src-level directory for server-only reads (a "data access layer")
	- client code importing action files directly instead of the barrel

	The answer also decides where the types of a server-only function live so client code can import them. `invite.types.ts` is today's answer; [[Shared Types Directory]] may change it.
	- **Decided 2026-10-31:** a data access layer, as Next.js recommends. Its scope, name and access checks still need research and planning. Until it's built, server-only functions stay out of client-imported barrels and are imported by file path, as with `getUserInvites` today. Sarah's call: it's the approach Next.js recommends.
		- Rejected: a server-only entry point per domain (`server.ts` or `server/index.ts`) - it isn't an established convention for app code, and `server.ts` is less obvious as a barrel than `index.ts`.
		- Rejected: direct file imports as the permanent rule - kept only as the interim fix until the DAL exists.
		- Rejected: client code importing action files directly - about 25 client files would change, and nobody can check the rule by reading a file, since some client files have no `'use client'`.
		- Rejected: keeping the barrels and setting Turbopack's `sideEffects` - the spike showed it works only on Turbopack and only with named re-exports, and a file missing from the list is silently dropped from production builds.
2. What does the data access layer cover: reads only, all server-only code (adding `addUser` and `addPlanner`), or all database access, with each `'use server'` action becoming a thin wrapper that validates input, calls the layer and revalidates, as Next.js describes?
3. Do the data access layer's functions check access themselves, as Next.js recommends, and if so, does `checkAuth` move into the layer?
4. Where do the data access layer's return types (DTOs) live, so client code can import them? This overlaps [[Shared Types Directory]].

# Rules

# Enforcement

# Migration Checklist

# Out of Scope
- Where shared DTO types live in general: [[Shared Types Directory]].
- How subpath imports are mocked: [[Unit Testing - New Centralized Mocks]] Open Decision 2. The mock paths here follow whatever import shape this story picks.

# Implementation
