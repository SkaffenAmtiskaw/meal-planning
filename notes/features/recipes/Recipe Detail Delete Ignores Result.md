---
type: 
status: idea
blocked-by:
  - "[[Calendar and Recipes Data Refresh]]"
confirmed: 2026-09-27
---
# Where It Stands

Blocked until [[Calendar and Recipes Data Refresh]] lands; then /shape. ^status

# Notes
Deleting a recipe from the recipe detail page always reports success. In `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx:50-56`, `onConfirm` awaits `deleteRecipe` but always returns `{ ok: true }`, so a failed or unauthorized delete still navigates to the Recipes list as if it worked. Found by reading code while planning [[Calendar and Recipes Data Refresh]] on 2026-09-27; not reproduced in the running app.

Blocked on [[Calendar and Recipes Data Refresh]] because its Step 4 turns `deleteRecipe` into a `defineMutation` and changes how the detail page refreshes after a delete. Once that lands, `onConfirm` can return the action's result.

# Questions

