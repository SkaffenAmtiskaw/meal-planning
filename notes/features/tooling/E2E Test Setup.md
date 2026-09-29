---
type: pattern
status: idea
blocked-by: []
confirmed: 2026-09-28
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Decisions made. Next: /architect ^status

Set up E2E testing as a convention (where tests live, how they get their data, how they sign in and how they're run) and prove it with one first test that follows the Rules. [[Core Flows E2E Tests]] and [[Calendar E2E Tests]] build on it.

Questions `/architect` answers as part of writing the Rules:
- Where E2E tests and their helpers live.
	- Decision 4 limits this: the data-creation helpers are plain functions, free of Playwright-specific code, so a dev seed script in the manual and agent testing story can reuse them.
- How tests sign in, and where test users' credentials live.
	- Finding for decision 2: better-auth's `testUtils` plugin (installed) creates users with `emailVerified: true` and returns Playwright-ready session cookies. Its docs have an E2E example that does exactly this, and recommend a test-only auth instance rather than adding it to the production config. The app's own `User` doc still has to be created alongside each better-auth user.
- How the tests are run locally: the command, and whether they run against the dev server or a production build.
	- Decision 3 limits this: the E2E server runs as its own process with `DB_URL` pointed at the memory server, never reusing Sarah's `pnpm dev` (Next 16 also blocks a second `next dev` in the same project), and the memory server has to be running before Playwright starts the Next server, because `webServer` starts before `globalSetup`.
- Which flow the first test covers.

# Purpose
%% The convention being introduced or standardized, in a sentence or two. Use this template when the fix is "everything should work this way" plus moving existing code over. For removing or tidying code without a new convention, use Cleanup instead. %%
E2E tests run locally against test data that stays consistent, following one written convention, with one first test to prove it. Split from [[E2E Testing]] on 2026-09-28.

# Root Cause
%% Why the current code produces the symptoms, or why the lack of a convention is a problem. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%
1. Which E2E tool should the app use? Candidates: Playwright, Cypress, WebdriverIO, Puppeteer, TestCafe, Selenium WebDriver.
	- **Decided 2026-09-28:** Playwright (`@playwright/test`). It handles the Calendar Page goal's drag, phone (real touch emulation) and axe accessibility scans without add-ons, records traces an agent can read on failure, runs in parallel for free in CI, and Sarah already knows it.
		- Rejected: Cypress - no real touch emulation, experimental WebKit support, and parallel runs are mostly in its paid cloud.
		- Rejected: WebdriverIO - built for real-device and native mobile testing, which this project doesn't need, and it takes more setup.
		- Rejected: Puppeteer - a browser automation library, not a test runner, and it has no WebKit.
		- Rejected: Selenium WebDriver - a browser automation library, not a test runner.
		- Rejected: TestCafe - niche, and nothing in this project calls for it.
2. How does test data stay consistent between runs: cleanup steps in the tests, or resetting the database after a run?
	- **Decided 2026-09-28:** Each test creates the users and planners it needs, with unique emails, and never changes data it didn't create. No cleanup steps and no reset: the memory server's throwaway database (decision 3) already resets between runs. This follows Playwright's test isolation best practice and keeps parallel runs and retries safe.
		- Rejected: one user per worker, one planner per test - user-level changes build up within a worker, so tests depend on run order, and sharing and account tests would need a second pattern anyway. Signing in once per worker may still come up as a speed-up in /architect's sign-in question.
		- Rejected: a shared seed reset before each test - forces tests to run one at a time.
		- Rejected: cleanup steps in the tests - a known anti-pattern that doesn't always run, still breaks parallel runs, and adds nothing on a throwaway database.
3. Which database do the E2E tests run against? Candidates: a separate database on the existing MongoDB setup, mongodb-memory-server, MongoDB in Docker through Testcontainers.
	- **Decided 2026-09-28:** mongodb-memory-server, pinned to the Atlas cluster's MongoDB version. Each run gets a fresh, isolated local database with no network or shared data, and it's the real `mongod`, so it matches production.
		- Rejected: a separate database on the existing Atlas cluster - slower and flakier over the network, a reset could hit the dev or production data, free-tier limits, and CI would need Atlas credentials.
		- Rejected: MongoDB in Docker through Testcontainers - needs a Docker runtime that isn't installed, for nothing this app uses.
4. Should the E2E tests and manual and agent testing share one seed data set, run against both databases?
	- **Decided 2026-09-28:** No shared seed. E2E tests read no seed data (decision 2). Manual and agent testing get their own Dev Foundations story, scoped to Sarah's goals: manual testing of access-level edge cases without tedious setup, and `first-pass` agents never stopping because no user exists for an access level. `/architect` writes the E2E data-creation helpers as plain functions, free of Playwright-specific code, so a dev seed script can reuse them. This follows the practice of tests and seeders sharing one set of factories, and the Single Concern rule.
		- Rejected: one seed data set used by both - E2E tests create their own data and don't read a seed.
		- Rejected: building the manual and agent environment in E2E Test Setup - gives a convention story a second job and blocks it on questions that have nothing to do with E2E, like whether the Atlas dev database is separate from production.
		- Rejected: splitting it out with no link to the E2E helpers - a seed script later would duplicate the helpers or force a refactor.

# Rules
%% The convention itself, as numbered rules an agent can check code against. Written with Sarah by `/architect`, along with Enforcement and the Migration Checklist, once Open Decisions are settled. It sets status to `spec` when all three are approved. %%
## Rule 1 - 

# Enforcement
%% Required. How future stories are kept from drifting: a lint rule, a type, a test, a module boundary, an agent instruction or a review checklist. If programmatic enforcement isn't possible, say so and describe the process instead. %%

# Migration Checklist
%% Every place that has to change, as checkboxes grouped by kind, with file paths. This is what gets split into implementation steps. %%

# Out of Scope
%% Related problems found along the way that this story won't fix. Each should also be on the Roadmap. %%
- Handling email confirmation in auth flows. Sarah decided 2026-09-28 that it gets worked out with the auth flow tests in [[Core Flows E2E Tests]].

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
