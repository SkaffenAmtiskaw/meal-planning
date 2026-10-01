---
type: infra
status: idea
blocked-by: []
confirmed: 2026-10-01
---
# Where It Stands
Decisions made. Next: /infra-design ^status

A seed for Sarah's local dev database that reuses the E2E factories in `test/factories/`, creating a user at each access level with the data they need, and that can be run again. Agents sign in as any seeded user with better-auth `testUtils` `getCookies`, and Sarah with a sign-in link from a `pnpm` command, opened in any browser. Seeded users share one well-known dev password, committed with the list of seeded users, and `running-the-app` moves off `.opencode/secrets/credentials.md`.

Background from E2E Test Setup:
- It decided 2026-09-28 that E2E tests read no seed data, which is why manual and agent testing got this story. Its data-creation helpers are plain functions in `test/factories/`, free of Playwright code, so a dev seed can reuse them, following the practice of tests and seeders sharing one set of factories (`docs/e2e_tests.md`, "Writing a Factory").
- `createUser` in `test/factories/user.ts` creates the better-auth user through the test-only auth instance in `test/auth.ts`, with an optional password, together with the app's `User` doc, so seeded users can have passwords.
- There are four access levels, `owner`, `admin`, `write` and `read`, stored per planner on the `User` doc (`src/_models/user/user.ts`).
- The local dev database doesn't share data with production (Sarah, 2026-09-28). How they're kept apart is for [[Services and Environments Audit]] to find out.

# Purpose
Lets Sarah test by hand, and agents check their work, as users at every access level on her local dev database, without tedious setup.

# Goals
- [ ] Manual testing of edge cases for users with different access levels doesn't take a bunch of tedious manual steps.
- [ ] Agents doing `first-pass` work never stop at an edge case because no user is set up for an access level.
- [ ] Nothing reads the test login from `.opencode/secrets/credentials.md`, so [[Finish OpenCode Migration]] can remove it.

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
Questions for this section:
- Which planners and data the seed creates beyond one user per access level (`owner`, `admin`, `write`, `read`).
- How the seed handles seeded users that already exist when it's run again. better-auth rejects an email that already exists (`docs/e2e_tests.md`, "Emails Are Unique and Lowercase").
- How seeded data that Sarah or an agent changed gets put back, without touching Sarah's own dev data in the same database. `first-pass` has agents create data through the app's screens when a check needs it.
- How an agent puts the `getCookies` session cookie into the built-in browser.
- How the seed recognizes the dev database, so its guard refuses to run against anything else.
- Where the committed list of seeded users and their dev password lives, and the emails the seeded users get.
- Where the sign-in link's local server lives, and how its `pnpm` command starts it alongside the dev server.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Test users and data that work in Claude Code cloud sessions. Sarah decided 2026-09-30 to leave them for later, and they were routed to [[Sentry Logging and Root Cause Analysis]].

# Implementation
