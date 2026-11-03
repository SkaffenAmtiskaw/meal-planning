---
type: bug
status: idea
blocked-by: []
confirmed: 2026-11-02
---
# Where It Stands
Next: /investigate ^status

A standalone bug: the detail page's Delete passes on `deleteRecipe`'s result, so a failed delete shows in the modal and the page stays where it is.

# Inbox

# Symptoms
Deleting a recipe from the recipe detail page always reports success. In `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx:50-56`, `onConfirm` awaits `deleteRecipe` but always returns `{ ok: true }`, so a failed or unauthorized delete still navigates to the Recipes list as if it worked. Found by reading code while planning [[Calendar and Recipes Data Refresh]] on 2026-09-27; not reproduced in the running app.

This covers only a failed delete from the detail page. What happens after a successful delete belongs to [[Calendar and Recipes Data Refresh]] Step 4, and hiding the button from read-only users belongs to [[Recipe Detail Read-Only Controls]].

# Who Can Hit This
Anyone whose delete fails. The easiest way is a read-only member, who sees the Delete button today and gets refused by the server. Found by reading code, not by running it.

# Root Cause

# Fix

# Acceptance Criteria

# Implementation
