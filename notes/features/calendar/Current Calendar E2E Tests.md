---
type: 
status: idea
confirmed: 2026-10-04
---
# Where It Stands
Next: /shape ^status

# Notes
Split from Core Flows E2E Tests on 2026-10-04.

Scope: regression tests for what `/[planner]/calendar` does today, such as viewing the month, week and list views and adding a meal. The flows the [[Calendar Page]] goal adds are covered by [[Calendar E2E Tests]], not here.

Sarah decided 2026-10-04 that the app-wide review is split into one story per feature area in `docs/e2e_tests.md` ("Feature Areas"), and that each area's story gets more granular about which flows to test. These tests add protection against regressions in what's already built.

The Calendar Page goal will rework much of the calendar ([[Remove Schedule-X]], [[Mobile List View]], [[Meal Editing]]), so tests written now may need rewriting. Sarah confirmed 2026-10-04 that the existing calendar flows are still in scope.

Sarah's notes from E2E Testing:
- Part of this will be an app-wide review to determine what needs e2e tests added now.

# Questions
