---
type: pattern
status: idea
blocked-by:
  - "decision needed: where do server-only exports live, relative to a barrel that client code imports?"
  - "decision needed: does the rule cover only src/_actions barrels, or every barrel?"
  - "decision needed: is the server-only build error enough enforcement?"
confirmed: 2026-09-27
---
# Where It Stands

Waiting on your decisions in Open Decisions; then write the Rules with Sarah. ^status

# Purpose
Server-only code (reads and helpers marked `import 'server-only'` rather than `'use server'`) keeps being reached through domain barrels like `@/_actions/sharing` that client components also import. The build then fails, or mongoose models get pulled into client bundles. This story sets one convention for where server-only exports live and how they're imported, so the fix isn't worked out again each time. Then it moves the existing cases over.

Found 2026-09-27 while making `getUserInvites` server-only. Sarah said it's not the first time this has come up.

# Symptoms
- [ ] `pnpm build` (Next 16.2.9, Turbopack) fails with "'server-only' cannot be imported from a Client Component module" whenever a `server-only` file is re-exported from a barrel that a `'use client'` file imports.
- [ ] The build trace shows the barrel pulling the server-only file's mongoose models into client bundles.

# Root Cause
- Each domain folder in `src/_actions/` has one barrel (`index.ts`, `export * from './...'`) that mixes callable server actions with everything else in the folder. Client components import server actions through that barrel, so everything it re-exports becomes part of the client module graph.
- `.opencode/docs/project_conventions.md` "Barrel Files" says only that barrels have no logic. Nothing says what a barrel that client code imports may re-export.
- The placement rule decided in [[Domain-Specific Code Locations]] (Rules) puts a function consumed across `src/` as a plain file in its domain folder. It doesn't say how that file is exported, so a server-only read there ends up in the same barrel as the client-called actions.

Current temporary fix (made 2026-09-27 when `getUserInvites` became server-only): `getUserInvites` was taken out of `src/_actions/sharing/index.ts`. Its two server callers, `src/_components/UserMenu/InviteBadge.tsx:7` and `src/app/settings/_components/InvitesSettings.tsx`, import `@/_actions/sharing/getUserInvites` directly. Its types moved to `src/_actions/sharing/invite.types.ts`, which stays in the barrel. Its mock moved to `test/mocks/@/_actions/sharing/getUserInvites.ts`, a folder next to the `test/mocks/@/_actions/sharing.ts` barrel mock.

# Open Decisions
1. Where do server-only exports live, relative to a barrel that client code imports? Starting points to research, not proposals:
	- direct file imports (today's temporary fix)
	- a second, server-only entry point per domain folder (e.g. `sharing/server.ts`)
	- a separate src-level directory for server-only reads (a "data access layer")
	- client code importing action files directly instead of the barrel

	The answer also decides where the types of a server-only function live so client code can import them. `invite.types.ts` is today's answer; [[Shared Types Directory]] may change it.
2. Does the rule cover only `src/_actions/*` barrels, or every barrel? For example, `src/_components/UserMenu` holds the `server-only` `InviteBadge`.
3. Is the `server-only` build error (`pnpm build` in pre-commit) enough enforcement? Or does something also need to stop a server-only export being added to a client-imported barrel, e.g. a lint import rule or a check in the `src/dataConventions.test.ts` that [[Data Rules Enforcement]] adds?

# Rules
%% The convention itself, as numbered rules an agent can check code against. Once the rules are confirmed, set status to `spec`. Lands in `.opencode/docs/project_conventions.md` "Barrel Files", next to the placement rule from [[Domain-Specific Code Locations]]. %%

# Enforcement
%% Required. See Open Decision 3. %%

# Migration Checklist
*Found 2026-09-27 by reading code. A starting list, not a full audit. Re-check before planning.*

## Already server-only, on the temporary fix
- [ ] `src/_actions/sharing/getUserInvites.ts`: move from direct imports to the decided shape. Update `InviteBadge.tsx`, `InvitesSettings.tsx` and `test/mocks/@/_actions/sharing/getUserInvites.ts` to match.

## About to become server-only in other stories
These barrels are imported by `'use client'` files, so each one will hit the same build error:
- [ ] `addUser`, in [[Server-Only Creation and Pure Reads]] Step 8. The `@/_actions/user` barrel is imported by `ChangeNameForm.tsx:9` and `DeleteAccountForm.tsx:8`.
- [ ] `getPlanner` and `getPlannerClient`, in [[Unchecked Planner Reads]]. The `@/_actions/planner` barrel is imported by `CreatePlannerForm.tsx:8`, `useRenamePlanner.ts:6` and `PlannerProvider.tsx:6`.
- [ ] `getSavedItem`, in [[Unchecked Planner Reads]]. The `@/_actions/library` barrel is imported by `RecipeForm.tsx:20` and `BookmarkForm.tsx:11`.

## Docs
- [ ] `.opencode/docs/project_conventions.md` "Barrel Files": add the rule.

# Out of Scope
- Where shared DTO types live in general: [[Shared Types Directory]].
- How subpath imports are mocked: [[Unit Testing - New Centralized Mocks]] Open Decision 2. The mock paths here follow whatever import shape this story picks.

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. %%
