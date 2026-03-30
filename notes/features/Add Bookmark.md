_Note: Unlike recipes, there is no page for bookmarks._

- use existing modal stub
- ensure form uses existing form feedback functionality
- bookmark should appear in list with edit and detail buttons disabled (they will be enabled in future features)
- clicking on bookmark in list should open URL in new tab

## Status: Complete

## Plan

### Step 1 — Add `zBookmarkFormSchema` to `bookmark.types.ts`
- Extend existing Zod schema with `plannerId` (like `zRecipeFormSchema`)
- Add `name.min(1)` validation
- Files: `src/_models/planner/bookmark.types.ts`

### Step 2 — Create `addBookmark` server action
- `src/_actions/saved/addBookmark.ts` — mirrors `addRecipe.ts`
- Export from `src/_actions/saved/index.ts`
- Files: `src/_actions/saved/addBookmark.ts`, `src/_actions/saved/addBookmark.test.ts`, `src/_actions/saved/index.ts`

### Step 3+4 — Build out `BookmarkForm` component with tests
- Replace stub in `BookmarkForm.tsx` with real form: name (required), url (required), tags (optional)
- Uses `useFormFeedback`, `FormFeedbackAlert`, `SubmitButton`, `TagCombobox`
- Calls `addBookmark` on submit, redirects on success
- Write tests alongside implementation
- Files: `src/app/[planner]/recipes/_components/Modal/BookmarkForm.tsx`, `src/app/[planner]/recipes/_components/Modal/BookmarkForm.test.tsx`

**Verification:** open `?status=add&type=bookmark`, fill in name + URL, submit — bookmark appears in list as a clickable link that opens in a new tab