# E2E Test Tooling
- E2E tests use [Playwright](https://playwright.dev/docs/intro) (`@playwright/test`).
- They run against a production build of the app, backed by a throwaway MongoDB database from [`mongodb-memory-server`](https://typegoose.github.io/mongodb-memory-server/). Every run starts with an empty database.
- Almost every test runs twice: in the `desktop` project (Desktop Chrome) and in the `phone` project (an emulated Pixel 7, with touch). Only tests that cover a workflow specific to one form factor run in that project only.

# Where E2E Code Lives

| Path | What it holds |
|------|---------------|
| `e2e/<area>/*.spec.ts` | the specs, grouped by feature area |
| `e2e/_fixtures/` | Playwright support code: the `test` and `expect` specs import, `signIn`, and `memoryServer.ts`, the launcher that starts the throwaway database |
| `test/factories/` | plain functions that create test data, and the database connection they use, imported through `#factories` |
| `test/auth.ts` | the test-only better-auth instance, imported through `#auth` |
| `playwright.config.ts` | the Playwright config, at the repo root |

Every file that imports `@playwright/test` is in `e2e/`, apart from `playwright.config.ts`. Keeping Playwright code out of `src/` and `test/` means Vitest never picks up a spec, and Playwright never picks up a unit test.

The factories and the test-only auth instance sit in `test/`, not `e2e/`, because they don't use Playwright. They're plain functions, so the dev seed in `seed/` reuses them too (see `docs/seed.md`).

## Naming Specs
A file that defines Playwright tests is named `<flow>.spec.ts`, such as `homeRedirect.spec.ts`. No other file in `e2e/` ends in `.spec.ts`. `*.test.ts[x]` is the unit-test naming convention (see `docs/unit_tests.md`), so a name tells you at a glance which runner a file belongs to. (Unit tests are also colocated with the module they test.)

## Feature Areas
Each spec goes in the folder for the route its first `page.goto` opens:

| Area | Routes |
|------|--------|
| `auth` | `/`, `/reset-password`, `/verify-email`, `/verify-email-change` |
| `calendar` | `/[planner]/calendar` |
| `recipes` | `/[planner]/recipes`, `/[planner]/recipes/[recipeId]` |
| `settings` | `/settings` |
| `sharing` | `/invite` |

If a spec's first route isn't in the table, add the route in the same change, either to an existing area or to a new one.

# Writing Specs

## Import from `e2e/_fixtures/`
Specs import `test`, `expect` and `signIn` from `e2e/_fixtures/`, never from `@playwright/test`. The `test` there opens each worker's database connections for the factories and `signIn`, and closes them when the worker ends. A spec that imports Playwright's own `test` gets no connections.

```typescript
// ✅ CORRECT
import { expect, signIn, test } from '../_fixtures';
```
```typescript
// ❌ INCORRECT - no database connections
import { expect, test } from '@playwright/test';
```

## Locate Elements in the Spec
Specs use Playwright locators directly. There are no page-object classes: each spec reads top to bottom in one file, which makes it easy to review and to debug from a trace.

When the same run of two or more UI actions (clicks, fills, drags, gestures) turns up in a second spec, move it into a function in `e2e/_fixtures/` that takes `page` or a `Locator`, and have both specs call it. Don't extract steps before a second spec needs them.

## Use User-Facing Locators
Find elements the way a user would, with Playwright's built-in locators, in this order of preference:

1. `getByRole`
2. `getByText`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByAltText`
6. `getByTitle`

Use `getByTestId` only when none of these can pick out the element, even after narrowing with `.filter()` or chaining from a parent locator. Never use CSS or XPath selectors.

Unit tests find elements by test ID (see `docs/unit_tests.md`). That stays right for unit tests, but specs don't copy it.

```typescript
// ✅ CORRECT
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByRole('grid')).toBeVisible();
```
```typescript
// ❌ INCORRECT - breaks when the markup changes, and a user never sees it
await page.locator('.mantine-Button-root').click();
await page.getByTestId('save-button').click();
```

## Example
The first spec, `e2e/auth/homeRedirect.spec.ts`, shows the whole shape: create the data, sign in, act, assert.

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

# Test Data

## Each Test Creates Its Own Data
Every user, planner and other document a test uses is created in that test, by calling the factories in `test/factories/`. Never hard-code an email or ID for data the test didn't create, and never create data in `beforeAll` or at module level.

Tests run in parallel and can be retried, so data that one test shares with another, or that a test changes, makes results depend on run order. Data a test creates for itself can't be touched by any other test.

```typescript
// ✅ CORRECT - the planner ID comes from what the factory returned
const planner = await createPlanner();
await page.goto(`/${planner._id}/calendar`);
```
```typescript
// ❌ INCORRECT - nothing with this ID exists in the fresh database
await page.goto('/64b7f0c2a1e4d93f8c2b1a70/calendar');
```

## The Factories
- `createUser({ planners, email?, password?, name? })` creates a user with the planners and access levels it's given. It returns `{ id, email, name, password, planners }`, where `id` is the better-auth user ID that `signIn` needs. `name` defaults to `'New User'`, and there's no password unless you pass one.
- `createPlanner(overrides?)` creates a planner. It takes any `PlannerInterface` fields, with empty `calendar`, `saved` and `tags` by default, and returns the saved `Planner` document.

When a test needs a kind of data no factory creates yet, add a factory. Files in `e2e/` never write to the database themselves, and never import `mongoose`, `mongodb` or `@/_models`.

## Users
Only `createUser` creates users. A user needs two records with the same email: the better-auth user, which signing in needs, and the app's `User` doc, which holds the user's planners. `createUser` creates both in one call, through the test-only instance's `auth.api.createUser` (with `emailVerified: true`) and `User.create`. If a test ends up with only one of them, the home page doesn't find the user and creates a new user and planner, so the test lands on the wrong planner.

Never use better-auth `testUtils`' `saveUser`. Its users have no password, so they can't test signing in with the form.

## Emails Are Unique and Lowercase
Unless you pass one, `createUser` generates an email that is unique on every call and all lowercase: `` `e2e-${crypto.randomUUID()}@example.com` ``. If you pass your own, it has to be unique and lowercase too:
- better-auth rejects an email that already exists, so a fixed email fails on the second test or retry that uses it.
- The home page looks users up by the email in the session, which better-auth stores in lowercase. A mixed-case email in the `User` doc isn't found.

## Writing a Factory
Factories write through the models in `@/_models` and the test-only auth instance in `test/auth.ts`. They never import `@/_actions`, `@/_auth`, anything in `e2e/`, or any module that imports `server-only`. Factories run in Playwright's worker, outside Next.js, where `server-only` throws. Going straight to the models also keeps them free of app logic, so the dev seed in `seed/` can use them too.

## Fixtures Hold Connections, Not Data
A `test.extend` fixture in `e2e/_fixtures/` only opens, provides or closes a resource, such as a database connection or a browser context. It opens and closes connections only through `test/factories/connection.ts` and `test/auth.ts`, never through `mongoose` or `mongodb` directly, and it never creates users, planners or other documents.

Keeping data out of fixtures keeps everything a test depends on visible in the spec. `signIn` is a plain function the spec calls, not a fixture, for the same reason. `memoryServer.ts` sits in `e2e/_fixtures/` too, but it's the launcher Playwright runs before the tests, not a fixture.

## Nothing Cleans Up
Nothing in `e2e/` or `test/factories/` deletes data: no `deleteOne`, `deleteMany`, `drop`, better-auth's `removeUser` or `deleteUser`, or anything like them, and no `afterEach`, `afterAll` or `globalTeardown` that removes data.

The database is thrown away after every run, so there's nothing to clean up. Cleanup steps don't run when a test fails partway, and a cleanup in one test can delete data another test running in parallel still needs.

# Signing In

## Use `signIn`, Not the Form
A test that needs a signed-in user calls `signIn(context, user)` from `e2e/_fixtures/`, after creating the user with `createUser`. It adds a fresh session cookie for that user to the browser context, so the test skips the sign-in form.

Only tests about signing in itself fill in the sign-in form: the form, its errors or where it redirects. Those live in `e2e/auth/`. Signing in through the form in every other test is slow, and every test would break whenever the sign-in screen changes.

Never share a signed-in session between tests with Playwright's `storageState`. It needs users that several tests share, which "Each Test Creates Its Own Data" rules out.

## `testUtils` Stays in `test/auth.ts`
better-auth's `testUtils` plugin creates sessions without a password, so it must never reach the app. It's used only in the test-only auth instance, `test/auth.ts`, which also carries `admin()` for `auth.api.createUser`. The app's own instance in `src/_auth/auth.ts` never has it.

No other file imports `testUtils`, re-exports it, or reaches it through a namespace import, `export *` or a dynamic `import()` of `better-auth/plugins`. Nothing imports from `better-auth/test`.

# Running E2E Tests

## Commands
- `pnpm test:e2e`: builds the app and runs every spec in `desktop` and `phone`. Pass a spec file or folder to run only those, such as `pnpm test:e2e e2e/auth`. It installs Playwright's Chromium first, which only downloads on the first run.
- `pnpm test:e2e:trace`: the same, with a trace recorded for every test, then opens the HTML report, even when tests fail. Open a test's trace in the report to step through what the browser did.

## How a Run Works
1. `e2e/_fixtures/memoryServer.ts` starts a MongoDB memory server on a random port, and Playwright passes its URI to the app and the tests as `DB_URL`.
2. `next build && next start -p 3100` builds the app and serves it on `http://localhost:3100`.
3. The tests run against that server.

E2E tests always run against this production build, never `next dev` and never a server that's already running. A production build is what users get, and it doesn't compile pages on demand while parallel workers wait. Your own `pnpm dev` on port 3000 can keep running during an E2E run. The build writes to the same `.next` folder as `pnpm build`, so don't run both at once in the same checkout.

## Environment Variables
Nothing in an E2E run comes from `.env.local`. At the top of `playwright.config.ts`, every variable in `src/env.ts` gets a value meant for E2E:
- `DB_URL` is the memory server's URI.
- `BETTER_AUTH_URL` is `http://localhost:3100`. The session cookies `signIn` adds take their domain from it.
- `BETTER_AUTH_SECRET` is a dummy secret.
- Everything else gets a dummy value that passes `src/env.ts`'s validation, such as a valid email for `RESEND_FROM_EMAIL`.

`test/auth.ts` and `test/factories/connection.ts` read `DB_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from `@/env`, so the tests and the app get the same values.

When you add a variable to `src/env.ts`, add an E2E value for it to `playwright.config.ts`. CI needs a dummy for it too: `docs/ci.md`, "Secrets and Environment Values", says where.

A few variables are read by better-auth on its own, because `src/_auth/auth.ts` and `src/_utils/auth/client.ts` don't pass them in. They're set nowhere, neither in `.env.local` nor in the E2E config, until they go through `src/env.ts`: `BETTER_AUTH_SECRETS`, `AUTH_SECRET`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `BASE_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`, `NEXT_PUBLIC_AUTH_URL` and `NEXTAUTH_URL`.

## MongoDB Version
The memory server runs the same MongoDB release series as the Atlas cluster, **8.0**, so the tests run against the database production uses.

The version is pinned in `package.json`, in `config.mongodbMemoryServer.version` (currently `8.0.32`). The download at `pnpm install` reads only that setting, so the launcher sets no version of its own (no `binary.version`). The memory-server entry in `playwright.config.ts` sets `MONGOMS_VERSION` from the pin, and sets `MONGOMS_SYSTEM_BINARY`, `MONGOMS_DOWNLOAD_URL` and `MONGOMS_ARCHIVE_NAME` to empty strings, so nothing set in your shell can swap in another `mongod`.

When Atlas moves to a new release series, change the pin and this section together.

# How These Conventions Are Enforced
For anyone changing these conventions: most of them are checked in review. The first spec, `e2e/auth/homeRedirect.spec.ts`, also guards the factories and `signIn`. It fails if `createUser` stops creating either of its two records, gives them different emails, or generates a fixed or mixed-case email, and if `signIn` stops adding the session cookie.
