---
type: bug
status: spec
blocked-by:
  - "[[Calendar and Recipes Data Refresh]]"
confirmed: 2026-09-25
---
# Where It Stands

Blocked until [[Calendar and Recipes Data Refresh]] lands; then /plan-steps. ^status

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
Once [[Calendar and Recipes Data Refresh]] has removed the client caller, move all three reads out of `'use server'` into server-only utilities, as [[Server-Only Creation and Pure Reads]] does for `addPlanner` / `addUser`. The browser then can't call them at all. The remaining callers are already behind the layout's access check.

Decided 2026-09-25: no interim `checkAuth` stopgap. It would be discarded by the move, and [[Calendar and Recipes Data Refresh]] is first in the Next queue. See the Security Concern above if that changes.

**Tests and shared mocks:** *Added 2026-09-26: hand-off from [[Unit Testing - Clean Up Mocks]], decided by Sarah on 2026-09-25.* This story owns the mock clean-up for the test files it changes:
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

# Implementation
%% A small bug may need only one step, but it still goes here so it can be reviewed. Once it exists, set status to `ready`. %%
