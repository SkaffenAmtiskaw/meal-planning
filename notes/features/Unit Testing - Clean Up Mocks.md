This is a cleanup story meant to align unit testing standards. All changes should be to unit test & mock files - no code should be changed.

Before starting any work on this task, you MUST read the project unit testing guidelines at `.opencode/docs/unit_tests.md`. Read carefully; DO NOT skim.

# **Workflow**
We will go through mocks one by one and update the following:
1. The mock file need to be updated to follow project conventions. If it does not yet exist, it should be created.
2. All files which consume the mock will be updated to consume the new mock API.
3. Follow the Boy Scout rule - any file that is touched should be updated to follow project conventions for unit tests.
4. After EACH file is changed, you must ask the user for approval before moving to the next file.
5. At the end of a session, the user will prompt you to summarize lessons learned during the session and make suggestions if anything needs to be added to the unit testing guidelines file.

# Current Status

## ✅ @mantine/form` - COMPLETE
- The `test/mocks` file was updated to use the correct convention.
- Consuming test files updated:
	- `AddMealForm.test.tsx`
	- `RecipeForm.test.tsx` (removed 6 mock-dependent tests)
	- `BookmarkForm.test.tsx`
- Cleanup work:
	- `transformRecipeForm` utility created with 100% coverage
	- Related actions (`addRecipe.ts`, `editRecipe.ts`) updated to use transformation

## 🚧 `@mantine/core` - PARTIAL
- ✅ The `test/mocks` file exports the correct modules (Card, Button, Modal, etc.) - some mocks may need to be updated
- Some test files are still incorrectly creating their own mocks for `@mantine/core`

## ✅ `@/_hooks` - COMPLETE
- `test/mocks` file updated to use project standards for mocks
- consuming test files have been updated

## ⏳ `@/_actions` - NOT STARTED
- Many actions are imported as `@/_actions/foo` - we should ensure mocks work for this

## ⏳ `@/_components` - NOT STARTED

## ⏳ `@/_utils` - NOT STARTED

## ⏳ `@mantine/hooks` - NOT STARTED

## ⏳ `next/navigation` - NOT STARTED
