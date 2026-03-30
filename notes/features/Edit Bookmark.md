- clicking on edit button in recipes list opens edit modal
- form uses existing form feedback

## Notes

`BookmarkForm` already accepts `item?: BookmarkInterface`, populates initial values, and renders "Save" when editing. `Modal.tsx` already has the full `CONTENT_TYPES.edit.bookmark` branch wired up.

The remaining work is:
- Create `editBookmark` server action (mirrors `editRecipe`)
- Add a branch in `BookmarkForm.handleSubmit` to call `editBookmark` when `item` is present (same pattern as `RecipeForm`)