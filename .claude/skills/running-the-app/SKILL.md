---
name: running-the-app
description: How to run this project's app in the built-in browser and sign in. Use before checking something in the running app.
user-invocable: false
---

# Starting the App
1. Call the built-in browser's `preview_start` with the name `dev`.
2. To sign in, how you do it depends on the user the check or repro names. In a worktree, never sign in with Google, because Google accepts sign-ins only from the main checkout's `localhost:3000`. The cases:
   - **A seeded user, or no user:** call `preview_start` with the name `sign-in`, then open `<sign-in URL>/<key>` for that user, or `owner` if it names none. The sign-in URL is on the host in `BETTER_AUTH_URL` in this checkout's `.env.local`, at the file's `SIGN_IN_PORT`, or at 3001 if the file has no `SIGN_IN_PORT`. If the link's page says that user isn't seeded, reseed and open the link again. If this checkout has a story data file in `seed/stories/`, reseed with `pnpm seed <story>`, so its data stays loaded. Otherwise, run `pnpm seed`.
   - **A story user, meaning one a story's data file created:** sign in through the app's sign-in form, with their email and the dev password from `seed/users.ts`, because the link server only knows the seeded users.

In either step, if `preview_start` says a port is taken by a process that isn't a preview server, find out whether that process is this checkout's. Another checkout's server would show you its own code and database. The cases:
- **For `dev`:** it's this checkout's if its PID is the one in this checkout's `.next/dev/lock`.
- **For `sign-in`:** it's this checkout's if its working folder is this checkout.

If it's this checkout's, open its URL in a tab and use it: `BETTER_AUTH_URL` for `dev`, the sign-in URL for `sign-in`. The user has probably started it themselves. Otherwise, stop and tell the user what's on the port. If `preview_start` fails any other way, stop and show the user what `preview_logs` prints.

When you're done, stop each server whose `preview_start` said `reused: false`, because the user starts their own server when they want one and doesn't want to hunt down one an agent left running. Leave every other server running.

# Screen Sizes
For phone-size checks, use the built-in browser's `mobile` preset, and set it back to `desktop` when you're done, because the tab keeps the size for later checks and for the user, who sees the same tab.
