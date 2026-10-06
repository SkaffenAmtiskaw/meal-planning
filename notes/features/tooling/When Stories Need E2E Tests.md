---
type: workflow
confirmed: 2026-10-05
blocked-by:
  - "[[Auth E2E Tests]]"
  - "[[Current Calendar E2E Tests]]"
  - "[[Recipes E2E Tests]]"
  - "[[Settings E2E Tests]]"
  - "[[Sharing E2E Tests]]"
---
# Where It Stands
Blocked by [[Auth E2E Tests]], [[Current Calendar E2E Tests]], [[Recipes E2E Tests]], [[Settings E2E Tests]] and [[Sharing E2E Tests]]; then /tooling ^status

Moved out of [[Agent Workflow Changes 2026-10-02]] on 2026-10-05. Sarah decided it waits until the core flows have E2E tests, since there's no reason for agents to suggest building E2E tests while the app has none.

# Notes
No skill or agent says when a feature or fix should add E2E tests and when it isn't worth it. Settle the rule with Sarah, then add it where stories get planned and reviewed (likely `/assess`, `/plan-steps` and `/final-review`), with any codebase facts about the E2E setup going in `docs/`. Sarah: "we need to update agents to specify when a feature needs e2e tests added and when it's not worth doing".

It also covers new feature areas: when a story adds a route that isn't in the route-to-area table in `docs/e2e_tests.md` ("Feature Areas"), the planning agents should notice and make adding the route to the table an acceptance criterion.

# Questions

