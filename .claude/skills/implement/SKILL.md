---
name: implement
description: Implement the next step of a ready note's implementation plan, asking Sarah about every choice the plan doesn't settle, then stop for her review. One step per session.
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
- **It used APIs from memory.** The libraries in this project are newer than your training data.

When the plan doesn't decide something, Sarah decides it, not you. She would rather answer many questions than review a guess.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Doc gaps:** the moment you notice something that belongs in `.opencode/docs/` (a convention the docs don't cover, or a rule that's wrong or out of date), stop and ask Sarah whether it should become doc. If it should, draft the change, show it to her and write it once she approves. Don't save it for the report or a later pass.
- **Out-of-scope items:** keep a running list of anything that belongs outside this step. Don't stop to deal with them as they come up. Step 10 handles them.

## 1. Find the step
Find the note in `notes/features/`. It needs `status: ready` or `in-progress`. If it has neither, tell Sarah what you found and stop. `notes/Note Conventions.md` explains the frontmatter and markers if you need them.

Read the whole note, including:
- each embedded section (`![[Hub#Section]]`), which is part of the note
- the Design Handoff and its images in `notes/assets/<story>/`
- ⚠️ Check Drift callouts, and **As built** notes on earlier steps

The step to implement is the first one under `# Implementation` with no `**Status:**` line. Tell Sarah in one line which step you're implementing. If `status` is `ready`, set it to `in-progress`.

Read the project docs when the work needs them, not all up front: `.opencode/docs/project_conventions.md` and `project_structure.md` before writing code, `unit_tests.md` before writing tests, `theme.md` before UI work.

## 2. Settle the open choices
**The rule:** a choice is open when there are two reasonable ways to do something and no written source picks one. Written sources are:
- the note: the step, the approach, the Design Handoff and its images
- Sarah's answers in this session
- the project docs in `.opencode/docs/`
- current library docs (see step 3)

Your own sense of what's obvious is never a source. An open choice is a question for Sarah.

Open choices include:
- anything she'd see in the app: layout, wording, what happens on an edge case or an error
- the shape of the code: a new module or reusing one, where it lives, its props or arguments
- anywhere the plan and the code disagree, such as a file that isn't what the plan assumed or a file the step needs that isn't in its Files list

Things the conventions settle, like local variable names or file naming, aren't open choices.

### Before writing any code
1. Read every file the step lists. Note anywhere the code isn't what the plan assumes.
2. If the step adds behavior to an existing module, name the job that module already does. If the new behavior isn't that same job, it's an open choice.
3. For UI work, go through each element in the design sections the step cites. For each one, name the Mantine component or theme value you'll use. If the nearest Mantine option would look clearly different from the design or wouldn't fit, that element was probably meant to be custom. Ask Sarah whether to build it custom or use a Mantine approximation.
4. Write the open choices to `.opencode/scratch/<note name> - step <N> choices.md`, then ask about them one at a time.

### While writing code
When a new open choice comes up, stop and ask right then. Don't save it for the end, and don't put in a placeholder to fix later.

Keep a list of every choice you make, each with its source. It goes in your report. If a choice has no source, it should have been a question.

## 3. Use current library APIs
Memory is never a source for a library API. Every API you use needs one of these:
- **The same API already used in this codebase,** the same way.
- **Next.js:** the version-matched docs in `node_modules/next/dist/docs/`.
- **Mantine:** the first time the step uses a component, or uses one for a new purpose, read its mantine.dev page, found through https://mantine.dev/llms.txt. Its docs show how Mantine intends the component to be used, which the types don't. Sarah strongly prefers doing things Mantine's way. To look up a prop on a component already used the documented way, the type definitions in `node_modules/@mantine/*/lib/` are enough.
- **better-auth:** https://better-auth.com/llms.txt, then the page for the API you need.
- **Anything else:** the installed package's docs for that version, or its type definitions.

Look up only what the step uses: one component, one function, one page. No whole-library reading.

When you use custom CSS instead of a Mantine component, theme setting or variant, put a one-line comment directly above it saying why Mantine didn't fit.

## 4. Write the tests first, then the code
**What a test is for:** every test names the branch or logic it covers. That means a conditional, a calculation, a state change, or what an interaction causes. If the test would still pass after you deleted the code it claims to cover, it doesn't count.

**Never test that JSX renders to spec.** No tests that a class is applied, that a prop is passed to a child, or that text from a prop shows up. Those are brittle and check nothing Sarah cares about.

For each piece of logic:
1. Write the test.
2. Run it with `pnpm test:agent <path>` and see it fail for the right reason.
3. Write the code that makes it pass.

A component with no branches still needs coverage. After writing it, add one test named `renders (coverage only, no logic)` that renders it and asserts nothing about the JSX.

A change that adds no logic (a type fix, lint fix, rename or import change) gets no new tests. The existing tests just have to keep passing. If a fix does add a branch, like a null guard, it needs a test. Say so in your report so it doesn't look like padding.

Follow `.opencode/docs/unit_tests.md` for mocks and test patterns.

Change files only with Edit and Write, never through Bash. The hook that protects the project config only sees Edit and Write.

## 5. Run the checks
Run `pnpm lint`, `pnpm check:types` and `pnpm test:agent` on the files you changed. Fix what they find. Never silence a check with an ignore comment or a config change unless Sarah told you to. A hook will ask her if you try.

Then read `cleanup.md` in this skill's folder and do what it says.

## 6. First pass in the app
Read `first-pass.md` in this skill's folder and do what it says.

## 7. Stage and report
Stage the files this step changed, by path. Never use `git add -A` or `git add .`. Don't commit. Sarah commits.

Then report, in this order:
1. **Files:** each file changed, with a one-line reason. Mark any file that isn't in the step's Files list.
2. **Choices:** each choice you made, what you picked and its source.
3. **Tests:** each test and the branch or logic it covers. List coverage-only tests as such. Mark tests added for a branch that a fix introduced.
4. **First pass:** each acceptance check, and what you saw or why you couldn't run it. Then any differences from the design.
5. **As built:** anything that differs from the step's plan. This is a draft; it goes into the note in step 9.
6. **Out of scope:** anything you collected.

End with: "Please check the acceptance criteria and review the staged diff."

Then stop and wait. The step isn't done until Sarah says it is.

## 8. Handle her feedback
Sort each piece of feedback:
- **A bug:** it doesn't do what the step or the design says. Read `bugs.md` in this skill's folder and follow it.
- **A change or addition:** it works as specified, but she wants something different or more. Her feedback at review is often quick and loosely worded, so it's where the most ambiguity is. Settle the open choices in it (step 2) before changing any code. Then write tests first, run the checks and redo the first-pass checks it affects.

Where a change or addition goes:
- **Same step, recorded as As built:** the step's idea sentence still holds. This includes behaviors she assumed but the spec never said, like a button that should focus a field.
- **Re-plan:** the idea sentence would have to change, or the work pulls in a later step or another story. Follow "Stopping to re-plan" below.
- **Out of scope:** new work unrelated to this step goes on the out-of-scope list.

**Corrections to how it's built.** Some feedback changes how the code is built rather than what it does: where a file lives, how data is fetched, which pattern to use. If the docs in `.opencode/docs/` already say it, you missed it, and there's nothing to ask. Otherwise, ask her whether it's a one-off for this step or the convention from now on. The docs lag far behind the code, and the moment she corrects you is the cheapest time to write the rule down. If it's the convention, draft the change to the doc that covers it, show it to her and write it once she approves. Match the doc's existing style.

Leave feedback changes unstaged, so `git diff` shows her just the fix. She stages them when she's happy. Report again with the same sections, covering only what changed, and wait.

Repeat until she confirms the step is done.

## 9. Update the note
Once she confirms:
1. Check the step's acceptance boxes and add `**Status:** ✅ Complete`.
2. If anything differs from the plan, or was added at review, add an **As built:** note under the step. Never edit the plan text itself.
3. If this was the last step, set `status` to `in-review`. The code review of the whole story, archiving, and unblocking the stories that waited on it all come later, not in this skill.
4. Update the note's `^status` line to say what happens next, e.g. "In progress. Next: implement Step 4", or "All steps implemented. Next: code review" after the last step. It holds the status only, never a description of the story. Show Sarah the line and wait for her approval before writing it.

Leave the note changes unstaged.

## 10. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found and why it's outside this step. Then go through the router's suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.

## 11. Stop
Don't start the next step in this session. By now it has read the note, the docs and the whole step, and carrying that into the next step bloats the context. Tell Sarah the step is done and give her the command for a new session: `/implement <note name>`.

## Stopping to re-plan
When the plan itself has to change:
1. Stop coding. Leave the work as it is, staged or not.
2. Add an **As built:** note under the step saying what's done, what isn't, and why the plan needs to change.
3. Set `status` to `spec`, since any change to a ready note's steps sends it back.
4. Update the `^status` line, e.g. "Needs re-plan from Step 3", after showing Sarah the line.
5. Route any out-of-scope items (step 10).
6. Tell her to run `/plan-steps <note name>` in a new session.
