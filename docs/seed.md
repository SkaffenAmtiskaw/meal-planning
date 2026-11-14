# The Dev Seed
This doc is for anyone who runs the app on their own machine and wants to use it as a signed-in user. `pnpm seed` fills your dev database with a user at each access level, all sharing one planner full of sample data. `pnpm sign-in` serves a link for each seeded user that signs any browser in as them, without the sign-in form.

The seed builds its data with the same factories the E2E tests use, but it isn't part of an E2E run, which starts with an empty database of its own (see `docs/e2e_tests.md`). The seed only ever runs on your machine, against a dev database. In the main checkout, that's the `test` database that `DB_URL` in `.env.local` points at, which also holds your own dev data. In a worktree, it's the worktree's own database (see "Worktrees").

`pnpm seed` and `pnpm sign-in` load only `.env.local`. `pnpm seed` checks the database name in `DB_URL` before it connects, and stops with an error unless it's `test` or a worktree's `test-<n>`. Production is a different database, `staging`, on the same Atlas cluster, and the database user in your `.env.local` has no access to it (see `docs/services.md`, "MongoDB Atlas").

# Getting Signed In
To get from a terminal to signed in as a seeded user:
1. Run `pnpm seed`. It prints the seeded users and the dev password.
2. Run `pnpm dev:sign-in`, which starts the dev server and the link server together. Ctrl-C stops both.
3. Open a seeded user's link, which the link server prints when it starts. In the main checkout, that's `http://localhost:3001/<key>`, such as `http://localhost:3001/write`. In a worktree, it's on the worktree's own host and port (see "Worktrees").

| Command | What it does |
|---------|--------------|
| `pnpm seed` | removes everything seeded before, then creates the seeded users and their planners fresh |
| `pnpm sign-in` | the link server, on `http://localhost:3001` in the main checkout |
| `pnpm dev:sign-in` | `pnpm dev` and `pnpm sign-in` at once |
| `pnpm db:empty-worktree` | drops every collection in a worktree's database (see "Worktrees") |

To test auth flows with no link server running, use `pnpm dev` on its own.

# What's Seeded
There's one seeded user per access level, and each one's key is their access level: `owner`, `admin`, `write` and `read`. Their names and emails, and the one dev password they share, are in `seed/users.ts`.

Each seeded user holds:
- **"Seeded Shared Planner"** at their access level, listed first, so the home page lands them there. It has tags, recipes (one untagged), bookmarks (one tagged) and meals in whole weeks from the start of last week through the first full week of next month, so the calendar always has meals around today and across a month boundary.
- **A personal planner** they own, named after them, such as "Olive's Planner". It starts empty.

The emails are Resend's test address (`delivered+<label>@resend.dev`), because the dev server sends real email through Resend. Mail to a seeded user, such as an invite or a password reset, never reaches a real inbox.

# Signing In with a Link
Opening a seeded user's link in any browser makes a fresh session for that user and redirects to the dev server at `BETTER_AUTH_URL`. In the main checkout, that's `http://localhost:3000`. A worktree's dev server is on the worktree's own host and port (see "Worktrees"). The link replaces whatever session the browser already had, including better-auth's cached copy of it, so you can switch users by opening another link. The session then renews and signs out as in the real app.

The link server's front page lists every seeded user with their link. A key that isn't a seeded user's gets a page listing the keys, and a user who isn't in the database gets a page saying to run `pnpm seed`.

You can also sign in through the sign-in form with a seeded user's email and the dev password.

# Seeding Again
Running `pnpm seed` again puts the seeded users and their planners back as a fresh seed makes them. Your own data is left alone, apart from your users' memberships in seeded planners and seeded users' memberships in your planners. If a run fails partway, run it again: the reset deletes whatever it finds.

`seed/reset.ts` runs first, and deletes, in order:
1. every planner a seeded user owns: the shared planner, the personal planners and any planner made while signed in as one
2. other users' memberships in those planners, and nothing else from their `User` doc, so your navbar has no dead links
3. pending invites to those planners, and invites sent to a seeded email
4. each seeded better-auth user with their sessions and accounts, then their `User` doc, which takes their memberships in your planners with it

The reset finds seeded users by email, so a seeded user whose email was changed in the app isn't found, and is left behind with their planners. To try out changing an email, sign up a new user through the app instead.

# Worktrees
Each worktree the Claude desktop app makes runs its own copy of the app beside the main checkout's, so two checkouts never share ports, sign-ins or data. Each worktree gets a slot from 1 to 5, and the slot's values go in the worktree's `.env.local`:

| Slot n sets | To |
|-------------|----|
| `PORT`, the dev server's port | 3000 + 10n |
| `SIGN_IN_PORT`, the link server's port | 3001 + 10n |
| the host in `BETTER_AUTH_URL` | `<worktree folder>.localhost`, in lowercase |
| the database in `DB_URL` | `test-<n>`, on the same Atlas cluster |

The main checkout has no slot. It keeps ports 3000 and 3001, `localhost` and `test`.

A worktree's database starts empty, so run `pnpm seed` in the worktree to fill it.

> [!NOTE]
> When a Claude Code session starts in a worktree that has no slot yet, the SessionStart hook in `.claude/settings.json` runs `scripts/worktree-slot.sh`, which gives the worktree the lowest free slot. A slot stays taken until its worktree is removed. If all five are taken, the session's start-up message says so, and the worktree can't run the app until another worktree is removed.
>
> `pnpm dev` and `pnpm sign-in` read their ports from `.env.local`. Each one fails if its port is taken, rather than moving to another, because a server that moved could land on another checkout's port.
>
> The host is what keeps sign-ins apart. Browsers keep cookies per host, not per port. A worktree's link server runs on the worktree's own host, so it sets its session cookie there and leaves the main checkout's `localhost` session alone. Browsers send every `*.localhost` name to your own machine, so the host needs no setup.
>
> Taking a slot drops every collection in the slot's database, so a worktree starts clean even if the last one in its slot was removed by hand or by the Claude desktop app. The SessionStart hook's sweep (`scripts/worktree-sweep.sh`) also empties a worktree's database when it removes the worktree after its PR merges. The emptying is `pnpm db:empty-worktree`, which refuses any database but `test-<n>`, so it can't touch `test` or production. If it fails when a slot is taken, the start-up message says so, and you run `pnpm db:empty-worktree` yourself once the cause is fixed.

# Changing the Seed
The seed's code is in `seed/`: the seeded users and the dev password in `seed/users.ts`, what `pnpm seed` runs in `seed/seed.ts`, the reset in `seed/reset.ts`, and the link server, the dev-database checks and the worktree emptying beside them. The seed creates its data with the factories in `test/factories/`, and reaches better-auth through the test-only instance in `test/auth.ts`, so `testUtils` stays out of the app (see `docs/e2e_tests.md`). The deleting lives in `seed/reset.ts`, not `test/factories/`, because nothing in `test/factories/` deletes data.

## The Reset Only Deletes Seeded Data
Your own dev data shares the database with the seed, so `seed/reset.ts` deletes only what it can trace back to the seeded emails in `seed/users.ts`. That means the seeded users themselves and the planners and invites they lead to.

When you add a new kind of record tied to a user or a planner, such as a shopping list per planner, add it to `seed/reset.ts` in the same change, so seeded users' records aren't left behind on every reseed. The reset finds them through the seeded users or the planners they own. Add it to the list under "Seeding Again" too, so the list still says everything a reseed deletes.

## Sample Data Stays Generic
The sample data is written inline in `seed/seed.ts` and passed to the factories as overrides. It's a general set any check can work with, not data shaped for one feature's checks, so it doesn't grow with every feature. A recipe or tag factory joins `test/factories/` only when an E2E test needs one.
