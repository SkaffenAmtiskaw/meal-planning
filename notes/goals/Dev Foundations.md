---
type: goal
confirmed: 2026-09-28
---
%% A goal is an epic: work Sarah ranks and ships together as one release. `/roadmap` shapes and ranks it. It has no `status` and no Where It Stands, and it's never implemented directly. Its rank lives on the Roadmap. So does the list of stories that serve it: the lines under its heading in Later, and every line elsewhere that ends with its 🎯 link. %%

# Purpose
%% Why this goal matters and what it changes, for the app's users or for how the app is built. %%
Covers the OpenCode migration, removes current pain points in building the app, and adds elements that really should be there, like a release process. The pain points are Sarah's while building and running the app, not users' while using it. They include observability (Sentry and PostHog): it's closer to what she builds than how she builds it, but it's work she's doing and running into problems with.

# Done When
%% What has to be true to ship this goal as a release. Each item is something Sarah can check in the running app, or a named piece of work being finished. %%
- The OpenCode migration is done: no OpenCode files remain (the `.opencode` directory and `opencode.jsonc`).
- A release process exists.
- Documentation is confirmed to match reality.
- Manual and agent testing isn't a huge pain in the ass, because credentials exist for almost all test cases and there's test data that meets our needs.
- Sarah doesn't have to go digging to remember how her services and accounts are set up, such as how to set up a new MongoDB environment or who she pays for the domain, when she needs to change anything.
- The production environment on Vercel has been audited: Sarah knows what it uses and how it differs from local (its database, its Resend domain and so on), and anything it should be doing differently is fixed or has a Roadmap line.
- Lint, type check, unit tests and build run automatically on every PR into `main`.
- E2E tests cover the core flows and run in CI.
- Production errors get reported to Sarah (Sentry).
- PostHog analytics is set up.
- When Sentry logs an error or an E2E test fails, an agent runs a root cause analysis, so it's ready for Sarah when she starts working.
- Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email.
- When a tool Sarah watches ships a release or feature that might be relevant to the app, an agent adds an idea note to investigate it.
- There's a known, tested way to back up and restore the production database.

# Out of Scope
%% Work that was considered for this goal and left out, with Sarah's reason, so `/roadmap` doesn't offer it again. %%
- Tech debt stories, including test-code tech debt such as [[Unit Testing - New Centralized Mocks]] and [[Unit Test Tidy-Ups]]: Sarah plans a separate tech debt goal later (2026-09-28).
