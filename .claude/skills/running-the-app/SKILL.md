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

In either step, if `preview_start` says a port is taken, check whether you can use what holds it. Another checkout's server would show you its own code and database. The cases, by what `preview_start` says holds the port, and what to do in each:
- **Another chat's preview server:** that chat is another session in this checkout, because each checkout's `.claude/launch.json` claims only its own ports. If the server answers at its URL, use it. Otherwise, stop and tell the user which sessions `list_sessions` shows running in this checkout. On 2026-11-27, only the session that started a preview server could stop it, and neither `preview_start` nor the Claude app's sidebar showed which session that was.
- **A process that isn't a preview server, for `dev`:** if its PID is the one in this checkout's `.next/dev/lock`, use it. Otherwise, stop and tell the user what's on the port.
- **A process that isn't a preview server, for `sign-in`:** if its working folder is this checkout, use it. Otherwise, stop and tell the user what's on the port.

To use a server, open its URL in a tab: `BETTER_AUTH_URL` for `dev`, the sign-in URL for `sign-in`. If `preview_start` fails any other way, stop and show the user what `preview_logs` prints.

# Screen Sizes
For phone-size checks, use the built-in browser's `mobile` preset, and set it back to `desktop` when you're done, because the tab keeps the size for later checks and for the user, who sees the same tab.

# When You're Done
Stop each server whose `preview_start` said `reused: false`, because the user doesn't want to hunt down a server an agent left running. Leave every other server running. When to stop depends on where you are:
- **A subagent:** stop it when you're done with the app, because the user reviews the session's work, not a subagent's run.
- **A session in a worktree:** the user reviews the work in a browser next to the code, and starting a worktree's app by hand is hard for them. The cases:
  - **If the session will commit its work:** leave the server running until the commit, then stop it. When you leave it running, give the user the app's URL and the sign-in link you used, so they can also open it in another browser.
  - **Otherwise:** stop it when you're done with the app.
- **A session in the main checkout:** stop it when you're done with the app, because the user and every other session there use the same ports.
