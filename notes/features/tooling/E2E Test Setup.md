---
type: pattern
status: in-progress
blocked-by: []
confirmed: 2026-09-29
---
# Where It Stands

In progress. Next: implement Step 3 ^status

Set up E2E testing as a convention (where tests live, how they get their data, how they sign in and how they're run) and prove it with one first test that follows the Rules. [[Core Flows E2E Tests]] and [[Calendar E2E Tests]] build on it.

# Purpose
E2E tests run locally against test data that stays consistent, following one written convention, with one first test to prove it. Split from [[E2E Testing]] on 2026-09-28.

# Root Cause

# Open Decisions
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
8. Do E2E specs go through page objects, or call Playwright locators directly?
	- **Decided 2026-09-29:** Locators directly in specs. A multi-step UI action that a second spec needs moves into a plain function in `e2e/_fixtures/` that takes `page` or a `Locator`, and specs call it instead of repeating the steps. Each spec reads top to bottom in one file, which is easiest to review and to debug from a trace. This follows Playwright's Best Practices, where user-facing locators give the resilience page objects were built for and page objects are "one such approach" rather than the default, and the AHA practice of not abstracting test code before real duplication shows what the abstraction should be.
		- Rejected: one page-object class per page in `e2e/pages/` - nine classes up front for pages most specs barely touch, at the per-page granularity Martin Fowler warns against when the large UI pieces are shared across routes, and every new flow becomes a two-file change.
		- Rejected: page objects provided through `test.extend` fixtures - all the costs of page-object classes, plus tracing each fixture's name back to its definition.
		- Rejected: component objects for complex UI from the start - a second pattern before there's any need; extracting repeated steps already allows it later.
9. How does each E2E test's setup (its users, planners and sign-in) reach the spec: through Playwright fixtures, or through helpers the spec calls?
	- **Decided 2026-09-29:** Fixtures handle only connections and browser contexts, and the data stays explicit in the spec. `e2e/_fixtures/` exports a `test` built with `test.extend` whose fixtures open and close each worker's database connections (the factories' Mongoose connection and the test-only auth instance's MongoClient) and close any browser context they open. Specs import `test` and `expect` from `e2e/_fixtures/`, create their users and planners by calling `test/factories/` themselves, and sign in with a plain `signIn`. This follows Playwright's Fixtures guidance where it is strongest, per-worker resources with their setup and teardown kept together, and the inline-setup practice (Kent C. Dodds, "Avoid Nesting when you're Testing") that keeps each test's data readable in the spec, as decision 8 does for locators.
		- Rejected: fixtures that create the data (such as `signedInUser`) - hides what a test depends on behind a fixture name, the cost decision 8 turned down, and the varied setups (several users per planner, password-only sign-in users, planner contents) would each need another fixture.
		- Rejected: plain helpers only - nothing gives each worker's database connections an open and close; they'd open on import and never close.

# Rules
Each rule lands in the new `docs/e2e_tests.md`, in the section named under it. No E2E code exists yet, so most rules have no examples of following or breaking them in this codebase.

## Rule 1 - Playwright code lives in `e2e/`
Every file that imports `@playwright/test` is in the root `e2e/` folder. The one exception is `playwright.config.ts` at the repo root.
- **Check:** a file that imports `@playwright/test` and isn't in `e2e/` or `playwright.config.ts` breaks the rule.
- **Lands in:** "Where E2E Code Lives", plus an `# e2e/` entry in `docs/project_structure.md`.

## Rule 2 - Specs are named `*.spec.ts`
A file in `e2e/` that defines Playwright tests is named `<flow>.spec.ts`. Any other file in `e2e/`, such as a fixture, is not named `*.spec.ts`.
- **Check:** a file that calls `test(` must end in `.spec.ts`, and one that doesn't mustn't.
- **Examples:** the unit-test equivalent is `*.test.ts[x]`, co-located with the module it tests (`docs/unit_tests.md`, "Conventions").
- **Lands in:** "Where E2E Code Lives".

## Rule 3 - Specs are grouped by feature area
Each spec sits in the `e2e/<area>/` folder for the route its first `page.goto` opens, using this table:

| Area | Routes |
|---|---|
| `auth` | `/`, `/reset-password`, `/verify-email`, `/verify-email-change` |
| `calendar` | `/[planner]/calendar` |
| `recipes` | `/[planner]/recipes`, `/[planner]/recipes/[recipeId]` |
| `settings` | `/settings` |
| `sharing` | `/invite` |

A spec whose first route isn't in the table means a new area: the route is added to the table, to an existing area or a new one, in the same change. Playwright support code that isn't a spec sits in `e2e/_fixtures/`.
- **Check:** find the spec's first `page.goto`, look up that route in the table and compare with the folder. A route missing from the table breaks the rule until the table is updated.
- **Examples:** the first test opens `/`, so it goes in `e2e/auth/`.
- **Lands in:** "Where E2E Code Lives", with the table.

## Rule 4 - `e2e/` creates data only through the factories
No file in `e2e/` writes to the database itself. It creates users, planners and other documents only by calling the data helpers in `test/factories/`. The one exception is the session that `signIn` creates through the test-only auth instance's `getCookies`.
- **Check:** a file in `e2e/` that imports `@/_models`, `mongoose` or `mongodb`, or uses the test-only auth instance for anything except `signIn` calling `getCookies` through `(await auth.$context).test` and fixtures calling the connection functions `test/auth.ts` exports, breaks the rule.
- **Lands in:** "Test Data". `docs/project_structure.md`'s `test/` entry also names `test/factories/`.

## Rule 5 - Specs call locators directly
Specs locate elements with Playwright locators in the spec itself. No file in `e2e/` defines a page-object class. A sequence of two or more UI actions (clicks, fills, drags, gestures) that appears in more than one spec moves into a function in `e2e/_fixtures/` that takes `page` or a `Locator`, and every spec that needs it calls the function.
- **Check:** a `class` in any `e2e/` file breaks the rule. So does the same run of two or more actions on the same UI element copied into a second spec, which is a review check across specs.
- **Lands in:** "Writing Specs".

## Rule 6 - Locators follow Playwright's recommended order
Specs find elements with Playwright's built-in locators, in this order of preference: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle`. `getByTestId` is used only when none of those can pick out the element on its own, even after narrowing with `.filter()` or chaining from a parent locator. CSS and XPath selectors (`page.locator('<selector>')`) are never used.
- **Check:** any `locator('…')` call with a selector string breaks the rule. Each `getByTestId` needs a reason no user-facing locator works, which is a review check.
- **Examples:** unit tests find elements by test ID (`screen.getByTestId('delete-button')` in `docs/unit_tests.md`). That stays right for unit tests; E2E specs don't copy it.
- **Lands in:** "Writing Specs".

## Rule 7 - Factories write through `@/_models`
Files in `test/factories/` write to the database only through `@/_models` and the test-only auth instance. They never import `@/_actions`, `@/_auth`, anything in `e2e/`, or any module that imports `server-only`.
- **Check:** any of those four imports breaks the rule.
- **Examples:** `src/_actions/sharing/signUpWithInvite.ts:3` shows the import a factory must not copy: it creates the app user through `addUser` from `@/_actions/user`.
- **Lands in:** "Test Data".

## Rule 8 - The user factory creates both user records
The user factory in `test/factories/` creates, in one call, the better-auth user (through the test-only auth instance's `auth.api.createUser`, with `emailVerified: true` and an optional password; that method needs the `admin()` plugin on the instance) and the app's `User` doc, with the same email and the planners and access levels it was given. Nothing else in `test/factories/` or `e2e/` calls `auth.api.createUser` or creates a `User` doc, and nothing uses `testUtils`' `saveUser`.
- **Check:** outside the user factory, any call that creates a better-auth user or an app `User` doc breaks the rule, for example `auth.api.createUser`, `auth.api.signUpEmail`, `testUtils`' `saveUser`, `User.create`, `new User(...).save()`, `User.insertMany` or an upsert on `User`. `saveUser` breaks it anywhere, and so does a user factory that creates only one of the two records. `testUtils`' own `createUser`, which only builds a user object, doesn't count.
- **Examples:** `src/_actions/sharing/signUpWithInvite.ts:44` pairs the same two records (`createUser`, then `addUser`) in the app.
- **Lands in:** "Test Data".

## Rule 9 - The user factory generates a unique, lowercase email
Unless the caller passes an email, the user factory generates one that is unique on every call, with a random part such as `crypto.randomUUID()`, and all lowercase. Both records get that same email.
- **Check:** the default email must include a per-call random part and be lowercase. A fixed default, or a counter that restarts in each worker, breaks the rule.
- **Examples:** the unit-test builder `test/fixtures/dish.ts:4` shows the defaults-with-overrides shape, though its fixed `'dish-1'` id wouldn't be unique enough here.
- **Lands in:** "Test Data".

## Rule 10 - `testUtils` lives only in the test-only auth instance
better-auth's `testUtils` plugin is used in one file, the test-only auth instance at `test/auth.ts`, which also carries `admin()`. No other file imports or re-exports it by name, reaches it through a namespace import, `export *` or dynamic `import()` of `better-auth/plugins`, or imports from `better-auth/test`.
- **Check:** outside `test/auth.ts`, a named import or re-export of `testUtils`, a namespace import, `export *` or dynamic `import()` of `better-auth/plugins` that reaches it, or any import from `better-auth/test` breaks the rule.
- **Examples:** `src/_auth/auth.ts:14`, the app's instance, follows it: `oneTap()` and `admin()`, no `testUtils`.
- **Lands in:** "Signing In".

## Rule 11 - No cleanup and no reset
Nothing in `e2e/` or `test/factories/` deletes or drops data: no call that removes documents, collections, the database or a better-auth user, whatever library it comes from. No `afterEach`, `afterAll` or `globalTeardown` cleans up data.
- **Check:** any call whose job is to delete or drop breaks the rule, for example `deleteOne`, `deleteMany`, `findOneAndDelete`, `findByIdAndDelete`, `drop`, `dropCollection`, `dropDatabase`, `removeUser` or better-auth's `deleteUser`. So does a teardown hook that removes data.
- **Lands in:** "Test Data".

## Rule 12 - E2E tests run against a production build
`pnpm test:e2e` runs `playwright install chromium && playwright test`, and `pnpm test:e2e:trace` runs it with `--trace on`, then opens the HTML report. In `playwright.config.ts`, the Next `webServer` entry runs `next build && next start -p 3100` with `reuseExistingServer: false`. No E2E config or script runs the tests against `next dev`, or against a server that's already running. The E2E build writes to the default `.next` folder, shared with `pnpm build` (Sarah decided 2026-09-29 against a separate `distDir`: `next dev` uses `.next/dev`, the pre-commit hook never runs E2E tests, and a collision needs another build in the same checkout at the same time).
- **Check:** only `playwright.config.ts` and the `test:e2e` and `test:e2e:trace` scripts in `package.json`. `next dev` in either, or `reuseExistingServer: true`, breaks the rule.
- **Lands in:** "Running E2E Tests".

## Rule 13 - Every app environment variable gets an E2E value
At the top of `playwright.config.ts`, before any `webServer` starts, every variable in `src/env.ts` (`server` and `client`) gets a value meant for E2E: `DB_URL` is the memory server's URI captured from its `webServer` entry; `BETTER_AUTH_URL` is `http://localhost:3100`, and `test/auth.ts` uses the same URL, since `getCookies` takes the cookie's domain and secure flag from it; `BETTER_AUTH_SECRET` is the dummy secret the test-only auth instance also uses; and everything else gets a dummy value that passes `src/env.ts`'s validation, such as a valid email for `RESEND_FROM_EMAIL`. No `src/env.ts` variable falls back to `.env.local`. The variables better-auth reads on its own, because `src/_auth/auth.ts` and `src/_utils/auth/client.ts` don't pass them, are set nowhere (not in `.env.local`, not in the E2E config) until they go through `src/env.ts`: `BETTER_AUTH_SECRETS`, `AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `BASE_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `NEXT_PUBLIC_AUTH_URL` and `NEXTAUTH_URL`.
- **Check:** a key in `src/env.ts` with no E2E value, a dummy that fails the schema, or any listed variable set in `.env.local` or `playwright.config.ts` breaks the rule. Variables that don't configure the app (`NODE_ENV`, better-auth's telemetry settings, Next's own) are out of scope.
- **Examples:** `test/mocks/env.ts` follows the same idea for unit tests, with one dummy value per variable.
- **Lands in:** "Running E2E Tests".

## Rule 14 - The memory server matches Atlas's MongoDB release series
The memory server's `mongod` version is set explicitly in `package.json` (mongodb-memory-server's `config.mongodbMemoryServer.version`) to a version in the same release series (major.minor) as the Atlas cluster. The install-time download reads only that setting, so the launcher sets no version of its own (no `binary.version`). The memory-server `webServer` entry's `env` sets `MONGOMS_VERSION` from that pin and sets `MONGOMS_SYSTEM_BINARY`, `MONGOMS_DOWNLOAD_URL` and `MONGOMS_ARCHIVE_NAME` to empty strings, so no variable in the shell can swap in another `mongod` (Sarah decided 2026-09-29). `docs/e2e_tests.md` records that series. When Atlas moves to a new series, the pin and the doc change together.
- **Check:** the pinned version's major.minor must equal the series in the doc. An unset version breaks the rule, and so does a memory-server `webServer` entry that doesn't set those four variables.
- **Lands in:** "Running E2E Tests".

## Rule 15 - Specs import `test` and `expect` from `e2e/_fixtures/`
Every spec imports `test` and `expect` from `e2e/_fixtures/`, never from `@playwright/test`. Only files inside `e2e/_fixtures/` import from `@playwright/test` (`playwright.config.ts` aside).
- **Check:** a `*.spec.ts` file that imports from `@playwright/test` breaks the rule.
- **Lands in:** "Writing Specs".

## Rule 16 - Fixtures provide connections and contexts, never test data
A `test.extend` fixture in `e2e/_fixtures/` only opens, provides or closes a resource: a database connection or a browser context. It opens and closes database connections only through `test/factories/connection.ts` and `test/auth.ts`, never `mongoose` or `mongodb` directly. No fixture calls a factory that creates a user, planner or any other document. `signIn` is a plain function the spec calls, not a fixture. Neither is the memory-server launcher `memoryServer.ts`, which also sits in `e2e/_fixtures/`.
- **Check:** a `test.extend` fixture that imports from `test/factories/` other than `connection.ts`, a fixture that writes to the database, or a `signIn` written as a fixture breaks the rule.
- **Lands in:** "Test Data".

## Rule 17 - Each test creates its own data
Every user, planner and other document a test uses is created in that test by calling `test/factories/`. A spec never hard-codes an email, ID or name for data it didn't create in that test, and never uses data created in `beforeAll`, at module level or by another test.
- **Check:** email addresses or 24-character hex IDs written as string literals in a spec break the rule, and so does a factory call in `beforeAll` or at module level. Values read from what a factory returned are fine.
- **Lands in:** "Test Data".

## Rule 18 - Tests sign in with `signIn`, not the form
A test that needs a signed-in user calls `signIn` from `e2e/_fixtures/`, which adds the user's `getCookies` cookies from the test-only auth instance to a browser context. The sign-in form is filled only by tests that check signing in itself: the form, its errors or where it redirects. Specs never use Playwright's `storageState` to share a signed-in session.
- **Check:** filling the sign-in form in a spec outside `e2e/auth/` breaks the rule. In `e2e/auth/`, it breaks the rule when nothing the test asserts is about signing in. Any `storageState` breaks it.
- **Lands in:** "Signing In".

# Enforcement
Every `biome.jsonc` change below is one Sarah approved on 2026-09-29, which is the explicit instruction to make it. `files.includes` also gains `e2e/**/*` (decision 5), so Biome checks `e2e/` at all. The Biome bans run in the pre-commit `biome check` and in `pnpm lint`. Biome doesn't merge overlapping overrides (its configuration reference: when a file matches several override patterns, only the first is used), so each set of files gets one override holding every ban and relaxation that applies to it, ordered most specific first. The existing override at `biome.jsonc:22` (`test/**/*` and `**/*/*.test.ts*`, which turns a11y and `noImgElement` off and puts test libraries first in the import order) also matches unit tests in `src/`, so the file sets are: `test/auth.ts`; `test/factories/**`; the rest of `test/**` and `src/` test files; the rest of `src/**`; `e2e/_fixtures/**`; and the rest of `e2e/**`. Each ban is checked once with a deliberately wrong import. Biome's GritQL plugins could match call patterns such as `page.locator('…')`, but Biome's docs say plugin support still has bugs, so none of these rules relies on them.

- **Rule 1:** Biome. An override for `src/**` and `test/**` turns on `style/noRestrictedImports`, banning `@playwright/test` with a message pointing to `docs/e2e_tests.md`.
- **Rule 2:** config plus process. `vitest.config.ts` includes only `**/*.test.{ts,tsx}` and excludes `e2e/**`, so Vitest never runs a spec whatever it's named. A test file in `e2e/` not named `*.spec.ts` is silently skipped by Playwright; nothing can flag that from the file, so whoever writes a spec checks that Playwright's report lists the new tests.
- **Rule 3:** process. Placement depends on a spec's first `page.goto` and the route table in `docs/e2e_tests.md`, which no type or lint rule can read.
- **Rule 4:** Biome, plus process. An override for `e2e/**` bans `mongoose`, `mongodb`, `@/_models` and `@/_models/**`, with a message pointing to `test/factories/`. Other uses of the test-only auth instance are process only: `signIn` imports the instance, and Biome can't ban single methods.
- **Rule 5:** process. Biome has no stable rule banning `class` declarations, and duplicated action sequences are found by comparing specs in review.
- **Rule 6:** process. Catching selector strings needs call-pattern matching, and whether a `getByTestId` was needed is a review judgment.
- **Rule 7:** Biome, plus a runtime error. An override for `test/factories/**` bans `@/_actions`, `@/_actions/**`, `@/_auth`, `@/_auth/**` and `server-only`. A factory that pulls in a `server-only` module indirectly throws as soon as `pnpm test:e2e` loads it. Imports from `e2e/` are process only, since they'd be relative paths Biome's patterns may not match reliably.
- **Rule 8:** the first E2E test, plus process. With no better-auth user, `getCookies` fails; with no app `User` doc, `src/app/page.tsx:39` creates a new user and planner, so the test lands on the wrong planner and fails. Other calls that create either record are process only. Runs in `pnpm test:e2e`, not before commits.
- **Rule 9:** E2E failures, plus process. better-auth's admin `createUser` rejects an email that already exists (`USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`), and the user factory calls it first: a fixed default fails on the second call, while a per-worker counter fails only when workers collide. The unique index on `User.email` (`src/_models/user/user.ts:12`) isn't the backstop, because Mongoose builds it in the background on the fresh database. A mixed-case email makes `src/app/page.tsx:24` miss the user, so the first test fails. How the email is generated is checked in review.
- **Rule 10:** Biome. An override for `src/**`, `test/**` and `e2e/**`, leaving out `test/auth.ts`, bans `testUtils` from `better-auth/plugins` (`importNames: ["testUtils"]`) and all of `better-auth/test`. `better-auth/plugins` is the package's only export of `testUtils` in 1.5.6. Namespace imports, `export *` and dynamic imports that reach it are process only. `better-auth/test` is declared in better-auth's `package.json` but not shipped in 1.5.6; banning it now covers it once it ships. Sarah asked for the `src/` ban in decision 6 and approved extending it on 2026-09-29.
- **Rule 11:** process. Delete and drop calls or teardown hooks need call-pattern matching, and the imports they come from are ones the factories need.
- **Rule 12:** process. The rule lives in two command strings (`playwright.config.ts`'s `webServer` and `package.json`'s `test:e2e`) that no type or lint rule can check. As a partial backstop, Next 16 refuses a second `next dev` sharing `.next` while Sarah's `pnpm dev` runs.
- **Rule 13:** a type. `playwright.config.ts` declares its E2E values as one object that `satisfies Record<Exclude<keyof typeof env, 'DB_URL'>, string>`, with `env` from a type-only import of `src/env.ts` (which runs no validation). `DB_URL` is left out because it comes from the memory server's `webServer` capture after the config loads. Caught by `pnpm check:types`, which `/implement` runs after every step; the pre-commit type check only covers staged `src/` test files. A dummy that fails `src/env.ts`'s schema fails `next build` at the start of `pnpm test:e2e`. A listed better-auth variable set in `.env.local` is process only.
- **Rule 14:** process. Nothing in tests or CI can read Atlas's version without Atlas credentials, which decision 3 avoided. A hand-run check script waits on [[Atlas Version Check Script]].
- **Rule 15:** Biome. An override for `e2e/**`, leaving out `e2e/_fixtures/**`, bans `@playwright/test` with a message pointing specs to `e2e/_fixtures/`. With Rule 1's ban, only `e2e/_fixtures/` and `playwright.config.ts` can import Playwright.
- **Rule 16:** partly Biome through Rule 4, which stops a fixture writing documents directly. A fixture calling a data factory in `test/factories/` is process only: the import is a relative path, and fixtures do import `connection.ts` from the same folder.
- **Rule 17:** E2E failures, plus process. The fresh database makes a hard-coded email or ID for data the test didn't create find nothing, and a hard-coded email passed to the user factory fails better-auth's duplicate-email check on a retry or second use. Data created in `beforeAll` or at module level is process only.
- **Rule 18:** process. `storageState` is an option on Playwright's API, not an import, and whether a form-filling test is about signing in is a review judgment.

# Migration Checklist
*Audited 2026-09-29 by reading code.*

## Setup
- [ ] Add `@playwright/test` and `mongodb-memory-server` as dev dependencies, and list `mongodb-memory-server` in `onlyBuiltDependencies` (`pnpm-workspace.yaml:1`) so its `mongod` downloads at install.
- [ ] `.gitignore`: Playwright's output (`test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`).
- [ ] `playwright.config.ts` (Rules 12, 13, 14): `testDir: 'e2e'`; the E2E env object with Rule 13's type; a memory-server `webServer` entry running `e2e/_fixtures/memoryServer.ts`, with the version pinned in `package.json` to Atlas's release series (Sarah reads it from the Atlas console), and `DB_URL` captured through `wait`; the Next entry `next build && next start -p 3100`, `reuseExistingServer: false`, with `webServer.timeout` raised for the build. Confirm (decision 7) that a `webServer` entry with only `wait` is accepted, and that the captured `DB_URL` reaches the worker processes.
- [ ] `package.json`: `test:e2e` runs `playwright test` (Rule 12).
- [ ] `test/auth.ts` (Rules 10, 13, 16): the test-only instance with `testUtils()` and `admin()`, the shared dummy secret and `BETTER_AUTH_URL`, its own MongoClient, and connect/close exports for fixtures.
- [ ] `test/factories/connection.ts` (Rule 16): the Mongoose connect/disconnect functions.
- [ ] `test/factories/`: the user factory (Rules 7, 8, 9) and a planner factory (Rule 7).
- [ ] `e2e/_fixtures/` (Rules 15, 16, 18): the extended `test` and `expect`, with a worker-scoped automatic fixture that opens and closes both connections, and the plain `signIn(context, user)`. Confirm `getCookies`' `expires` is in the unit `context.addCookies` expects.

## First test
- [ ] A user created through the factories, with an owned planner, signed in with `signIn`, visits `/` and lands on `/<plannerId>/calendar`, in `e2e/auth/`. It confirms a bare `getCookies` session cookie is accepted while `cookieCache` is on (decision 6). Sarah decided 2026-09-29; she cares less about the flow than about proving every piece is wired up.

## Config
- [ ] `vitest.config.ts` (`vitest.config.ts:14`): `include` only `**/*.test.{ts,tsx}` (the project's unit-test naming) and exclude `e2e/**`, keeping Vitest's default excludes. Sarah asked for this change 2026-09-29.
- [ ] `biome.jsonc`: `files.includes` gains `e2e/**/*` (`biome.jsonc:3`); one override per file set as Enforcement lists, merged with the existing override at `biome.jsonc:22`; each ban checked once with a deliberately wrong import.

## Docs
- [ ] New `docs/e2e_tests.md`: "Where E2E Code Lives" (Rules 1-3, with the area table), "Writing Specs" (Rules 5, 6, 15), "Test Data" (Rules 4, 7, 8, 9, 11, 16, 17), "Signing In" (Rules 10, 18) and "Running E2E Tests" (Rules 12-14, with the Atlas series recorded). Sarah decided 2026-09-29.
- [ ] AGENTS.md's "Docs" list: "`docs/e2e_tests.md`: before writing E2E tests".
- [ ] `docs/project_structure.md`: an `# e2e/` entry, and the `test/` entry moved out from under `# src/` to the top level (`docs/project_structure.md:29`), covering `fixtures/`, `utils/`, `factories/` and `auth.ts` as well as the setup script and mocks. Sarah decided 2026-09-29 to fix the misplaced entry here (Boy Scout rule), since this story rewrites it anyway.

## Tests and mocks
None: no module in `src/` moves, and files in `test/` have no tests of their own.

# Out of Scope
- Handling email confirmation in auth flows. Sarah decided 2026-09-28 that it gets worked out with the auth flow tests in [[Core Flows E2E Tests]].

# Implementation
## Step 1: E2E runner
**Idea:** `pnpm test:e2e` runs a spec against a production build of the app backed by a throwaway memory-server database.

**Source:** Migration Checklist → Setup: dev dependencies and `onlyBuiltDependencies`; `.gitignore`; `playwright.config.ts`; `package.json` `test:e2e`. Rules 1, 2, 3, 12, 13, 14, 15. Decision 7's confirmation that a `webServer` entry with only `wait` is accepted. Pulled in by Sarah 2026-09-29: which browsers the tests run in. Sarah decided: two projects, desktop Chromium and an emulated Pixel phone, so only Chromium is installed. Pulled in by Sarah 2026-09-29: where the memory-server launcher lives. Sarah decided: `e2e/_fixtures/memoryServer.ts` (Rule 16 now says it isn't a fixture).

**Approach:** Decisions 3 and 7, Rules 12-14. The `mongod` version is pinned in `package.json` `config.mongodbMemoryServer.version` (Rule 14), in the Atlas cluster's release series: ask Sarah for the version from the Atlas console. The first `webServer` entry runs `e2e/_fixtures/memoryServer.ts`, which starts `MongoMemoryServer` with no version of its own, reads the running `mongod`'s version from the server itself (a `buildInfo` command on its URI, not the configured value), logs that version and the URI, and stays running. Playwright captures the URI into `DB_URL` through `wait` named groups. The second entry runs `next build && next start -p 3100` with `reuseExistingServer: false` and a `timeout` raised to cover the build. Both entries set `stdout: 'pipe'` so their output shows in the run. The E2E env object sits at the top of the config with Rule 13's `satisfies` type and a type-only import of `src/env.ts`, and is copied into `process.env` before any `webServer` starts. The config sets `reporter: [['list'], ['html', { open: 'never' }]]` and two projects, `desktop` (Desktop Chrome) and `phone` (Pixel 7). Confirm a `webServer` entry with only `wait` (no `url` or `port`) is accepted. `e2e/_fixtures/index.ts` exports `test` and `expect` (Rule 15), plain for now; Step 2 extends `test`. The spec is scaffolding: signed out, it opens `/` and sees the sign-in prompt, using a `getByRole` locator (Rule 6). Step 2 replaces its body with the first real test. Chromium is installed with `pnpm exec playwright install chromium` (ask Sarah before downloading).

**Files:**
- `package.json` - `@playwright/test` and `mongodb-memory-server` dev dependencies; `test:e2e` runs `playwright test`; `config.mongodbMemoryServer.version`
- `pnpm-lock.yaml` - the new dependencies
- `pnpm-workspace.yaml` - `mongodb-memory-server` in `onlyBuiltDependencies`, so the pinned `mongod` downloads at install
- `.gitignore` - `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`
- `playwright.config.ts` (new) - `testDir: 'e2e'`, the reporters, the `desktop` and `phone` projects, the E2E env object, both `webServer` entries
- `e2e/_fixtures/memoryServer.ts` (new) - the launcher the first `webServer` entry runs
- `e2e/_fixtures/index.ts` (new) - exports `test` and `expect` for specs
- `e2e/auth/homeRedirect.spec.ts` (new) - scaffold spec: signed out, `/` shows the sign-in prompt

**Acceptance:**
- [x] Delete `node_modules/.cache/mongodb-memory-server/`, run `pnpm rebuild mongodb-memory-server`, then list that folder. See one `mongod` binary whose name has the pinned version, in the Atlas cluster's release series, and no other version.
- [x] With `pnpm dev` running in another terminal, run `pnpm test:e2e`. See the memory server log that same `mongod` version and a `mongodb://127.0.0.1:<port>/` URI, then `next build` run, then one test pass in the `desktop` project and one in the `phone` project. `pnpm dev` keeps running and serving `localhost:3000` throughout.
- [x] Run `pnpm test:e2e` a second time. See a different port in the memory server's URI.
- [x] Stop `pnpm dev`. Temporarily rename `.env.local` to `.env.local.bak`, run `pnpm test:e2e`, see both tests still pass, so no value comes from `.env.local`. Rename it back.
- [x] Run `pnpm test:e2e --trace on`, then `pnpm exec playwright show-report`. Open each test's trace. See the sign-in prompt at desktop width in the `desktop` test and at phone width in the `phone` test, both on `http://localhost:3100/`.
- [x] After a run, run `git status`. See no `test-results/` or `playwright-report/`.
- [x] Temporarily delete `RESEND_FROM_EMAIL` from the E2E env object in `playwright.config.ts`, run `pnpm check:types`, see an error naming `RESEND_FROM_EMAIL` as missing. Revert.
- [x] Temporarily set `RESEND_FROM_EMAIL` in the E2E env object to `not-an-email`, run `pnpm test:e2e`, see `next build` fail with an invalid environment variable error for `RESEND_FROM_EMAIL`. Revert.

**Status:** ✅ Complete

**As built:**
- The pinned `mongod` is 8.0.32, the Atlas cluster's version.
- The launcher doesn't log the `mongod` version. Instead, the memory-server `webServer` entry's `env` forces the pinned version over anything set in the shell: `MONGOMS_VERSION` is read from `package.json`'s `config.mongodbMemoryServer.version`, and `MONGOMS_SYSTEM_BINARY`, `MONGOMS_DOWNLOAD_URL` and `MONGOMS_ARCHIVE_NAME` are set to empty strings. Sarah decided 2026-09-29, so acceptance check 2 no longer looks for a version in the log.
- `test:e2e` runs `playwright install chromium && playwright test`, so a fresh clone needs no separate browser install. Sarah chose this over a `postinstall` script, which would download Chromium on every `pnpm install`.
- `test:e2e:trace` runs the E2E tests with `--trace on`, passing any spec path to the test run, then opens the HTML report even when tests fail. Added at Sarah's request during review.
- `package.json` declares `"type": "module"`, which Node's docs recommend and which stops Node warning when it runs the launcher. Sarah decided 2026-09-29.
- `tsconfig.json`'s `target` is `ES2022` instead of `es5`, matching the browsers Next.js 16 supports. The ES5 target rejected top-level `await` in the launcher and named groups in the config's `wait` regex. Sarah pulled it in from the out-of-scope list.
- The scaffold spec expects the Email field, `getByRole('textbox', { name: 'Email' })`, since the prompt's message is a paragraph with no accessible name. Sarah chose it.
- The Next `webServer` entry waits on `url` (`http://localhost:3100`), and the config sets `use.baseURL` to the same URL, since Playwright needs an explicit `baseURL` when `webServer` is a list. Its `timeout` is 120 seconds; the build takes about 12.

## Step 2: First test
**Idea:** A test signs in a user made by the factories, then sees `/` send that user to their planner's calendar.

**Source:** Migration Checklist → Setup: `test/auth.ts`; `test/factories/connection.ts`; `test/factories/` user and planner factories; `e2e/_fixtures/`. Migration Checklist → First test. Rules 4, 7, 8, 9, 10, 11, 16, 17, 18. Decision 6's `cookieCache` confirmation; decision 7's confirmation that the captured `DB_URL` reaches the worker processes.

**Approach:** Decisions 2, 6 and 9, Rules 7-11 and 16-18. `test/auth.ts` builds the test-only instance with `testUtils()` and `admin()`, the same dummy `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (`http://localhost:3100`) that `playwright.config.ts` sets, and its own `MongoClient` on `DB_URL`; it exports connect and close functions. The user factory creates the better-auth user through `auth.api.createUser` (`emailVerified: true`, optional password) and the app `User` doc through `User.create` from `@/_models/user`, with the default email `` `e2e-${crypto.randomUUID()}@example.com` `` (no `.toLowerCase()`, so the template itself stays lowercase) and the planners and access levels it's given. The planner factory creates a `Planner` through `@/_models/planner`. `e2e/_fixtures/index.ts` extends `test` with one worker-scoped automatic fixture that opens and closes both connections. `signIn(context, user)` adds the user's `getCookies` cookies (from `(await auth.$context).test`) to the context; confirm `getCookies`' `expires` is in the unit `context.addCookies` expects. The spec's body is replaced by one test, `signed-in user lands on their planner calendar`: it creates a planner and an owner of it, signs in, opens `/`, expects `/<plannerId>/calendar` and expects the calendar view to be visible, found with a user-facing locator (Rule 6), so a calendar route that errors or 404s fails the test. Nothing deletes data (Rule 11).

**Files:**
- `test/auth.ts` (new) - the test-only auth instance and its connection functions
- `test/factories/connection.ts` (new) - Mongoose connect and disconnect
- `test/factories/user.ts` (new) - the user factory
- `test/factories/planner.ts` (new) - the planner factory
- `e2e/_fixtures/index.ts` - `test` extended with the worker connection fixture
- `e2e/_fixtures/signIn.ts` (new) - `signIn`
- `e2e/auth/homeRedirect.spec.ts` - the scaffold test replaced by the first test

**Acceptance:**
- [x] Run `pnpm test:e2e --trace on`, then `pnpm exec playwright show-report`. See `signed-in user lands on their planner calendar` pass in `desktop` and `phone`. Open each trace. See the page start at `/` and end on `/<plannerId>/calendar` showing the planner layout's header and the calendar, not the sign-in prompt, at desktop width and at phone width.

App code: each check breaks the behavior the test covers.
- [x] Temporarily change `src/app/page.tsx:36` from `` redirect(`${plannerId}/calendar`) `` to `` redirect(`${plannerId}/recipes`) ``, run `pnpm test:e2e e2e/auth/homeRedirect.spec.ts`, see `signed-in user lands on their planner calendar` fail in `desktop` and `phone` on the URL assertion, with `/<plannerId>/recipes` as the received URL. Revert.
- [x] Temporarily change `src/app/page.tsx:24` from `User.findOne({ email: session.user.email })` to `User.findOne({ email: 'nobody@example.com' })`, run the same command, see the test fail in `desktop` and `phone` on the URL assertion, with `/` as the received URL (the page errors when `addUser` tries a second `User` doc with the same email). Revert.
- [x] Temporarily change `src/app/page.tsx:17` from `headers: await headers(),` to `headers: new Headers([...(await headers())].filter(([name]) => name !== 'cookie')),`, run the same command, see the test fail in `desktop` and `phone` on the URL assertion, with `/` as the received URL (the sign-in prompt). Revert.
- [x] Temporarily add `notFound();` as the first line of `CalendarPage` in `src/app/[planner]/calendar/page.tsx`, with `import { notFound } from 'next/navigation';`, run the same command, see the test fail in `desktop` and `phone` on the calendar-view assertion while the URL assertion passes (the right URL shows a 404). Revert.

Test harness: each check breaks a factory or `signIn`, proving the first test catches it (Enforcement for Rules 8 and 9 relies on this).
- [x] Temporarily change the `context.addCookies(...)` call in `e2e/_fixtures/signIn.ts` to `context.addCookies([])`, run `pnpm test:e2e e2e/auth/homeRedirect.spec.ts`, see `signed-in user lands on their planner calendar` fail in `desktop` and `phone` on the URL assertion, with `/` as the received URL (the sign-in prompt). Revert.
- [x] Temporarily remove the `User.create(...)` call from `test/factories/user.ts`, run `pnpm test:e2e e2e/auth/homeRedirect.spec.ts`, see `signed-in user lands on their planner calendar` fail in `desktop` and `phone` on the URL assertion, with a different planner ID in the received URL (`src/app/page.tsx` made a new user and planner). Revert.
- [x] Temporarily pass `other-${crypto.randomUUID()}@example.com` as the email to `auth.api.createUser` in `test/factories/user.ts`, leaving the `User` doc's email as it is, run `pnpm test:e2e e2e/auth/homeRedirect.spec.ts`, see `signed-in user lands on their planner calendar` fail in `desktop` and `phone` on the URL assertion, with a different planner ID in the received URL. Revert.
- [x] Temporarily change the user factory's default email to the fixed `e2e@example.com`, run `pnpm test:e2e e2e/auth/homeRedirect.spec.ts --workers=1`, see `signed-in user lands on their planner calendar` pass in one project and fail in the other with "User already exists. Use another email." from `auth.api.createUser` in the user factory. Revert.
- [x] Temporarily change the user factory's default email template to `` `E2E-${crypto.randomUUID()}@example.com` ``, run `pnpm test:e2e e2e/auth/homeRedirect.spec.ts`, see `signed-in user lands on their planner calendar` fail in `desktop` and `phone` on the URL assertion, with a different planner ID in the received URL. Revert.

**Status:** ✅ Complete

**As built:**
- `test/auth.ts` and `test/factories/connection.ts` read `DB_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from `@/env`, so the values come from `playwright.config.ts` alone and a later seed script picks up the dev values. Sarah decided 2026-09-29.
- The user factory is `createUser({ planners, email?, password?, name? })`: `planners` is required, `name` defaults to `'New User'`, and there's no default password. It returns `{ id, email, name, password, planners }`, where `id` is the better-auth user id that `signIn` reads. Sarah decided 2026-09-29.
- The planner factory is `createPlanner(overrides)`, taking `Partial<PlannerInterface>` with `addPlanner`'s defaults, and returns the saved `Planner` document. Sarah decided 2026-09-29.
- `src/_models/user/user.ts`, `src/_models/planner/planner.ts` and `src/_models/sharing/pendingInvite.ts` read `models` from mongoose's default export (`mongoose.models.X`), because mongoose doesn't export `models` to ES modules and Playwright loads the factories as ES modules. Sarah decided 2026-09-29.
- `e2e/_fixtures/index.ts` also re-exports `signIn`, so specs import it with `test` and `expect`.
- The spec finds the calendar view with `getByRole('grid')`, which the default month view renders on desktop and phone.
- App-code checks 2-4 were reworded after they didn't run as written. Check 2's received URL is `/`, because `addUser` hits the unique `email` index. Checks 3 and 4 as planned failed `next build`'s type check, so Sarah chose the cookie-stripping edit and a `notFound()` in `CalendarPage` instead.

## Step 3: E2E docs
**Idea:** The docs describe the E2E convention where agents and Sarah will look for it.

**Source:** Migration Checklist → Docs: `docs/e2e_tests.md`; AGENTS.md's Docs list; `docs/project_structure.md` `# e2e/` entry and top-level `test/` entry (Sarah decided 2026-09-29 to fix the misplaced entry here). Rules 1-18 "Lands in". Boy Scout fix: `docs/project_structure.md:7-8` describes `# scripts/` as "lefthook scripts", but it also holds the vault scripts (`vault-lint.sh`, `note-refs.sh`, `vault-orphans.sh`, `note-section.sh`), found by plan-checker during /plan-steps 2026-09-29.

**Approach:** Rules' "Lands in" lines. `docs/e2e_tests.md` has "Where E2E Code Lives" (Rules 1-3, with the area table and the launcher in `e2e/_fixtures/`), "Writing Specs" (Rules 5, 6, 15), "Test Data" (Rules 4, 7, 8, 9, 11, 16, 17, with Rule 16 covering `test.extend` fixtures only), "Signing In" (Rules 10, 18) and "Running E2E Tests" (Rules 12-14, with the Atlas release series and the `package.json` pin Step 1 set, and Rule 13's list of better-auth variables that are set nowhere). Each Rule keeps its Check. It matches the style of `docs/unit_tests.md`.

**Files:**
- `docs/e2e_tests.md` (new) - the convention
- `AGENTS.md` - "`docs/e2e_tests.md`: before writing E2E tests" in the Docs list
- `docs/project_structure.md` - an `# e2e/` entry; the `test/` entry moved to the top level, covering `fixtures/`, `utils/`, `factories/` and `auth.ts` as well as the setup script and mocks; the `# docs/` description names E2E tests; Boy Scout fix to the `# scripts/` description

**Acceptance:**
- [ ] Read `docs/e2e_tests.md` top to bottom, as someone about to write a new spec with no access to the note. See that each section makes sense on its own: what to do, where things go and why, with nothing that only the note explains.
- [ ] In `docs/e2e_tests.md`, see Rules 1-3 with the area table under "Where E2E Code Lives", Rules 5, 6 and 15 under "Writing Specs", Rules 4, 7, 8, 9, 11, 16 and 17 under "Test Data", Rules 10 and 18 under "Signing In", and Rules 12-14 under "Running E2E Tests", each with its Check. Under "Where E2E Code Lives", see `e2e/_fixtures/memoryServer.ts` named as the memory-server launcher. Under "Test Data", see Rule 16 apply to `test.extend` fixtures. Under "Running E2E Tests", see Rule 14 name `package.json` `config.mongodbMemoryServer.version` and not `binary.version`, the same release series as the pin in `package.json`, the four `MONGOMS_*` variables the memory-server entry sets, and the better-auth variables that are set nowhere.
- [ ] Open `docs/project_structure.md`. See `# e2e/` as a top-level entry describing specs grouped by feature area plus `_fixtures/`, and `# test/` as a top-level entry, no longer under `# src/`. Under `# test/`, see `fixtures/`, `utils/`, `factories/`, `auth.ts`, the setup script and `mocks/`. See `# docs/` mention E2E tests and `# scripts/` mention the vault scripts.
- [ ] Open `AGENTS.md`. See `docs/e2e_tests.md` in the Docs list.

## Step 4: Biome checks `e2e/`
**Idea:** Biome lints and formats files in `e2e/` the same way it does `src/` and `test/`.

**Source:** Migration Checklist → Config: `biome.jsonc` `files.includes` gains `e2e/**/*` (decision 5).

**Approach:** Decision 5. Add `e2e/**/*` to `files.includes` at `biome.jsonc:3`, so the pre-commit `biome check` and `pnpm lint` cover the E2E code from here on. The import bans come in Step 5. Before the change, the implementer confirms `pnpm biome check e2e` processes no files.

**Files:**
- `biome.jsonc` - `e2e/**/*` in `files.includes`
- `e2e/_fixtures/memoryServer.ts`, `e2e/_fixtures/index.ts`, `e2e/_fixtures/signIn.ts`, `e2e/auth/homeRedirect.spec.ts` - any formatting or lint fixes `pnpm lint` makes in the files Steps 1 and 2 wrote

**Acceptance:**
- [ ] Run `pnpm biome check e2e`. See it check the four files in `e2e/`.
- [ ] Temporarily change a single-quoted string in `e2e/auth/homeRedirect.spec.ts` to double quotes, run `pnpm biome check e2e`, see a formatting error on that line. Revert.

## Step 5: Biome import bans
**Idea:** Biome rejects every import the E2E Rules forbid, each in the files the Rule covers.

**Source:** Migration Checklist → Config: `biome.jsonc` overrides. Enforcement for Rules 1, 4, 7, 10 and 15.

**Approach:** Enforcement's opening paragraph and its Rule 1, 4, 7, 10 and 15 entries. One override per file set, ordered most specific first, each holding every `style/noRestrictedImports` ban and relaxation that applies to its files, each ban with its message. The existing test override at `biome.jsonc:22` (`test/**/*` and `**/*/*.test.ts*`) holds two settings its files must keep: a11y and `noImgElement` off, and an `assist.actions.source.organizeImports.options.groups` list (the main groups list with `vitest`, `vitest/**`, `@vitest/*` and `@testing-library/*` as the first block). Both go into every override below whose files it matched, marked "test settings":
- `test/auth.ts`: `@playwright/test` (Rule 1); test settings.
- `test/factories/**`: `@playwright/test` (Rule 1); `testUtils` from `better-auth/plugins` and all of `better-auth/test` (Rule 10); `@/_actions`, `@/_actions/**`, `@/_auth`, `@/_auth/**`, `server-only` (Rule 7); test settings.
- the rest of `test/**` with `src/` test files: Rules 1 and 10; test settings.
- the rest of `src/**`: Rules 1 and 10.
- `e2e/_fixtures/**`: `mongoose`, `mongodb`, `@/_models`, `@/_models/**` (Rule 4); Rule 10.
- the rest of `e2e/**`: Rules 4 and 10, plus `@playwright/test` pointing to `e2e/_fixtures/` (Rule 15).

The implementer verifies the overrides statically before handing the step over: every ban in every file set it belongs to, each with a deliberately wrong import in a file from that set (bare paths and `/**` patterns separately, and Rule 10's `better-auth/test`); that the real files stay clean (`mongodb-memory-server` in `e2e/_fixtures/memoryServer.ts`, `mongodb` and `testUtils` in `test/auth.ts`, `@playwright/test` in `e2e/_fixtures/index.ts`); and that the files relying on the test relaxation (`<img` at `test/mocks/@mantine/core.tsx:49`, `<div onClick=...>` at `src/_components/Calendar/_components/DishListItem/DishListItem.test.tsx:190`) show no a11y or `noImgElement` errors, as before; and that `pnpm biome check` wants no import-order changes in `test/` or `src/` test files.

**Files:**
- `biome.jsonc` - the six overrides, the existing test override merged into them

**Acceptance:**
- [ ] Temporarily add `import { test } from '@playwright/test'` to `src/env.ts`, run `pnpm biome lint src/env.ts`, see a `noRestrictedImports` error pointing to `docs/e2e_tests.md`. Revert.
- [ ] Temporarily add `import { User } from '@/_models/user'` and `import { test } from '@playwright/test'` to `e2e/auth/homeRedirect.spec.ts`, run `pnpm biome lint e2e/auth/homeRedirect.spec.ts`, see an error on each, pointing to `test/factories/` and `e2e/_fixtures/`. Revert.
- [ ] Run `pnpm biome check src test e2e`. See no errors, so the test files keep their import order.

## Step 6: Vitest runs only unit tests
**Idea:** Vitest picks up only `*.test.ts[x]` files and never looks in `e2e/`.

**Source:** Migration Checklist → Config: `vitest.config.ts`. Rule 2's enforcement.

**Approach:** Rule 2's enforcement. `test.include` becomes `['**/*.test.{ts,tsx}']` and `test.exclude` adds `e2e/**` to Vitest's `configDefaults.exclude`, keeping its defaults. Sarah asked for this config change 2026-09-29. Before the change, the implementer confirms `pnpm vitest run e2e` tries to run `e2e/auth/homeRedirect.spec.ts`, and records the test file and test counts `pnpm vitest run src` reports.

**Files:**
- `vitest.config.ts` - `include` and `exclude`

**Acceptance:**
- [ ] Run `pnpm vitest run e2e`. See "No test files found".
- [ ] Run `pnpm vitest run src`. See the same test file and test counts the implementer recorded before the change.
- [ ] Temporarily add `src/scratch.spec.ts` holding `import { test, expect } from 'vitest'; test('x', () => expect(1).toBe(2))`, run `pnpm vitest run src`, see it isn't run and nothing fails. Delete it.
