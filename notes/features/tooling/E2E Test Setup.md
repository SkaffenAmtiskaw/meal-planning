---
type: pattern
status: spec
blocked-by: []
confirmed: 2026-09-29
---
# Where It Stands

Rules approved. Next: /plan-steps ^status

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
`pnpm test:e2e` runs `playwright test`. In `playwright.config.ts`, the Next `webServer` entry runs `next build && next start -p 3100` with `reuseExistingServer: false`. No E2E config or script runs the tests against `next dev`, or against a server that's already running. The E2E build writes to the default `.next` folder, shared with `pnpm build` (Sarah decided 2026-09-29 against a separate `distDir`: `next dev` uses `.next/dev`, the pre-commit hook never runs E2E tests, and a collision needs another build in the same checkout at the same time).
- **Check:** only `playwright.config.ts` and the `test:e2e` script in `package.json`. `next dev` in either, or `reuseExistingServer: true`, breaks the rule.
- **Lands in:** "Running E2E Tests".

## Rule 13 - Every app environment variable gets an E2E value
At the top of `playwright.config.ts`, before any `webServer` starts, every variable in `src/env.ts` (`server` and `client`) gets a value meant for E2E: `DB_URL` is the memory server's URI captured from its `webServer` entry; `BETTER_AUTH_URL` is `http://localhost:3100`, and `test/auth.ts` uses the same URL, since `getCookies` takes the cookie's domain and secure flag from it; `BETTER_AUTH_SECRET` is the dummy secret the test-only auth instance also uses; and everything else gets a dummy value that passes `src/env.ts`'s validation, such as a valid email for `RESEND_FROM_EMAIL`. No `src/env.ts` variable falls back to `.env.local`. The variables better-auth reads on its own, because `src/_auth/auth.ts` and `src/_utils/auth/client.ts` don't pass them, are set nowhere (not in `.env.local`, not in the E2E config) until they go through `src/env.ts`: `BETTER_AUTH_SECRETS`, `AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `BASE_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `NEXT_PUBLIC_AUTH_URL` and `NEXTAUTH_URL`.
- **Check:** a key in `src/env.ts` with no E2E value, a dummy that fails the schema, or any listed variable set in `.env.local` or `playwright.config.ts` breaks the rule. Variables that don't configure the app (`NODE_ENV`, better-auth's telemetry settings, Next's own) are out of scope.
- **Examples:** `test/mocks/env.ts` follows the same idea for unit tests, with one dummy value per variable.
- **Lands in:** "Running E2E Tests".

## Rule 14 - The memory server matches Atlas's MongoDB release series
The memory server's `mongod` version is set explicitly (mongodb-memory-server's `binary.version`) to a version in the same release series (major.minor) as the Atlas cluster. `docs/e2e_tests.md` records that series. When Atlas moves to a new series, the pin and the doc change together.
- **Check:** the pinned version's major.minor must equal the series in the doc. An unset version breaks the rule.
- **Lands in:** "Running E2E Tests".

## Rule 15 - Specs import `test` and `expect` from `e2e/_fixtures/`
Every spec imports `test` and `expect` from `e2e/_fixtures/`, never from `@playwright/test`. Only files inside `e2e/_fixtures/` import from `@playwright/test` (`playwright.config.ts` aside).
- **Check:** a `*.spec.ts` file that imports from `@playwright/test` breaks the rule.
- **Lands in:** "Writing Specs".

## Rule 16 - Fixtures provide connections and contexts, never test data
A fixture in `e2e/_fixtures/` only opens, provides or closes a resource: a database connection or a browser context. It opens and closes database connections only through `test/factories/connection.ts` and `test/auth.ts`, never `mongoose` or `mongodb` directly. No fixture calls a factory that creates a user, planner or any other document. `signIn` is a plain function the spec calls, not a fixture.
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
Every `biome.jsonc` change below is one Sarah approved on 2026-09-29, which is the explicit instruction to make it. `files.includes` also gains `e2e/**/*` (decision 5), so Biome checks `e2e/` at all. The Biome bans run in the pre-commit `biome check` and in `pnpm lint`. Biome doesn't merge overlapping overrides (its configuration reference: when a file matches several override patterns, only the first is used), so each set of files gets one override holding every ban and relaxation that applies to it, ordered most specific first. The existing override at `biome.jsonc:22` (`test/**/*` and `**/*/*.test.ts*`, which turns a11y and `noImgElement` off) also matches unit tests in `src/`, so the file sets are: `test/auth.ts`; `test/factories/**`; the rest of `test/**` and `src/` test files; the rest of `src/**`; `e2e/_fixtures/**`; and the rest of `e2e/**`. Each ban is checked once with a deliberately wrong import. Biome's GritQL plugins could match call patterns such as `page.locator('…')`, but Biome's docs say plugin support still has bugs, so none of these rules relies on them.

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
- [ ] `playwright.config.ts` (Rules 12, 13, 14): `testDir: 'e2e'`; the E2E env object with Rule 13's type; a memory-server `webServer` entry pinned to Atlas's release series (Sarah reads it from the Atlas console), with `DB_URL` captured through `wait`; the Next entry `next build && next start -p 3100`, `reuseExistingServer: false`, with `webServer.timeout` raised for the build. Confirm (decision 7) that a `webServer` entry with only `wait` is accepted, and that the captured `DB_URL` reaches the worker processes.
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
