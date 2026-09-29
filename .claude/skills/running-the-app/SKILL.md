---
name: running-the-app
description: How to start this project's app in the built-in browser, sign in with the test login, check phone sizes and stop the server afterward. Use before starting the app or checking something in the browser.
user-invocable: false
---

# Starting the App
1. Call the built-in browser's `preview_start` with the name `dev` (from `.claude/launch.json`). It starts the dev server, or reuses it if it's already running, and opens http://localhost:3000 in a new tab. If it fails, stop and show Sarah what `preview_logs` prints.
2. To sign in, use the test login in `.opencode/secrets/credentials.md`. Type it only into the app on localhost, and never repeat it in chat or a report.

If `preview_start` said `reused: false`, you started the server, so stop it when you're done: call `preview_stop` with the `serverId` from `preview_start`. If it said `reused: true`, leave it running.

# Screen Sizes
For phone-size checks, use the built-in browser's `mobile` preset, and set it back to `desktop` when you're done.
