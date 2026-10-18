---
name: running-the-app
description: How to run this project's app in the built-in browser and sign in. Use before checking something in the running app.
user-invocable: false
---

# Starting the App
1. Call the built-in browser's `preview_start` with the name `dev`.
2. To sign in, also call `preview_start` with the name `sign-in`, then open `http://localhost:3001/<key>` for the seeded user the check or repro names, or `owner` if it names none. If the link's page says that user isn't seeded, run `pnpm seed` and open the link again.

If `preview_start` says the port is taken by a process that isn't a preview server, the user has probably started the server themselves. Open the port's URL in a tab. If it's this app (the meal planner on 3000, the list of seeded users on 3001), use it. Otherwise, stop and tell the user what's there. If `preview_start` fails any other way, stop and show the user what `preview_logs` prints.

When you're done, stop each server whose `preview_start` said `reused: false`, because the user starts their own server when they want one and doesn't want to hunt down one an agent left running. Leave every other server running.

# Screen Sizes
For phone-size checks, use the built-in browser's `mobile` preset, and set it back to `desktop` when you're done, because the tab keeps the size for later checks and for the user, who sees the same tab.
