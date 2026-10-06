# First pass in the app
Before handing the step to Sarah, do its acceptance checks yourself in the running app, and compare what you built with the design. This doesn't replace her checks. It means she shouldn't run into the obvious failures.

## Start the app
Skip this if no check in the step needs the app, such as when every check is a break-it check or a run-and-see check (see below).

Start it, sign in, and stop it when you're done, as the `running-the-app` skill describes.

## Do each acceptance check
If the step is a Build Order step, do its Implementer checks first. They're yours alone and never go to Sarah, and you fix a failing one the same way as a failing acceptance check (below). Its Sarah checks are then its acceptance checks. If it says "Sarah checks: none", it has none.

Do each check as it's written, including the user, the screen size and the data it names:
- **Phone size:** see Screen Sizes in the `running-the-app` skill.
- **Data:** if the check needs data that doesn't exist yet, like a day with two meals, create it through the app's own screens. List what you created in your report.
- **Setup outside the repo** that the step's Approach, or a Build Order step's Setup first line, gives Sarah and she hasn't done yet: before the first check that needs it, walk her through it, as AGENTS.md describes under "Setup outside the repo". Then run the check, unless it's one only Sarah can do (see "Run-and-see checks").
- **A user or anything else you can't get to:** don't run the check. Report it as not run, with the reason.

Record what you actually saw, in concrete terms: "the modal closed and the meal appeared on Tuesday", not "works". Never report a check as passing unless you saw it pass.

A failing check is part of the step's spec. If fixing it involves an open choice, ask Sarah first. Otherwise, fix it. After any fix, rerun the tests and the checks it could affect.

### Checks your runs already cover
If you couldn't run one of Sarah's checks as written, but another run of yours already shows everything it would prove, such as running a job's script against a local server that returns 401 instead of breaking a secret on GitHub, report which run covers it. `SKILL.md` step 7 asks her whether to drop it.

### Break-it checks
A step that changes only tests has break-it checks instead of click-throughs, and doesn't need the app. For each check:
1. Make the edit exactly as written.
2. Run the command the check names: `pnpm vitest run <test file>` for a unit test, or `pnpm test:e2e <spec file>` for an E2E spec.
3. Record which tests failed.
4. Revert the edit, and check with `git diff` that the file is back to how it was before the check.

If the tests that failed aren't exactly the ones the check names, don't change the tests or the check yourself. Show Sarah both lists and ask what to do.

### Run-and-see checks
Two kinds of step have run-and-see checks: a step that builds infrastructure in an infra story, such as a workflow or a script, and a test-only step that changes E2E code. In each, you run a command, open a PR or trigger a workflow, then see the result. If a check runs only on this machine, run it once any setup outside the repo it needs is done, and record what you saw. If it needs a commit or a push, such as opening a PR, or something only Sarah can do, such as a check in the claude.ai UI, don't run it. Report it as not run, with the reason. `SKILL.md` step 7 walks her through it after the report.

For an E2E trace check, run `pnpm test:e2e <spec file>` instead of `pnpm test:e2e:trace`, and record which tests passed in each project. The trace command keeps a report server running until it's stopped, and watching the trace is Sarah's check.

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
