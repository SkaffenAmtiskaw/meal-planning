---
type: pattern
status: spec
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands

Next: /plan-steps. ^status

# Purpose
Adding a meal or a library item doesn't reliably refresh what's on screen. Refreshing is a client-side side effect tied to modals and countdowns, and the planner lives in client state that no refresh reaches. This story builds the shared pieces of the data refresh pattern (tag registry, `invalidate()`, `defineMutation`) and moves every calendar and recipe mutation onto them, so these mutations refresh the page from the server.

Split from [[Stale Data Issues]] on 2026-09-25.

# Symptoms
At the end of this story the following should be fixed:
- [ ] after adding a new recipe, it is not immediately available in the saved dishes dropdown in the create meal modal
- [ ] meals created in month view don't show immediately show up when switching to week view

# Root Cause
![[Stale Data Issues#Root Cause Analysis]]

# Open Decisions
- Should `getPlanner` use React `cache()` to dedupe the layout's read with the calendar page's read? (Places E says "consider".)

# Rules
The design lives in [[Stale Data Issues]]. The sections embedded below are part of this note.

![[Stale Data Issues#Confirmed Approach]]

# Enforcement
![[Stale Data Issues#^type-level]]

The conventions meta-test and lefthook command are built in [[Data Rules Enforcement]], once every action is migrated.

# Migration Checklist
## A. Infrastructure
- [ ] tag registry — `src/_actions/_utils/cacheTags.ts`
- [ ] `invalidate()` helper (+ spike from Rule 1)
- [ ] `defineMutation` wrapper, `access: { planner, level }` form. `'self'` and `'public'` are added in [[Settings Data Refresh]].

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

## E. Client Fetching → Server Props (Rule 2)
- [ ] `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` — layout fetches the planner server-side and passes it as a prop (consider React `cache()` on `getPlanner` to dedupe with the calendar page's read)

## F. `router.refresh()` Removals (Rule 3)
- [ ] `src/app/[planner]/calendar/_components/AddMealForm/AddMealModal.tsx`
- [ ] `src/app/[planner]/recipes/_components/DeleteItemButton.tsx`
- [ ] `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.tsx`
- [ ] `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.tsx`

## G. Client-Local State to Reconcile
- [ ] `src/_components/TagCombobox.tsx` — `availableTags` must re-sync from props or use `useOptimistic`

## Tests and Shared Mocks
*Added 2026-09-26: hand-off from [[Unit Testing - Clean Up Mocks]], decided by Sarah on 2026-09-25.* This story owns the mock clean-up for the test files it changes:
- Every test file it rewrites or moves uses the centralized mock in `test/mocks/` for any module that has one (`vi.mock('<module>', async () => await import('@mocks/...'))`), not an ad-hoc factory, per `.opencode/docs/unit_tests.md`.
- When it moves, renames or reshapes an export of `@/_actions` or `@/_models`, it updates the matching `test/mocks/@/_actions/*.ts` or `test/mocks/@/_models/*.ts` in the same step.
- If another story already did this for a file, there's nothing more to do.

Known files as of 2026-09-25 (found by reading code; re-check when planning):
- `src/_actions/library/editBookmark.test.ts`: ad-hoc `@/_actions/auth`, `@/_models/planner`
- `src/_actions/library/addBookmark.test.ts:11`, `deleteBookmark.test.ts:12`: ad-hoc `@/_models/planner`
- `src/_actions/library/addRecipe.test.ts`: ad-hoc `@/_models/planner`, `@/_models/library` (line 12)
- `editBookmark`, `editRecipe`, `updateRecipeNotes`, `updateRecipeTags` tests: drop the ad-hoc `next/cache` mock when `revalidatePath` goes
- `src/app/[planner]/layout.test.tsx`: ad-hoc `@/_actions/user` (line 25) and `@/_actions/auth` (line 21)
- `InlineTagsEditor.test.tsx`: ad-hoc `@/_actions/library`; doesn't mock `@/_hooks/useEditMode`, so the real hook runs
- `InlineNotesEditor.test.tsx:23`: custom subpath factory for `@/_hooks/useEditMode`
- `test/mocks/@/_actions/calendar.ts`: `addMeal` default still returns `data: { calendar: [] }`
- `test/mocks/@/_actions/library.ts`: `addTag` takes `{ plannerId, name }`

# Out of Scope
- Planner, sharing and user actions and the settings screens - [[Settings Data Refresh]].
- `defineQuery`, the conventions test and lefthook - [[Data Rules Enforcement]].

# Draft Steps (from the split)
> [!warning] For the agent running /plan-steps
> This section is the draft plan saved when [[Stale Data Issues]] was split on 2026-09-25. It replaces `.opencode/scratch/Calendar and Recipes Data Refresh - plan.md`; start from it as that skill's "draft saved by a split". It has not been through plan-checker. **Once the approved plan is written under Implementation, delete this whole section** (heading included).

Note: `notes/features/tech debt/Calendar and Recipes Data Refresh.md` (type: pattern). Step numbers are the original draft's; renumber when planning. "Places A–H" refers to the Migration Checklist sections as they appeared in [[Stale Data Issues]] before the split; this note carries its share of them.


## Step 1: Adding a meal refreshes the calendar from the server
**Idea:** Adding a meal refreshes the calendar from inside the server action instead of from the modal.

**Source:** Symptom: meals created in month view don't show up when switching to week view; Rule 1; Rule 3; Tag Model; Wrapper Shape; Enforcement → type level; Places A: tag registry, `invalidate()` helper + spike, `defineMutation`; Places B: `calendar/addMeal`; Places F: `AddMealModal.tsx`

**Approach:** Create the full typed tag registry from the Tag Model. Build `invalidate()` and run the Rule 1 spike inside it: if `updateTag` alone doesn't re-render the current route in Next 16, `invalidate()` also calls `refresh()` from `next/cache`. Build `defineMutation` with the `access: { planner, level }` form only. `'self'` and `'public'` are added in the steps that first need them (Steps 7 and 14). `invalidates` is a required non-empty tuple and runs only on `ok: true`. Convert `addMeal`. Drop its unused returned `calendar` and `AddMealForm`'s `onSuccess(calendar)` argument. `AddMealModal` stops calling `router.refresh()` and only closes. `defineQuery` is left for Step 19.

**Files:**
- `src/_actions/_utils/cacheTags.ts` (new) - typed `plannerTags` / `userTags` registry
- `src/_actions/_utils/invalidate.ts` (new) - the only `next/cache` importer; `updateTag` per tag, plus `refresh()` if the spike needs it
- `src/_actions/_utils/defineMutation.ts` (new) - `server-only` wrapper: zod parse, planner access check, handler, invalidate on success
- `src/_actions/calendar/addMeal.ts` - built with `defineMutation`, invalidates `calendar(p)`, no longer returns `calendar`
- `src/app/[planner]/calendar/_components/AddMealForm/AddMealForm.tsx` - `onSuccess` takes no calendar argument
- `src/app/[planner]/calendar/_components/AddMealForm/AddMealModal.tsx` - remove `router.refresh()`
- matching `*.test.ts(x)` for each of the above

**Acceptance:**
- [ ] Desktop, write user, calendar in month view on a week with an empty day: Add Meal on that day, submit, then close the modal with the X **before** the 3-second countdown ends. Switch to week view: the meal is there without a reload. (Reproduces the symptom.)
- [ ] Desktop, month view: add a meal and let the countdown finish. The modal closes and the meal is already in the month cell.
- [ ] Phone, list view: add a meal with the mobile add button. It appears in the list without a reload.
- [ ] Two browsers: an owner downgrades a write user to read while the write user has the Add Meal modal open. The write user submits and sees an "Unauthorized" error in the form, and no meal is added.
- [ ] Temporarily delete the `invalidates` line from `addMeal` and run `pnpm build`. The build fails with a type error on `addMeal`. Restore the line.

## Step 2: PlannerProvider gets the planner from the layout
**Idea:** The planner layout loads the planner on the server and passes it to `PlannerProvider` as a prop.

**Source:** Rule 2; Places E: `PlannerProvider.tsx`

**Approach:** Places E, first item. `[planner]/layout.tsx` fetches the serialized planner and passes it down. `PlannerProvider` drops `useEffect`/`useState` and the `id` prop. *Open question: whether to add React `cache()` to `getPlanner` to dedupe with the calendar page's read.*

**Files:**
- `src/app/[planner]/layout.tsx` - fetch the planner and pass it to `PlannerProvider`
- `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` - take `planner` as a prop; no client fetching
- `src/_actions/planner/getPlanner.ts` - only if `cache()` is chosen
- matching tests

**Acceptance:**
- [ ] Desktop, write user: Calendar → Add Meal → a dish with source "saved". The dropdown lists the planner's saved recipes and bookmarks, same as before.
- [ ] Desktop, write user: Recipes page shows the Add dropdown and the edit/delete buttons, same as before. As a read-only user they are hidden, same as before.
- [ ] Phone, write user: calendar list view shows the per-day add buttons, same as before.
- [ ] Desktop, devtools network throttled to "Slow 4G": hard-reload the calendar. The calendar is there as soon as the page paints, with no empty content area first.

## Step 3: Adding a library item refreshes saved items
**Idea:** Adding a recipe or bookmark refreshes the planner's saved items from inside the server action.

**Source:** Symptom: after adding a new recipe, it is not immediately available in the saved dishes dropdown in the create meal modal; Rule 1; Places B: `library/addRecipe`, `library/addBookmark`

**Approach:** Convert both to `defineMutation`, invalidating `saved(p)`. With Step 2 in place, the refreshed layout carries the new saved list into `PlannerProvider`.

**Files:**
- `src/_actions/library/addRecipe.ts` - `defineMutation`, invalidates `saved(p)`
- `src/_actions/library/addBookmark.ts` - same
- matching tests

**Acceptance:**
- [ ] Desktop, write user: Recipes → Add → Recipe, save "Test Soup". Click Calendar in the navbar (no reload) → Add Meal → saved dish dropdown lists "Test Soup". (Reproduces the symptom.)
- [ ] Same flow with a bookmark: the new bookmark is in the dropdown.
- [ ] After saving, the new recipe is in the Recipes list, same as before.

## Step 4: Editing or deleting a library item refreshes from the server
**Idea:** Library edit and delete actions invalidate saved items instead of revalidating paths.

**Source:** Rule 1; Rule 3; Places B: `library/editRecipe`, `library/editBookmark`, `library/deleteRecipe`, `library/deleteBookmark`; Places F: `DeleteItemButton.tsx`

**Approach:** Convert the four actions and remove their `revalidatePath` calls. `DeleteItemButton` stops calling `router.refresh()`.

**Files:**
- `src/_actions/library/editRecipe.ts` - `defineMutation`, invalidates `saved(p)`, remove `revalidatePath` ×2
- `src/_actions/library/editBookmark.ts` - same, remove `revalidatePath`
- `src/_actions/library/deleteRecipe.ts` - `defineMutation`, invalidates `saved(p)`
- `src/_actions/library/deleteBookmark.ts` - same
- `src/app/[planner]/recipes/_components/DeleteItemButton.tsx` - remove `router.refresh()`
- matching tests

**Acceptance:**
- [ ] Desktop, write user: rename a recipe in the edit modal. The Recipes list shows the new name. Click Calendar (no reload) → Add Meal → the dropdown shows the new name.
- [ ] Edit a recipe from its detail page. The detail page shows the new values.
- [ ] Edit a bookmark's URL. The list links to the new URL.
- [ ] Delete a bookmark, then a recipe, from the list. Each disappears right away. Neither is in the Add Meal dropdown afterwards.

## Step 5: Inline recipe edits refresh from the server
**Idea:** The recipe detail page's inline notes and tags editors rely on the server action to refresh the page.

**Source:** Rule 1; Rule 3; Places B: `library/updateRecipeNotes`, `library/updateRecipeTags`; Places F: `InlineNotesEditor.tsx`, `InlineTagsEditor.tsx`

**Files:**
- `src/_actions/library/updateRecipeNotes.ts` - `defineMutation`, invalidates `saved(p)`, remove `revalidatePath`
- `src/_actions/library/updateRecipeTags.ts` - same
- `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.tsx` - remove `router.refresh()`
- `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.tsx` - remove `router.refresh()`
- matching tests

**Acceptance:**
- [ ] Desktop, write user, recipe detail page: edit the notes inline and save. The new notes show. Go back to Recipes and reopen the recipe: the notes are still there.
- [ ] Edit the tags inline (remove one, add one existing tag) and save. The pills update. The Recipes list shows the new tags on that recipe.
- [ ] Phone: same notes edit works.

## Step 6: New tags appear in every tag picker
**Idea:** Tag pickers take their tag list from server props and show a newly created tag optimistically.

**Source:** Rule 1; Rule 2 (optimistic updates); Places B: `library/addTag`; Places G: `TagCombobox.tsx`

**Approach:** `addTag` becomes a `defineMutation` with an object input (`{ plannerId, name }`), invalidating `tags(p)`. `TagCombobox` replaces its `availableTags` state with `useOptimistic` over `initialTags`, so it reconciles when the refreshed props arrive.

**Files:**
- `src/_actions/library/addTag.ts` - `defineMutation`, object input, invalidates `tags(p)`
- `src/_components/TagCombobox.tsx` - `useOptimistic` over `initialTags`; call `addTag` with the object input
- matching tests

**Acceptance:**
- [ ] Desktop, write user, recipe detail page: inline tags → type "Spicy" → create. The pill appears right away. Save. Go to another recipe (no reload), open its inline tag editor: "Spicy" is offered.
- [ ] Add Recipe modal: create tag "Quick", then cancel the modal. Open Add Recipe again: "Quick" is offered.
- [ ] Two browsers: an owner downgrades a write user to read. The write user tries to create a tag and sees the error. The optimistic pill disappears.

**Open questions for /plan-steps** (also in Open Decisions):
- React `cache()` on `getPlanner` (Step 2) - note's Open Decisions.

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
