# First pass in the app
Before handing the step to Sarah, do its acceptance checks yourself in the running app, and compare what you built with the design. This doesn't replace her checks. It means she shouldn't run into the obvious failures.

## Start the app
1. Run `sh scripts/playwright-server.sh check`. If it prints `not running`, run `sh scripts/playwright-server.sh start`. If that prints `timeout`, stop and show Sarah the log lines it printed.
2. Open http://localhost:3000 in the browser pane.
3. If you need to sign in, the test login is in `.opencode/secrets/credentials.md`. Only type it into the app on localhost:3000, and never repeat it in chat.

If you started the server, leave it running for Sarah's review. Tell her you started it, and that `sh scripts/playwright-server.sh stop` stops it.

## Do each acceptance check
Do each check as it's written, including the user, the screen size and the data it names:
- **Phone size:** use the browser pane's `mobile` preset, and set it back to `desktop` when you're done.
- **Data:** if the check needs data that doesn't exist yet, like a day with two meals, create it through the app's own screens. List what you created in your report.
- **A user or setup you can't get to,** like a read-only user with no test login: don't run the check. Report it as not run, with the reason.

Record what you actually saw, in concrete terms: "the modal closed and the meal appeared on Tuesday", not "works". Never report a check as passing unless you saw it pass.

A failing check is part of the step's spec, so fix it. If the fix involves an open choice, ask Sarah first. After any fix, rerun the tests and the checks it could affect.

## Compare with the design
For each Design Handoff section and image the step's **Source:** cites, screenshot the same view at the same screen size and compare. Designs aren't pixel perfect, but the build should mostly match them.

- **Must match.** The design is a written source, so fix these without asking:
  - what's on screen and in what order
  - the layout (row vs column, grouping, alignment)
  - wording
  - which states exist
  - which kind of control it is (button vs link)
  - color roles from `.opencode/docs/theme.md`
- **Don't chase:** differences too small to notice at a glance, like a few pixels of spacing that come from using a Mantine theme value. Don't report these.
- **Ask Sarah:** the element looks clearly different from the design, or matching it would take custom CSS or using a Mantine component differently from how its docs intend.

If the Design Handoff and something Sarah said in this session disagree, ask her which one wins.
