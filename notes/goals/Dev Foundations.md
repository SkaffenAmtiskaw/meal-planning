---
type: goal
confirmed: 2026-10-04
---

# Purpose
Covers the OpenCode migration, removes current pain points in building the app, and adds elements that really should be there, like a release process. The pain points are Sarah's while building and running the app, not users' while using it. They include observability (Sentry): it's closer to what she builds than how she builds it, but it's work she's doing and running into problems with.

# Done When
- The OpenCode migration is done: no OpenCode files remain (the `.opencode` directory and `opencode.jsonc`).
- A release process exists.
- Documentation is confirmed to match reality.
- Manual and agent testing isn't a huge pain in the ass, because credentials exist for almost all test cases and there's test data that meets our needs.
- Sarah doesn't have to go digging to remember how her services and accounts are set up, such as how to set up a new MongoDB environment or who she pays for the domain, when she needs to change anything.
- The production environment on Vercel has been audited: Sarah knows what it uses and how it differs from local (its database, its Resend domain and so on), and anything it should be doing differently is fixed or has a Roadmap line.
- Lint, type check, unit tests and build run automatically on every PR into `main`.
- E2E tests cover the core flows and run in CI.
- Production errors get reported to Sarah (Sentry).
- When Sentry logs an error or an E2E test fails, an agent runs a root cause analysis, so it's ready for Sarah when she starts working.
- Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email.
- There's a known, tested way to back up and restore the production database.

# Out of Scope
- Tech debt stories, including test-code tech debt such as [[Unit Testing - New Centralized Mocks]] and [[Unit Test Tidy-Ups]]: Sarah left them out on 2026-09-28, and they belong to the [[App Health]] standing goal.
- PostHog analytics: Sarah moved it to [[Dev Tooling]] on 2026-10-04, since it isn't necessary to the baseline of dev tooling she needs for a smooth development process.
- Watching libraries and tools for new releases or features worth adopting: Sarah moved it to [[Dev Tooling]] on 2026-10-04.
- [[Vercel Plugin]]: Sarah moved it to [[Dev Tooling]] on 2026-10-04.
- Switching the testing library to `vitest-browser-react`: Sarah moved it to [[Dev Tooling]] on 2026-10-04.
