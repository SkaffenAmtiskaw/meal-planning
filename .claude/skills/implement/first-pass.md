# First pass in the app
Before handing the step to Sarah, do its acceptance checks yourself in the running app, and compare what you built with the design. This doesn't replace her checks. It means she shouldn't run into the obvious failures.

## Start the app
Skip this if no check in the step needs the app, such as when every check is a break-it check or a run-and-see check (see below).

Start it, sign in, and stop it when you're done, as the `running-the-app` skill describes.

## Do each acceptance check
Do each check as it's written, including the user, the screen size and the data it names:
- **Phone size:** see Screen Sizes in the `running-the-app` skill.
- **Data:** if the check needs data that doesn't exist yet, like a day with two meals, create it through the app's own screens. List what you created in your report.
- **A user or setup you can't get to,** like a read-only user with no test login: don't run the check. Report it as not run, with the reason.

Record what you actually saw, in concrete terms: "the modal closed and the meal appeared on Tuesday", not "works". Never report a check as passing unless you saw it pass.

A failing check is part of the step's spec. If fixing it involves an open choice, ask Sarah first. Otherwise, fix it. After any fix, rerun the tests and the checks it could affect.

### Break-it checks
A step that changes only tests has break-it checks instead of click-throughs, and doesn't need the app. For each check:
1. Make the edit exactly as written.
2. Run the test file it names with `pnpm vitest run <test file>`.
3. Record which tests failed.
4. Revert the edit, and check with `git diff` that the file is back to how it was before the check.

If the tests that failed aren't exactly the ones the check names, don't change the tests or the check yourself. Show Sarah both lists and ask what to do.

### Run-and-see checks
A step that builds infrastructure in an infra story, such as a workflow or a script, has run-and-see checks: run a command, open a PR or trigger a workflow, then see the result. If a check runs only on this machine, run it and record what you saw. If it needs a commit or a push, such as opening a PR, or setup outside the repo that Sarah hasn't done yet, don't run it. Report it as not run, with the reason.

## Compare with the design
For each Design Handoff section and image the step's **Source:** cites, screenshot the same view at the same screen size and compare. Designs aren't pixel perfect, but the build should mostly match them.

Sort each difference:
- **Ask Sarah:** the Design Handoff and something she said in this session disagree. Or the difference comes from the Mantine component or theme value used: the element looks clearly different from the design, or matching it would take custom CSS or using a Mantine component differently from how its docs intend.
- **Don't chase:** differences too small to notice at a glance, like a few pixels of spacing that come from using a Mantine theme value. Don't report these.
- **Otherwise, it must match.** The design is a written source, so fix these without asking:
  - what's on screen and in what order
  - the layout (row vs column, grouping, alignment)
  - wording
  - which states exist
  - which kind of control it is (button vs link)
  - color roles from `docs/theme.md`
