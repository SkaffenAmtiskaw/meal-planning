# Server Action Error Handling

Return error objects instead of throwing from client-called server actions, so the Next.js dev overlay is not triggered for expected errors (auth failures, not found, etc.).

## Context

- Client-called mutation actions currently `throw new Error(...)` for expected failures
- This triggers the Next.js dev overlay in development — noise for expected/handled errors
- `useFormFeedback.wrap` catches thrown errors via try/catch and sets `errorMessage`
- Inline editors (`InlineNotesEditor`, `InlineTagsEditor`, `TagCombobox`) call actions directly with no error UI
- Server-side fetch actions (`getUser`, `getPlanner`, `getSavedItem`, `addUser`, `addPlanner`) are **excluded** — they are called from server components where throwing is appropriate

## Approach

Define a shared `ActionResult<T>` discriminated union:
```ts
type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }
```

Client-called actions return `ActionResult<T>` instead of throwing for expected errors. Unexpected errors (DB failures, network) may still throw and are caught by try/catch in callers.

`useFormFeedback.wrap` checks `result.ok` instead of relying solely on catch.

<!-- Claude-generated plan below -->

## Steps

### Step 1 — Define `ActionResult<T>` utility
- Create `src/_utils/actionResult/actionResult.ts` with the `ActionResult<T>` type
- Create `src/_utils/actionResult/index.ts`
- Write unit tests (`actionResult.test.ts` — type-level only, but ensure index exports correctly)

**Verify:** `pnpm lint` passes, `pnpm test` passes

---

### Step 2 — Update `useFormFeedback.wrap` to handle `ActionResult`
- Change `wrap` generic signature to accept `fn: (...args) => Promise<ActionResult<T>>`
- After awaiting `fn`, check `result.ok`; if `false`, set error state and return
- Keep existing try/catch for unexpected errors (network/DB)
- Update `onSuccess` to receive `result.data` (typed as `T`)
- Update tests in `useFormFeedback.test.ts`

**Verify:** `pnpm test` passes, `pnpm lint` passes

---

### Step 3 — Update mutation actions
Change these actions to return `ActionResult<T>` instead of throwing:
- `addRecipe` → `ActionResult<{ _id: string; name: string }>`
- `deleteRecipe` → `ActionResult`
- `updateRecipeNotes` → `ActionResult`
- `updateRecipeTags` → `ActionResult`
- `addTag` → `ActionResult<{ _id: string; name: string; color: string }>`

For each: replace `throw new Error(...)` with `return { ok: false, error: '...' }`. On success, return `{ ok: true, data: ... }`. Update the corresponding `*.test.ts` file.

**Verify:** `pnpm test` passes, `pnpm lint` passes

---

### Step 4 — Update `wrap` callers (`RecipeForm`, `DeleteRecipeButton`)
- `RecipeForm`: have the wrapped async fn `return addRecipe(...)` (so ActionResult propagates to `wrap`)
- `DeleteRecipeButton`: have the wrapped async fn `return deleteRecipe(...)` (same)
- Update `RecipeForm.test.tsx` and `DeleteRecipeButton.test.tsx`

**Verify:** `pnpm test` passes, `pnpm lint` passes

---

### Step 5 — Update direct callers (`InlineNotesEditor`, `InlineTagsEditor`, `TagCombobox`)
- `InlineNotesEditor`: check `result.ok`; add an error state + display if `!result.ok`
- `InlineTagsEditor`: same pattern
- `TagCombobox`: replace try/catch with `result.ok` check; keep `setCreateError` for display
- Update all corresponding `*.test.ts` files

**Verify:** `pnpm test` passes, `pnpm lint` passes

---

## Files

| File | Change |
|---|---|
| `src/_utils/actionResult/actionResult.ts` | **create** — `ActionResult<T>` type |
| `src/_utils/actionResult/index.ts` | **create** — re-export |
| `src/_utils/actionResult/actionResult.test.ts` | **create** — tests |
| `src/_hooks/useFormFeedback/useFormFeedback.ts` | update `wrap` signature + logic |
| `src/_hooks/useFormFeedback/useFormFeedback.test.ts` | update tests |
| `src/_actions/saved/addRecipe.ts` | return `ActionResult` |
| `src/_actions/saved/addRecipe.test.ts` | update tests |
| `src/_actions/saved/deleteRecipe.ts` | return `ActionResult` |
| `src/_actions/saved/deleteRecipe.test.ts` | update tests |
| `src/_actions/saved/updateRecipeNotes.ts` | return `ActionResult` |
| `src/_actions/saved/updateRecipeNotes.test.ts` | update tests |
| `src/_actions/saved/updateRecipeTags.ts` | return `ActionResult` |
| `src/_actions/saved/updateRecipeTags.test.ts` | update tests |
| `src/_actions/planner/addTag.ts` | return `ActionResult` |
| `src/_actions/planner/addTag.test.ts` | update tests |
| `src/app/[planner]/recipes/_components/Modal/RecipeForm.tsx` | return ActionResult from wrapped fn |
| `src/app/[planner]/recipes/_components/Modal/RecipeForm.test.tsx` | update tests |
| `src/app/[planner]/recipes/_components/DeleteRecipeButton.tsx` | return ActionResult from wrapped fn |
| `src/app/[planner]/recipes/_components/DeleteRecipeButton.test.tsx` | update tests |
| `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.tsx` | check result, add error UI |
| `src/app/[planner]/recipes/[recipeId]/_components/InlineNotesEditor.test.tsx` | update tests |
| `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.tsx` | check result, add error UI |
| `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.test.tsx` | update tests |
| `src/_components/TagCombobox.tsx` | replace try/catch with result check |
| `src/_components/TagCombobox.test.tsx` | update tests |

## Manual Test Plan

Run `pnpm dev` and sign in. For each scenario, confirm **no Next.js dev overlay appears** and the UI shows the correct feedback.

### Add a recipe (success)
1. Navigate to the recipes page → click **Add Recipe**
2. Fill in a title → click **Add Recipe**
3. Expected: success feedback shown, modal closes, recipe appears in the list

### Add a recipe (validation error)
1. Open the Add Recipe modal → click **Add Recipe** without entering a title
2. Expected: form validation error shown inline, no overlay, modal stays open

### Delete a recipe (success)
1. Click the trash icon on any recipe → confirm in the modal
2. Expected: modal closes, recipe removed from list, no overlay

### Delete a recipe (simulated auth error)
1. In a separate tab, sign out
2. Back in the original tab, attempt to delete a recipe
3. Expected: error message displayed in the confirm modal, no overlay

### Inline notes edit (success)
1. Open a recipe → click the pencil icon next to **Notes**
2. Type something → click the check icon
3. Expected: notes update in place, no overlay

### Inline notes edit (error)
1. Sign out in a separate tab, attempt to save notes in the original tab
2. Expected: error message displayed near the save button, no overlay

### Inline tags edit (success)
1. Open a recipe → click the pencil icon next to **Tags**
2. Add or remove a tag → click save
3. Expected: tags update in place, no overlay

### Add a new tag via tag combobox (success)
1. Open the Add Recipe modal → type a new tag name in the Tags field → click **Create**
2. Expected: tag added to the selection, no overlay

### Add a new tag via tag combobox (error)
1. Sign out in a separate tab, attempt to create a tag in the original tab
2. Expected: inline error message shown near the tag input, no overlay
