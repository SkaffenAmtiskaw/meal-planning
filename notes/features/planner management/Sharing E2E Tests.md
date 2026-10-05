---
type: 
status: idea
confirmed: 2026-10-04
---
# Where It Stands
Next: /shape. /plan-steps waits on [[Auth E2E Tests]] ^status

# Notes
Split from Core Flows E2E Tests on 2026-10-04.

Scope: regression tests for what `/invite` and planner membership already do, such as inviting someone, accepting or declining an invite, leaving a planner and changing a member's access.

Sarah decided 2026-10-04 that the app-wide review is split into one story per feature area in `docs/e2e_tests.md` ("Feature Areas"), and that each area's story gets more granular about which flows to test. These tests add protection against regressions in what's already built.

Invites send a link by email. Sarah decided 2026-10-04 that the way E2E tests get email links is built in [[Auth E2E Tests]], so this story waits on it.

Sarah's notes from E2E Testing:
- Part of this will be an app-wide review to determine what needs e2e tests added now.

# Questions
