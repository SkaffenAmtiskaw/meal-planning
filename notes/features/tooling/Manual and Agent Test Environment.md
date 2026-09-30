---
type: infra
status: idea
blocked-by:
  - "decision needed: where the seeded users' logins are kept, and whether Sarah gets an easy way to skip sign-in"
confirmed: 2026-09-30
---
# Where It Stands
Next: /decide, then /infra-design ^status

A seed for Sarah's local dev database that reuses the E2E factories in `test/factories/`, creating a user at each access level with the data they need, and that can be run again. Agents sign in as any seeded user with better-auth `testUtils` `getCookies`, and `running-the-app` moves off `.opencode/secrets/credentials.md`.

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
5. Should the story give Sarah an easy way to skip the sign-in form when testing by hand, such as a `pnpm dev profile=admin` that starts the app signed in as that seeded user? She already saves the test logins in her browser's password manager and keeps a browser profile per test user. In this stack it would most likely mean dev-only code in the app that signs her in without a password, turned on by an env variable, while `docs/e2e_tests.md` keeps `testUtils` off the app's own auth instance. Research should find how much work it is and how safe the dev-only switch can be made.
	- **Leaning 2026-09-30:** "if there's an _easy_ way for me to skip sign-in I'd do it". She has used `.env.dev` files with logins for many user profiles and `pnpm dev profile=admin` at past jobs and found it extremely handy, but that stack was very different. Not checked yet.

# Design
Questions for this section:
- Which planners and data the seed creates beyond one user per access level (`owner`, `admin`, `write`, `read`).
- How the seed handles seeded users that already exist when it's run again. better-auth rejects an email that already exists (`docs/e2e_tests.md`, "Emails Are Unique and Lowercase").
- How seeded data that Sarah or an agent changed gets put back, without touching Sarah's own dev data in the same database. `first-pass` has agents create data through the app's screens when a check needs it.
- How an agent puts the `getCookies` session cookie into the built-in browser.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Test users and data that work in Claude Code cloud sessions. Sarah decided 2026-09-30 to leave them for later, and they were routed to [[Sentry Logging and Root Cause Analysis]].

# Implementation
