---
type: hub
confirmed: 2026-09-25
---
# Where It Stands

Split 2026-09-25 into four stories. Next: /plan-steps on [[Calendar and Recipes Data Refresh]] or [[Server-Only Creation and Pure Reads]]; both can start now. ^status

# Purpose
The following issues currently existing in the app are likely a symptom of a larger issue with stale data in the app. This story needs to create a *consistent* pattern for refreshing data when mutations occur, and make sure that pattern is followed everywhere in the app.

Any proposed architecture for this story will include a plan for enforcing this pattern in future stories. Drift is to be avoided. If programmatic enforcement is not possible this may lead to a larger discussion about development processes. Do not hesitate to ask the user questions to brainstorm possible strategies for enforcement.

The work was split into four stories on 2026-09-25. The calendar and recipes fixes ship and can be checked on their own, as can the settings migration and the cleanup of writes outside server actions. Enforcement can only pass once all three are done. The rules, tag model and enforcement plan stay here in one copy, and each story embeds the sections it builds.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Root Cause Analysis
There is **no Next.js caching anywhere in the app** — no `'use cache'`, `unstable_cache`, `fetch`, or route `revalidate` config. Every read is a direct Mongoose query on each request. Tag revalidation on its own would therefore be a no-op; the staleness is entirely client-side.

- **Saved dishes dropdown** — `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` is a client component that fetches the whole planner once in `useEffect([id])` and stores it in `useState`. `router.refresh()` re-renders server components but preserves client state, so `usePlannerSavedItems` (→ `DishSourceFields`, `DishRow`) never sees new recipes until a hard reload.
- **Month → week view** — `AddMealModal` calls `router.refresh()` only in `onSuccess`, and `useFormFeedback` delays `onSuccess` until its 3s success countdown finishes (`src/_hooks/useFormFeedback/useFormFeedback.ts`). Closing the modal early unmounts the form, clears the interval, and the refresh never happens. Switching views is client state only, so the stale `calendar` props persist.

**Common thread:** refreshing is a client-side side effect coupled to UI lifecycle (modals, countdowns, remembering to call it), and some server data lives in client state outside the RSC tree where no refresh can reach it.

# Confirmed Approach
*Decided 2026-09-25: hybrid tag revalidation.* Tag revalidation is the right path, but only combined with moving invalidation to the server and removing client-held copies of server data.

## Rule 1 — Mutations invalidate on the server
Every mutating server action is built with `defineMutation` and declares the cache tags it invalidates. After a successful handler, the wrapper calls a single `invalidate()` helper (`updateTag` per tag). A Server Action that revalidates returns the re-rendered route (layouts included) in the same response, so the refresh no longer depends on what the modal or form does afterwards.

- **First implementation step (spike):** confirm that `updateTag` with no cached reads still refreshes the current route in Next 16. If not, `invalidate()` also calls `refresh()` from `next/cache`.
- `invalidate()` is the **only** module allowed to import from `next/cache`.

## Rule 2 — Server data reaches the client only through server-rendered props
No client `useEffect` fetching of server actions for displayed data. Client components may hold transient UI state; optimistic updates use React's `useOptimistic` and reconcile with incoming props.

## Rule 3 — No `router.refresh()`
Server actions refresh the page themselves. `router.push` remains allowed purely for navigation.

## Tag Model
*Reads tag every entity they include; writes invalidate only the entities they change.* Tags are declared in a typed registry at `src/_actions/_utils/cacheTags.ts` — never as string literals.

| Registry | Tags |
|---|---|
| `plannerTags` | `calendar(id)`, `saved(id)`, `tags(id)`, `details(id)` (name), `members(id)`, `invites(id)` (outgoing) |
| `userTags` | `profile(userId)`, `planners(userId)` (memberships + access levels), `invites(email)` (incoming) |

Because nothing is cached yet, tags are currently a contract rather than a cache key. When the roadmap caching story adds `'use cache'` + `cacheTag` to reads, no mutation needs to change.

## Wrapper Shape
`src/_actions/_utils/defineMutation.ts` (`server-only`, **not** `'use server'`):

```ts
export const addMeal = defineMutation({
	schema: zMealFormSchema,
	access: { planner: (input) => input.plannerId, level: 'write' }, // or 'self' | 'public'
	invalidates: (input) => [plannerTags.calendar(input.plannerId)], // required, non-empty
	handler: async (input, ctx) => { /* ... */ return { ok: true, data } },
});
```

- Absorbs the zod parse + `checkAuth` boilerplate currently repeated in every action.
- `invalidates` is required and typed as a non-empty tuple; it runs only when the handler returns `ok: true`.
- `defineQuery` marks reads (and is the future home for `cacheTag`).

## Out of Scope
- Enabling `cacheComponents` / `'use cache'` — belongs to the roadmap caching item.
- Real-time sync to other members' open sessions. They get fresh data on their next request, since nothing is cached.

# Enforcement
- **Type level** — a `defineMutation` without a non-empty `invalidates` fails typechecking, caught by `pnpm build` in pre-commit. ^type-level
- **Conventions meta-test** — `src/dataConventions.test.ts`, a static scan using the `typescript` compiler API (no module imports, no mocks):
	1. every export of every `'use server'` file under `src/_actions/**` is initialized by a `defineMutation(...)` or `defineQuery(...)` call (barrels and type-only exports skipped)
	2. no `router.refresh(` in any non-test file under `src/**`
	3. no import of `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` from `next/cache` outside the `invalidate()` helper
- **Lefthook** — the pre-commit `test-coverage` step uses `vitest related`, which would never select a meta-test for a newly added action (no import-graph link). Add a pre-commit command that always runs `src/dataConventions.test.ts` when any `src/**/*.{ts,tsx}` file is staged. *The user explicitly authorized this `lefthook.yml` edit for this story on 2026-09-25.*
- **Not programmatically enforced (open item)** — Rule 2 (`useEffect` fetching). Documented in `.opencode/docs/project_conventions.md` alongside Rules 1 and 3.

# Coverage
| Migration Checklist area | Story |
|---|---|
| A. tag registry, `invalidate()` + spike, `defineMutation` | [[Calendar and Recipes Data Refresh]] |
| A. `defineQuery`, `src/dataConventions.test.ts`, lefthook command, `project_conventions.md` | [[Data Rules Enforcement]] |
| B. `calendar/*`, `library/*` | [[Calendar and Recipes Data Refresh]] |
| B. `planner/*`, `sharing/*`, `user/*` | [[Settings Data Refresh]] |
| C. `addPlanner`, `addUser` | [[Server-Only Creation and Pure Reads]] |
| D. reads → `defineQuery` | [[Data Rules Enforcement]] |
| E. `PlannerProvider` | [[Calendar and Recipes Data Refresh]] |
| E. settings hooks, `MemberListContainer` | [[Settings Data Refresh]] |
| F. calendar and recipes components | [[Calendar and Recipes Data Refresh]] |
| F. settings components | [[Settings Data Refresh]] |
| G. `TagCombobox` | [[Calendar and Recipes Data Refresh]] |
| H. `verify-email-change/page.tsx`, exempt client calls | [[Settings Data Refresh]] |
| H. `src/app/page.tsx` `addUser`, `getPlanners`, `validateInviteToken` | [[Server-Only Creation and Pure Reads]] |

# Child Stories
| Story | Status | Scope in this area | Blocked by |
|---|---|---|---|
| [[Calendar and Recipes Data Refresh]] | spec | tag registry, `invalidate()`, `defineMutation`; calendar and library mutations; both original symptoms | - |
| [[Settings Data Refresh]] | spec | planner, sharing and user mutations; settings data as server props; verify-email-change write | [[Calendar and Recipes Data Refresh]] |
| [[Server-Only Creation and Pure Reads]] | spec | `addPlanner` / `addUser` out of `'use server'`; `getPlanners` and `validateInviteToken` stop writing | - |
| [[Data Rules Enforcement]] | spec | `defineQuery` on reads; conventions meta-test, lefthook command, conventions doc | the three stories above |

**Related, not child stories:**
- [[Add Meal Changes (Saved Recipes)]] and [[Mobile List View]] - blocked on [[Calendar and Recipes Data Refresh]]
- [[Meal Editing]] - new meal mutations follow the rules here
- [[Unchecked Planner Reads]] - ⚠️ security: `getPlanner`, `getPlannerClient` and `getSavedItem` are server actions with no access check; found while planning, fixed after [[Calendar and Recipes Data Refresh]]
- [[Unchecked Invite Lookup]] - ⚠️ security: `getUserInvites` is a server action that returns invite tokens for any email; found while planning

# Build Order
1. [[Calendar and Recipes Data Refresh]] and [[Server-Only Creation and Pure Reads]] can start now. They share no pieces (inferred: they only touch the same files, in `createPlanner` and `signUpWithInvite` imports).
2. [[Settings Data Refresh]] after [[Calendar and Recipes Data Refresh]] (stated: it uses the tag registry, `invalidate()` and `defineMutation` built there).
3. [[Data Rules Enforcement]] last (stated: the meta-test fails until every `'use server'` export is wrapped and every `router.refresh()` is removed).

# Open Decisions
1. **`invalidates` needs values the input doesn't carry.** `cancelInvite` needs the invite's email, `deleteAccount` needs the user's memberships, and member changes may need the target user. Should `invalidates` also receive the handler's result? Doesn't affect [[Calendar and Recipes Data Refresh]], whose actions all take `plannerId`. Needed before [[Settings Data Refresh]] converts `cancelInvite` and `deleteAccount`. Record the answer in Wrapper Shape above.

# Related Issues Found (Out of Scope)
Both added to [[Roadmap]] under Bugfixes.
- `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx` ignores `deleteRecipe`'s result and always reports success
- [[Zero Planners Crash]] — leaving your only planner likely crashes `src/app/page.tsx` (`user.planners[0]` on an empty array); unverified, from static reading only

# Deferred Work
%% Unfinished pieces moved here from stories that are otherwise done. Move the full step, its image embeds and the relevant handoff text - not a summary - so whoever builds it doesn't have to go back to the archived note. Leave a "🚛 Moved to [[<this hub>]]" pointer in the original. %%
