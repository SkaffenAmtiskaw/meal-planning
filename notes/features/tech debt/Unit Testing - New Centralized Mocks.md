---
type: pattern
status: idea
blocked-by:
  - "decision needed: centralize every ad-hoc mock, or only factories shared by 3+ files?"
  - "decision needed: how are subpath imports mocked?"
  - "decision needed: wait for Domain-Specific Code Locations?"
  - "decision needed: where do app-level mocks live?"
  - "decision needed: who builds the mock for the new src/_actions/_utils helpers?"
confirmed: 2026-09-25
---
# Where It Stands

Waiting on your decisions in Open Decisions; then write the Rules with Sarah. ^status

# Purpose
Many test files mock modules that have no centralized mock in `test/mocks/`, each with its own factory. This story decides how new centralized mocks are laid out (barrels, subpaths, modules with no barrel, code under `src/app/`). It then creates them where `.opencode/docs/unit_tests.md` "Creating Centralized Mocks" calls for one, and moves the consuming tests over. It changes only test and mock files, never source.

Split from [[Unit Testing - Clean Up Mocks]] on 2026-09-25. That story keeps only the stragglers in modules that already have centralized mocks.

# Root Cause
Until 2026-09-25, `unit_tests.md` said new centralized mocks needed the user's go-ahead, so tests wrote their own factories. The existing mocks mirror their import specifier (`@/_actions/auth` → `test/mocks/@/_actions/auth.ts`). Nothing says how to mirror a subpath import, a module with no barrel (`@/_utils`), or code under `src/app/`.

# Current State (moved from [[Unit Testing - Clean Up Mocks]] on 2026-09-25)
*Checked against the code on 2026-09-25 by scanning every `vi.mock` call in `src`. "Centralized" means the test uses `vi.mock('<module>', async () => await import('@mocks/...'))`; "ad-hoc" means it defines its own factory.*

## ⏳ `@/_components` - NOT STARTED
> ⚠️ **Check Drift 2026-09-25:** The scope is bigger than stated, and one mock can't cover it. There are 33 ad-hoc calls across 29 files, not 12. 15 files mock the `@/_components` barrel. 8 mock the sub-barrel `@/_components/Calendar`. The rest mock deep paths (`Calendar/CalendarContext`, `Calendar/MealCard/MealCard`, `Calendar/MobileAgenda/MobileAgenda`, `Calendar/MobileMonthGrid/MobileMonthGrid`, `Calendar/_components/CalendarNavButtons`, `NavLink`, `PillButton` ×2, `UserMenu`), because that is what the source imports. Most barrel factories export a different set of components in each file. Only three groups share an identical body: `ConfirmButton` (`RecipeDetail`, `DeleteItemButton`, `RemoveMemberButton` tests), `FormFeedbackAlert` (`ConfirmModal`, `RecipeForm`, `InviteForm` tests) and `useCalendarContext: vi.fn()` (`MobileAgenda`, `MobileMonthGrid`, `MobileAddMealButton`, `MealMonthAgenda` tests). Other stories will also change these exports: Header Date Picker adds `src/_components/CalendarDatePicker/`, Today and Selected Day Markers refactors `WeekView` and `MobileMonthGrid` and fixes a circular import through the `Calendar` barrel, and Mobile List View changes `MealCard`. Found by reading code and notes, not verified in the running app.
- No centralized mock exists. 12 test files use ad-hoc factories.
- The shared `FormFeedbackAlert` factory in `ConfirmModal.test.tsx:9`, `RecipeForm.test.tsx:21` and `InviteForm.test.tsx:9` contains conditional logic (`status === 'error' ? ... : null`), which the "What Good Mock Defaults Look Like" section of `unit_tests.md` warns against. It was probably added for a specific test. Part of this work is finding the test or tests that rely on the conditional and working out a different way for them to check that case, so the centralized mock can be a static stub. Found by reading code, 2026-09-25; Sarah decided on 2026-09-26 how to handle it.

## ⏳ `@/_utils` - NOT STARTED
> ⚠️ **Check Drift 2026-09-25:** `src/_utils/index.ts` doesn't exist, so there is no barrel to mock. A centralized mock would be one file per submodule, as `test/mocks/@/_actions/` is. The real count is 36 ad-hoc calls: `@/_utils/auth` 8 (a directory, `src/_utils/auth/`), `zObjectId` 7, `catchify` 6, `serialize` 6, `matchesId` 4, `zSafeString` 3, `date` 2. `checkAuth.test.ts:10` also uses `vi.mock('@/_utils/catchify', { spy: true })`, which is neither form. Two `zObjectId` factories return a real zod schema, which is logic inside a mock: `src/app/[planner]/calendar/page.test.tsx` and `src/app/[planner]/recipes/page.test.tsx`. Mantine Date Picker Setup adds `getWeekStart` and `WEEK_START`, and Header Date Picker adds `formatDate`, so these exports will change. Found by reading code and notes, not verified in the running app.
- No centralized mock exists. 25 mock calls across test files use ad-hoc factories (`catchify`, `serialize`, `zObjectId`, `auth`, `matchesId`, ...).

## Not tracked above
> ⚠️ **Check Drift 2026-09-25:** `@app` is not an alias in `tsconfig.json` or `vitest.config.ts`. Every other centralized mock mirrors its import specifier (`@/_actions/auth` → `test/mocks/@/_actions/auth.ts`), but this one doesn't. The hook's real path is `@/app/[planner]/calendar/_hooks/usePlannerSavedItems`, and its 3 consumers mock the relative specifier `'../../_hooks/usePlannerSavedItems'` (`DishRow.test.tsx:17`, `DishRowExpanded.test.tsx:14`, `DishSourceFields.test.tsx:12`). Step 2 of Add Meal Changes (Saved Recipes) adds `kind`, `tags` and `lastUsed` to this mock. That story now waits on Calendar and Recipes Data Refresh. `@/app/[planner]/_components` (`useCanWrite`, `usePlannerContext`) is also mocked ad-hoc in 7 files with slightly different factories. Found by reading code and notes, not verified in the running app.
- `test/mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems.ts` - an app-level centralized mock (added 2026-09-24), used by `DishRow`, `DishRowExpanded` and `DishSourceFields` tests. It is the first mock under `@app`; decide whether app-level mocks are part of this story's conventions.
- `./AuthLayout` (`src/app/_components/AuthLayout`) - mocked ad-hoc by a relative specifier in 2 files, each exporting different parts: `SignInPrompt.test.tsx:7` (`AuthLayoutRoot`, `AuthLayoutHeader`) and `SignInFlow.test.tsx:15` (seven other `AuthLayout*` parts). The `SignInFlow` factory has logic in it: `AuthLayoutEmailDisplay` spreads its props and renders a working change-email button wired to `onChangeEmail`, which that file's change-email test clicks. Centralizing it means finding another way for that test to reach `onChangeEmail`, as with the `FormFeedbackAlert` conditional. Found by reading code while planning [[Unit Testing - Clean Up Mocks]], 2026-09-26.
- `./ToggleContext` (`src/app/[planner]/_components/ToggleContext/`) - mocked ad-hoc by a relative specifier in `PlannerLayout.test.tsx:18` (`ToggleProvider` pass-through plus `useToggleContext`). [[Unit Testing - Clean Up Mocks]] Step 4 (planned 2026-09-26) adds a second inline factory in `BurgerToggle.test.tsx` (`useToggleContext` only). That's a deliberate, temporary exception to `unit_tests.md` "Use Async Import Pattern for All Mocks" until Open Decisions 1 and 4 are answered. The two factory bodies differ. Found by reading code and notes.

## Other modules with no centralized mock
*Found 2026-09-25 by parsing every `vi.mock(` call in `src/**/*.test.ts(x)`. Found by reading code, not verified in the running app.*
- `@/_auth`: 10 files (`auth.api.getSession` or `mongoClient` shapes), e.g. `src/_actions/user/getUser.test.ts:10`, `src/app/page.test.tsx:28`, `src/_actions/sharing/signUpWithInvite.test.ts:12`
- `@/_theme/colors`: 7 calls
- `next/link`: 4 files
- `mongoose`: 4
- `@mantine/dates`: 1 (`CalendarHeader.test.tsx`), below the 3-file rule
- `next/cache`: the same `{ revalidatePath: vi.fn() }` factory in 4 files (`editBookmark`, `editRecipe`, `updateRecipeNotes`, `updateRecipeTags` tests). Out of scope, see below.

# Open Decisions
1. Centralize every ad-hoc mock, or only where 3 or more test files share an identical factory body (the `unit_tests.md` rule since 2026-09-25)? Under that rule, `@/_components` today yields only three groups (`ConfirmButton`, `FormFeedbackAlert`, `useCalendarContext`), and `@/_utils/date` (2 consumers) stays ad-hoc.
2. How are subpath imports mocked? The source imports the `@/_components` barrel, the `@/_components/Calendar` sub-barrel and deep paths, and this story can't change the source imports.
3. Should this wait for [[Domain-Specific Code Locations]] (`pattern` · `idea`)? It may move code out of `@/_components` and `@/_utils` to a new alias, which would change the mock paths.
4. Where do app-level mocks live? `test/mocks/@app/...` isn't an alias and doesn't mirror the import path. Its consumers mock a relative specifier. This also decides `@/app/[planner]/_components` (`useCanWrite`, `usePlannerContext`), which 7 files mock ad-hoc. It also decides the relative app-level mocks `./AuthLayout` and `./ToggleContext` (see Current State).
5. Who builds the shared mock for the `src/_actions/_utils` helpers (`defineMutation`, `defineQuery`, `invalidate`, `cacheTags`) that [[Calendar and Recipes Data Refresh]] and [[Data Rules Enforcement]] add? [[Calendar and Recipes Data Refresh]] writes the first tests that need it, so answer this before its /plan-steps.

# Rules
%% To decide with Sarah once the Open Decisions are answered. %%

# Enforcement
%% Required. A candidate: a static test that fails when 3 or more test files contain the same `vi.mock` factory body. To decide. %%

# Migration Checklist
%% Built from Current State once Open Decisions 1-4 are answered. Re-scan first: [[Mantine Date Picker Setup]], [[Header Date Picker]], [[Today and Selected Day Markers]], [[Mobile List View]] and [[Add Meal Changes (Saved Recipes)]] change these exports. %%

# Out of Scope
- Stragglers in modules that already have centralized mocks: [[Unit Testing - Clean Up Mocks]] and the Stale Data stories that rewrite those tests.
- `next/cache`: [[Calendar and Recipes Data Refresh]] replaces `revalidatePath` with `invalidate()`, so these 4 mocks go away.
- `@tabler/icons-react` mocks that `unit_tests.md` forbids: Roadmap, Tech Debt.

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. %%
