---
type: pattern
status: ready
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands

Ready. Next: build Step 1. ^status

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
  - **Decided** 2026-09-27: Sarah decided this story doesn't add `cache()`. It is routed out of scope, most likely to [[Unchecked Planner Reads]], which moves `getPlanner` out of its `'use server'` file.

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
  - Sarah decided 2026-09-27: re-sync from props, with no optimistic display. The new pill appears once `addTag` returns, as it does today.
- [ ] `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.tsx` — view mode draws its pills from a `useState` copy of `tagIds` that never re-syncs; it must draw them from the prop, keeping local state only for edits in progress. Found by plan-checker 2026-09-27; Sarah decided the same day that this story builds it.

## Tests and Shared Mocks
This story owns the mock clean-up for the test files it changes:

> ⚠️ **Check Drift 2026-09-28:** The docs moved from `.opencode/docs/` to `docs/`, so `.opencode/docs/unit_tests.md` below is now `docs/unit_tests.md`. Found while `/tooling` moved the docs.

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
  - Sarah decided 2026-09-27: `InlineNotesEditor.test.tsx` keeps this thin factory, and `InlineTagsEditor.test.tsx` copies it. How subpath imports are mocked stays Open Decision 2 in [[Unit Testing - New Centralized Mocks]].
- `test/mocks/@/_actions/calendar.ts`: `addMeal` default still returns `data: { calendar: [] }`
- `test/mocks/@/_actions/library.ts`: `addTag` takes `{ plannerId, name }`

# Out of Scope
- Planner, sharing and user actions and the settings screens - [[Settings Data Refresh]].
- `defineQuery`, the conventions test and lefthook - [[Data Rules Enforcement]].

# Implementation
## Step 1: Adding a meal refreshes the calendar from the server
**Idea:** Adding a meal refreshes the calendar from inside the server action instead of from the modal.

**Source:** Symptom: meals created in month view don't show up when switching to week view; Rule 1; Rule 3; Tag Model; Wrapper Shape; Enforcement → type level; Migration Checklist A: tag registry, `invalidate()` helper + spike, `defineMutation`; B: `calendar/addMeal`; F: `AddMealModal.tsx`; Tests and Shared Mocks: `test/mocks/@/_actions/calendar.ts`

**Approach:** Create the full typed tag registry from the Tag Model (`plannerTags` and `userTags`). Build `invalidate()` and run the Rule 1 spike inside it: if `updateTag` alone doesn't re-render the current route in Next 16, `invalidate()` also calls `refresh()` from `next/cache`. Record the spike's result as an **As built** note. Build `defineMutation` with the `access: { planner, level }` form only; `'self'` and `'public'` are added in [[Settings Data Refresh]]. `invalidates` is a required non-empty tuple and runs only on `ok: true`. Convert `addMeal`, drop its unused returned `calendar` and `AddMealForm`'s `onSuccess(calendar)` argument. `AddMealModal` stops calling `router.refresh()` and only closes. `defineQuery` is left to [[Data Rules Enforcement]]. Every converted action's tests will need `invalidate` mocked (it calls `next/cache`, which needs a request), so its shared mock is created here with the module (Sarah decided 2026-09-27; Open Decision 5 in [[Unit Testing - New Centralized Mocks]]).

**Files:**
- `src/_actions/_utils/cacheTags.ts` (new) - typed `plannerTags` / `userTags` registry
- `src/_actions/_utils/invalidate.ts` (new) - the only `next/cache` importer; `updateTag` per tag, plus `refresh()` if the spike needs it
- `src/_actions/_utils/defineMutation.ts` (new) - `server-only` wrapper: zod parse, planner access check, handler, invalidate on success
- `test/mocks/@/_actions/_utils/invalidate.ts` (new) - shared mock for `invalidate()`, used by every converted action's tests
- `src/_actions/calendar/addMeal.ts` - built with `defineMutation`, invalidates `calendar(p)`, no longer returns `calendar`
- `test/mocks/@/_actions/calendar.ts` - `addMeal` default no longer returns `data: { calendar: [] }`
- `src/app/[planner]/calendar/_components/AddMealForm/AddMealForm.tsx` - `onSuccess` takes no calendar argument
- `src/app/[planner]/calendar/_components/AddMealForm/AddMealModal.tsx` - remove `router.refresh()`
- `src/_actions/_utils/cacheTags.test.ts`, `invalidate.test.ts`, `defineMutation.test.ts` (new) - tests for the new pieces
- `src/_actions/calendar/addMeal.test.ts` - updated for the wrapper and the dropped `calendar`
- `src/app/[planner]/calendar/_components/AddMealForm/AddMealForm.test.tsx` - `onSuccess` called with no argument
- `src/app/[planner]/calendar/_components/AddMealForm/AddMealModal.test.tsx` - closes on success, no refresh

**Acceptance:**
- [ ] Desktop, write user, calendar in month view on a week with an empty day: click Add Meal in the header, set Date to that empty day, add a dish, submit, then close the modal with the X **before** the 3-second countdown ends. Switch to week view: the meal is there without a reload. (Reproduces the symptom.)
- [ ] Desktop, month view: add a meal and let the countdown finish. The modal closes and the meal is already in the month cell.
- [ ] Phone, write user, list view: tap an empty day's add trigger, add a meal. It appears under that day without a reload.
- [ ] Phone, write user, month view: add a meal with the floating Add Meal button. The day shows it without a reload.
- [ ] Two browsers: an owner downgrades a write user to read while the write user has the Add Meal modal open. The write user submits and sees an "Unauthorized" error in the form. Close the modal: the day is still empty, and still empty after a reload.
- [ ] Temporarily delete the `invalidates` line from `addMeal` and run `pnpm build`. The build fails with a type error pointing at the `defineMutation({...})` call in `addMeal.ts`. Restore the line.
- [ ] Temporarily change it to `invalidates: () => []` and run `pnpm build`. The build fails the same way. Restore the line.

The last two checks are the plan's only non-app checks. They are how the type-level Enforcement is seen.

## Step 2: PlannerProvider gets the planner from the layout
**Idea:** `PlannerProvider` receives the planner as a prop from the server-rendered layout.

**Source:** Rule 2; Migration Checklist E: `PlannerProvider.tsx`; Tests and Shared Mocks: `src/app/[planner]/layout.test.tsx`

**Approach:** Migration Checklist E. `[planner]/layout.tsx` fetches the serialized planner (`getPlannerClient`) after its access check and passes it down. `PlannerProvider` drops `useEffect`/`useState` and the `id` prop, and no longer renders nothing while loading. No React `cache()` on `getPlanner` in this story (Sarah decided 2026-09-27; see the note's Open Decisions).

**Files:**
- `src/app/[planner]/layout.tsx` - fetch the planner and pass it to `PlannerProvider`
- `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` - take `planner` as a prop; no client fetching
- `src/app/[planner]/layout.test.tsx` - new prop; mock `@/_actions/planner` with the shared mock; ad-hoc `@/_actions/auth` → shared mock; delete the dead `@/_actions/user` mock (the layout doesn't import it)
- `src/app/[planner]/_components/PlannerContext/PlannerProvider.test.tsx` - prop instead of fetching

**Acceptance:**
- [ ] Desktop, write user: Calendar → Add Meal → a dish with source "saved". The dropdown lists the planner's saved recipes and bookmarks, same as before.
- [ ] Desktop, write user: Recipes page shows the Add Item dropdown and the edit/delete buttons, same as before. As a read-only user they are hidden, same as before.
- [ ] Phone, write user: calendar list view shows the per-day add triggers, and month view shows the floating Add Meal button, same as before.
- [ ] Read-only user: the calendar header has no Add Meal button, phone list view has no per-day add triggers, and phone month view has no floating Add Meal button, same as before.
- [ ] Desktop, devtools network throttled to "Slow 4G": hard-reload the calendar. The calendar is there as soon as the page paints, with no empty content area first.

## Step 3: Adding a library item refreshes saved items
**Idea:** Adding a recipe or bookmark refreshes the planner's saved items from inside the server action.

**Source:** Symptom: after adding a new recipe, it is not immediately available in the saved dishes dropdown in the create meal modal; Rule 1; Migration Checklist B: `library/addRecipe`, `library/addBookmark`; Tests and Shared Mocks: `addBookmark.test.ts`, `addRecipe.test.ts`

**Approach:** Convert both to `defineMutation`, invalidating `saved(p)`. With Step 2 in place, the refreshed layout carries the new saved list into `PlannerProvider`.

**Files:**
- `src/_actions/library/addRecipe.ts` - `defineMutation`, invalidates `saved(p)`
- `src/_actions/library/addBookmark.ts` - same
- `src/_actions/library/addRecipe.test.ts` - updated for the wrapper; ad-hoc `@/_models/planner` and `@/_models/library` mocks → shared mocks
- `src/_actions/library/addBookmark.test.ts` - updated for the wrapper; ad-hoc `@/_models/planner` mock → shared mock

**Acceptance:**
- [ ] Desktop, write user: Recipes → Add Item → Recipe, save "Test Soup". Click Calendar in the navbar (no reload) → Add Meal → saved dish dropdown lists "Test Soup". (Reproduces the symptom.)
- [ ] Desktop, write user: same flow with a bookmark. The new bookmark is in the dropdown.
- [ ] Desktop, write user: after saving, the new recipe is in the Recipes list, same as before.

## Step 4: Editing or deleting a library item refreshes from the server
**Idea:** Changing or removing a saved item refreshes the page from inside the server action.

**Source:** Rule 1; Rule 3; Migration Checklist B: `library/editRecipe`, `library/editBookmark`, `library/deleteRecipe`, `library/deleteBookmark`; F: `DeleteItemButton.tsx`; Tests and Shared Mocks: `editBookmark.test.ts`, `deleteBookmark.test.ts`, `next/cache` mocks in `editBookmark` / `editRecipe` tests

**Approach:** Convert the four actions and remove their `revalidatePath` calls. `DeleteItemButton` stops calling `router.refresh()`.

**Files:**
- `src/_actions/library/editRecipe.ts` - `defineMutation`, invalidates `saved(p)`, remove `revalidatePath` ×2
- `src/_actions/library/editBookmark.ts` - same, remove `revalidatePath`
- `src/_actions/library/deleteRecipe.ts` - `defineMutation`, invalidates `saved(p)`
- `src/_actions/library/deleteBookmark.ts` - same
- `src/app/[planner]/recipes/_components/DeleteItemButton.tsx` - remove `router.refresh()`
- `src/_actions/library/editRecipe.test.ts` - updated for the wrapper; drop the ad-hoc `next/cache` mock
- `src/_actions/library/editBookmark.test.ts` - updated for the wrapper; drop `next/cache`; ad-hoc `@/_actions/auth` and `@/_models/planner` → shared mocks
- `src/_actions/library/deleteRecipe.test.ts` - updated for the wrapper
- `src/_actions/library/deleteBookmark.test.ts` - updated for the wrapper; ad-hoc `@/_models/planner` → shared mock
- `src/app/[planner]/recipes/_components/DeleteItemButton.test.tsx` - no refresh on success

**Acceptance:**
- [ ] Desktop, write user: rename a recipe in the edit modal on the Recipes list. The list shows the new name. Click Calendar (no reload) → Add Meal → the dropdown shows the new name.
- [ ] Desktop, write user: edit a recipe from its detail page. The detail page shows the new values, same as before.
- [ ] Desktop, write user: edit a bookmark's URL. The list links to the new URL, same as before.
- [ ] Desktop, write user: delete a bookmark, then a recipe, from the list. Each disappears right away, and neither is in the Add Meal dropdown afterwards, same as before.
- [ ] Desktop, write user: delete a recipe from its detail page. No "not found" page appears between confirming and landing on the Recipes list, and the list doesn't show the recipe. (Once `deleteRecipe` refreshes the current route, the detail page re-renders for a deleted recipe and calls `notFound()`. If that shows, stop and raise it with Sarah; it needs a decision, not a builder's guess.)

## Step 5: Inline recipe edits refresh from the server
**Idea:** The recipe detail page's inline editors show what the server re-renders after a save.

**Source:** Rule 1; Rule 2; Rule 3; Migration Checklist B: `library/updateRecipeNotes`, `library/updateRecipeTags`; F: `InlineNotesEditor.tsx`, `InlineTagsEditor.tsx`; G: `InlineTagsEditor.tsx`; Tests and Shared Mocks: `updateRecipeNotes` / `updateRecipeTags` `next/cache` mocks, `InlineTagsEditor.test.tsx`, `InlineNotesEditor.test.tsx`

**Approach:** Convert both actions to `defineMutation`, invalidating `saved(p)`, and remove `revalidatePath`. Both editors stop calling `router.refresh()`. `InlineTagsEditor` draws its view-mode pills from the `tagIds` prop; its local state holds only the edit in progress and starts from `tagIds` each time editing opens (Migration Checklist G).

**Files:**
- `src/_actions/library/updateRecipeNotes.ts` - `defineMutation`, invalidates `saved(p)`, remove `revalidatePath`
- `src/_actions/library/updateRecipeTags.ts` - same
- `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.tsx` - remove `router.refresh()`
- `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.tsx` - remove `router.refresh()`; view-mode pills from the `tagIds` prop, local state only while editing
- `src/_actions/library/updateRecipeNotes.test.ts`, `src/_actions/library/updateRecipeTags.test.ts` - updated for the wrapper; drop the ad-hoc `next/cache` mock
- `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.test.tsx` - no refresh; its `@/_hooks/useEditMode` factory stays as it is (Sarah decided 2026-09-27; subpath mocks are Open Decision 2 in [[Unit Testing - New Centralized Mocks]])
- `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.test.tsx` - no refresh; ad-hoc `@/_actions/library` → shared mock; mock `@/_hooks/useEditMode` with the same thin factory `InlineNotesEditor.test.tsx` uses, instead of running the real hook (Sarah decided 2026-09-27); new tests: pills follow a new `tagIds` prop on rerender, editing starts from the current `tagIds`, an edit in progress survives a prop change

**Acceptance:**
- [ ] Desktop, write user, recipe detail page: edit the notes inline and save. The new notes show. Go back to Recipes and reopen the recipe: the notes are still there.
- [ ] Desktop, write user, recipe detail page: edit the tags inline (remove one, add one existing tag) and save. The pills update.
- [ ] Two browsers, desktop, write user, both on the same recipe's detail page: B changes the tags inline and saves. A edits the notes inline and saves. A's pills now match B's tags without a reload. A then opens the tags editor: the picker holds B's tags, not A's old ones. (Before this step, A keeps showing its old pills.)
- [ ] Desktop, write user: open the inline tags editor, remove a tag, cancel. The pills show the saved tags again. Open the tags editor again: the picker shows all the saved tags, including the one you removed.
- [ ] Desktop, write user: open the tags editor and remove a tag without saving. Edit the notes and save. The tags editor is still open and still shows the removal.
- [ ] Phone, write user, recipe detail page: edit the notes inline and save. The new notes show under Notes.
- [ ] Two browsers: an owner downgrades a write user to read while the write user has the inline notes editor open. The write user saves and sees "Unauthorized" under Notes. Reloading shows the old notes.

## Step 6: New tags appear in every tag picker
**Idea:** A newly created tag reaches every tag picker through server props.

**Source:** Rule 1; Rule 2; Migration Checklist B: `library/addTag`; G: `TagCombobox.tsx`; Tests and Shared Mocks: `test/mocks/@/_actions/library.ts` `addTag`

**Approach:** `addTag` becomes a `defineMutation` with an object input (`{ plannerId, name }`), invalidating `tags(p)`. `TagCombobox` drops its `availableTags` state and reads `initialTags` directly; the new tag arrives through the server refresh that `addTag` triggers. No optimistic display: the pill appears once `addTag` returns, as it does today (Sarah decided 2026-09-27; props rather than `useOptimistic`, Migration Checklist G). All three places that host it (`RecipeForm`, `BookmarkForm`, `InlineTagsEditor`) get their tags from server-rendered props (the URL-driven recipe/bookmark modal from the recipes page, the detail page's `?status=edit` recipe form and inline editor from the detail page), so the refresh reaches them.

**Files:**
- `src/_actions/library/addTag.ts` - `defineMutation`, object input, invalidates `tags(p)`
- `src/_components/TagCombobox.tsx` - tag list from `initialTags` only; call `addTag` with the object input
- `test/mocks/@/_actions/library.ts` - `addTag` takes `{ plannerId, name }`
- `src/_actions/library/addTag.test.ts` - object input, updated for the wrapper
- `src/_components/TagCombobox.test.tsx` - object input; tag list comes from props

**Acceptance:**
- [ ] Desktop, write user, recipe detail page, inline tags editor: type "Spicy", choose Create. The "Spicy" pill appears. Save. The pills show "Spicy", same as before.
- [ ] Two browsers, desktop, write user. Browser A opens Add Recipe. Browser B, on a recipe detail page, creates tag "Zesty" in the inline tags editor. In A, create tag "Quick". A's picker now offers "Zesty" as well as showing the "Quick" pill. (Before this step, A's picker never shows "Zesty".)
- [ ] Desktop, write user: Add Item → Bookmark, create tag "Weeknight" in its picker, save the bookmark. The bookmark shows "Weeknight" in the Recipes list, same as before.
- [ ] Two browsers: an owner downgrades a write user to read. On a recipe detail page, in the inline tags editor, the write user tries to create a tag. "Unauthorized" shows under the picker and no pill appears.
