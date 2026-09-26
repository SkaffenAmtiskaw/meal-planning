---
type: cleanup
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
A running list of small unit-test fixes that don't follow `.opencode/docs/unit_tests.md`. Each one is too small for its own story, so they're collected here and handled in one sweep every so often. Add new items as bullets under Current State. Changes are to test files only.

# Current State
*Items are added as they're found. Re-check each one before planning.*

- [ ] `src/app/[planner]/_components/ToggleContext/ToggleProvider.test.tsx` "renders children" and both tests in `ToggleContext.test.ts` are presentational or test React itself (that `createContext` has a Provider and a null default), which "Don't Create Purely Presentational Tests" rules out. Found by reading code while planning [[Unit Testing - Clean Up Mocks]], 2026-09-26. When removing them, confirm `ToggleContext.ts` stays at 100% coverage; after that story's Step 3, `useToggleContext.test.tsx` renders `ToggleContext.Provider` directly.
- [ ] `src/app/_components/SignInFlow.test.tsx` "renders nothing when checkEmailStatus returns an unknown status" exists only to cover `default: return null` in `SignInFlow.tsx`'s `renderContent` switch. That switch has a case for every `Step` member, so the default can only be reached with a value outside the type. **Exception to test-files-only:** remove the `default` from `SignInFlow.tsx`, then delete the test. Found while implementing [[Unit Testing - Clean Up Mocks]] Step 1, 2026-09-26.

# Out of Scope
- New or missing centralized mocks: [[Unit Testing - New Centralized Mocks]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Coverage stays at 100%.

# Implementation
%% The step plan goes here - then set status to `ready`. %%
