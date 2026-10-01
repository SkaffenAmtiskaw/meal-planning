---
type: infra
status: spec
blocked-by: []
confirmed: 2026-10-01
---
# Where It Stands
Design approved. Next: /plan-steps ^status

A seed for Sarah's local dev database that reuses the E2E factories in `test/factories/`, creating a user at each access level with the data they need, and that can be run again. Agents sign in as any seeded user with better-auth `testUtils` `getCookies`, and Sarah with a sign-in link from a `pnpm` command, opened in any browser. Seeded users share one well-known dev password, committed with the list of seeded users, and `running-the-app` moves off `.opencode/secrets/credentials.md`.

Background from E2E Test Setup:
- It decided 2026-09-28 that E2E tests read no seed data, which is why manual and agent testing got this story. Its data-creation helpers are plain functions in `test/factories/`, free of Playwright code, so a dev seed can reuse them, following the practice of tests and seeders sharing one set of factories (`docs/e2e_tests.md`, "Writing a Factory").
- `createUser` in `test/factories/user.ts` creates the better-auth user through the test-only auth instance in `test/auth.ts`, with an optional password, together with the app's `User` doc, so seeded users can have passwords.
- There are four access levels, `owner`, `admin`, `write` and `read`, stored per planner on the `User` doc (`src/_models/user/user.ts`).
- The local dev database doesn't share data with production (Sarah, 2026-09-28). How they're kept apart is for [[Services and Environments Audit]] to find out.

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
- **`seed/devDatabase.ts`:** opens the seed's connections, and only to the dev database. It calls `connectDatabase` (`test/factories/connection.ts`) and `connectAuth` (`test/auth.ts`), then reads the name of the database it connected to. Unless it's `test`, it closes the connections and stops with an error naming the database, before anything is read or written. Production is on the same Atlas cluster under a different database name (Sarah, 2026-10-01), so checking the connected name, not the host, tells them apart. Only the seed uses it: decision 5 gives the link server no guards, and pointed elsewhere it finds no seeded users.
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
- **Docs:** `docs/project_structure.md` gets `seed/`, and its `test/auth.ts` and `test/factories/` lines say the seed uses them too. `docs/e2e_tests.md`'s lines saying a dev seed could reuse the factories "later" point to `seed/` instead.
- **`.opencode/secrets/credentials.md`:** deleted, as the story's last change, once nothing in `.claude/` points at it. It's gitignored, so this can't be undone. The `.opencode/secrets` line in `.gitignore` stays until [[Finish OpenCode Migration]] removes `.opencode/`.

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
