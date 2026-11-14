This doc is for anyone planning, writing, reviewing or running E2E tests. It assumes you know [Playwright](https://playwright.dev/docs/intro), which the tests use. Beyond the rules it gives, how E2E code is organised is left to whoever writes it, such as what specs share, where a helper lives or how a spec is split.

# What Gets E2E Tests
E2E tests protect the app's user flows: what a user does through the browser from start to end, such as adding a meal to a day or accepting an invite. Each one is slow to run and breaks when a flow's screens change, so E2E tests cover the paths users depend on, and unit tests cover the rest, as `docs/unit_tests.md` describes. Which E2E tests a change adds or updates depends on what the change does to the app's flows.

## Flows a Change Adds or Changes
A change that adds a user flow, or changes what a user does or sees in an existing one, adds or updates an E2E test of that flow's main path. The main path is the way through that ends in what the user came to do, such as the saved meal showing on its day.

The test checks that path, not every detail along it. A detail a unit test can check stays in unit tests, such as which row a tag sits on in a list, a required field's message or other behavior inside a single component. Unit tests reach those cases faster and more directly.

## Failures the User Sees
When the app shows the user a failure, how it's tested depends on whether a browser can cause it and how far its handling goes:
- **If the failure can't be caused through the browser,** such as a database error: it stays in unit tests, however it's handled.
- **If the app only shows an error message,** such as a notification that a save failed: it stays in unit tests, because it's one component's behavior.
- **If the handling goes further,** such as a redirect, a retry, putting back what was on screen or a way for the user to recover: it works like a flow of its own. Whether it gets an E2E test is the project owner's call, made for each change when it's planned. They weigh how much it would hurt users if the handling broke against the cost of one more E2E test.

## Bug Fixes
How a bug fix is tested depends on whether a marked test already waits on it and what the bug broke:
- **If the flow's E2E test is marked `test.fail()` for the bug:** the fix takes the marker out, as "Tests a Known Bug Breaks" describes.
- **If the bug broke a flow's main path and no E2E test caught it:** the fix adds the test that would have, so the bug can't come back unnoticed.
- **Otherwise:** the fix's test, if it needs one, is a unit test.

# How a Test Stays Reliable
A test that depends on anything outside itself, such as data another test made or the order tests run in, fails some runs and passes others, because tests run in parallel and can be retried. A test can also fail when nothing a user sees is wrong, such as when its markup changes or its data isn't what the app would have made. The rules below prevent both, so a failing test means a flow is broken.

## Each Test Creates Its Own Data
Every user, planner and other document a test uses is created in that test, with the factories in `test/factories/`. Never hard-code an email or ID for data the test didn't create, and never create data in `beforeAll` or at module level. When tests share data and one of them changes it, results depend on run order, while data a test creates for itself can't be touched by any other test.

Specs and helpers never write to the database themselves. Data that no factory creates yet comes from a factory's overrides or a new factory, whichever fits. A factory makes data the way the app would, such as both of a user's records, so a test built on one starts from a state the app can really be in, and a change to a model is made in one place.

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
Every email a test uses is unique on every call and all lowercase. Unless you pass one, `createUser` generates an email like that with `uniqueEmail()` from `test/factories/uniqueEmail.ts`. A spec or factory that needs a fresh email of its own, such as one to sign up with, calls `uniqueEmail()` too.

better-auth rejects an email that already exists, so a fixed email fails on the second test or retry that uses it. And the home page looks users up by the email in the session, which better-auth stores in lowercase, so a mixed-case email in the `User` doc isn't found.

## Fixtures Hold Connections, Not Data
A `test.extend` fixture in `e2e/_fixtures/` only opens, provides or closes a resource, such as a database connection or a browser context, and never creates users, planners or other documents. A fixture can be shared by every test in a worker, so data it created would be data tests share. Keeping data out of fixtures also keeps everything a test depends on visible in the spec, so `signIn` and the email helpers are plain functions the spec calls, not fixtures.

A fixture opens and closes connections only through `test/factories/connection.ts` and `test/auth.ts`, the modules whose connections the factories and `signIn` use.

## Nothing Cleans Up
Nothing in `e2e/` or `test/factories/` deletes data. No code there calls `deleteOne`, `deleteMany`, `drop`, better-auth's `removeUser` or `deleteUser`, or anything like them, and no `afterEach`, `afterAll` or `globalTeardown` removes data. The database is thrown away after every run, so there's nothing to clean up. Cleanup steps don't run when a test fails partway, and a cleanup in one test can delete data another test running in parallel still needs.

## Each Test Gets Its Own Client IP
The `test` fixture gives each test its own random client IP, through an `X-Forwarded-For` header in Playwright's `extraHTTPHeaders`. A production build turns on better-auth's rate limit, which counts requests by client IP. With no header, Next gives every request the same IP, so tests would share one count and run into the limit.

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

# Writing Specs

## The Shape of a Spec
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

## Use `signIn`, Not the Form
A test that needs a signed-in user calls `signIn(context, user)` from `e2e/_fixtures/`, after creating the user with `createUser`. It adds a fresh session cookie for that user to the browser context, so the test skips the sign-in form.

Only tests about signing in itself fill in the sign-in form: the form, its errors or where it redirects. Those live in `e2e/auth/`. Signing in through the form in every other test is slow, and every test would break whenever the sign-in form changes.

Never share a signed-in session between tests with Playwright's `storageState`. It needs users that several tests share, which "Each Test Creates Its Own Data" rules out.

## Waiting for a Second Email
The email helpers in `e2e/_fixtures/` read the emails the app has sent, as the fake Resend API kept them. `latestEmailTo` returns as soon as any email has reached the address, so if the address already has one, it can return the old one. Wait for the new one first, such as with `expect.poll(async () => (await emailsTo(address)).length).toBe(2)`.

## Tests a Known Bug Breaks
A known bug is one with its own note in the notes repo (see `docs/project_structure.md`, "Notes"). Sometimes a known bug breaks a flow a spec covers. How that flow's test is written depends on whether the bug's right behavior is settled, because the test asserts that behavior:
- **If it's settled:** write the test for the right behavior anyway, and make Playwright's `test.fail()` marker the first line of its body, so it's in effect before any step can fail. A comment beside it names the bug's note.
- **If it isn't:** leave the test out. The bug's own story writes it once the behavior is settled.

Playwright reports a marked test as passing when it fails, and as failing when it passes. So the run stays green while the bug is open, and the fix has to take the marker out.

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

# Where E2E Code Lives

| Path | What it holds |
|------|---------------|
| `e2e/<area>/*.spec.ts` | the specs, in a folder for each feature area, such as `auth` or `calendar` |
| `e2e/<area>/_helpers/` | code that an area's specs share |
| `e2e/_helpers/` | code that specs in more than one area share |
| `e2e/_fixtures/` | Playwright support code: what specs import, such as the `test` fixture and `signIn`, and the launchers for the services a run starts |
| `test/factories/` | the factories (plain functions that create test data), their database connection, and helpers E2E code can't get from the app's own modules, such as a new object ID. All are imported through `#factories/<name>`. |
| `test/auth.ts` | the test-only better-auth instance, imported through `#auth` |
| `playwright.config.ts` | the Playwright config, at the repo root |

Playwright code stays in `e2e/`, apart from `playwright.config.ts`, so the app and the unit tests never load Playwright. Playwright runs only what's in `e2e/`, and Vitest runs only `*.test.ts[x]` files outside it, so a spec anywhere else never runs. A file that defines tests ends in `.spec.ts`, and no other file in `e2e/` ends in `.spec.ts` or `.test.ts`, because Playwright runs any such file as a spec.

The factories and the test-only auth instance sit in `test/`, not `e2e/`, because they don't use Playwright. They're plain functions, so the dev seed in `seed/` reuses them too (see `docs/seed.md`).

## Factories Stay Out of Next.js
Factories run in Playwright's worker, outside Next.js, where `server-only` throws. So they write through the models in `@/_models` and the test-only auth instance in `test/auth.ts`, and never import `@/_actions`, `@/_auth` or any other module that imports `server-only`.

## `testUtils` Stays in `test/auth.ts`
better-auth's `testUtils` plugin creates sessions without a password, so it must never reach the app. It's used only in the test-only auth instance, `test/auth.ts`. The app's own instance in `src/_auth/auth.ts` never has it. No other file imports or re-exports it in any form, and nothing imports from `better-auth/test`.

# Running E2E Tests
You run the E2E tests yourself with the commands below. CI also runs them, as the `e2e` check, on every PR into a protected branch, `develop` or `main` (see `docs/ci.md`, "Checks on PRs").

Almost every test runs twice: in the `desktop` project (Desktop Chrome) and in the `phone` project (an emulated Pixel 7, with touch). A test that covers a flow specific to one form factor runs only in that form factor's project. It's tagged `@desktop-only` or `@phone-only`, as in `test('<name>', { tag: '@phone-only' }, …)`, and the other project's `grepInvert` in `playwright.config.ts` skips it.

## Commands
- `pnpm test:e2e`: builds the app and runs every spec in `desktop` and `phone`. Pass a spec file or folder to run only those, such as `pnpm test:e2e e2e/auth`. It installs Playwright's Chromium first, which only downloads on the first run.
- `pnpm test:e2e:trace`: runs the same tests with a trace recorded for every test. Then it opens the HTML report, even if tests failed. Open a test's trace in the report to step through what the browser did.

## How a Run Works
1. `e2e/_fixtures/memoryServer.ts` starts a MongoDB memory server from [`mongodb-memory-server`](https://typegoose.github.io/mongodb-memory-server/) on a random port, and Playwright passes its URI to the app and the tests as `DB_URL`.
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

The test code reads these through `@/env` too, so the tests and the app get the same values.

One variable outside `src/env.ts` gets an E2E value too: `RESEND_BASE_URL`, the fake Resend API's URL, which Playwright sets the way it sets `DB_URL`. Setting it sends the app's emails to the fake with no test-only code, so no E2E run sends a real email.

> [!NOTE]
> The email senders in `src/_auth/emails/` create their Resend client without a `baseUrl`, so the Resend SDK reads `RESEND_BASE_URL` from `process.env` on its own. The email helpers read the variable from `process.env` too, since `@/env` doesn't have it. Resend's docs don't mention the variable. If an SDK upgrade stops reading it, `latestEmailTo` fails with "No email reached ‹address›".

When you add a variable to `src/env.ts`, add an E2E value for it to `playwright.config.ts`. Where else it needs a value, such as CI, `test/mocks/env.ts` and Vercel, depends on whether the schema requires it, as `docs/ci.md`, "Secrets and Environment Values", describes. Add its row to the table in `docs/services.md`, "The Environments", which records where each variable's values live.

## MongoDB Version
The memory server runs the same MongoDB release series as the Atlas cluster, **8.0**, so the tests run against the database production uses. The version is pinned in `package.json`, in `config.mongodbMemoryServer.version`. When Atlas moves to a new release series, change the pin and this section together.

> [!NOTE]
> The download at `pnpm install` reads only that setting, so the launcher sets no version of its own (no `binary.version`). The memory-server entry in `playwright.config.ts` sets `MONGOMS_VERSION` from the pin, and sets `MONGOMS_SYSTEM_BINARY`, `MONGOMS_DOWNLOAD_URL` and `MONGOMS_ARCHIVE_NAME` to empty strings, so nothing set in your shell can swap in another `mongod`.

# How These Rules Are Enforced
For anyone changing these rules: `biome.jsonc` bans the imports they rule out, including `mongoose`, `mongodb` and `@/_models` in specs and helpers. Two specs also guard the factories and `signIn`. `e2e/auth/homeRedirect.spec.ts` fails if `createUser` leaves out either record, or if `signIn`'s session cookie doesn't work, because the redirect needs both records and a working cookie. `e2e/auth/signIn.spec.ts` signs in through the form as a user created without `emailVerified`, so it checks that `createUser`'s users are verified by default. `homeRedirect.spec.ts` can't, because `signIn`'s cookie skips the verification check.
