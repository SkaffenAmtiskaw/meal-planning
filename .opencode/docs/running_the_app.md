# Starting the App
1. Run `sh scripts/playwright-server.sh check`. If it prints `not running`, run `sh scripts/playwright-server.sh start`. If that prints `timeout`, stop and show Sarah the log lines it printed.
2. Open http://localhost:3000 in the built-in browser.
3. To sign in, use the test login in `.opencode/secrets/credentials.md`. Type it only into the app on localhost, and never repeat it in chat or a report.

`sh scripts/playwright-server.sh stop` stops the server. If you started it, tell Sarah.

# Screen Sizes
For phone-size checks, use the built-in browser's `mobile` preset, and set it back to `desktop` when you're done.
