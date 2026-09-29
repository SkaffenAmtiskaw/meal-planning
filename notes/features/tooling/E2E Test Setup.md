---
type: pattern
status: idea
blocked-by: []
confirmed: 2026-09-29
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Decisions made. Next: /architect ^status

Set up E2E testing as a convention (where tests live, how they get their data, how they sign in and how they're run) and prove it with one first test that follows the Rules. [[Core Flows E2E Tests]] and [[Calendar E2E Tests]] build on it.

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
5. Where should E2E tests and their helpers live?
	- Decision 4 limits this: the data-creation helpers are plain functions, free of Playwright-specific code, so a dev seed script in the manual and agent testing story can reuse them.
	- **Decided 2026-09-29:** Specs and Playwright-only code (fixtures, globalSetup) go in a root `e2e/` folder. The plain data-creation helpers go in `test/`, apart from Playwright code; /architect names the subfolder, apart from the unit-test builders in `test/fixtures/`. This keeps E2E tests in their own folder, as Next.js's Playwright example does, so neither Vitest nor Playwright picks up the other's files, while the helpers sit where both the tests and a later seed script can import them. Sarah asked for the matching config change: add `e2e/**/*` to `biome.jsonc` `files.includes`.
		- Rejected: everything under `test/` - mixes Playwright code into the Vitest-only tree, gives "fixtures" two meanings, and a bare `vitest run test` would pick up the specs.
		- Rejected: a `spec/` root folder - `e2e/` is the Next.js and Playwright name and says what the folder holds; "spec" is also a note status in this project.
		- Rejected: helpers in a new root such as `db/factories/` - a second new root before the seed story that would need it is shaped.
		- Rejected: specs next to pages in `src/` - E2E flows span pages, Vitest would run them, and helpers would fall under the 100% coverage rule.
6. How do E2E tests sign in, and where do test users' credentials live?
	- Finding for decision 2: better-auth's `testUtils` plugin (installed) creates users with `emailVerified: true` and returns Playwright-ready session cookies. Its docs have an E2E example that does exactly this, and recommend a test-only auth instance rather than adding it to the production config. The app's own `User` doc still has to be created alongside each better-auth user.
	- **Decided 2026-09-29:** Each test signs in with better-auth `testUtils` `getCookies` on a test-only auth instance that also carries `admin()`. The plain user helper in `test/` creates the better-auth user through `auth.api.createUser` (`emailVerified: true`, password optional, lowercased email) together with the app's `User` doc, the way `signUpWithInvite.ts` does. No credentials are stored: emails and any passwords are generated per test, and only a dummy `BETTER_AUTH_SECRET` is shared with the E2E server (where it's set is decision 7). Sarah asked for a Biome rule that bans importing `testUtils` inside `src/`. This follows the practice of signing in programmatically everywhere except the tests that test sign-in, and lets one user helper serve E2E tests, sign-in form tests and the later seed script (decision 4). /architect's first test confirms a bare session cookie is accepted while `cookieCache` is on.
		- Rejected: testUtils `saveUser` to create users - its users have no password, so sign-in tests and the seed script would need a second helper.
		- Rejected: signing in through the form in every test - slow, breaks whenever the sign-in UI changes, and is the log-in-through-the-UI anti-pattern.
		- Rejected: signing in once and reusing Playwright `storageState` - needs shared users, which goes against decision 2, and buys no speed over cookies.
7. How are the E2E tests run locally: with which command, and against the dev server or a production build?
	- Decision 3 limits this: the E2E server runs as its own process with `DB_URL` pointed at the memory server, never reusing Sarah's `pnpm dev` (Next 16 also blocks a second `next dev` that shares the same build folder, `.next`), and the memory server has to be running before Playwright starts the Next server, because `webServer` starts before `globalSetup`.
	- **Decided 2026-09-29:** `pnpm test:e2e` runs `playwright test` against a production build: a first `webServer` entry starts the memory server on a random port and Playwright captures its URI into `DB_URL` through `wait` named groups, then a second entry runs `next build && next start -p 3100`, with `reuseExistingServer: false`. Every `src/env.ts` variable gets a dummy value at the top of `playwright.config.ts` (including the shared `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` on port 3100), so nothing falls back to real values in `.env.local`. This follows Next.js's guidance to test against production code and dev/prod parity with CI, and keeps all setup in the one file every way of running Playwright reads. /architect confirms a `webServer` entry with only `wait` is accepted, and raises `webServer.timeout` to cover the build.
		- Rejected: `next dev` on its own build folder - not what users run, pages compile on demand under parallel workers, and it needs `next.config.mjs` and `tsconfig.json` changes.
		- Rejected: both a production and a dev mode - carries the dev option's config costs and two server paths; can be added on top later if build time hurts.

# Rules
Questions for this section:
- Which flow the first test covers.

%% The convention itself, as numbered rules an agent can check code against. Written with Sarah by `/architect`, along with Enforcement and the Migration Checklist, once Open Decisions are settled. It sets status to `spec` when all three are approved. %%
## Rule 1 - 

# Enforcement
%% Required. How future stories are kept from drifting: a lint rule, a type, a test, a module boundary, an agent instruction or a review checklist. If programmatic enforcement isn't possible, say so and describe the process instead. %%

# Migration Checklist
%% Every place that has to change, as checkboxes grouped by kind, with file paths. This is what gets split into implementation steps. %%
## Docs
- [ ] `docs/project_structure.md`: move the `test/` entry out from under `# src/` to the top level (it sits at the repo root), and have its description cover `test/fixtures/` and `test/utils/` as well as the setup script and mocks. Sarah decided 2026-09-29 to fix this here (Boy Scout rule), since this story rewrites that entry anyway.

# Out of Scope
%% Related problems found along the way that this story won't fix. Each should also be on the Roadmap. %%
- Handling email confirmation in auth flows. Sarah decided 2026-09-28 that it gets worked out with the auth flow tests in [[Core Flows E2E Tests]].

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
