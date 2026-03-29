## Status

- [x] Step 1: `deleteRecipe` server action ✅
- [x] Step 2: Enable delete in `SavedList` (direct) ✅
- [x] Step 3: Delete button on recipe detail page (direct) ✅
- [ ] Step 4: `DeleteConfirmModal` wired into both surfaces

## Planned Work

### Step 1 — `deleteRecipe` server action

- New file `src/_actions/saved/deleteRecipe.ts`
- Input: `{ plannerId, recipeId }` (Zod-validated)
- Auth check via `checkAuth(plannerId)`
- Locate item via `planner.saved.id(recipeId)`, call `.deleteOne()`, then `planner.save()`
- Export from `src/_actions/saved/index.ts`

### Step 2 — Enable delete in `SavedList` (direct, no confirmation)

- Convert `SavedList` to a client component (`'use client'`)
- Trash icon onClick calls `deleteRecipe` directly, then `router.refresh()`
- Delete button remains disabled for bookmarks (out of scope)

### Step 3 — Delete button on recipe detail page (direct, no confirmation)

- Add red Delete button next to the existing Edit button in `RecipeDetail`
- onClick calls `deleteRecipe` directly, then redirects to `/${plannerId}/recipes`

### Step 4 — `DeleteConfirmModal` wired into both surfaces

- New file `src/app/[planner]/recipes/_components/DeleteConfirmModal.tsx`
- Client component; props: `opened`, `onClose`, `onConfirm`, `loading`
- Mantine `Modal` with Cancel + Delete (red) buttons
- Replace direct onClick in `SavedList` and `RecipeDetail` with modal open/confirm pattern

## Manual Testing

### After Step 2

1. Go to the recipes list page (`/[planner]/recipes`)
2. Click the trash icon on a recipe — confirm the recipe is removed from the list immediately
3. Click the trash icon on a bookmark — confirm the button is disabled and nothing happens

### After Step 3

4. Navigate to a recipe's detail page (`/[planner]/recipes/[recipeId]`)
5. Click **Delete** — confirm you are redirected to `/[planner]/recipes` and the recipe no longer appears in the list

### After Step 4

6. Go to the recipes list page (`/[planner]/recipes`)
7. Click the trash icon on a recipe — confirm the `DeleteConfirmModal` appears
8. Click **Cancel** — confirm the modal closes and the recipe is still in the list
9. Click the trash icon again — click **Delete** — confirm the modal closes and the recipe is removed from the list
10. Navigate to a recipe's detail page (`/[planner]/recipes/[recipeId]`)
11. Click **Delete** — confirm the `DeleteConfirmModal` appears
12. Click **Cancel** — confirm the modal closes and you remain on the detail page
13. Click **Delete** again — click **Delete** in the modal — confirm you are redirected to `/[planner]/recipes` and the recipe no longer appears in the list

## Original Notes

- delete recipe is a discrete unit of work listed in Planned Changes
- a confirmation dialog should be shown before deleting
- bookmark deletion is a separate task
