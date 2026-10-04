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
Read-only users see edit controls on the recipe detail page. Found by reading code while planning [[Calendar and Recipes Data Refresh]] on 2026-09-27; not reproduced in the running app.

- `src/app/[planner]/recipes/[recipeId]/_components/RecipeDetail.tsx:42-70` shows the Edit and Delete buttons to everyone.
- The pencil buttons in `InlineNotesEditor.tsx` and `InlineTagsEditor.tsx` (same folder) show to everyone too.
- None of these check `useCanWrite`. The list page's `EditRecipeButton` and `DeleteItemButton` do.
- `src/app/[planner]/recipes/[recipeId]/page.tsx:51` renders the `?status=edit` form without checking write access.
- The server rejects the save, so no data changes, but the controls still show.

Blocked on [[Calendar and Recipes Data Refresh]] because its Step 5 edits both inline editors.

# Questions
- What should a read-only user get when they open `?status=edit` on a recipe detail page?
