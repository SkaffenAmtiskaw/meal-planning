This doc is for anyone writing, reviewing or running E2E tests. It says where E2E code lives and how a run works. It also gives the rules that keep tests reliable and keep test-only code, real data and real email apart from them, each with what goes wrong if you break it. Which E2E tests a change needs is in `docs/e2e_coverage.md`. Everything else about how E2E code is organised, such as what specs share, where a helper lives or how a spec is split, is left to whoever writes it.

# E2E Test Tooling
- E2E tests use [Playwright](https://playwright.dev/docs/intro) (`@playwright/test`).
- They run against a production build of the app, backed by a throwaway MongoDB database from [`mongodb-memory-server`](https://typegoose.github.io/mongodb-memory-server/). Every run starts with an empty database.
- Almost every test runs twice: in the `desktop` project (Desktop Chrome) and in the `phone` project (an emulated Pixel 7, with touch). A test that covers a workflow specific to one form factor runs only in that form factor's project. It's tagged `@desktop-only` or `@phone-only`, as in `test('<name>', { tag: '@phone-only' }, …)`, and the other project's `grepInvert` in `playwright.config.ts` skips it.

# Where E2E Code Lives

| Path | What it holds |
|------|---------------|
| `e2e/<area>/*.spec.ts` | the specs, in a folder for each feature area, such as `auth` or `calendar` |
| `e2e/<area>/_helpers/` | code that an area's specs share |
| `e2e/_helpers/` | code that specs in more than one area share |
| `e2e/_fixtures/` | Playwright support code: what specs import, such as the `test` fixture, `signIn`, shared form steps and the email helpers, and the launchers Playwright starts for the memory server and the fake Resend API |
| `test/factories/` | plain functions that create test data, and their database connection, imported through `#factories/<name>` |
| `test/auth.ts` | the test-only better-auth instance, imported through `#auth` |
| `playwright.config.ts` | the Playwright config, at the repo root |

Playwright code stays in `e2e/`, apart from `playwright.config.ts`, so the app and the unit tests never load Playwright. Playwright runs only what's in `e2e/`, and Vitest runs only `*.test.ts[x]` files outside it, so a spec anywhere else never runs. A file that defines tests ends in `.spec.ts`, and no other file in `e2e/` ends in `.spec.ts` or `.test.ts`, because Playwright runs any such file as a spec.

The factories and the test-only auth instance sit in `test/`, not `e2e/`, because they don't use Playwright. They're plain functions, so the dev seed in `seed/` reuses them too (see `docs/seed.md`).

# Writing Specs

## Import from `e2e/_fixtures/`
Specs import `test`, `expect` and anything else of Playwright's through `e2e/_fixtures/`, never from `@playwright/test`. The `test` there opens each worker's database connections for the factories and `signIn`, and closes them when the worker ends, so a spec that imports Playwright's own `test` gets no connections. Even types such as `Page` come through `e2e/_fixtures/`, so a single Biome ban on `@playwright/test` in specs catches a stray `test` import.

```typescript
// ✅ CORRECT
import { expect, signIn, test } from '../_fixtures';
```
```typescript
// ❌ INCORRECT - no database connections
import { expect, test } from '@playwright/test';
```

## Each Test Gets Its Own Client IP
The `test` fixture gives each test its own random client IP, through an `X-Forwarded-For` header in Playwright's `extraHTTPHeaders`. A production build turns on better-auth's rate limit, such as three sign-ups in 10 seconds, and the limit counts requests by client IP. With no header, Next gives every request the same IP, so tests would share one count and run into the limit.

## Waiting for a Second Email
The email helpers in `e2e/_fixtures/` read the emails the app has sent, as the fake Resend API kept them. `latestEmailTo` returns as soon as any email has reached the address, so if the address already has one, it can return the old one. Wait for the new one first, such as with `expect.poll(async () => (await emailsTo(address)).length).toBe(2)`.

## Use User-Facing Locators
Find elements the way a user would, with Playwright's user-facing locators, such as `getByRole`, `getByText` and `getByLabel`. They also check what a user sees, such as a button's accessible name. If none of them can pick an element out, use `getByTestId`. Never use CSS or XPath selectors, because they break whenever the markup changes, even when nothing a user sees has changed.

```typescript
// ✅ CORRECT
await page.getByRole('button', { name: 'Save' }).click();
```
```typescript
// ❌ INCORRECT - breaks when the markup changes, and a user never sees it
await page.locator('.mantine-Button-root').click();
```

## Example
`e2e/auth/homeRedirect.spec.ts` shows the shape of a spec: create the data, sign in, act, assert.

```typescript
import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { expect, signIn, test } from '../_fixtures';

test('signed-in user lands on their planner calendar', async ({
	context,
	page,
}) => {
	const planner = await createPlanner();
	const user = await createUser({
		planners: [{ planner: planner._id, accessLevel: 'owner' }],
	});
	await signIn(context, user);

	await page.goto('/');

	await expect(page).toHaveURL(`/${planner._id}/calendar`);
	await expect(page.getByRole('grid')).toBeVisible();
});
```

## Tests a Known Bug Breaks
A known bug is one with its own note in the notes repo (see `docs/project_structure.md`, "Notes"). Sometimes a known bug breaks a flow a spec covers. Write that test for the right behavior anyway, and make Playwright's `test.fail()` marker the first line of its body, so it's in effect before any step can fail. A comment beside it names the bug's note. Playwright reports a marked test as passing when it fails, and as failing when it passes. So the run stays green while the bug is open, and the fix has to take the marker out.

```typescript
test('adds a meal from the Add Meal form', async ({ context, page }) => {
	// Expected to fail until "Blank Dish Row Blocks Saving a Meal" is fixed.
	test.fail();
	// ...
});
```

A marked test passes however it fails, even when a locator stops finding its element, so a run can't show that it fails because of the bug. When you write one, run it once without the marker, and check that it fails at the assertion the bug breaks rather than at an earlier step.

Whoever fixes the bug needs to know the test is waiting on them, so the bug's note says so in its `# Inbox` section. If the Inbox already has an item for the bug's marked tests, add the test to it. Otherwise, add an item that names the test and says to remove its `test.fail()` line in the fix.

A marked test is marked for only one known bug, though one bug can have several marked tests. A test that two bugs break still fails after the first fix, so that fix can't take the marker out.

# Test Data

## Each Test Creates Its Own Data
Every user, planner and other document a test uses is created in that test, with the factories in `test/factories/`. Never hard-code an email or ID for data the test didn't create, and never create data in `beforeAll` or at module level. Biome bars specs and helpers from importing `mongoose`, `mongodb` or `@/_models`, so data that no factory creates yet comes from a factory's overrides or a new factory, whichever fits.

Tests run in parallel and can be retried, so when tests share data and one of them changes it, results depend on run order. Data a test creates for itself can't be touched by any other test.

```typescript
// ✅ CORRECT - the planner ID comes from what the factory returned
const planner = await createPlanner();
await page.goto(`/${planner._id}/calendar`);
```
```typescript
// ❌ INCORRECT - nothing with this ID exists in the fresh database
await page.goto('/64b7f0c2a1e4d93f8c2b1a70/calendar');
```

## Users Come from `createUser`
A user needs two records with the same email: the better-auth user, which signing in needs, and the app's `User` doc, which holds the user's planners. `createUser` creates both in one call. If a test ends up with only one of them, the home page doesn't find the user and creates a new user and planner, so the test lands on the wrong planner.

The better-auth user's email is verified unless you pass `emailVerified: false`. An unverified user can't sign in with a password until they follow a verification link.

## Emails Are Unique and Lowercase
Unless you pass one, `createUser` generates an email that is unique on every call and all lowercase, from `uniqueEmail()` in `test/factories/uniqueEmail.ts`. A spec or factory that needs a fresh email of its own, such as one to sign up with, calls `uniqueEmail()` too. An email you pass yourself has to be unique and lowercase too. better-auth rejects an email that already exists, so a fixed email fails on the second test or retry that uses it. And the home page looks users up by the email in the session, which better-auth stores in lowercase, so a mixed-case email in the `User` doc isn't found.

## Factories Stay Out of Next.js
Factories run in Playwright's worker, outside Next.js, where `server-only` throws. So they write through the models in `@/_models` and the test-only auth instance in `test/auth.ts`, and never import `@/_actions`, `@/_auth` or any other module that imports `server-only`.

## Fixtures Hold Connections, Not Data
A `test.extend` fixture in `e2e/_fixtures/` only opens, provides or closes a resource, such as a database connection or a browser context. It opens and closes connections only through `test/factories/connection.ts` and `test/auth.ts`, the connections the factories and `signIn` use, and it never creates users, planners or other documents. A fixture can be shared by every test in a worker, so data it created would be data tests share, which "Each Test Creates Its Own Data" rules out. Keeping data out of fixtures also keeps everything a test depends on visible in the spec, so `signIn` and the email helpers are plain functions the spec calls, not fixtures.

## Nothing Cleans Up
Nothing in `e2e/` or `test/factories/` deletes data: no `deleteOne`, `deleteMany`, `drop`, better-auth's `removeUser` or `deleteUser`, or anything like them, and no `afterEach`, `afterAll` or `globalTeardown` that removes data.

The database is thrown away after every run, so there's nothing to clean up. Cleanup steps don't run when a test fails partway, and a cleanup in one test can delete data another test running in parallel still needs.

# Signing In

## Use `signIn`, Not the Form
A test that needs a signed-in user calls `signIn(context, user)` from `e2e/_fixtures/`, after creating the user with `createUser`. It adds a fresh session cookie for that user to the browser context, so the test skips the sign-in form.

Only tests about signing in itself fill in the sign-in form: the form, its errors or where it redirects. Those live in `e2e/auth/`. Signing in through the form in every other test is slow, and every test would break whenever the sign-in form changes.

Never share a signed-in session between tests with Playwright's `storageState`. It needs users that several tests share, which "Each Test Creates Its Own Data" rules out.

## `testUtils` Stays in `test/auth.ts`
better-auth's `testUtils` plugin creates sessions without a password, so it must never reach the app. It's used only in the test-only auth instance, `test/auth.ts`. The app's own instance in `src/_auth/auth.ts` never has it. No other file imports or re-exports it in any form, and nothing imports from `better-auth/test`.

# Running E2E Tests
You run the E2E tests yourself with the commands below. CI also runs them, as the `e2e` check, on every PR into a protected branch, `develop` or `main` (see `docs/ci.md`, "Checks on PRs").

## Commands
- `pnpm test:e2e`: builds the app and runs every spec in `desktop` and `phone`. Pass a spec file or folder to run only those, such as `pnpm test:e2e e2e/auth`. It installs Playwright's Chromium first, which only downloads on the first run.
- `pnpm test:e2e:trace`: the same, with a trace recorded for every test, then opens the HTML report, even when tests fail. Open a test's trace in the report to step through what the browser did.

## How a Run Works
1. `e2e/_fixtures/memoryServer.ts` starts a MongoDB memory server on a random port, and Playwright passes its URI to the app and the tests as `DB_URL`.
2. `e2e/_fixtures/fakeResend.ts` starts the fake Resend API on a random port, and Playwright passes its URL to the app and the tests as `RESEND_BASE_URL`. It keeps every email the app sends, by recipient, for the email helpers to read.
3. `next build && next start` builds the app and serves it on `localhost`, on a free port that `playwright.config.ts` picks once per run.
4. The tests run against that server.

E2E tests always run against this production build, never `next dev` and never a server that's already running. A production build is what users get, and it doesn't compile pages on demand while parallel workers wait.

Because each run picks a free port, your own `pnpm dev` can keep running during an E2E run, and two checkouts can run E2E at the same time. Every build in a checkout writes to the same `.next` folder, so don't run two at once there, whether they're E2E runs or `pnpm build`.

## Environment Variables
Nothing in an E2E run comes from `.env.local`. At the top of `playwright.config.ts`, every variable in `src/env.ts` gets a value meant for E2E:
- `DB_URL` is the memory server's URI.
- `BETTER_AUTH_URL` is the run's own `http://localhost:<port>`. The session cookies `signIn` adds take their domain from it.
- `BETTER_AUTH_SECRET` is a dummy secret.
- Everything else gets a dummy value that passes `src/env.ts`'s validation, such as a valid email for `RESEND_FROM_EMAIL`.

`test/auth.ts` and `test/factories/connection.ts` read `DB_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from `@/env`, so the tests and the app get the same values.

When you add a variable to `src/env.ts`, add an E2E value for it to `playwright.config.ts`. CI needs a dummy for it too: `docs/ci.md`, "Secrets and Environment Values", says where. Give it its real values in `.env.local` and on Vercel, and add its row to the table in `docs/services.md`, "The Environments", which records where each variable's values live.

One variable outside `src/env.ts` gets an E2E value too: `RESEND_BASE_URL`, the fake Resend API's URL, which Playwright sets the way it sets `DB_URL`. The email senders in `src/_auth/emails/` create their Resend client without a `baseUrl`, so the Resend SDK reads `RESEND_BASE_URL` from `process.env` on its own. That sends the app's emails to the fake with no test-only code, and no E2E run sends a real email. The email helpers read the variable from `process.env` too, since `@/env` doesn't have it. Resend's docs don't mention the variable. If an SDK upgrade stops reading it, `latestEmailTo` fails with "No email reached ‹address›".

A few variables are read by better-auth on its own, because `src/_auth/auth.ts` and `src/_utils/auth/client.ts` don't pass them in. They're set nowhere, neither in `.env.local` nor in the E2E config, until they go through `src/env.ts`: `BETTER_AUTH_SECRETS`, `AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `BASE_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `NEXT_PUBLIC_AUTH_URL` and `NEXTAUTH_URL`.

## MongoDB Version
The memory server runs the same MongoDB release series as the Atlas cluster, **8.0**, so the tests run against the database production uses.

The version is pinned in `package.json`, in `config.mongodbMemoryServer.version` (currently `8.0.32`). The download at `pnpm install` reads only that setting, so the launcher sets no version of its own (no `binary.version`). The memory-server entry in `playwright.config.ts` sets `MONGOMS_VERSION` from the pin, and sets `MONGOMS_SYSTEM_BINARY`, `MONGOMS_DOWNLOAD_URL` and `MONGOMS_ARCHIVE_NAME` to empty strings, so nothing set in your shell can swap in another `mongod`.

When Atlas moves to a new release series, change the pin and this section together.

# How These Rules Are Enforced
For anyone changing these rules: `biome.jsonc` bans the imports they rule out, and the ones "Each Test Creates Its Own Data" names. Two specs also guard the factories and `signIn`. `e2e/auth/homeRedirect.spec.ts` checks `createUser`'s two records and its emails, and `signIn`'s session cookie. `e2e/auth/signIn.spec.ts` signs in through the form as a user created without `emailVerified`, so it checks that `createUser`'s users are verified by default. `homeRedirect.spec.ts` can't, because `signIn`'s cookie skips the verification check.
