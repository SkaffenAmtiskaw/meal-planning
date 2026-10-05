---
name: running-the-app
description: How to start this project's app in the built-in browser, sign in, check phone sizes and stop the servers afterward, and which user a check or repro signs in as. Use before starting the app or checking something in the browser, or when writing a check or repro step that needs a signed-in user.
user-invocable: false
---

# Starting the App
1. Call the built-in browser's `preview_start` with the name `dev` (from `.claude/launch.json`). It starts the dev server, or reuses it if it's already running, and opens http://localhost:3000 in a new tab.
2. To sign in, also call `preview_start` with the name `sign-in`. It starts the link server, or reuses it, and opens http://localhost:3001, which lists the seeded users. Then open `http://localhost:3001/<key>` for the seeded user the check or repro names, or `owner` if none is named. The link signs the browser in as that user and opens the app. Who's who, with their keys, is in `seed/users.ts`. If the page says the user isn't seeded, run `pnpm seed`, then open the link again.

If `preview_start` says the port is in use by a process that isn't a preview server, Sarah has probably started that server herself, such as with `pnpm dev` or `pnpm dev:sign-in`. Navigate a tab to the port's URL and check it's this app: the meal planner on 3000, or the list of seeded users on 3001. If it is, use it as you would a reused server. If it isn't, stop and tell Sarah what's on the port. If `preview_start` fails any other way, stop and show Sarah what `preview_logs` prints.

If a `preview_start` said `reused: false`, you started that server, so stop it when you're done: call `preview_stop` with the `serverId` it gave. Leave every other server running, whether `preview_start` reused it or Sarah started it herself. This holds for `dev` and `sign-in` alike.

# Which User to Sign In As
A check or repro step that needs a signed-in user says who it signs in as:
- **If it changes the user's email:** a new user it signs up through the app. `pnpm seed` finds seeded users by their email, so it would leave a seeded user with a changed email behind.
- **Otherwise:** a seeded user, named by key: `owner`, `admin`, `write` or `read`, as listed in `seed/users.ts`. If the behavior differs by access level, it's the user at that level.

# Screen Sizes
For phone-size checks, use the built-in browser's `mobile` preset, and set it back to `desktop` when you're done.
