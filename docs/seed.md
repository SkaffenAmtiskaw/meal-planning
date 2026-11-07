# The Dev Seed
- `pnpm seed` fills your dev database with a seeded user at each access level, all sharing one planner full of sample data.
- `pnpm sign-in` serves a link per seeded user that signs any browser in as them, without the sign-in form.
- Everything lives in `seed/`, and only ever runs on your machine against a dev database. In the main checkout, that's the `test` database that `DB_URL` in `.env.local` points at, which also holds your own dev data. In a worktree, it's the worktree's own database (see "Worktrees").

# Commands
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

`pnpm dev` stays on its own, for testing auth flows with no link server running.

`pnpm seed` and `pnpm sign-in` load only `.env.local`. `pnpm seed` checks the database name in `DB_URL` before it connects, and stops with an error unless it's `test` or a worktree's `test-<n>`. Production is a different database, `staging`, on the same Atlas cluster, so the name is what tells them apart.

# The Seeded Users
There's one seeded user per access level, and each one's key is their access level: `owner`, `admin`, `write` and `read`. Their names and emails, and the one dev password they share, are in `seed/users.ts`. `pnpm seed`'s printout and the link server's front page list them too.

Each seeded user holds:
- **"Seeded Shared Planner"** at their access level, listed first, so the home page lands them there. It has 3 tags, 4 recipes (one untagged), 2 bookmarks (one tagged) and meals in whole weeks from the start of last week through the first full week of next month, so the calendar always has meals around today and across a month boundary.
- **A personal planner** they own, named after them, such as "Olive's Planner". It starts empty.

The emails are Resend's test address (`delivered+<label>@resend.dev`). The dev server sends real email through Resend, and a send to that address counts as delivered without going out, so an invite or password reset to a seeded user never bounces.

# Signing In
Opening a seeded user's link in any browser makes a fresh session for that user and redirects to the dev server at `BETTER_AUTH_URL`. In the main checkout, that's `http://localhost:3000`. A worktree's dev server is on the worktree's own host and port (see "Worktrees"). The link replaces whatever session the browser already had, including better-auth's cached copy of it, so you can switch users by opening another link. The session then renews and signs out as in the real app.

- The link server's front page lists every seeded user with their link.
- A key that isn't a seeded user's gets a page listing the keys.
- A user who isn't in the database gets a page saying to run `pnpm seed`.

You can also sign in through the sign-in form with a seeded user's email and the dev password.

# Starting Fresh
Running `pnpm seed` again puts the seeded users and their planners back as a fresh seed makes them. `seed/reset.ts` runs first, and deletes:
1. every planner a seeded user owns: the shared planner, the personal planners and any planner made while signed in as one
2. other users' memberships in those planners, and nothing else from their `User` doc, so your navbar has no dead links
3. pending invites to those planners, and invites sent to a seeded email
4. each seeded better-auth user with their sessions and accounts, then their `User` doc, which takes their memberships in your planners with it

Your own data is left alone, apart from those memberships. If a run fails partway, run it again: the reset deletes whatever it finds.

The reset finds seeded users by email, so a seeded user whose email was changed in the app isn't found, and is left behind with their planners. To try out changing an email, sign up a new user through the app instead.

# Worktrees
Each worktree the Claude desktop app makes runs its own copy of the app beside the main checkout's, so two checkouts never share ports, sign-ins or data. When a Claude Code session starts in a worktree that has no slot yet, the SessionStart hook in `.claude/settings.json` runs `scripts/worktree-slot.sh`. The script gives the worktree the lowest free slot from 1 to 5 and writes the slot's values into the worktree's `.env.local`:

| Slot n sets | To |
|-------------|----|
| `PORT`, the dev server's port | 3000 + 10n |
| `SIGN_IN_PORT`, the link server's port | 3001 + 10n |
| the host in `BETTER_AUTH_URL` | `<worktree folder>.localhost` |
| the database in `DB_URL` | `test-<n>`, on the same Atlas cluster |

A slot stays taken until its worktree is removed. If all five are taken, the Claude Code session's start-up message says so, and the worktree can't run the app until another worktree is removed.

The main checkout has no slot. It keeps ports 3000 and 3001, `localhost` and `test`.

`pnpm dev` and `pnpm sign-in` read their ports from `.env.local`. Each one fails if its port is taken, rather than moving to another. A server that moved could land on another checkout's port.

The host is what keeps sign-ins apart. Browsers keep cookies per host, not per port. A worktree's link server runs on the worktree's own host, so it sets its session cookie there and leaves the main checkout's `localhost` session alone. Browsers send every `*.localhost` name to your own machine, so the host needs no setup.

A worktree's database starts empty, because taking a slot drops every collection in the slot's database. An earlier worktree on that slot may have left data behind. The emptying is `pnpm db:empty-worktree`, which refuses any database but `test-<n>`, so it can't touch `test` or production. If it fails, the start-up message says so, and you run `pnpm db:empty-worktree` yourself once the cause is fixed. Either way, run `pnpm seed` in the worktree to fill it.

# Changing the Seed

## Where the Code Lives

| Path | What it holds |
|------|---------------|
| `seed/users.ts` | the seeded users and the dev password |
| `seed/seed.ts` | what `pnpm seed` runs: the reset, then the sample data and the users |
| `seed/reset.ts` | deletes everything the seeded emails lead to |
| `seed/devDatabase.ts` | opens the seed's connections, only to a dev database |
| `seed/databaseNames.ts` | which database names count as dev databases, and which as a worktree's |
| `seed/emptyWorktreeDatabase.ts` | what `pnpm db:empty-worktree` runs |
| `seed/signInServer.ts` | the link server `pnpm sign-in` runs |

The seed creates its data with the factories in `test/factories/`, and reaches better-auth through the test-only instance in `test/auth.ts`, so `testUtils` stays out of the app (see `docs/e2e_tests.md`). The deleting lives in `seed/reset.ts`, not `test/factories/`, because nothing in `test/factories/` deletes data.

## The Reset Only Deletes Seeded Data
Your own dev data shares the database with the seed, so `seed/reset.ts` finds everything it deletes from the seeded emails in `seed/users.ts`: the seeded users themselves, and the planners and invites they lead to, and nothing else.

When you add a new kind of record tied to a user or a planner, such as a shopping list per planner, add it to `seed/reset.ts` in the same change, found from the seeded users or the planners they own. Otherwise the copies seeded users make are left behind on every reseed. Add it to the list under "Starting Fresh" too, so the list still says everything a reseed deletes.

## Sample Data Stays Generic
The sample data is written inline in `seed/seed.ts` and passed to the factories as overrides. It's a general set any check can work with, not data shaped for one feature's checks, so it doesn't grow with every feature. A recipe or tag factory joins `test/factories/` only when an E2E test needs one.
