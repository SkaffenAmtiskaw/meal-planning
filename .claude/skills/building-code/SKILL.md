---
name: building-code
description: How to build a planned change to the app's code, from reading what it builds on to handling the user's feedback. Use when building a step of a story's plan, or a fix to a story's code that the user reviews.
user-invocable: false
---

# Building Code
Build a planned change in this order: read what it builds on and check that the plan fits, write it test first, clean up and run the checks, do its acceptance checks, then handle the user's feedback. Along the way, the user decides each choice the plan leaves open and no source settles, because past implementers here settled those themselves and often got them wrong.

## 1. Read the Plan and Check It Fits
Read every file the plan names, and check that the plan fits the code, the design and the docs:
- **New behavior in an existing module:** if it's a different job from the one the module does, build it as its own module without asking, as "Single Concern" in `docs/project_conventions.md` requires, even where the plan adds it to the existing module.
- **UI elements:** for each element in the design the plan cites, name the component you'll use: the plan's, or Mantine's if the plan doesn't say, as `docs/style_guidelines.md` prefers. It's an open choice if the note gives no reason or sign-off and either:
  - the component would look clearly different from the design
  - the plan builds it custom where a Mantine component does the job and matches the design
- **Anywhere else the plan doesn't fit the code, or departs from the design or the docs with no reason or sign-off from the user in the note:** the sources disagree, so it's an open choice.

Ask the user about each open choice before you build that part. Give each reasonable approach with what it changes: what the user would see in the app, which code it touches, and what later work it makes easier or harder.

## 2. Write It Test First
Build the change one piece of logic at a time: write the test, run it and see it fail for the right reason, then write the code that makes it pass. Each test follows "Test Logic, Not Rendering" in `docs/unit_tests.md`. A change that adds no logic, such as a type fix or a rename, gets no new test. A fix that adds a branch, like a null guard, does: say so in your report, so it doesn't look like padding.

As you build, you'll make decisions the plan doesn't, such as a button's wording, what happens when a save fails or a new component's props. Apart from plumbing and details nobody would weigh, like a local variable's name, each one is an open choice unless one of these settles it:
- the note
- the docs in `docs/`
- the libraries' docs
- the existing code, when it leaves only one answer that works, such as an argument that has to be required because a caller breaks without it

Your own sense of what's obvious, or what you'd prefer, never settles one: if you can't point to the file and line, the note section or the doc that rules out the other answers, it's open.
- **If a source settles it:** make it, and give its source in your report.
- **If it's open:** stop and ask the user, as step 1 describes, before writing the code it affects, rather than putting in a placeholder to fix later.

Change files only with Edit and Write, never through Bash, because the hook that guards the project config and ignore comments sees only Edit and Write.

## 3. Clean Up and Run the Checks
Once the code is written, make two cleanup edits:
1. **Import aliases** in the files you changed, as "Imports" in `docs/project_conventions.md` describes.
2. **Shared mocks** for each module mocked with `vi.mock` in the test files you changed, as "Creating Centralized Mocks" in `docs/unit_tests.md` describes, across the app.

Then run `pnpm lint` on the files you changed, `pnpm test:agent` on each file or folder you changed, and `pnpm check:types`, and fix what they find.

## 4. Do the Acceptance Checks
Before handing the change to the user, do its acceptance checks yourself, so the user doesn't run into the obvious failures.

For a Build Order step, do its Implementer checks first, which are yours alone and never go to the user. Its Sarah checks are then its acceptance checks, and "Sarah checks: none" means it has none.

How you do the checks depends on the change:
- **If the change touches only tests:** do its checks as `test-only-checks.md` in this skill's folder describes.
- **Otherwise:**
  1. If a check needs the running app, start it and sign in as the `running-the-app` skill describes.
  2. If a check needs data that doesn't exist yet, like a day with two meals, create it through the app's own screens, and list what you created in your report.
  3. Do each check as it's written, including the user, the screen size and the data it names, and record what you saw in concrete terms: "the modal closed and the meal appeared on Tuesday", not "works".
  4. If a check fails, it's part of the change's spec, so fix it, then rerun the tests and the acceptance checks the fix could affect.
  5. If the plan cites Design Handoff sections or images, compare what you built with them, as `design-comparison.md` in this skill's folder describes.

If you can't run a check, such as one that needs a user, a commit or a push you can't get to, report it as not run, with the reason. If another run of yours already shows everything it would prove, such as running a job's script against a local server that returns 401 instead of breaking a secret on GitHub, report which run covers it.

## 5. Handle the User's Feedback
Sort each piece of the user's feedback:
- **A bug:** it doesn't do what the plan or its design says. Fix it as `bugs.md` in this skill's folder describes.
- **A change or addition:** it works as planned, but the user wants something different or more. Feedback at review is often quick and loosely worded, so settle its open choices, as steps 1 and 2 describe, before changing any code. Then build it from step 2 on, redoing only the acceptance checks it affects.
- **A correction to how it's built,** such as where a file lives or which pattern to use: make it. If `docs/` doesn't already say it, it's a doc gap.
