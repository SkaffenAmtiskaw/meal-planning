---
status: in-progress
reviewed: 2026-09-25
---
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
*Checked against the code on 2026-09-25 by scanning every `vi.mock` call in `src`. "Centralized" means the test uses `vi.mock('<module>', async () => await import('@mocks/...'))`; "ad-hoc" means it defines its own factory.*

## 🚧 `@/_actions` - MOSTLY DONE
- ✅ updated subdirectories for consistent import patterns
- ✅ centralized mocks in `test/mocks/@/_actions/` (auth, calendar, library, planner, sharing, user)
- ✅ 43 test files use the centralized mocks
- ❌ 6 files still use ad-hoc factories:
	- `src/_actions/sharing/getPendingInvites.test.ts` (`@/_actions/auth`)
	- `src/_actions/auth/checkAuth.test.ts` (`@/_actions/user`)
	- `src/_actions/library/editBookmark.test.ts` (`@/_actions/auth`)
	- `src/app/_components/SignInFlow.test.tsx` (`@/_actions/auth`)
	- `src/app/[planner]/layout.test.tsx` (`@/_actions/user`)
	- `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.test.tsx` (`@/_actions/library`)

## ⏳ `@/_components` - NOT STARTED
- No centralized mock exists. 12 test files use ad-hoc factories.

## ✅ `@/_hooks` - COMPLETE
- `test/mocks` file updated to use project standards for mocks
- consuming test files have been updated

## 🚧 `@/_models` - MOSTLY DONE
*Previously marked complete; the 2026-09-25 scan found remaining ad-hoc factories.*
- ✅ updated subdirectories for consistent import patterns
- ✅ centralized mocks in `test/mocks/@/_models/`
- ✅ 12 test files use the centralized mocks
- ❌ these files still use ad-hoc factories:
	- `src/_actions/library/addRecipe.test.ts` (`@/_models/planner`)
	- `src/_actions/planner/getPlanner.test.ts` (`@/_models/planner`)
	- `src/_actions/sharing/getUserInvites.test.ts` (`@/_models/user`, `@/_models/planner`)
	- `src/_actions/sharing/signUpWithInvite.test.ts` (`@/_models/sharing`)

## ⏳ `@/_utils` - NOT STARTED
- No centralized mock exists. 25 mock calls across test files use ad-hoc factories (`catchify`, `serialize`, `zObjectId`, `auth`, `matchesId`, ...).

## ✅ `@mantine/core` - COMPLETE
- ✅ The centralized mock has been updated to provide simple useful mocks
- ✅ 95 test files use the centralized mock
- The only other mock is `src/app/layout.test.tsx` stubbing `@mantine/core/styles.css`, which is a CSS import and not a straggler

## ✅ `@mantine/form` - COMPLETE
- The `test/mocks` file was updated to use the correct convention.
- Consuming test files updated:
	- `AddMealForm.test.tsx`
	- `RecipeForm.test.tsx` (removed 6 mock-dependent tests)
	- `BookmarkForm.test.tsx`
- Cleanup work:
	- `transformRecipeForm` utility created with 100% coverage
	- Related actions (`addRecipe.ts`, `editRecipe.ts`) updated to use transformation

## ✅ `@mantine/hooks` - COMPLETE (1 straggler)
- ❌ `src/app/[planner]/_components/ToggleContext/useToggleContext.test.tsx` still uses an ad-hoc factory

## ✅ `next/headers` - COMPLETE
*Previously marked partial; all 5 consuming test files now use the centralized mock.*

## ✅ `next/navigation` - COMPLETE
- ✅ centralized mock in `test/mocks` has been created
- ✅ consuming test files updated to use centralized mock

## Not tracked above
- `test/mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems.ts` - an app-level centralized mock (added 2026-09-24), used by `DishRow`, `DishRowExpanded` and `DishSourceFields` tests. It is the first mock under `@app`; decide whether app-level mocks are part of this story's conventions.
