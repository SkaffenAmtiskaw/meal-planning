---
type: infra
status: in-review
blocked-by: []
confirmed: 2026-10-01
---
# Where It Stands
All steps implemented. Next: /final-review ^status

All 11 steps are done: `pnpm seed` runs through tsx against the dev database and refuses any other database before connecting, Biome checks `seed/` with the test-support import bans, and each run removes everything seeded before, then creates the four seeded users with their personal planners and a shared planner filled with tags, recipes, bookmarks and meals. `pnpm sign-in` serves a link per seeded user at `http://localhost:3001` that signs any browser in as them, and `pnpm dev:sign-in` runs it alongside the dev server. Agents sign in through those links as the seeded user a check names, and nothing in `.claude/` or AGENTS.md points at the old test login. `docs/seed.md` describes the seed and its reset convention, and AGENTS.md sends anyone changing `seed/` or adding a model there. `/plan-steps` writes each check that needs a signed-in user as a named seeded user, or as a new user signed up through the app when the check changes the email. The old test login in `.opencode/secrets/` is deleted, along with its `.gitignore` line. What remains is the review of the whole story.

# Inbox

# Purpose
Lets Sarah test by hand, and agents check their work, as users at every access level on her local dev database, without tedious setup.

# Goals
- [ ] `pnpm seed` creates a user at each access level (`owner`, `admin`, `write`, `read`) in the dev database, all members of one shared planner that has data to work with.
- [ ] Each seeded user also owns a personal planner, so the navbar lists two planners for them.
- [ ] Running `pnpm seed` again puts the seeded users and their planners back as a fresh seed makes them, and leaves Sarah's own dev data unchanged.
- [ ] `pnpm seed` refuses to run, and changes nothing, when `DB_URL` points at anything other than the dev database.
- [ ] Opening a seeded user's sign-in link in any browser lands Sarah in the app signed in as that user, without the sign-in form, including when that browser was already signed in as someone else.
- [ ] Any seeded user can sign in through the sign-in form with the committed dev password.
- [ ] An agent's first pass signs in as any seeded user in the built-in browser, so no acceptance check is reported as not run for lack of a user at an access level.
- [ ] No skill or subagent in `.claude/` signs in with, or mentions, `.opencode/secrets/credentials.md`.
- [ ] `.opencode/secrets/credentials.md` is deleted.

# Open Decisions
1. Who is the test environment for: Sarah testing by hand and local agents, or cloud sessions too?
	- **Decided 2026-09-30:** only Sarah on her machine and local agents. Sarah's call: cloud sessions can come later. They were routed to [[Sentry Logging and Root Cause Analysis]], the only story that needs them.
2. Where do the seeded test users and data live?
	- **Decided 2026-09-30:** the Atlas database named `test` in `.env.local`'s `DB_URL`, which also holds Sarah's own dev data. Sarah's call: it's the database she uses for local development, so it makes sense to use it for this as well.
3. How do agents sign in as a test user?
	- **Decided 2026-09-30:** they skip the sign-in form and get a session cookie for the user from better-auth `testUtils` `getCookies`, as E2E tests do, so no agent credentials are stored. Sarah's call: skipping the sign-in is useful.
4. Where are the seeded users' logins kept? The seed needs each user's email and password, Sarah needs the passwords to sign in, and agents need to know which user has which access level. They could be committed in the repo, such as in the seed script, since they only open the app on Sarah's machine, or kept out of git, such as in `.env.local`. What's the standard practice other apps use for credentials only local testing uses? Today the test login is in the gitignored `.opencode/secrets/credentials.md`, which the `running-the-app` skill reads. That was a quick fix, not a convention, and `.opencode/` is going away.
	- **Decided 2026-10-01:** one well-known dev password for all seeded users, committed in the repo alongside the list of seeded users (email, access level, profile name), with a guard so the seed only runs against the dev database. Sarah's call from the options: as in mainstream frameworks' local seeds, the password is fixture data that opens nothing outside the dev database, seeded users can still test the sign-in form and password settings, and the guard covers the one risk that could reach production.
		- Rejected: keep the password out of git in `.env.local` - adds setup and makes agents open a file of real secrets, to hide a value that opens nothing.
		- Rejected: seeded users have no password - the app would show them as Google-only, so they couldn't test the sign-in form or password settings.
5. Should the story give Sarah an easy way to skip the sign-in form when testing by hand, such as a `pnpm dev profile=admin` that starts the app signed in as that seeded user? She already saves the test logins in her browser's password manager and keeps a browser profile per test user. In this stack it would most likely mean dev-only code in the app that signs her in without a password, turned on by an env variable, while `docs/e2e_tests.md` keeps `testUtils` off the app's own auth instance. Research should find how much work it is and how safe the dev-only switch can be made.
	- **Decided 2026-10-01:** a sign-in link outside the app. A `pnpm` command starts a small local server outside `src/` that gives a link for the seeded user Sarah names, and opening the link in any browser sets that user's session cookie from `getCookies` and redirects to the dev server. Sarah's call from the options: she can test in any browser or profile, nothing in `src/` changes, sign-out and session renewal behave as in the real app, and since it only ever runs on her machine against the dev database it needs no guards beyond that.
		- Rejected: don't build it, keep browser profiles and the password manager - she wants an easy way to skip the sign-in form.
		- Rejected: a script that opens a Playwright Chromium window - she wants to test in any browser she chooses.
		- Rejected: dev-only sign-in code in the app - it would ship sign-in without a password in the app's code, against the purpose of the `testUtils` rule in `docs/e2e_tests.md`.
		- Rejected: impersonation through the app's better-auth admin plugin - not dev-only, and more work.
		- Rejected: a reverse proxy that adds the session cookie to every request - it works, but needs many request and response rewrites, and one miss signs the plain dev tab in as a seeded user.

# Design
Everything for the local test environment lives in a new top-level `seed/` folder (Sarah's call, 2026-10-01: "seed" is the standard word for data put into a dev database). Sarah decided 2026-10-01 that each seeded user also owns a personal planner, and that the seed has no Google-only user until a story needs one.

## Pieces
- **`seed/users.ts`:** says who the seeded users are. It holds the one dev password they share, and an entry per user with a key, profile name, email and access level on the shared planner:

  | Key | Name | Email | Shared planner |
  |---|---|---|---|
  | `owner` | Olive Owner | `delivered+seed-owner@resend.dev` | `owner` |
  | `admin` | Adam Admin | `delivered+seed-admin@resend.dev` | `admin` |
  | `write` | Wren Writer | `delivered+seed-write@resend.dev` | `write` |
  | `read` | Reid Reader | `delivered+seed-read@resend.dev` | `read` |

  The emails are Resend's labeled test address: the dev server sends real email through Resend, a send to a `resend.dev` test address counts as delivered without going out, and Resend's docs warn that sends to made-up addresses bounce and hurt the sending domain's reputation, which production shares. They're lowercase and unique, as `docs/e2e_tests.md` requires.
- **`seed/devDatabase.ts`:** opens the seed's connections, and only to the dev database. It reads the name of the database `DB_URL` points at, with the MongoDB driver's own parsing, which opens no connection. Unless it's `test`, it stops with an error naming the database. Only then does it call `connectDatabase` (`test/factories/connection.ts`) and `connectAuth` (`test/auth.ts`), which both take their database from `DB_URL`. Sarah decided 2026-10-02 to check before connecting, because mongoose creates each imported model's collections and indexes as soon as it connects. Production is on the same Atlas cluster under a different database name (Sarah, 2026-10-01), so checking the database name, not the host, tells them apart. Only the seed uses it: decision 5 gives the link server no guards, and pointed elsewhere it finds no seeded users.
- **`seed/reset.ts`:** removes everything the seed made, and what was later done as a seeded user, found from the emails in `seed/users.ts`:
  - deletes every planner a seeded user owns: the shared planner, the personal planners, and any planner created while signed in as one
  - removes only the membership in those planners from any other user's `User` doc, such as Sarah's after accepting an invite, so the navbar has no dead link
  - deletes pending invites to those planners and invites sent to a seeded email
  - deletes each seeded better-auth user with its sessions and accounts (`testUtils`' `deleteUser`), then their `User` doc, which takes their memberships in Sarah's planners with it

  A seeded user whose email was changed in the app is no longer found and is left behind; the email-change convention below keeps checks from doing that. The deleting lives here, not in `test/factories/`, because `docs/e2e_tests.md` says nothing there deletes data.
- **`seed/seed.ts`:** what `pnpm seed` runs. It connects through `seed/devDatabase.ts`, runs `seed/reset.ts`, then creates everything fresh with the factories in `test/factories/`:
  - **The shared planner,** "Seeded Shared Planner", made with `createPlanner`: 3 tags in different colors; 4 recipes, some tagged and one untagged, with ingredients, instructions and times; 2 bookmarks, one tagged; and meals on most days, with some days empty, from the start of last week through the first full week of next month. Counted from the day the seed runs, the range always covers the current week and crosses a month boundary. Some days have two meals, and some dishes link to the saved recipes.
  - **Each user in `seed/users.ts`,** made with `createUser` with the dev password, holding the shared planner at their access level first, so the home page lands them there, then their own empty personal planner as `owner`, named after them, such as "Olive's Planner".
  - When done, it prints each user's name, email and access level, and that `pnpm sign-in` gives their links.

  The sample data is written inline. A recipe or tag factory joins `test/factories/` only when an E2E test needs one.
- **`seed/signInServer.ts`:** signs a browser in as a seeded user from a link. A small Node `http` server on `http://localhost:3001`, connected through `test/auth.ts` (`connectAuth`), so `testUtils` stays out of the app.
  - `/` lists each seeded user (name, access level, email) with their link.
  - `/<key>`, such as `/admin`, finds the user by their email in `seed/users.ts`, makes a fresh session with `getCookies`, and redirects to the dev server (`BETTER_AUTH_URL`). The response sets the session cookie with no `Domain`, so it belongs to `localhost` and reaches port 3000, and expires every other better-auth cookie the browser sent: better-auth's cookie cache trusts its cached-session cookie without checking it against the session cookie, and the app caches for 30 days, so a browser signed in as someone else would otherwise stay that user. Cookie names come from better-auth's context (`authCookies`).
  - A key not in the list gets a 404 listing the valid keys. A key whose user isn't in the database gets a page saying to run `pnpm seed`.
- **`package.json`:** the commands, and the tool that runs them.
  - `tsx` as a pinned devDependency: plain `node` can't resolve the `@/` and `#auth` paths, and tsx resolves tsconfig `paths` and takes Node flags such as `--env-file` (tsx docs).
  - `seed`: `tsx --env-file=.env.local seed/seed.ts`
  - `sign-in`: `tsx --env-file=.env.local seed/signInServer.ts`
  - `dev:sign-in`: `pnpm run "/^(dev|sign-in)$/"`, which starts both at once (pnpm 10 runs every script the regex matches at the same time). Ctrl-C stops both.
  - `dev` is unchanged, so Sarah can run the app with no link server when testing auth flows (Sarah, 2026-10-01).

  Both scripts load only `.env.local`, the file decision 2 names, so they reach the dev server's database, and a missing variable fails `src/env.ts`'s check instead of reaching another database.
- **`.claude/launch.json`:** a second entry, `sign-in`, runs `pnpm sign-in` on port 3001. `dev` stays separate, so an agent reuses Sarah's running `pnpm dev` or `pnpm dev:sign-in` and starts only what's missing.
- **Agent instructions:** agents sign in as seeded users instead of using the test login.
  - `running-the-app`: step 2 starts `sign-in` with `preview_start` as well as `dev`, then opens the link for the seeded user the check or repro names, or `owner` if none is named. Who's who is in `seed/users.ts`. If the link says the user isn't seeded, run `pnpm seed`. Stopping only what you started covers both servers.
  - `first-pass`: the "read-only user with no test login" example goes from "A user or setup you can't get to". The bullet stays for setups that still can't be reached.
  - `bug-reproducer`: "Use only that account" becomes signing in as the seeded user the steps name.
  - `routine-sessions`: the example of a skill a routine never loads gives the new reason, that `running-the-app` signs in through the link server against Sarah's local dev database. The list of what a routine can't reach drops `.opencode/secrets/` and keeps `.env*`.
  - `AGENTS.md`: the `.opencode/` paragraph drops its example "(such as the test login `running-the-app` uses)", which the change to `running-the-app` makes untrue.
- **Docs:** `docs/project_structure.md` gets `seed/`, its `docs/` line's list of topics gains the seed, and its `test/auth.ts` and `test/factories/` lines say the seed uses them too. `docs/e2e_tests.md`'s lines saying a dev seed could reuse the factories "later" point to `seed/` instead.
- **`.opencode/secrets/credentials.md`:** deleted, as the story's last change, once nothing in `.claude/` points at it. It's gitignored, so this can't be undone. The `.opencode/secrets` line in `.gitignore` goes with it (Sarah's call, 2026-10-04).

## Flow
1. **Seeding:** Sarah, or an agent whose link says the user isn't seeded, runs `pnpm seed`. tsx loads `.env.local`, and `seed/devDatabase.ts` connects and checks the database name. If it isn't `test`, the run stops and nothing is read or written. Otherwise `seed/reset.ts` removes the old seeded data, `seed/seed.ts` creates the users and planners fresh, and the script prints who's who. If it fails partway, running it again cleans up, since the reset removes whatever it finds.
2. **Starting:** Sarah runs `pnpm dev:sign-in`, or `pnpm dev` and `pnpm sign-in` separately, or only `pnpm dev`. Agents start `dev` and `sign-in` with `preview_start`, which reuses what's already running.
3. **Signing in:** opening `http://localhost:3001/<key>` in any browser makes a fresh session for that user, replaces the browser's better-auth cookies and redirects to `http://localhost:3000`, where the home page sends the user to the shared planner. The session renews and signs out as in the real app.
4. **Switching users:** opening another user's link in the same browser replaces the session. Signing in through the form with a seeded email and the dev password works too.
5. **Starting clean:** when seeded data has drifted, `pnpm seed` puts it back. Sarah's own data is unchanged, apart from losing memberships in seeded planners.

# Conventions
- **Checks name a seeded user.** A click-through check that needs a signed-in user names the seeded user it signs in as, by key (`owner`, `admin`, `write` or `read`, listed in `seed/users.ts`). A behavior that differs by access level is checked as the user at that level. Lands in the `plan-steps` skill, under "Checks".
- **Email changes never use a seeded user.** A check that changes a user's email never uses a seeded user, because `pnpm seed` finds seeded users by email and would leave the changed one behind. It signs up a new user through the app instead. Lands in the `plan-steps` skill, under "Checks", after the one above.
- **The reset only deletes, and only seeded data.** `seed/reset.ts` finds everything it deletes from the seeded emails in `seed/users.ts`, so Sarah's own data in the same database is never touched. A story that adds a new kind of record tied to a user or a planner, such as a shopping list per planner, also adds it to `seed/reset.ts` in the same change, so the copies made by seeded users get deleted with them. The sample data `pnpm seed` creates stays in `seed/seed.ts`, and stays generic. Lands in a new `docs/seed.md`, which also describes the seed for anyone using it (the commands, the seeded users and the sign-in links). AGENTS.md's "Docs" list gets "`docs/seed.md`: before changing `seed/` or adding a model".

# Out of Scope
- Test users and data that work in Claude Code cloud sessions. Sarah decided 2026-09-30 to leave them for later, and they were routed to [[Sentry Logging and Root Cause Analysis]].

# Implementation
## Step 1: The seed command connects only to the dev database
**Idea:** `pnpm seed` refuses to run unless it's connected to the dev database.

**Source:** Goal: `pnpm seed` refuses to run, and changes nothing, when `DB_URL` points at anything other than the dev database.

**Approach:** Design → Pieces: `package.json` (`tsx` as a pinned devDependency, the `seed` script only; `sign-in` and `dev:sign-in` come in later steps) and `seed/devDatabase.ts` as the design describes: it opens both connections through `connectDatabase` and `connectAuth`, reads the connected database's name, and unless it's `test`, closes them and stops with an error naming the database, before anything is read or written. `seed/seed.ts` starts as a scaffold: it connects through `seed/devDatabase.ts`, prints the database it connected to, closes the connections and exits. Step 3 replaces the scaffold with the real seed. Look up tsx's `--env-file` and tsconfig `paths` support in its docs for the installed version. Node gives a variable already set in the environment precedence over `--env-file`, which is how the second check points the seed elsewhere. The implementer also confirms, in Atlas or with `mongosh`, that the refused run left no `seed-guard-check` database behind.

**Files:**
- `package.json` - `tsx` devDependency and the `seed` script
- `pnpm-lock.yaml` - the `tsx` install
- `seed/devDatabase.ts` (new) - opens the seed's connections and refuses any database but `test`
- `seed/seed.ts` (new) - scaffold that connects through `seed/devDatabase.ts`, prints the database name and exits

**Acceptance:**
- [x] Run `pnpm seed`, see it print that it connected to the `test` database and exit without an error. Proves: the seed reaches the dev database through `.env.local`, with `@/` and `#auth` paths resolving outside Next.js.
- [x] Copy `DB_URL` from `.env.local`, change only the database name in it to `seed-guard-check`, and run `DB_URL='<that URL>' pnpm seed`. See it stop with an error naming `seed-guard-check`. Proves: pointed at any other database on the same cluster, such as production, the seed refuses before touching anything.

**Status:** ✅ Complete

**As built:** `seed/devDatabase.ts` checks the database name from `DB_URL` before it connects, not after (Sarah's call 2026-10-02, now in Design → Pieces). Once Step 3 imports the models, connecting first would let mongoose create their collections and indexes in the wrong database before the guard refused. Since the refused run never connects, it can't leave a `seed-guard-check` database behind, and a listing of the cluster's databases after the check showed none.

## Step 2: Biome checks the seed
**Idea:** Biome checks `seed/` the same way it checks the support code in `test/`.

**Source:** Pulled in by Sarah 2026-10-01: `biome.jsonc`'s `files.includes` covers only `src/`, `test/`, `e2e/` and `playwright.config.ts`, so `seed/` would get no linting, formatting or import bans from `pnpm lint`, the pre-commit hook or CI. Sarah decided: `seed/` gets the same bans as the general test-support override, no `@playwright/test` and no direct `testUtils` import.

**Approach:** Add `seed/**/*` to `files.includes` in `biome.jsonc`. Also add it to the includes of the import-ban override for test support code, the one listing `test/**/*` without `test/auth.ts`, `test/factories/` or `e2e/`. That keeps the comment above the ban overrides true: no two of them match the same file. Run `pnpm lint` so Step 1's files follow the rules. The implementer also adds a direct `@playwright/test` import to a `seed/` file, sees `pnpm lint:ci` fail, and reverts.

**Files:**
- `biome.jsonc` - `seed/` in the checked files and in the test-support import bans
- `seed/devDatabase.ts`, `seed/seed.ts` - any fixes `pnpm lint` makes

**Acceptance:**
- [x] Add `import { testUtils } from 'better-auth/plugins';` to the top of `seed/seed.ts`, run `pnpm lint:ci`, and see it fail on that import with the message that `testUtils` is used only in `test/auth.ts`. Revert. Proves: Biome checks `seed/`, and code there can reach `testUtils` only through the test-only auth instance.

**Status:** ✅ Complete

## Step 3: Seeded users with their planners
**Idea:** `pnpm seed` creates each seeded user with the planners the design gives them.

**Source:** Goal: `pnpm seed` creates a user at each access level ...; Goal: Each seeded user also owns a personal planner ...; Goal: Any seeded user can sign in through the sign-in form with the committed dev password.

**Approach:** Design → Pieces: `seed/users.ts` (the dev password and the four users from the table) and `seed/seed.ts` (replacing Step 1's scaffold).
- **What the seed creates:** "Seeded Shared Planner" with `createPlanner`, empty for now. Then each user, with `createUser` and the dev password. Each holds the shared planner at their access level first, and their own personal planner, such as "Olive's Planner", as `owner` second.
- **The printout:** when done, it prints each user's name, email and access level.
- **Later steps:** sample data comes in Step 5, and the printed line about `pnpm sign-in` comes in Step 6.
- **Clearing by hand:** until Step 4 builds the reset, a second run stops on the first seeded email that already exists. While building, clear the seeded users and planners by hand between runs, better-auth's `user`, `account` and `session` documents included. Clear them once more after the last run, so Sarah's first check makes the one fresh seed.
- **Implementer checks:** the implementer also signs in through the form as `admin` and as `write`, and checks that each lands on the shared planner with their access level.

**Files:**
- `seed/users.ts` (new) - the dev password and who the seeded users are
- `seed/seed.ts` - creates the shared planner and each seeded user with their two planners, and prints who's who

**Acceptance:**
- [x] Run `pnpm seed`, see it print the four seeded users with their name, email and access level. Proves: the seed says who's who when it finishes.
- [x] On desktop, open a private window so your own session stays put. Sign in through the sign-in form as `read`, using Reid Reader's email and the dev password from `seed/users.ts`. See the app land on "Seeded Shared Planner" as read-only, and the navbar list "Seeded Shared Planner" and "Reid's Planner". Proves: seeded users have the committed password, get the shared planner first at their own access level, and own a personal planner.
- [x] In a new private window, sign in through the form as `owner`. Open Settings and expand "Seeded Shared Planner". See its member list show Olive Owner as owner, Adam Admin as admin, Wren Writer as write and Reid Reader as read. Proves: all four users share one planner, each at their own access level.

**Status:** ✅ Complete

**As built:** The dev password is `password` (Sarah's call 2026-10-04: it makes plain the data is fake), and the printout's header gives it: `Seeded users (password: password):`.

## Step 4: Re-running the seed starts the seeded users fresh
**Idea:** `pnpm seed` removes everything seeded before it creates the seed again.

**Source:** Goal: Running `pnpm seed` again puts the seeded users and their planners back as a fresh seed makes them, and leaves Sarah's own dev data unchanged.

**Approach:** Design → Pieces: `seed/reset.ts`, and `seed/seed.ts` running it right after connecting.
- **What the reset deletes:** it finds everything from the emails in `seed/users.ts`, and deletes in the design's order:
  1. every planner a seeded user owns
  2. any other user's membership in those planners, and nothing else from their `User` doc
  3. pending invites to those planners, and invites sent to a seeded email
  4. each seeded better-auth user with its sessions and accounts, through `testUtils`' `deleteUser`, then their `User` doc

  Look up `deleteUser` in better-auth's testUtils docs for the installed version.
- **Missing users:** if a seeded user isn't found, the reset moves on. That way a run after a partial failure cleans up whatever is there.
- **Implementer checks:** the implementer also checks both kinds of invite deletion. Signed in as `owner`, it invites `delivered+outside@resend.dev` and leaves the invite pending. Signed in as a user who isn't seeded, it invites `write`'s email and leaves that pending too. Then it reruns `pnpm seed` and checks both pending invites are gone.

**Files:**
- `seed/reset.ts` (new) - deletes everything the seeded emails lead to
- `seed/seed.ts` - runs the reset before creating the seed

**Acceptance:**
- [x] On desktop:
  1. In a private window, sign in through the form as `owner` and rename "Seeded Shared Planner" in Settings to "Renamed".
  2. In a new private window, sign in as `write` and create a new planner called "Wren's Extra".
  3. Run `pnpm seed`.
  4. In a new private window, sign in as `write` again.

  See the navbar list only "Seeded Shared Planner" and "Wren's Planner". Proves: a rerun works on top of an earlier seed, puts changed seeded data back and removes planners a seeded user made.
- [x] On desktop:
  1. In your normal browser, signed in as your own dev account, invite `read`'s email to one of your planners.
  2. In a private window, sign in as `read`, open Settings from the user menu and accept the invite under Invites.
  3. In a new private window, sign in as `owner` and invite your own dev account's email to "Seeded Shared Planner".
  4. Back in your normal browser, accept that invite the same way.
  5. Run `pnpm seed`, then reload the app in your normal browser.

  See all your own planners still in the navbar with their data, and "Seeded Shared Planner" gone. In Settings, see that Reid Reader is no longer in your planner's member list. Proves: the reset leaves your own data alone, apart from memberships that involve seeded users.

**Status:** ✅ Complete

**As built:** Creating a planner in Settings never added it to the user who made it: `getUser` returns a serialized user, and `createPlanner`'s raw `User.collection.updateOne` doesn't cast its string `_id`, so the first check's "Wren's Extra" step couldn't work. Sarah pulled the fix into this step 2026-10-04: `src/_actions/planner/createPlanner.ts` casts the id with `new Types.ObjectId`, and its test expects the ObjectId.

## Step 5: Sample data in the shared planner
**Idea:** `pnpm seed` fills the shared planner with data to work with.

**Source:** Goal: `pnpm seed` creates a user at each access level ..., all members of one shared planner that has data to work with.

**Approach:** Design → Pieces: `seed/seed.ts`, "The shared planner" bullet.
- **The library:** 3 tags in different colors. 4 recipes with ingredients, instructions and times, some tagged and one untagged. 2 bookmarks, one of them tagged.
- **The calendar:** meals from the start of last week through the first full week of next month, counted from the day the seed runs. Most days have meals and some are empty. Some days have two meals, and some dishes link to the saved recipes. The pattern gives every week in the range at least one empty day and one day with two meals, whatever day the seed runs.
- **Where the data lives:** written inline in `seed/seed.ts` and passed to `createPlanner` as overrides. No new factory.
- **Implementer checks:** the implementer runs the seed and checks in the app that last week, the current week, the days around the month boundary and the first full week of next month all have meals.

**Files:**
- `seed/seed.ts` - the shared planner's tags, recipes, bookmarks and meals

**Acceptance:**
- [x] Run `pnpm seed`. On desktop, in a private window, sign in through the form as `write`. In the recipes view, see 3 tags in different colors, 4 recipes with one untagged, and 2 bookmarks with one tagged. Proves: the shared planner has a library to work with, tagged and untagged.
- [x] Still as `write`, open the calendar:
  1. See meals on most days of the current week, with at least one empty day and one day with two meals.
  2. Open a dish that links to a saved recipe, and see the recipe.
  3. Move to next month, and see meals through its first full week.

  Proves: the calendar always has meals around today and across a month boundary, with dishes that link to recipes.

**Status:** ✅ Complete

**As built:** The range runs in whole Sunday-to-Saturday weeks, matching the calendar's `getWeekStart`, with the same meals on each day of the week: Wednesday empty, Sunday and Friday with two meals. `seed/seed.ts` works out the week start itself rather than importing the app's `getWeekStart`, and the date logic stays inline without unit tests (both Sarah's calls 2026-10-04).

## Step 6: Sign-in links
**Idea:** Opening a seeded user's link at `http://localhost:3001` signs the browser in as that user.

**Source:** Goal: Opening a seeded user's sign-in link in any browser lands Sarah in the app signed in as that user, without the sign-in form, including when that browser was already signed in as someone else.

**Approach:** Design → Pieces: `seed/signInServer.ts` as the design describes. It's a Node `http` server on port 3001, connected through `connectAuth`:
- **`/`** lists each seeded user with their link.
- **`/<key>`** makes a fresh session with `getCookies` and sets the session cookie with no `Domain`. It also expires every other better-auth cookie the browser sent, taking their names from better-auth's context (`authCookies`), then redirects to `BETTER_AUTH_URL`. Look up `getCookies` in better-auth's testUtils docs for the installed version.
- **An unknown key** gets a 404 listing the valid keys.
- **A key whose user isn't in the database** gets a page saying to run `pnpm seed`.

`package.json` gets the `sign-in` script, and the printout from `seed/seed.ts` ends by saying `pnpm sign-in` gives the links. The implementer also signs out after a link sign-in and checks that the sign-in page shows.

**Files:**
- `seed/signInServer.ts` (new) - the link server
- `package.json` - the `sign-in` script
- `seed/seed.ts` - the printout's closing line about `pnpm sign-in`

**Acceptance:**
- [x] Run `pnpm seed` and see its last line say `pnpm sign-in` gives the sign-in links. Run `pnpm dev`, and `pnpm sign-in` in a second terminal. In a private window, open `http://localhost:3001` and see the four seeded users, each with name, access level, email and link. Click `admin`'s link. See the app open on "Seeded Shared Planner", signed in as Adam Admin, with no sign-in form. Proves: a link signs a fresh browser in as the user it names.
- [x] In the browser you normally use for the app, signed in as your own dev account, open `http://localhost:3001/read`. See the app signed in as Reid Reader, read-only on "Seeded Shared Planner". Reload the page and see it's still Reid Reader. Afterwards, sign out and sign back in as yourself. Proves: a link replaces a session the browser already had, including better-auth's cached copy of it.
- [x] Open `http://localhost:3001/nobody` and see a not-found page listing `owner`, `admin`, `write` and `read`. Proves: a mistyped key gets a page saying which keys work.
- [x] Stop `pnpm sign-in` and run it again as `DB_URL='<DB_URL from .env.local with the database name changed to seed-guard-check>' pnpm sign-in`. Open `http://localhost:3001/owner` and see a page saying to run `pnpm seed`. Proves: a link for a user who isn't seeded says how to fix it.

**Status:** ✅ Complete

## Step 7: One command for the app and the link server
**Idea:** `pnpm dev:sign-in` runs the dev server and the link server together.

**Source:** Design → Pieces: `package.json`, `dev:sign-in`; Design → Flow: Starting.

**Approach:** Design → Pieces: `package.json` gets `dev:sign-in`: `pnpm run "/^(dev|sign-in)$/"`. `dev` stays as it is. Check in pnpm's docs for the installed version that a regex `run` runs the matching scripts at the same time, and that Ctrl-C stops both.

**Files:**
- `package.json` - the `dev:sign-in` script

**Acceptance:**
- [x] Run `pnpm dev:sign-in`, and see output from both the Next.js dev server and the link server. Open `http://localhost:3001/write` and see the app signed in as Wren Writer. Press Ctrl-C, then open `http://localhost:3000` and `http://localhost:3001`, and see that neither responds. Proves: one command starts both servers, and Ctrl-C stops both.

**Status:** ✅ Complete

**As built:**
- On Ctrl-C, pnpm reports each script as `Failed` with exit code 130, since each was stopped by a signal. Both servers still stop.
- `next dev` (Next.js 16.3.8) appended its agent-rules block to `AGENTS.md` on every start, which left the tree changed after any dev run. Sarah pulled the fix into this step 2026-10-04: `next.config.mjs` sets `agentRules: false`, since AGENTS.md's "Library APIs" already points agents to Next's bundled docs.

## Step 8: Agents sign in through the links
**Idea:** Agents sign in through the link server as the seeded user a check names.

**Source:** Goal: An agent's first pass signs in as any seeded user in the built-in browser ...; Goal: No skill or subagent in `.claude/` signs in with, or mentions, `.opencode/secrets/credentials.md`; Design → Pieces: Agent instructions, including `AGENTS.md`'s `.opencode/` example.

**Approach:** Design → Pieces: `.claude/launch.json` and Agent instructions.
- **`.claude/launch.json`:** a new `sign-in` entry runs `pnpm sign-in` on port 3001.
- **`running-the-app`:** step 2 starts `sign-in` with `preview_start` as well as `dev`. Then it opens the link for the seeded user the check or repro names, or `owner` if none is named. Who's who is in `seed/users.ts`. If the link says the user isn't seeded, the agent runs `pnpm seed`. The existing rule to stop only what you started now covers both servers. The skill's description drops "the test login".
- **`first-pass`:** the example "read-only user with no test login" goes. The bullet stays.
- **`bug-reproducer`:** "Use only that account" becomes signing in as the seeded user the steps name.
- **`routine-sessions`:** the example now gives the new reason `running-the-app` stays out of routines: it signs in through the link server against Sarah's local dev database. The list of what a routine can't reach drops `.opencode/secrets/` and keeps `.env*`.
- **`AGENTS.md`:** the `.opencode/` paragraph drops its example "(such as the test login `running-the-app` uses)", which this step makes untrue.
- **Implementer check:** the implementer tests the "not seeded" path itself. It starts `pnpm sign-in` against a `seed-guard-check` `DB_URL` as in Step 6, asks a session to open the app as `owner`, and stops the session as soon as it runs `pnpm seed`. Reaching for `pnpm seed` is the whole result. Then it restarts `sign-in` normally.

**Files:**
- `.claude/launch.json` - the `sign-in` entry
- `.claude/skills/running-the-app/SKILL.md` - sign in through the link server as a named seeded user
- `.claude/skills/implement/first-pass.md` - the example of an unreachable user goes
- `.claude/agents/bug-reproducer.md` - sign in as the seeded user the steps name
- `.claude/skills/routine-sessions/SKILL.md` - the new reason `running-the-app` stays out of routines, and the list drops `.opencode/secrets/`
- `AGENTS.md` - the `.opencode/` paragraph's example of the test login goes

**Acceptance:**
- [x] With nothing running on ports 3000 or 3001:
  1. Open a new Claude Code session in this repo in the desktop app.
  2. Ask: "Use the running-the-app skill to open the app as the `read` seeded user, then tell me which planner you landed on and whether you could add a meal."
  3. In the browser pane, see it open `http://localhost:3001/read` and land on "Seeded Shared Planner" as Reid Reader.
  4. See its reply name that planner and say it couldn't add a meal.
  5. When it's done, open `http://localhost:3000` and see nothing respond.

  Proves: an agent signs in as any seeded user on its own, and stops the servers it started.
- [x] Run `pnpm dev:sign-in`, then ask a new session the same thing with `admin`. See it reuse both servers, report Adam Admin's view of "Seeded Shared Planner", and leave both running. Proves: an agent uses servers you already have running and doesn't stop them.
- [x] Run `grep -rnE "opencode/secrets|test login" .claude/ AGENTS.md` and see no matches. Proves: nothing an agent reads points at the old test login.

**Status:** ✅ Complete

**As built:**
- `preview_start` doesn't reuse a server it didn't start: with `pnpm dev:sign-in` running in a terminal, it refuses because the port is in use by a process that isn't a preview server. `running-the-app` handles that case by opening the port's URL, checking it's this app (the meal planner on 3000, the seeded users list on 3001), using it and leaving it running. `bug-reproducer`'s first step now stops only when the skill says to, rather than on any `preview_start` failure.
- `bug-reproducer` has no Bash and doesn't change data the steps don't ask for, so if a link says its user isn't seeded, it stops and reports that instead of running `pnpm seed` (Sarah's call 2026-10-04).

## Step 9: Docs for the seed
**Idea:** The project docs describe the seed.

**Source:** Conventions: The reset only deletes, and only seeded data; Design → Pieces: Docs, including the docs topic list in `docs/project_structure.md`.

**Approach:**
- **`docs/seed.md` (new),** from the Conventions' third bullet. It describes the commands (`pnpm seed`, `pnpm sign-in` and `pnpm dev:sign-in`), the seeded users in `seed/users.ts` and the sign-in links. It also sets three conventions:
  - `seed/reset.ts` finds everything it deletes from the seeded emails.
  - A story that adds a new kind of record tied to a user or a planner adds it to `seed/reset.ts` in the same change.
  - The sample data stays generic, in `seed/seed.ts`.

  Match the style of the other docs.
- **`AGENTS.md`:** its "Docs" list gets "`docs/seed.md`: before changing `seed/` or adding a model".
- **`docs/project_structure.md`,** from Design → Pieces: Docs. It gets a `seed/` entry, and the seed joins the list of topics in its `docs/` line. Its `test/auth.ts` and `test/factories/` lines say the seed uses them too.
- **`docs/e2e_tests.md`:** two lines say a dev seed could reuse the factories "later", one under "Where E2E Code Lives" and one under "Writing a Factory". Both point to `seed/` instead.

**Files:**
- `docs/seed.md` (new) - how to use the seed, and the reset convention
- `AGENTS.md` - the Docs list points to `docs/seed.md`
- `docs/project_structure.md` - `seed/`, and the seed's use of `test/auth.ts` and `test/factories/`
- `docs/e2e_tests.md` - the "later" lines point to `seed/`

**Acceptance:**
- [x] With nothing running, follow only `docs/seed.md`: reseed, start the app with the link server, and sign in as `write` from its link. See the app open on "Seeded Shared Planner" as Wren Writer. Proves: the doc alone gets someone from a terminal to signed in as a seeded user.
- [x] Start a new Claude Code session and ask: "I'm adding a ShoppingList model, one per planner. Besides the model, what else needs to change?" See the answer include adding it to `seed/reset.ts`, citing `docs/seed.md`. Proves: AGENTS.md sends an agent who adds a model to the reset convention.

**Status:** ✅ Complete

**As built:**
- `docs/seed.md` names the seeded users' keys, which are their access levels, and points to `seed/users.ts`, the link server's page and the seed's printout for names, emails and the dev password, rather than copying them (Sarah's call 2026-10-04: one source for who's who).
- Its "Starting Fresh" section lists what a reseed deletes, and the reset convention says a new record added to `seed/reset.ts` joins that list too (Sarah's call 2026-10-04).
- Boy Scout fix: `docs/project_structure.md`'s `test/` line said the folder is shared by unit and E2E tests; it now names the seed too. Found while editing that file's `test/auth.ts` and `test/factories/` lines.

## Step 10: Checks name a seeded user
**Idea:** `/plan-steps` writes every check that needs a signed-in user as a named seeded user.

**Source:** Conventions: Checks name a seeded user; Conventions: Email changes never use a seeded user.

**Approach:** The Conventions' first two bullets go into `.claude/skills/plan-steps/SKILL.md` under "Checks", the second after the first:
- **Seeded users:** a click-through check that needs a signed-in user names the seeded user it signs in as, by key, as listed in `seed/users.ts`. A behavior that differs by access level is checked as the user at that level.
- **Email changes:** a check that changes a user's email never uses a seeded user, because `pnpm seed` finds seeded users by email. It signs up a new user through the app instead.

Afterwards, reread the whole "Checks" section so it reads naturally as a whole.

**Files:**
- `.claude/skills/plan-steps/SKILL.md` - the two conventions under "Checks"

**Status:** ✅ Complete

**As built:**
- The two conventions are one rule with cases, the email-change case first and then "Otherwise: a seeded user", in a new "Which user a check signs in as" subsection (Sarah's call 2026-10-04: condition before instruction, so an agent doesn't act on "name a seeded user" and miss the exception).
- Both acceptance checks were dropped (Sarah's call 2026-10-04): the implementer gave both prompts to a fresh subagent, which loads AGENTS.md and none of the implementing session's context. Its check for hiding Add meal signed in as `read` (and `write` for contrast), and its email-change check signed up a new user, citing the reason `pnpm seed` would leave a changed seeded user behind.

## Step 11: Delete the old test login
**Idea:** The old test login file is deleted.

**Source:** Goal: `.opencode/secrets/credentials.md` is deleted.

**Approach:** Design → Pieces: `.opencode/secrets/credentials.md` is deleted as the story's last change, once Step 8 has left nothing in `.claude/` pointing at it. The file is gitignored, so deleting it can't be undone: ask Sarah before deleting it, as AGENTS.md describes under "Git and files". The `.opencode/secrets` line in `.gitignore` does not stay.

**Files:**
- `.opencode/secrets/credentials.md` (deleted) - nothing uses it any more
- `.gitignore` - the `.opencode/secrets` line goes

**Acceptance:**
- [x] Run `ls .opencode/secrets/` and see no `credentials.md`. Proves: the old test login is gone.

**Status:** ✅ Complete

**As built:** The empty `.opencode/secrets/` folder stays, since the check lists it and git doesn't track an empty folder.
