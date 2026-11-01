---
name: building-code
description: How to build a planned change to the code, from reading what it builds on to handling the user's feedback. Use when building a step of a story's plan, or a fix to a story's code that the user reviews.
user-invocable: false
---

# Building Code

## 1. Read the Plan and Check It Fits
Read every file the plan names, then check the plan against the code, the design and the docs before you build. Two places where it may not fit have rules of their own:
- **New behavior the plan adds to an existing module, where it's a different job from the one the module does:**
  - **If the note gives the user's reason or sign-off for adding it there:** follow the plan.
  - **Otherwise:** build it as its own module without asking. "Single Concern" in `docs/project_conventions.md` rules out adding it to the existing module, even when that module is where the behavior is used.
- **The component for each UI element in the design the plan cites:** start from the component the plan names for the element. If the plan names none, start from Mantine's, because `docs/style_guidelines.md` prefers Mantine components. Then:
  - **If the note gives the user's reason or sign-off for that component:** use it.
  - **If the component would look clearly different from the design, or the plan builds the element custom where a Mantine component does the job and matches the design:** which component to use is an open choice.
  - **Otherwise:** use it.

Ask the user about each open choice before you build that part. Give each reasonable approach with what it changes: what the user would see in the app, which code it touches, and what later work it makes easier or harder.

## 2. Write It Test First
Build the change one piece of logic at a time: write the test, run it and see it fail for the right reason, then write the code that makes it pass. "Test Logic, Not Rendering" in `docs/unit_tests.md` says which tests a change gets and what each one covers.

As you build, you'll make decisions the plan doesn't, such as a button's wording, what happens when a save fails or a new component's props. If one is an open choice, stop and ask the user, as step 1 describes, before writing the code it affects, rather than putting in a placeholder to fix later. Otherwise, make it, and say in your report what settles it, so the user can catch one that was theirs to make.

Change files only with Edit and Write, never through Bash, because the hook that guards the project config and ignore comments sees only Edit and Write.

## 3. Clean Up and Run the Checks
Once the code is written, make two cleanup edits:
1. **Import aliases** in the files you changed, as "Imports" in `docs/project_conventions.md` describes.
2. **Centralized mocks** for each module mocked with `vi.mock` in the test files you changed, as "Creating Centralized Mocks" in `docs/unit_tests.md` describes. Count the test files that mock it across the whole app, not only the ones you changed.

Then run `pnpm lint` on the files you changed, `pnpm test:agent` on each file or folder you changed, and `pnpm check:types`, and fix what they find. If the change adds a lint rule, also run `pnpm lint:ci` on the whole app, because the rule can break files you didn't change.

## 4. Do the Acceptance Checks
Before handing the change to the user, do its acceptance checks yourself, so the user doesn't run into the obvious failures.

For a Build Order step, do its Implementer checks first, which are yours alone and never go to the user. Its Sarah checks are then its acceptance checks.

How you do the checks depends on the change:
- **If the change touches only tests:** do its checks as `test-only-checks.md` in this skill's folder describes.
- **Otherwise:**
  1. If a check needs the running app, start it and sign in as the `running-the-app` skill describes.
  2. If a check needs data that doesn't exist yet, like a day with two meals, create it through the app's own screens, so the check runs on data the app itself could produce. When you report that check, say what data you created for it.
  3. For each check you can run, do it as it's written, including the signed-in user, the screen size and the data it names. Record what you saw in concrete terms: "the modal closed and the meal appeared on Tuesday", not "works". For a check you can't run, such as one only the user can do, or one that needs a commit or a push you can't get to:
     - **If another run of yours already shows everything it would prove:** report which run covers it. For example, a check might break a CI job's secret on GitHub to see the job fail. Running the job's script against a local server that returns 401 shows the same failure, so it covers the check.
     - **Otherwise:** report it as not run, with the reason.
  4. If a check fails, fix the code until it passes, because the check is part of the change's spec. Then rerun the tests and the acceptance checks the fix could affect.
  5. If the plan cites Design Handoff sections or images, compare what you built with them, as `design-comparison.md` in this skill's folder describes. After a fix from the comparison, rerun the tests and the acceptance checks it could affect.

## 5. Handle the User's Feedback
Sort each piece of the user's feedback:
- **A bug:** it doesn't do what the plan or its design says. Fix it as `bugs.md` in this skill's folder describes.
- **A change or addition:** it works as planned, but the user wants something different or more. Feedback at review is often quick and loosely worded, so settle its open choices, as steps 1 and 2 describe, before changing any code. Then build it from step 2 on, redoing only the acceptance checks it affects.
- **A correction to how it's built,** such as where a file lives or which pattern to use: make it. If `docs/` doesn't already say it, it's a doc gap.
