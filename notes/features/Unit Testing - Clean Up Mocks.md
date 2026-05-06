This is a cleanup story meant to align unit testing standards. All changes should be to unit test & mock files - no code should be changed.

Before starting any work on this task, you MUST read the project unit testing guidelines at `.opencode/docs/unit_tests.md`. Read carefully; DO NOT skim.

_Note: The purpose of this task is to clean up bad patterns in unit tests. You should not blindly assume ANY code you encounter is a pattern we want to continue - ALL code should be evaluated against both the project guidelines and unit testing best practices._

# **Workflow**
We will go through mocks one by one and update the following:
1. The mock file need to be updated to follow project conventions. If it does not yet exist, it should be created.
2. All files which consume the mock will be updated to consume the new mock API.
3. Follow the Boy Scout rule - any file that is touched should be updated to follow project conventions for unit tests.
4. After EACH file is changed, you must ask the user for approval before moving to the next file.
5. At the end of a session, the user will prompt you to summarize lessons learned during the session and make suggestions if anything needs to be added to the unit testing guidelines file.

# Current Status

## ⏳ `@/_actions` - NOT STARTED
- Many actions are imported as `@/_actions/foo` - we should ensure mocks work for this import pattern
## ⏳ `@/_components` - NOT STARTED
## ✅ `@/_hooks` - COMPLETE
- `test/mocks` file updated to use project standards for mocks
- consuming test files have been updated
## ⏳ `@/_models` - NOT STARTED

## ⏳ `@/_utils` - NOT STARTED
## ✅ `@mantine/core` - COMPLETE
- ✅ The centralized mock has been updated to provide simple useful mocks
- ✅ Consuming test files have been updated to import the centralized mock and align with project standards
## ✅ @mantine/form` - COMPLETE
- The `test/mocks` file was updated to use the correct convention.
- Consuming test files updated:
	- `AddMealForm.test.tsx`
	- `RecipeForm.test.tsx` (removed 6 mock-dependent tests)
	- `BookmarkForm.test.tsx`
- Cleanup work:
	- `transformRecipeForm` utility created with 100% coverage
	- Related actions (`addRecipe.ts`, `editRecipe.ts`) updated to use transformation
## ⏳ `@mantine/hooks` - NOT STARTED

## ⏳ `next/headers` - NOT STARTED
## ✅ `next/navigation` - COMPLETE
- ✅ centralized mock in `test/mocks` has been created
- ✅ consuming test files updated to use centralized mock



