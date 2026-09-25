---
type: pattern
status: spec
reviewed: 2026-09-25
---
The following issues currently existing in the app are likely a symptom of a larger issue with stale data in the app. This story needs to create a *consistent* pattern for refreshing data when mutations occur, and make sure that pattern is followed everywhere in the app.

Any proposed architecture for this story will include a plan for enforcing this pattern in future stories. Drift is to be avoided. If programmatic enforcement is not possible this may lead to a larger discussion about development processes. Do not hesitate to ask the user questions to brainstorm possible strategies for enforcement.

At the end of this story the following should be fixed:
- [ ] after adding a new recipe, it is not immediately available in the saved dishes dropdown in the create meal modal
- [ ] meals created in month view don't show immediately show up when switching to week view

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
- **Type level** — a `defineMutation` without a non-empty `invalidates` fails typechecking, caught by `pnpm build` in pre-commit.
- **Conventions meta-test** — `src/dataConventions.test.ts`, a static scan using the `typescript` compiler API (no module imports, no mocks):
	1. every export of every `'use server'` file under `src/_actions/**` is initialized by a `defineMutation(...)` or `defineQuery(...)` call (barrels and type-only exports skipped)
	2. no `router.refresh(` in any non-test file under `src/**`
	3. no import of `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` from `next/cache` outside the `invalidate()` helper
- **Lefthook** — the pre-commit `test-coverage` step uses `vitest related`, which would never select a meta-test for a newly added action (no import-graph link). Add a pre-commit command that always runs `src/dataConventions.test.ts` when any `src/**/*.{ts,tsx}` file is staged. *The user explicitly authorized this `lefthook.yml` edit for this story on 2026-09-25.*
- **Not programmatically enforced (open item)** — Rule 2 (`useEffect` fetching). Documented in `.opencode/docs/project_conventions.md` alongside Rules 1 and 3.

# Places to Update
## A. Infrastructure
- [ ] tag registry — `src/_actions/_utils/cacheTags.ts`
- [ ] `invalidate()` helper (+ spike from Rule 1)
- [ ] `defineMutation` / `defineQuery` wrappers
- [ ] `src/dataConventions.test.ts`
- [ ] lefthook pre-commit command for the conventions test
- [ ] `.opencode/docs/project_conventions.md` — document Rules 1–3 and the tag model

## B. Mutating Actions → `defineMutation`
All paths relative to `src/_actions/`.

| Action | Invalidates | Notes |
|---|---|---|
| `calendar/addMeal` | `calendar(p)` | drop the unused returned `calendar` (and the `onSuccess` param in `AddMealForm`). Once [[Add Meal Changes (Saved Recipes)]] Step 1b makes `addMeal` write `lastUsed` on linked saved items, it must also invalidate `saved(p)`. |
| `library/addBookmark` | `saved(p)` | |
| `library/addRecipe` | `saved(p)` | |
| `library/editBookmark` | `saved(p)` | remove existing `revalidatePath` |
| `library/editRecipe` | `saved(p)` | remove existing `revalidatePath` (×2) |
| `library/deleteRecipe` | `saved(p)` | |
| `library/deleteBookmark` | `saved(p)` | |
| `library/updateRecipeNotes` | `saved(p)` | remove existing `revalidatePath` |
| `library/updateRecipeTags` | `saved(p)` | remove existing `revalidatePath` |
| `library/addTag` | `tags(p)` | |
| `planner/createPlanner` | `userTags.planners(self)` | |
| `planner/updatePlannerName` | `details(p)` | |
| `sharing/inviteUser` | `invites(p)`, `userTags.invites(email)` | |
| `sharing/cancelInvite` | `invites(p)`, `userTags.invites(email)` | normalize return to `ActionResult` (`{ ok }`, currently `{ success }`) |
| `sharing/acceptInvite` | `userTags.planners(self)`, `userTags.invites(email)`, `invites(p)`, `members(p)` | |
| `sharing/declineInvite` | `userTags.invites(email)`, `invites(p)` | |
| `sharing/updateMemberAccess` | `members(p)`, `userTags.planners(target)` | |
| `sharing/removeMember` | `members(p)`, `userTags.planners(target)` | |
| `sharing/leavePlanner` | `members(p)`, `userTags.planners(self)` | |
| `sharing/signUpWithInvite` | `invites(p)`, `members(p)` | access `'public'` |
| `user/updateUserName` | `userTags.profile(self)` | |
| `user/requestEmailChange` | `userTags.profile(self)` | |
| `user/verifyEmailChangeAndSetPassword` | `userTags.profile(user)` | access `'public'` (token) |
| `user/deleteAccount` | `userTags.profile(self)`, `userTags.planners(self)`, `members(p)` for each membership | |

## C. Not Actually Server Actions → Move Out of `'use server'`
Move into server-only internal utils so they can't be called from the client:
- [ ] `planner/addPlanner` — currently exported as a server action **with no auth check**
- [ ] `user/addUser`

## D. Read Actions → `defineQuery`
- [ ] `getPlanner`, `getPlannerClient`, `getPlanners`, `getSavedItem`
- [ ] `getUser`, `getUserInvites`, `getPendingInvites`, `getPlannerMembers`
- [ ] `checkAuth`, `checkEmailStatus`, `validateInviteToken`

## E. Client Fetching → Server Props (Rule 2)
- [ ] `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` — layout fetches the planner server-side and passes it as a prop (consider React `cache()` on `getPlanner` to dedupe with the calendar page's read)
- [ ] `src/app/settings/_hooks/useInvites.ts` — load in `PlannerList` (server) and pass down; cancel-invite optimism via `useOptimistic`
- [ ] `src/app/settings/_hooks/usePlannerMembers.ts` — same
- [ ] `src/app/settings/_hooks/useCurrentUserMembership.ts` — same
- [ ] `src/app/settings/_components/MemberListContainer.tsx` — hook `refresh()` usage goes away

## F. `router.refresh()` Removals (Rule 3)
- [ ] `src/app/[planner]/calendar/_components/AddMealForm/AddMealModal.tsx`
- [ ] `src/app/[planner]/recipes/_components/DeleteItemButton.tsx`
- [ ] `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.tsx`
- [ ] `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.tsx`
- [ ] `src/app/settings/_components/CreatePlannerForm.tsx`
- [ ] `src/app/settings/_components/useRenamePlanner.ts`
- [ ] `src/app/settings/_components/InvitesSection.tsx` (×2)
- [ ] `src/app/settings/_components/ChangeNameForm.tsx`
- [ ] `src/app/settings/_components/ChangeEmailForm.tsx`
- [ ] `src/app/settings/_components/PlannerItem.tsx`

## G. Client-Local State to Reconcile
- [ ] `src/_components/TagCombobox.tsx` — `availableTags` must re-sync from props or use `useOptimistic`

## H. Writes Outside Server Actions
`updateTag` only works inside Server Actions, so these need resolving:
- [ ] `src/app/page.tsx` calls `addUser` during render (first sign-in) — keep as an internal util (C); no invalidation needed since it redirects
- [ ] `src/app/verify-email-change/page.tsx` calls `verifyEmailChange` during render — move to a Route Handler that writes, calls `revalidateTag(tag, 'max')`, and redirects, or to a confirm-button action (*decide in story*)
- [ ] `getPlanners` `$set`s default planner names on read — set the default at creation + one-off backfill, make the read pure
- [ ] `validateInviteToken` deletes expired invites on read — make the read pure; expire via a Mongo TTL index or in `acceptInvite`
- Exempt: client better-auth calls (`SignInFlow`, `ChangePasswordForm`, `ResetPasswordForm`, `ResendVerificationForm`, sign-out buttons) — followed by navigation, no planner data displayed

# Related Issues Found (Out of Scope)
Both added to [[Roadmap]] under Bugfixes.
- `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx` ignores `deleteRecipe`'s result and always reports success
- [[Zero Planners Crash]] — leaving your only planner likely crashes `src/app/page.tsx` (`user.planners[0]` on an empty array); unverified, from static reading only
