---
type: cleanup
status: in-progress
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands
In progress. Next: implement Step 2. ^status

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

# Implementation
## Decisions made while planning (2026-09-26)
- **Checks.** This story changes only test files, so nothing in the running app changes. Each step's checks are break-it checks instead of click-throughs: temporarily break the matching line in the source file (or the shared mock), run the test file, see the named test fail, then revert. This proves every kept or rewritten test catches real behavior. Approved by Sarah 2026-09-26.
- **Toggle tests.** `BurgerToggle.test.tsx` and `useToggleContext.test.tsx` stop reaching through the real `ToggleProvider` to `useDisclosure`. Each isolates its direct dependency instead, so neither mocks `@mantine/hooks` anymore. This replaces the note's "move onto the existing `@mantine/hooks` mock". Approved by Sarah 2026-09-26.

## Remaining work (the approach, from the 2026-09-25 Check Drift callout under Workflow)
1. `SignInFlow.test.tsx` moves onto the centralized `@/_actions/auth` mock, with the Boy Scout clean-up.
2. `BookmarkForm.test.tsx` moves onto the centralized `@/_actions/library` mock, with the Boy Scout clean-up.
3. `useToggleContext.test.tsx` drops its ad-hoc `@mantine/hooks` factory (per the toggle decision above), with the Boy Scout clean-up.
4. `BurgerToggle.test.tsx` drops its ad-hoc `@mantine/hooks` factory (per the toggle decision above), with the Boy Scout clean-up.

Every step changes test files only. No source file or `test/mocks/` file changes. The existing centralized mocks already export everything these tests need.

Break-it checks run one test file with `pnpm vitest run <test file>`. Every temporary edit is reverted before the next check.

Workflow item 5 stays as a session habit, not a step: after each `/implement` session on this story, Sarah asks for lessons learned and suggested changes to `unit_tests.md`. Decided by Sarah 2026-09-26.

---

## Step 1: SignInFlow tests on the shared auth mock
**Idea:** Bring `SignInFlow.test.tsx` up to the unit test conventions.

**Source:** Current Status → `@/_actions` → `src/app/_components/SignInFlow.test.tsx` (`@/_actions/auth`); Workflow item 3 (Boy Scout rule)

**Approach:** Remaining work 1.
- Replace the ad-hoc `@/_actions/auth` factory with `vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'))`. The shared `checkEmailStatus` defaults to resolving `'new'`. The per-describe `mockResolvedValueOnce` overrides stay as they are.
- Boy Scout: the "email from query params" test sets `useSearchParams` with `mockReturnValue`, so the override leaks into any test that runs after it. Scope it to that test only.
- Boy Scout: rename "calls resetToIdle when change email button is clicked" to describe the behavior, not the handler name: "returns to idle from social-only when change email button is clicked".
- The ad-hoc `./AuthLayout`, `@/_utils/auth` and `@/_utils/zSafeString` factories and the unmocked `GoogleLogoSVG` stay as they are (see the out-of-scope list).

**Files:**
- `src/app/_components/SignInFlow.test.tsx` - use the shared `@/_actions/auth` mock, scope the query-param override, rename one test

**Acceptance:**
- [ ] In `test/mocks/@/_actions/auth.ts:24`, rename the export `checkEmailStatus` to `checkEmailStatusX`. Run `pnpm vitest run src/app/_components/SignInFlow.test.tsx` and see the has-password, new-step and social-only tests fail, which shows the file really uses the shared mock. Revert. [Sarah] - This blows up imports all over the place. I'm not sure that blowing up imports is a meaningful way to test the mock is being used.
- [x] In `src/app/_components/SignInFlow.tsx:93`, change `checkEmailStatus(email)` to `checkEmailStatus('')`. Run the file and see "calls checkEmailStatus on continue" fail. Revert.
- [x] In `SignInFlow.tsx:164`, change `{continueBtn.error && (` to `{false && (`. Run the file and see "displays error when checkEmailStatus fails" fail. Revert.
- [x] In `SignInFlow.tsx:80`, change `checkEmailStatus(emailFromQuery)` to `checkEmailStatus('')`. Run the file and see "reads email from query params and triggers check" fail. Revert.
- [x] In `SignInFlow.tsx:94`, change `setStep({ type: status, email })` to `setStep({ type: 'has-password', email })`. Run the file and see "displays name and password inputs and hides email/SSO after checkEmailStatus returns new" and "displays social-only warning and hides email/SSO after checkEmailStatus returns social-only" fail. Revert. [Sarah] - This failed a lot more than just those two.
- [x] In `SignInFlow.tsx:320`, change `onClick={resetToIdle}` to `onClick={() => {}}`. Run the file and see "returns to idle from social-only when change email button is clicked" fail. Revert.
- [x] Leak check: in `SignInFlow.test.tsx`, temporarily move the "email from query params" `describe` block to the top of the outer `describe`. Run the file and see every test pass. Then, with the block still at the top, change that test's `useSearchParams` override back to an unscoped `mockReturnValue`, and remove anything that resets it. Run the file and see "displays error when checkEmailStatus fails" fail, because the leaked query email uses up its rejected value. Undo both edits. [Sarah] - Do this and report the result? Since these changes aren't committed I don't have an easy way to make sure I revert everything correctly.

**Status:** ✅ Complete

**As built:**
- Added "renders nothing when checkEmailStatus returns an unknown status" to keep `SignInFlow.tsx` at 100% coverage. The old ad-hoc mock returned `undefined`, which covered `default: return null` by accident; the shared mock returns `'new'`, so nothing reached it. Approved by Sarah 2026-09-26.
- The first check (renaming the shared `checkEmailStatus` export) was dropped, so its box stays unchecked. It only broke imports, and no test relies on the mock's default value. The `vi.mock` line in the diff shows the file uses the shared mock. Decided by Sarah 2026-09-26.
- Forcing `has-password` at `SignInFlow.tsx:94` fails 11 tests, not the two the check names. Every test that needs a different step after Continue fails, which is expected.
- The agent ran the leak check and reported the result, because it edits `SignInFlow.test.tsx`, which wasn't committed yet. With the block moved to the top, all 27 tests pass. With the override also left unscoped, 16 fail, including "displays error when checkEmailStatus fails". This was a one-off for this check, not a rule for planning steps. Decided by Sarah 2026-09-26.

---

## Step 2: BookmarkForm tests on the shared library mock
**Idea:** Bring `BookmarkForm.test.tsx` up to the unit test conventions.

**Source:** Current Status → `@/_actions` → Check Drift 2026-09-25 (`BookmarkForm.test.tsx:17` mocks `@/_actions/library` ad-hoc); Workflow item 3 (Boy Scout rule)

**Approach:** Remaining work 2.
- Replace the ad-hoc `@/_actions/library` factory with `vi.mock('@/_actions/library', async () => await import('@mocks/@/_actions/library'))`. The shared `addBookmark` and `editBookmark` default to `{ ok: true, data }`.
- Boy Scout ("Only Mock Return Values When Testing Outcomes"): remove the `mockResolvedValue` overrides from the four tests that only check a call or rely on success. The shared default covers them.
- Boy Scout ("Synchronous Handler Tests"): "calls addBookmark with plannerId on submit" has no `await`, so drop its `async`.
- Boy Scout (no prop-pass tests): remove "passes error status to FormFeedbackAlert". It only asserts that `status` and `errorMessage` are passed through to a child. Also remove what only that test used: the local `FeedbackStatus` type and the `FormFeedbackAlert` and `useFormFeedback` imports. The `@/_components` factory keeps exporting `FormFeedbackAlert`, because the source renders it.
- `_id: 'bm-1' as never` in the edit test stays. `as never` casts are used widely across test files (47 of them) and no convention rules them out.
- The ad-hoc `@/_components` factory stays as it is (see the out-of-scope list).

**Files:**
- `src/app/[planner]/recipes/_components/Modal/BookmarkForm.test.tsx` - use the shared `@/_actions/library` mock, drop redundant overrides and the prop-pass test

**Acceptance:**
- [ ] In `test/mocks/@/_actions/library.ts:14`, change `addBookmark`'s `ok: true as const` to `ok: false as const`. Run `pnpm vitest run "src/app/[planner]/recipes/_components/Modal/BookmarkForm.test.tsx"` and see "navigates to pathname after successful add" fail, which shows the test relies on the shared mock's success default. Revert.
- [ ] In `src/app/[planner]/recipes/_components/Modal/BookmarkForm.tsx:52`, change `plannerId }` to `plannerId: '' }`. Run the file and see "calls addBookmark with plannerId on submit" fail. Revert.
- [ ] In `BookmarkForm.tsx:52`, change `tags: selectedTags` to `tags: []`. Run the file and see "submits with selected tags included" fail. Revert.
- [ ] In `BookmarkForm.tsx:54`, change `if (item)` to `if (false)`. Run the file and see "calls editBookmark with _id in edit mode" fail. Revert.
- [ ] In `BookmarkForm.tsx:60`, change `() => router.push(pathname)` to `() => {}`. Run the file and see "navigates to pathname after successful add" fail. Revert.
- [ ] In `BookmarkForm.tsx:93`, change `onClick={() => router.push(pathname)}` to `onClick={() => {}}`. Run the file and see "navigates to pathname on cancel" fail. Revert.

---

## Step 3: useToggleContext tests without ToggleProvider
**Idea:** Test `useToggleContext` against a plain `ToggleContext.Provider` instead of the real `ToggleProvider`.

**Source:** Current Status → `@mantine/hooks` → `src/app/[planner]/_components/ToggleContext/useToggleContext.test.tsx` still uses an ad-hoc factory; Workflow item 3 (Boy Scout rule)

**Approach:** Remaining work 3, per the toggle decision.
- Remove the ad-hoc `@mantine/hooks` factory and `mockUseDisclosure`. The hook never calls `useDisclosure`; only `ToggleProvider` does, and `ToggleProvider.test.tsx` already covers that wiring ("provides opened state and toggle function via context").
- "throws error when used outside ToggleProvider": remove its unused `mockUseDisclosure` setup.
- Rewrite "returns toggle function that can be called" as "returns the context value inside a provider": wrap in `ToggleContext.Provider` with a test value `{ opened, toggle }`, and check the hook returns that value.

**Files:**
- `src/app/[planner]/_components/ToggleContext/useToggleContext.test.tsx` - drop the `@mantine/hooks` mock, provide the context directly

**Acceptance:**
- [ ] In `src/app/[planner]/_components/ToggleContext/ToggleProvider.tsx:14`, add `throw new Error('x');` as the first line of the component. Run `pnpm vitest run "src/app/[planner]/_components/ToggleContext/useToggleContext.test.tsx"` and see every test still pass, which shows the tests no longer go through `ToggleProvider`. (Before this step, "returns toggle function that can be called" would fail.) Revert.
- [ ] In `src/app/[planner]/_components/ToggleContext/useToggleContext.ts:9-10`, delete the `if (!ctx) throw …` lines. Run the file and see "throws error when used outside ToggleProvider" fail. Revert.
- [ ] In `useToggleContext.ts:11`, change `return ctx;` to `return { ...ctx, toggle: () => {} };`. Run the file and see "returns the context value inside a provider" fail. Revert.

---

## Step 4: BurgerToggle tests without ToggleProvider
**Idea:** Test `BurgerToggle` against a mocked `useToggleContext` instead of the real `ToggleProvider`.

**Source:** Current Status → `@mantine/hooks` → Check Drift 2026-09-25 (`BurgerToggle.test.tsx:11` has the same ad-hoc `useDisclosure` factory); Workflow item 3 (Boy Scout rule)

**Approach:** Remaining work 4, per the toggle decision.
- Remove the ad-hoc `@mantine/hooks` factory and `mockUseDisclosure`. Mock `./ToggleContext` instead, which is `BurgerToggle`'s only dependency besides `@mantine/core`. Use a small inline factory. This is a deliberate, temporary exception to "Use Async Import Pattern for All Mocks": only one other file (`PlannerLayout.test.tsx:18`) mocks `./ToggleContext`, with a different factory body, so it doesn't meet the 3-file bar for a centralized mock, and where app-level mocks live is still an open decision in [[Unit Testing - New Centralized Mocks]] (see the out-of-scope list).
- Keep "should call toggle function when Burger is clicked", with its toggle coming from the mocked `useToggleContext`. Boy Scout: find the button with `screen.getByRole('button')` and click it with `fireEvent.click`, instead of `document.querySelector('button')?.click()`, which skips the click silently if the button is missing.
- Boy Scout (no presentational tests): remove "should render Burger with color prop". It only checks that a button renders.
- Remove "should throw error when used outside ToggleProvider". It tests `useToggleContext`'s own error, which Step 3's test covers.

**Files:**
- `src/app/[planner]/_components/BurgerToggle.test.tsx` - mock `./ToggleContext` instead of `@mantine/hooks`, drop the presentational test and the duplicate throw test

**Acceptance:**
- [ ] In `src/app/[planner]/_components/ToggleContext/useToggleContext.ts`, add `throw new Error('x');` as the first line of `useToggleContext`. Run `pnpm vitest run "src/app/[planner]/_components/BurgerToggle.test.tsx"` and see its one test still pass, which shows it no longer runs through the real hook. Revert.
- [ ] In `src/app/[planner]/_components/BurgerToggle.tsx:13`, change `onClick={toggle}` to `onClick={() => {}}`. Run the file and see "should call toggle function when Burger is clicked" fail. Revert.
- [ ] Run `grep -rn "vi.mock('@mantine/hooks', ()" src`. It finds nothing: every `@mantine/hooks` mock left uses the shared async import.
