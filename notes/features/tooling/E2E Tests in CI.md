---
type: 
status: idea
blocked-by:
  - "[[CI Checks]]"
confirmed: 2026-09-28
---
# Where It Stands
Blocked until [[CI Checks]] lands, then /shape ^status

# Notes
Split from [[E2E Testing]] on 2026-09-28.

Scope: run the E2E tests in GitHub Actions when `develop` opens a PR into `main`, set up whatever environment that needs, and write a doc on how to create a new environment. It builds on [[CI Checks]] (which sets up CI) and [[E2E Test Setup]] (which gets the tests running locally).

> [!warning]
> The E2E tests build the app into the default `.next` folder, the same one `pnpm build` uses ([[E2E Test Setup]] Rule 12; Sarah decided 2026-09-29 not to give it a separate folder). Nothing in CI may run another `next build` in the same checkout while the E2E tests run, or the two builds collide.

A failed E2E test reaches Sarah through the failed-check session [[CI Checks]] sets up. This story adds instructions for that session to run a preliminary root cause analysis of the failure, moved here from [[Sentry Root Cause Analysis]] 2026-09-29, which reuses it for Sentry errors.

Sarah's note from [[E2E Testing]], moved here from [[Sentry Root Cause Analysis]] 2026-09-29:
- I'd love if a failed e2e test automatically kicked off a Claude agent that did a preliminary root cause analysis for me to review

Sarah's notes from [[E2E Testing]]:
- I want e2e tests to run automatically, but I don't want them to run locally every time I commit because they take goddamn forever. So this probably means it's time for GHA. The most obvious (to me) place to run them is when develop opens a PR into main.
- If e2e tests are running in CI, we might need a new environment. We need to figure out moving pieces for that. (note: it'd be super nice if this work created a document about creating a new environment I could refer back to later!)

# Questions

