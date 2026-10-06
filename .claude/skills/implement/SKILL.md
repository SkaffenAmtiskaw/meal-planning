---
name: implement
description: Implement the next step of a ready note's implementation plan, asking Sarah about each real choice the plan leaves open, then stop for her review. One step per session.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-config.sh'
---

Implement the next step of the note **$ARGUMENTS**.

## Why this skill works the way it does
Sarah reviews every step by hand, in the diff and in the running app, before the next one starts. The plan is how she makes sure what gets built is what she expected.

The agent this skill replaces failed her in three ways, and most rules below exist because of one of them:
- **It settled questions itself.** When the plan was silent, it picked an answer instead of asking, and the answers were often wrong.
- **Its tests were worthless.** They checked that a class was applied or a prop was passed, not the logic.
- **It used APIs from memory.**

When the plan leaves a real choice open, Sarah decides it, not you. A choice that the note, the docs or the existing code already settle isn't a question: make it and list it in your report, where she can check it without being asked about every detail.

## 1. Find the step
Find the note in `notes/features/`. It needs `status: ready` or `in-progress`. If it has neither, tell Sarah what you found and stop.

If its Roadmap line serves a ranked goal but not the building goal, and has no 🚨 or 📌, it can't be built yet, as the Roadmap's "How this file works" describes under "Goals". Tell Sarah which goal it waits on, and stop.

Read the whole note, including:
- the Design Handoff and its images in `notes/assets/<story>/`
- ⚠️ Check Drift callouts, and **As built** notes on earlier steps

The step to implement is the first one under `# Implementation` with no `**Status:**` line. Tell Sarah in one line which step you're implementing. If `status` is `ready`, set it to `in-progress` and move the story's line in `notes/Roadmap.md` into **Now**, following that file's rules for what a line holds.

Read the project docs AGENTS.md lists when the work needs them, not all up front.

## 2. Settle the open choices
**The rule:** a choice is open as AGENTS.md describes under "Open choices are hers": it has more than one reasonable answer, and nothing written picks one. Here, the written sources are:
- the note: the step, the approach, the Design Handoff and its images
- Sarah's answers in this session
- the project docs in `docs/`
- current library docs (see step 3)
- the existing code, when it leaves only one answer that works, such as an argument that has to be required because a caller breaks without it

Your own sense of what's obvious, or what you'd prefer, is never a source. If you can't point to the file and line, the note section or the doc that rules out the other answers, the choice is open.

Choices that are often open:
- anything she'd see in the app: layout, wording, what happens on an edge case or an error
- the shape of the code: a new module or reusing one, where it lives, its props or arguments
- anywhere the plan and the code disagree, such as a file that isn't what the plan assumed or a file the step needs that isn't in its Files list

Things the conventions settle, like local variable names or file naming, aren't open choices.

How tooling plumbing works, such as which API, protocol or command flags a routine or script uses, isn't an open choice either, as AGENTS.md describes under "What to ask about". Pick what works, and give that AGENTS.md section as its source, with your reason.

Keep a list of every choice you make without asking, each with its source. It goes in your report. If a choice has no source, it should have been a question.

### Asking about an open choice
Ask about one choice at a time, even when several belong to the same function or component. Leave the parts the sources already settle out of the question: they go in the report. For each open choice, give:
- each reasonable approach, and what it changes: what she'd see in the app, which code it touches, and what later work it makes easier or harder
- a recommendation, as AGENTS.md describes under "Recommendations"

### Before writing any code
1. If the step's Approach asks you to record the state before the change, such as test counts, record it now, before you change anything.
2. Read every file the step lists. Note anywhere the code isn't what the plan assumes.
3. If the step adds behavior to an existing module, name the job that module already does. If the new behavior isn't that same job, it's an open choice.
4. For UI work, go through each element in the design sections the step cites. For each one, name the Mantine component or theme value you'll use. If the nearest Mantine option would look clearly different from the design or wouldn't fit, that element was probably meant to be custom. Ask Sarah whether to build it custom or use a Mantine approximation.
5. Write the open choices to `.scratch/<note name> - step <N> choices.md`, then ask Sarah about each one, as "Asking about an open choice" describes.

### While writing code
When a new open choice comes up, stop and ask right then. Don't save it for the end, and don't put in a placeholder to fix later.

## 3. Use current library APIs
Follow "Library APIs" in AGENTS.md for every API you use, and "Customization" in `docs/style_guidelines.md` for any custom CSS.

## 4. Write the tests first, then the code
Every test follows "Test Logic, Not Rendering" in `docs/unit_tests.md`.

For each piece of logic:
1. Write the test.
2. Run it with `pnpm test:agent <path>` and see it fail for the right reason.
3. Write the code that makes it pass.

A change that adds no logic (a type fix, lint fix, rename or import change) gets no new tests. The existing tests just have to keep passing. If a fix does add a branch, like a null guard, it needs a test. Say so in your report so it doesn't look like padding.

Change files only with Edit and Write, never through Bash. The hook that protects the project config only sees Edit and Write.

## 5. Run the checks
Run `pnpm lint`, `pnpm check:types` and `pnpm test:agent` on the files you changed. Fix what they find. A hook asks Sarah before you add an ignore comment or change project config.

Then read `cleanup.md` in this skill's folder and do what it says.

## 6. First pass in the app
Read `first-pass.md` in this skill's folder and do what it says.

## 7. Stage and report
First, triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in is handled like a change or addition in step 8: if the step's idea sentence still holds, build it now and record it as As built. Otherwise, follow "Stopping to re-plan".

Stage the files this step changed.

Then report, in this order:
1. **Files:** a table with one row per changed file: the file as a markdown link she can click, and a one-line summary of its change. Mark any file that isn't in the step's Files list.
2. **Choices:** a table of each choice you made without asking her: what you picked, and its source as a link (`file:line`, the note section or the doc). Leave out the choices she answered in this session.
3. **Tests:** each test and the branch or logic it covers. List coverage-only tests as such. Mark tests added for a branch that a fix introduced.
4. **First pass:** each acceptance check, and what you saw or why you couldn't run it. If you recorded the state before the change, give it first, since her checks compare against it. Then any differences from the design.
5. **As built:** anything that differs from the step's plan. This is a draft; it goes into the note in step 9.
6. **Out of scope:** each item triaged, and what Sarah chose for it.

After the report, go through these one at a time:
1. **Checks your runs already cover,** as `first-pass.md` describes: for each, say which of your runs shows what it would prove, and ask Sarah whether to drop it.
2. **Checks only Sarah can do,** such as ones that need a push or the claude.ai UI: walk her through them, as AGENTS.md describes under "Setup outside the repo". If one needs this step committed and pushed, first ask her to review the staged diff, then to commit and push it.

End with: "Please check the acceptance criteria you haven't done yet, and review the staged diff if you haven't."

Then stop and wait. The step isn't done until Sarah says it is.

## 8. Handle her feedback
Sort each piece of feedback:
- **A bug:** it doesn't do what the step or the design says. Read `bugs.md` in this skill's folder and follow it.
- **A change or addition:** it works as specified, but she wants something different or more. Her feedback at review is often quick and loosely worded, so it's where the most ambiguity is. Settle the open choices in it (step 2) before changing any code. Then write tests first, run the checks and redo the first-pass checks it affects.

Where a change or addition goes:
- **Same step, recorded as As built:** the step's idea sentence still holds. This includes behaviors she assumed but the spec never said, like a button that should focus a field.
- **Re-plan:** the idea sentence would have to change, or the work pulls in a later step or another story. Follow "Stopping to re-plan" below.
- **Out of scope:** new work unrelated to this step goes on the out-of-scope list.

**Corrections to how it's built.** Some feedback changes how the code is built rather than what it does: where a file lives, how data is fetched, which pattern to use. If the docs in `docs/` already say it, you missed it, and there's nothing to ask. Otherwise, ask her whether it's a one-off for this step or the convention from now on. If it's the convention, handle it as AGENTS.md describes under "Doc gaps".

How a feedback change is reported depends on its form, as AGENTS.md describes under "Approval covers the edits":
- **If its exact form was settled before you wrote it,** such as a swap she named: stage the files it changed, and report again with the same sections, covering only what changed. Don't ask her to approve it.
- **Otherwise:** leave it unstaged, so her unstaged changes show just the fix. Report again with the same sections, covering only what changed, and ask her whether she approves it. Once she does, stage the files it changed.

Repeat until she confirms the step is done.

## 9. Update the note
Once she confirms:
1. Check the step's acceptance boxes and add `**Status:** ✅ Complete`. Remove any check she dropped. Its As built note says which of your runs covered it.
2. If anything differs from the plan, or was added at review, add an **As built:** note under the step.
3. If this was the last step, set `status` to `in-review`. The review of the whole story (`/final-review`), archiving, and unblocking the stories that waited on it all come later, not in this skill.
4. Update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "In progress. Next: /implement Step 4", or "All steps implemented. Next: /final-review" after the last step.

Leave the note changes unstaged.

## 10. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 11. Stop
Don't start the next step in this session. By now it has read the note, the docs and the whole step, and carrying that into the next step bloats the context. Tell Sarah the step is done and give her the command for a new session: `/implement <note name>`.

## Stopping to re-plan
When the plan itself has to change:
1. Stop coding. Leave the work as it is, staged or not.
2. Add an **As built:** note under the step saying what's done, what isn't, and why the plan needs to change.
3. Set `status` to `spec`, since any change to a ready note's steps sends it back.
4. Update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Needs re-plan. Next: /plan-steps".
5. Route any out-of-scope items (step 10).
6. Tell her to run `/plan-steps <note name>` in a new session.
