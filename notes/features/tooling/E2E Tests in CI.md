---
type: infra
status: idea
blocked-by:
  - "decision needed: how a hard E2E failure gets a stronger model"
confirmed: 2026-10-02
---
# Where It Stands
Next: /decide ^status

Shaped as one infra story: an `e2e` job on PRs into `main`, and when it fails, `ci-failure` runs a root cause analysis that the Sentry routine can reuse. Split from E2E Testing on 2026-09-28. One open decision first, then `/infra-design`.

# Inbox
- Background for `/infra-design`, from the idea note: the E2E tests build the app into the default `.next` folder, the same one `pnpm build` uses (`docs/e2e_tests.md`, "How a Run Works"; Sarah decided 2026-09-29 not to give it a separate folder). Nothing in CI may run another `next build` in the same checkout while the E2E tests run, or the two builds collide.

# Purpose
Run the E2E tests automatically in CI instead of locally on every commit, and when one fails, have an agent run a preliminary root cause analysis that's ready for Sarah to review.

Sarah's notes from E2E Testing:
- I want e2e tests to run automatically, but I don't want them to run locally every time I commit because they take goddamn forever. So this probably means it's time for GHA. The most obvious (to me) place to run them is when develop opens a PR into main.
- If e2e tests are running in CI, we might need a new environment. We need to figure out moving pieces for that. (note: it'd be super nice if this work created a document about creating a new environment I could refer back to later!)
- I'd love if a failed e2e test automatically kicked off a Claude agent that did a preliminary root cause analysis for me to review

# Goals
- [ ] The E2E tests run in GitHub Actions on PRs into `main`.
- [ ] A failed E2E job reaches Sarah through the `ci-failure` session (`docs/ci.md`, "The Job That Starts `ci-failure`"), which runs a preliminary root cause analysis.
- [ ] [[Sentry Logging and Root Cause Analysis]] can reuse the root cause analysis for Sentry errors.
- [ ] A failure that needs more reasoning gets a stronger model than `ci-failure`'s Sonnet. Sarah decided 2026-09-30 that such failures should get one, and expects some E2E failures to need it.
- [ ] `docs/ci.md` covers the E2E job and how its failures are handled.

# Open Decisions
1. How does a hard E2E failure's diagnosis get a stronger model? A routine has one model for every run, and `ci-failure` runs on Sonnet (`.claude/skills/ci-failure/routine.md`). The two ways found while planning CI Failure Sessions 2026-09-30:
   - the skill hands a hard failure's diagnosis to a subagent set to a stronger model, such as Opus
   - a second routine with its own model, which the workflow fires instead of `ci-failure` when the E2E job fails

# Design
Questions for this section:
- Where does the root cause analysis live, so the Sentry routine's skill can reuse it? That routine won't run `ci-failure`, since a Sentry error isn't a CI failure. Sarah wants whichever home is easiest.
- Is the `e2e` job a required check in the ruleset on `main`?
  - **Decided 2026-10-02:** yes. Sarah's call.
- When the `e2e` job fails, does the `ci-failure` session fix the failure or only analyze it?
  - **Leaning 2026-10-02:** an easy fix gets fixed and a PR is created, just like a linting issue. If the code changed but the tests weren't updated, that's easy to fix. If the code changes broke something in an unrelated part of the app, that might be a harder fix and might need to go through the full bug workflow with planning, implementing and reviewing. Not checked yet.
- What does the `Meal Planning Routines` cloud environment need so a session can rerun the E2E tests, such as allowed hosts for the Chromium and `mongod` downloads?

# Conventions

# Setup Outside the Repo

# Out of Scope
- Writing more E2E tests: [[Auth E2E Tests]], [[Current Calendar E2E Tests]], [[Recipes E2E Tests]], [[Settings E2E Tests]], [[Sharing E2E Tests]] and [[Calendar E2E Tests]].
- Stopping the four existing check jobs from downloading MongoDB: an item in [[Dev Tooling Tidy-Ups]].
- Feature branches, protecting `develop` and the release process, which may later change where the E2E tests run: [[Branching and Releases]].
- A doc on creating a new environment: [[Services and Environments Audit]]. CI needs no new environment, since the E2E tests run against a throwaway database with dummy values (Sarah confirmed 2026-10-02).
- Root cause analysis for Sentry errors: [[Sentry Logging and Root Cause Analysis]].
