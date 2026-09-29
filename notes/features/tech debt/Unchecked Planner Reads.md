---
type: bug
status: spec
blocked-by:
  - "[[Calendar and Recipes Data Refresh]]"
  - "[[Server-Only Code Behind Barrels]]"
confirmed: 2026-09-25
---
# Where It Stands

Blocked until [[Calendar and Recipes Data Refresh]] and [[Server-Only Code Behind Barrels]] land; then /plan-steps. ^status

# ⚠️ Security Concern
**Anyone who can reach the app may be able to read any planner's data, including its calendar, saved recipes and tags, by calling a server action with that planner's id. No membership check stops them.** This is an authorization hole, not a code-tidiness issue.

The planned fix (moving the reads out of `'use server'`) depends on [[Calendar and Recipes Data Refresh]]. **If that plan changes, is delayed, or this story is re-scoped, the hole must still be closed some other way**, for example by adding `checkAuth(id, 'read')` to each read. Don't close or archive this note until no `'use server'` export returns planner data without checking access.

Found while planning [[Stale Data Issues]] on 2026-09-25.

# Symptoms
Found by reading code on 2026-09-25. **Not reproduced in the running app.**
- `getPlanner`, `getPlannerClient` and `getSavedItem` are exported from `'use server'` files. That makes each one a server action the browser can call.
- Each takes a planner id and returns the planner (or one saved item) without calling `checkAuth`.

# Who Can Hit This
- Anyone who knows a planner id. Planner ids appear in every planner URL (`/<plannerId>/calendar`), so this includes:
  - people who were removed from a planner
  - people who left a planner
  - anyone a URL was shared with
- Possibly signed-out users: nothing in these functions checks for a session.
- To verify: `getPlannerClient` is imported by a client component, so its action id ships in client JavaScript. `getPlanner` and `getSavedItem` are only imported by server code today, which may make them harder to call from a browser. Nothing guarantees that stays true.

# Root Cause
- `src/_actions/planner/getPlanner.ts`, `src/_actions/planner/getPlannerClient.ts` and `src/_actions/library/getSavedItem.ts` all start with `'use server'` but contain no access check.
- The only client caller is `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx`, which calls `getPlannerClient` in a `useEffect`. [[Calendar and Recipes Data Refresh]] replaces that with the layout passing the planner as a prop.
- The other callers are server components behind the `[planner]` layout's `checkAuth(id, 'read')`:
  - `src/app/[planner]/calendar/page.tsx`
  - `src/app/[planner]/recipes/page.tsx`
  - `src/app/[planner]/recipes/[recipeId]/page.tsx`
  - `src/app/[planner]/recipes/_components/Modal/Modal.tsx`

# Fix
> ⚠️ **Check Drift 2026-09-27:** Found by reading code while making `getUserInvites` server-only (not verified in the running app). The `@/_actions/planner` barrel is imported by `'use client'` files (`CreatePlannerForm.tsx`, `useRenamePlanner.ts`, `PlannerProvider.tsx`), and so is `@/_actions/library` (`RecipeForm.tsx`, `BookmarkForm.tsx` and others). Making `getPlanner`, `getPlannerClient` or `getSavedItem` server-only while they stay in those barrels breaks `pnpm build`, the same failure `getUserInvites` hit. Moving them into `_utils/` as this Fix says may also clash with the placement rule in [[Domain-Specific Code Locations]], since app pages consume them, not only sibling actions. Plan with the Rules from [[Server-Only Code Behind Barrels]].

Once [[Calendar and Recipes Data Refresh]] has removed the client caller, move all three reads out of `'use server'` into server-only utilities, as [[Server-Only Creation and Pure Reads]] does for `addPlanner` / `addUser`. The browser then can't call them at all. The remaining callers are already behind the layout's access check.

Decided 2026-09-25: no interim `checkAuth` stopgap. It would be discarded by the move, and [[Calendar and Recipes Data Refresh]] is first in the Next queue. See the Security Concern above if that changes.

**Dedupe the planner read (moved from [[Calendar and Recipes Data Refresh]] 2026-09-27):** once that story's Step 2 lands, the `[planner]` layout fetches the planner through `getPlannerClient`, which calls `getPlanner`. Each page under it then reads the same planner again: the calendar page through `getPlannerClient`, and the recipes list, recipe detail page and recipe `Modal.tsx` through `getPlanner`. That is one extra DB read per page load. When `getPlanner` moves out of `'use server'` into its server-only home, wrap it in React `cache()` so every read in a request shares one query. `getPlannerClient` goes through `getPlanner`, so it benefits too. This wasn't done in the `'use server'` file because wrapping an export there in `cache()` may clash with Next's rule that every `'use server'` export is an async function. Check the version-matched Next docs in `node_modules/next/dist/docs/` for `cache()` before building. Sarah decided on 2026-09-27 that [[Calendar and Recipes Data Refresh]] doesn't add it.

**Tests and shared mocks:** This story owns the mock clean-up for the test files it changes:

> ⚠️ **Check Drift 2026-09-28:** The docs moved from `.opencode/docs/` to `docs/`, so `.opencode/docs/unit_tests.md` below is now `docs/unit_tests.md`. Found while `/tooling` moved the docs.

- Every test file it rewrites or moves uses the centralized mock in `test/mocks/` for any module that has one (`vi.mock('<module>', async () => await import('@mocks/...'))`), not an ad-hoc factory, per `.opencode/docs/unit_tests.md`.
- When it moves, renames or reshapes an export of `@/_actions` or `@/_models`, it updates the matching `test/mocks/@/_actions/*.ts` or `test/mocks/@/_models/*.ts` in the same step.
- If another story already did this for a file, there's nothing more to do.

Known files as of 2026-09-25 (found by reading code; re-check when planning):
- `src/_actions/planner/getPlanner.test.ts` (`@/_models/planner`)
- `test/mocks/@/_actions/planner.ts` and `library.ts` stop exporting `getPlanner`, `getPlannerClient` and `getSavedItem`; their consumers mock the new server-only path

# Acceptance Criteria
- [ ] `getPlanner`, `getPlannerClient` and `getSavedItem` are no longer exported from any `'use server'` file.
- [ ] These flows are unchanged:
  - opening the calendar
  - the recipe list
  - a recipe detail page
  - the recipe add and edit modal
- [ ] One page load under `[planner]` (calendar, recipe list or recipe detail) queries the planner once, not twice.

# Implementation
%% A small bug may need only one step, but it still goes here so it can be reviewed. Once it exists, set status to `ready`. %%
