---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
A running list of small unit-test fixes that don't follow `.opencode/docs/unit_tests.md`. Each one is too small for its own story, so they're collected here and handled in one sweep every so often.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Unit test fixes that don't follow `.opencode/docs/unit_tests.md`. Changes are to test files only, unless an item names an exception.

# Items
*Items are added as they're found. Re-check each one before planning.*

- [ ] `src/app/[planner]/_components/ToggleContext/ToggleProvider.test.tsx` "renders children" and both tests in `ToggleContext.test.ts` are presentational or test React itself (that `createContext` has a Provider and a null default), which "Don't Create Purely Presentational Tests" rules out. Removing both `ToggleContext.test.ts` tests leaves it empty, so delete the file. `ToggleContext.ts` stays at 100% coverage without it, through `useToggleContext.test.tsx` and `ToggleProvider.test.tsx` (checked 2026-09-26). Found by reading code while planning [[Unit Testing - Clean Up Mocks]], 2026-09-26.
- [ ] `src/app/_components/SignInFlow.test.tsx` "renders nothing when checkEmailStatus returns an unknown status" exists only to cover `default: return null` in `SignInFlow.tsx`'s `renderContent` switch. That switch has a case for every `Step` member, so the default can only be reached with a value outside the type. **Exception to test-files-only:** remove the `default` from `SignInFlow.tsx`, then delete the test. Found while implementing [[Unit Testing - Clean Up Mocks]] Step 1, 2026-09-26.
- [ ] `src/_components/Calendar/CalendarContext.test.tsx` and `src/app/[planner]/calendar/_components/CalendarModal/CalendarModalContext.test.tsx` use a hand-rolled `TestComponent` in both tests, and `src/app/[planner]/_components/ToggleContext/ToggleProvider.test.tsx` "provides opened state and toggle function via context" uses a hand-rolled `ContextReader`, which "Use the Testing Library's Own Tools" rules out. Move each onto `renderHook`: the throw tests call it with no wrapper, the context-value tests pass the provider as `wrapper` (for `ToggleProvider`, `renderHook(() => useContext(ToggleContext), { wrapper: ToggleProvider })`), keeping their existing assertions. Found by reading code while implementing [[Unit Testing - Clean Up Mocks]] Step 3, 2026-09-26.
- [ ] Remove the `vi.mock('@tabler/icons-react', ...)` factories, which the "Never Mock" table in `unit_tests.md` forbids, from `src/_components/Navbar/PlannerContextSection.test.tsx:18`, `src/_components/UserMenu/UserMenu.test.tsx:13`, `src/app/[planner]/recipes/_components/DeleteItemButton.test.tsx:23` and `src/app/settings/_components/InvitesSection.test.tsx:20`. Two assertions depend on the fake icons: in `InvitesSection.test.tsx`, "should show expiration warning when near expiry" (L139) asserts `icon-clock`, so assert the "Expires soon" text instead; "should show expired message when expired" (L159) already asserts "Expired", so delete its `icon-clock` line. `PlannerContextSection.test.tsx`'s `icon-chevron-down` query needs no change, because `PlannerContextSection.tsx:41` sets that test id on the real icon. [[Calendar and Recipes Data Refresh]] and [[Settings Data Refresh]] also rewrite the `DeleteItemButton` and `InvitesSection` tests, so re-check those two first. Moved from the Roadmap 2026-09-26, checked by reading code the same day.

# Out of Scope
- New or missing centralized mocks: [[Unit Testing - New Centralized Mocks]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Coverage stays at 100%.

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
