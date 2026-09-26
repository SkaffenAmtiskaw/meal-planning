---
type: cleanup
status: spec
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands
Drift found. Next: /plan-steps. ^status

This is a cleanup story meant to align unit testing standards. All changes should be to unit test & mock files - no code should be changed.

Before starting any work on this task, you MUST read the project unit testing guidelines at `.opencode/docs/unit_tests.md`. Read carefully; DO NOT skim.

_Note: The purpose of this task is to clean up bad patterns in unit tests. You should not blindly assume ANY code you encounter is a pattern we want to continue - ALL code should be evaluated against both the project guidelines and unit testing best practices._

# **Workflow**
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 that this story goes back to `spec` for `/plan-steps` and doesn't keep this per-file Workflow as an exception. Note Conventions now requires implementation steps, which `/implement` builds one step at a time, and the story had none. Step 4's per-file approval comes from `/implement`'s per-step review instead. Step 1's "if it does not yet exist, it should be created" no longer applies, because new mocks moved to their own story. After the split and the Stale Data hand-off, the remaining work is `SignInFlow.test.tsx` and `BookmarkForm.test.tsx` moving onto the existing `@/_actions` mocks, and `BurgerToggle.test.tsx` and `useToggleContext.test.tsx` moving onto the existing `@mantine/hooks` mock, each with the Boy Scout clean-up. Found by reading notes.

We will go through mocks one by one and update the following:
1. The mock file need to be updated to follow project conventions. If it does not yet exist, it should be created.
2. All files which consume the mock will be updated to consume the new mock API.
3. Follow the Boy Scout rule - any file that is touched should be updated to follow project conventions for unit tests.
4. After EACH file is changed, you must ask the user for approval before moving to the next file.
5. At the end of a session, the user will prompt you to summarize lessons learned during the session and make suggestions if anything needs to be added to the unit testing guidelines file.

# Current Status
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to split the new-mocks work into its own story. This story keeps only the stragglers in modules that already have centralized mocks (`@/_actions`, `@/_models`, `@/_hooks`, `@mantine/hooks`). The new story takes `@/_components`, `@/_utils`, the `@app` mock question and any other module with no centralized mock yet, along with their open design questions. The callout below also says new centralized mocks need the user's go-ahead. That is out of date: commit e3d8603 changed `unit_tests.md` to create one once 3 or more test files share the same factory body. Found by reading code, notes and the doc history.

> ⚠️ **Check Drift 2026-09-25:** Open question for the user: this story now covers two sizes of work - finishing ~11 straggler files in modules that already have centralized mocks, and creating new centralized mocks for `@/_components` and `@/_utils` (~37 files). Should the new-mocks part become its own story, so this one can close after the stragglers? Per `unit_tests.md`, new centralized mocks need the user's go-ahead.

*Checked against the code on 2026-09-25 by scanning every `vi.mock` call in `src`. "Centralized" means the test uses `vi.mock('<module>', async () => await import('@mocks/...'))`; "ad-hoc" means it defines its own factory.*

## 🚧 `@/_actions` - MOSTLY DONE
- ✅ updated subdirectories for consistent import patterns
> ⚠️ **Check Drift 2026-09-25:** The Stale Data child stories (added 2026-09-25) change the real `@/_actions` modules these mocks stand in for, and none of them lists `test/mocks/` in its files. Server-Only Creation and Pure Reads moves `addUser` and `addPlanner` out of the barrels. Unchecked Planner Reads moves `getPlanner`, `getPlannerClient` and `getSavedItem`. Unchecked Invite Lookup moves `getUserInvites`. Calendar and Recipes Data Refresh stops `addMeal` returning `calendar` (the mock's default still has `data: { calendar: [] }`) and changes `addTag` to take an object. Settings Data Refresh changes `cancelInvite` to return `{ ok }` (the mock returns `{ success: true }`). This line stays true only if each of those stories updates the mocks. Found by reading notes, with the mock exports checked in code.
- ✅ centralized mocks in `test/mocks/@/_actions/` (auth, calendar, library, planner, sharing, user)
- ✅ 43 test files use the centralized mocks
> ⚠️ **Check Drift 2026-09-25:** This list is incomplete. `src/app/[planner]/recipes/_components/Modal/BookmarkForm.test.tsx:17` also mocks `@/_actions/library` ad-hoc (`addBookmark`, `editBookmark`), even though the `@mantine/form` section lists that file as updated. `src/app/[planner]/layout.test.tsx:21` also mocks `@/_actions/auth` ad-hoc, not just `@/_actions/user`. The centralized mocks have 57 consumers, not 43. Found by reading code, not verified in the running app.
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to hand the stragglers in files that the Stale Data child stories rewrite or move over to those stories. Each one moves its own tests onto the centralized mocks as part of its "matching tests", and updates `test/mocks/` for the exports it changes. From this list that means every file except `SignInFlow.test.tsx`, which Settings Data Refresh lists as exempt, plus `BookmarkForm.test.tsx` from the callout above, which none of them touches. Found by reading notes.
- ❌ 6 files still use ad-hoc factories:
	- `src/_actions/sharing/getPendingInvites.test.ts` (`@/_actions/auth`) 🚛 Moved to [[Data Rules Enforcement]]
	- `src/_actions/auth/checkAuth.test.ts` (`@/_actions/user`) 🚛 Moved to [[Data Rules Enforcement]]
	- `src/_actions/library/editBookmark.test.ts` (`@/_actions/auth`) 🚛 Moved to [[Calendar and Recipes Data Refresh]]
	- `src/app/_components/SignInFlow.test.tsx` (`@/_actions/auth`)
	- `src/app/[planner]/layout.test.tsx` (`@/_actions/user`) 🚛 Moved to [[Calendar and Recipes Data Refresh]]
	- `src/app/[planner]/recipes/[recipeId]/_components/InlineTagsEditor.test.tsx` (`@/_actions/library`) 🚛 Moved to [[Calendar and Recipes Data Refresh]]

## ⏳ `@/_components` - NOT STARTED
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to split the new-mocks work into its own story (see the callout under Current Status), so this section moves out of this story. Found by reading code and notes.
🚛 Moved to [[Unit Testing - New Centralized Mocks]] on 2026-09-25.

## ✅ `@/_hooks` - COMPLETE
> ⚠️ **Check Drift 2026-09-25:** Two consumers of `@/_hooks/useEditMode` are not complete. Their source files import the subpath, not the barrel. `InlineNotesEditor.test.tsx:23` mocks the subpath with a custom factory that pulls `useEditMode` out of `@mocks/@/_hooks`, which is not the async import form. `InlineTagsEditor.test.tsx` doesn't mock `@/_hooks/useEditMode` at all, so the real hook runs. That file is already an `@/_actions` straggler. Found by reading code, not verified in the running app.
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to hand both `useEditMode` consumers over to Calendar and Recipes Data Refresh, which rewrites `InlineTagsEditor` and touches `InlineNotesEditor`. Found by reading notes.
- `test/mocks` file updated to use project standards for mocks
- consuming test files have been updated

## 🚧 `@/_models` - MOSTLY DONE
*Previously marked complete; the 2026-09-25 scan found remaining ad-hoc factories.*
- ✅ updated subdirectories for consistent import patterns
- ✅ centralized mocks in `test/mocks/@/_models/`
- ✅ 12 test files use the centralized mocks
> ⚠️ **Check Drift 2026-09-25:** This list has about 17 files, not 4. Three of the listed files mock more than it says: `addRecipe.test.ts:12` also mocks `@/_models/library`, `getUserInvites.test.ts:16` also mocks `@/_models/sharing`, and `signUpWithInvite.test.ts:12` also mocks `@/_auth`. These files are not listed: `src/_actions/library/addBookmark.test.ts:11`, `deleteBookmark.test.ts:12` and `editBookmark.test.ts:17` (planner); `src/_actions/planner/updatePlannerName.test.ts:12` (planner); `src/_actions/sharing/acceptInvite.test.ts:19,25` (user, sharing), `declineInvite.test.ts:10` (sharing), `getPendingInvites.test.ts:8` (sharing), `getPlannerMembers.test.ts:5` (user) and `removeMember.test.ts:12` (user); `src/_actions/user/getUser.test.ts:18`, `updateUserName.test.ts:18` and `verifyEmailChangeAndSetPassword.test.ts:31` (user); `src/app/page.test.tsx:36` (user). `test/mocks/@/_models/sharing.ts` gives `PendingInvite` only `findOne`, `create` and `deleteOne`, but `getPendingInvites` and `getUserInvites` use `PendingInvite.find`, so the mock needs extending. The centralized mocks have 19 consumers, not 12. Found by reading code, not verified in the running app.
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to hand these stragglers over to the Stale Data child stories that rewrite or move them (Calendar and Recipes Data Refresh, Settings Data Refresh, Server-Only Creation and Pure Reads, Data Rules Enforcement, Unchecked Planner Reads and Unchecked Invite Lookup). None of the `@/_models` stragglers in this list or the callout above stays in this story. Found by reading notes.
- ❌ these files still use ad-hoc factories:
	- `src/_actions/library/addRecipe.test.ts` (`@/_models/planner`) 🚛 Moved to [[Calendar and Recipes Data Refresh]]
	- `src/_actions/planner/getPlanner.test.ts` (`@/_models/planner`) 🚛 Moved to [[Unchecked Planner Reads]]
	- `src/_actions/sharing/getUserInvites.test.ts` (`@/_models/user`, `@/_models/planner`) 🚛 Moved to [[Unchecked Invite Lookup]]
	- `src/_actions/sharing/signUpWithInvite.test.ts` (`@/_models/sharing`) 🚛 Moved to [[Server-Only Creation and Pure Reads]]

## ⏳ `@/_utils` - NOT STARTED
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to split the new-mocks work into its own story (see the callout under Current Status), so this section moves out of this story. Found by reading code and notes.
🚛 Moved to [[Unit Testing - New Centralized Mocks]] on 2026-09-25.

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
> ⚠️ **Check Drift 2026-09-25:** There is a second straggler. `src/app/[planner]/_components/BurgerToggle.test.tsx:11` has the same ad-hoc `useDisclosure: () => mockUseDisclosure()` factory. Found by reading code, not verified in the running app.
- ❌ `src/app/[planner]/_components/ToggleContext/useToggleContext.test.tsx` still uses an ad-hoc factory

## ✅ `next/headers` - COMPLETE
*Previously marked partial; all 5 consuming test files now use the centralized mock.*

## ✅ `next/navigation` - COMPLETE
- ✅ centralized mock in `test/mocks` has been created
- ✅ consuming test files updated to use centralized mock

## Not tracked above
> ⚠️ **Check Drift 2026-09-25:** Sarah decided on 2026-09-25 to split the new-mocks work into its own story (see the callout under Current Status), so this section moves out of this story. Found by reading code and notes.
🚛 Moved to [[Unit Testing - New Centralized Mocks]] on 2026-09-25.
