## Status

- [x] Step 1: Basic recipe detail page ✅
- [x] Bug fix: RecipeForm source/time fields crash on input ✅
- [x] Step 2: Responsive layout ✅
- [x] Step 3: Keep-awake on mobile ✅ (manual test confirmed)
- [x] Step 4: Inline notes editing ✅
- [x] Step 5: Inline tags editing ✅

## Planned Work

### Step 1 — Basic Recipe Detail Page ✅
- Route `/[planner]/recipes/[recipeId]` resolves and displays all static recipe fields
- Fields shown: name, source (link or text), time (prep/cook/total/actual), servings, ingredients, instructions, notes, storage, tags (colored pills)
- Disabled Edit button (placeholder)
- Pre-requisite fixes:
  - `getSavedItem.ts`: string comparison for `_id` lookup
  - `bookmarkSchema`: removed explicit `_id`, added `strict: false` so recipe fields are not stripped on write (Mongoose Union always casts using the first sub-schema)
  - `recipeSchema`: removed explicit `_id` with default function (caused non-deterministic ObjectId on every access)
  - `addRecipe.ts`: uses `insertIndex` pattern to read stable `_id` after save
  - `SavedList.tsx`: uses `next/link` for recipe navigation; `isBookmark` guard uses `!!url` not `'url' in item`
  - `page.tsx`: `JSON.parse(JSON.stringify(item))` converts Mongoose subdocument to plain object before passing to client component

### Bug Fix — RecipeForm initialValues missing nested objects
- `useForm` in `RecipeForm.tsx` has no `initialValues`, so `source` and `time` are `undefined` in form state
- Mantine's `setPath` crashes with `Cannot set properties of undefined (setting 'name')` when the user types in `source.name` or any `time.*` field
- Fix: add `initialValues` to `useForm` that includes `source: { name: '', url: '' }` and `time: { prep: '', cook: '', total: '', actual: '' }`, populated from `item` when editing

### Step 2 — Responsive Layout
- Time fields: `SimpleGrid cols={{ base: 2, sm: 4 }}`
- Source fields: `SimpleGrid cols={{ base: 1, sm: 2 }}`
- Main content: `Stack` with consistent spacing, `Container size="md"` to cap desktop width

### Step 3 — Keep-Awake
- `KeepAwakeToggle` client component using `navigator.wakeLock.request('screen')`
- Only renders when `'wakeLock' in navigator`
- Mantine `Switch` labeled "Keep screen awake"
- Visible on desktop too (wherever the browser supports the Wake Lock API) — intentional

### Step 4 — Inline Notes Editing
- `updateRecipeNotes` server action
- `InlineNotesEditor` client component: read-only text + pencil icon → textarea with Save/Cancel
- Save calls `updateRecipeNotes` then `router.refresh()`

### Step 5 — Inline Tags Editing
- `updateRecipeTags` server action
- `InlineTagsEditor` client component: tag pills + edit icon → `TagCombobox`
- Changes call `updateRecipeTags` then `router.refresh()`

## Original Notes

- create a page for a specific recipe
- ensure recipe reflows in mobile and desktop
- add a keep awake option on mobile
- allow user to add/edit notes and add/edit tags directly from the page
- add a button for editing the recipe (disabled until edit functionality added)
- recipe list already renders links to this page — links will be broken until this page is created; completing this page is a prerequisite for the recipe list link task to be considered done
