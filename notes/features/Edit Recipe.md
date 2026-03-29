- when a user edits the recipe from the list the form should appear in the modal
- when a user edits the recipe from the recipe page the form should not be in a modal - it should replace the page
- inputs should mirror the layout of the static page where possible
- the form should be responsive in mobile

---

<!-- Claude-generated plan -->

## Context

The modal infrastructure for editing is already in place (URL params `?item={id}&status=edit&type=recipe`, `getSavedItem`, `RecipeForm` pre-population). What's missing:

- `editRecipe` server action (form has a `// TODO` stub)
- Edit button wiring in `SavedList` and `RecipeDetail`
- A dedicated edit page (`/[recipeId]/edit`) for the non-modal recipe page flow

## Implementation Plan

### ✅ Step 1 — Create `editRecipe` server action + tests

**File:** `src/_actions/saved/editRecipe.ts`

- Schema: `zRecipeFormSchema.extend({ _id: z.string() })` — adds `_id` to identify the recipe
- Use `Planner.collection.updateOne` with `$set`/`$unset` per the existing subdocument field update pattern (Mongoose union schema blocks all other approaches)
- Required fields (`name`, `ingredients`, `instructions`, `tags`): always `$set`
- Optional fields (`source`, `time`, `servings`, `notes`, `storage`): `$set` when present, `$unset` when absent
- Revalidate `/${plannerId}/recipes` and `/${plannerId}/recipes/${recipeId}`
- Return `ActionResult<{ _id: string; name: string }>`

**Test file:** `src/_actions/saved/editRecipe.test.ts`

### ✅ Step 2 — Wire `RecipeForm` to call `editRecipe` in edit mode + update tests

**File:** `src/app/[planner]/recipes/_components/Modal/RecipeForm.tsx`

- Add optional `redirectTo?: string` prop; default to `pathname` (preserves current modal-close behavior)
- When `item` is present → call `editRecipe` with `{ ...values, _id: String(item._id), ... }`
- When no `item` → call `addRecipe` (unchanged)
- Use `redirectTo` for both cancel navigation and post-save navigation
- Success/error feedback is handled by the existing `useFormFeedback` + `FormFeedbackAlert` already in the form — no additional work needed; this applies to both the modal and the edit page since both render `RecipeForm`

**Test file:** `src/app/[planner]/recipes/_components/Modal/RecipeForm.test.tsx`

### ✅ Step 3 — Enable edit button in `SavedList` for recipes + update tests (EditRecipeButton extracted as client component)

**File:** `src/app/[planner]/recipes/_components/SavedList.tsx`

- For recipes: render the edit `ActionIcon` as a `Link` to `?item=${item._id}&status=edit&type=recipe`
- For bookmarks: keep `disabled` (bookmark edit is a future feature)
- Modal infrastructure already handles fetching and rendering the form with `item` pre-populated

**Test file:** `src/app/[planner]/recipes/_components/SavedList.test.tsx`

### ✅ Step 4 — Add edit mode to recipe detail page via query param + tests

**File:** `src/app/[planner]/recipes/[recipeId]/page.tsx`

Page behavior:
- Add `status` to the search params schema: `z.literal('edit').optional()`
- When `status=edit`: render `RecipeForm` in a `Container size="md"` (no modal) with `redirectTo={`/${plannerId}/recipes/${recipeId}`}` so cancel and save navigate back to the detail view
- When no status: render `RecipeDetail` as before (unchanged)
- Serializes the item the same way as the existing detail path (`JSON.parse(JSON.stringify(item))`)

**Test file:** `src/app/[planner]/recipes/[recipeId]/page.test.tsx`

### Step 5 — Enable edit button in `RecipeDetail` + update tests

**File:** `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx`

- Change edit button from `disabled` to navigate to `?status=edit` (adds query param to current page URL)
- Use `router.push` (already has `useRouter` imported)

**Test file:** `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.test.tsx`

## Files Touched

| File | Change |
|---|---|
| `src/_actions/saved/editRecipe.ts` | New — server action |
| `src/_actions/saved/editRecipe.test.ts` | New — unit tests |
| `src/_actions/saved/index.ts` | Add `editRecipe` export |
| `src/app/[planner]/recipes/_components/Modal/RecipeForm.tsx` | Add `redirectTo` prop; call `editRecipe` when editing |
| `src/app/[planner]/recipes/_components/Modal/RecipeForm.test.tsx` | Update tests |
| `src/app/[planner]/recipes/_components/SavedList.tsx` | Wire edit button for recipes |
| `src/app/[planner]/recipes/_components/SavedList.test.tsx` | Update tests |
| `src/app/[planner]/recipes/[recipeId]/page.tsx` | Add `status=edit` param branch |
| `src/app/[planner]/recipes/[recipeId]/page.test.tsx` | Update tests |
| `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx` | Wire edit button |
| `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.test.tsx` | Update tests |

## Verification

**After Step 1:** `pnpm test src/_actions/saved/editRecipe.test.ts` passes with 100% coverage

**After Step 2:** Submitting the recipe form in edit mode calls `editRecipe`; existing add flow still works

**After Step 3:** Clicking edit on a recipe row in the recipes list opens the edit modal pre-populated with recipe data

**After Step 4:** Navigating to `/{planner}/recipes/{recipeId}?status=edit` shows the full-page form pre-populated

**After Step 5:** Clicking Edit on the recipe detail page navigates to `?status=edit`

**Manual test prompts:**
1. Go to the recipes list → click the pencil icon on a recipe → confirm the edit modal opens with the recipe's data pre-filled → change the name → save → confirm the list reflects the new name
2. Click a recipe to open its detail page → click Edit → confirm it navigates to the edit page (no modal) with fields pre-filled → change an ingredient → save → confirm it returns to the detail page with the updated ingredient
3. On the edit page, click Cancel → confirm it navigates back to the detail page without saving changes
4. On the edit modal, click Cancel → confirm the modal closes without saving

`pnpm test:coverage` passes with 100% coverage across all touched files
