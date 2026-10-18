---
name: implement
description: Builds the next step of a story's plan. Use when a note's next step is /implement.
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
For every story type but infra, the user reviews every step by hand, in the diff and in the running app, before the next one starts. The plan is how they make sure what gets built is what they expected.

For an infra story, they want it to work, and care little about how it's built. They usually don't review its diff, but want it at hand in case the build turns out very different from what they expected. Its steps are the Build Order at the end of its Design. Each step lists the checks you do on your own and the few the user does, which prove that one of its Goals works or need something only the user can do.

## 1. Find the step
Find the note in `notes/features/`. If its `status` isn't `ready` or `in-progress`, tell the user what you found, and stop. If the Roadmap's "How this file works" says under "Goals" that the story can't be built yet, tell them which goal it waits on, and stop.

Read the whole note. The step to build is the first one with no `**Status:**` line:
- **An infra story:** under `## Build Order`, at the end of `# Design`. Its **Builds:** line names the Pieces it builds, and its **Setup first:** line names any item from Setup Outside the Repo that the user does before it.
- **Any other story:** under `# Implementation`.

Tell the user in one line which step you're building. If `status` is `ready`, set it to `in-progress`, and move the story's line in `notes/Roadmap.md` into Now.

## 2. Build it
Build the step as the `building-code` skill describes, through "Do the Acceptance Checks". If building it shows the plan has to change, as step 4's second case describes, re-plan as `re-planning.md` in this skill's folder describes.

## 3. Report
Triage the out-of-scope list first, and handle an item the user pulls in as the first two cases of step 4 describe.

Then report. What the report holds depends on the step:
- **A Build Order step:** one table with one row per changed file: the file as a markdown link the user can click, a one-line summary of its change, and any choice you made in it without asking. If anything differs from the step's plan, say so in a line or two under the table, as the draft of its As built note. Then open the Code tab's diff pane, so the full diff is at hand. Add no other tables, and don't ask the user to review the diff.
- **Any other step:** these sections, in this order:
  1. **Files:** a table with one row per changed file: the file as a markdown link the user can click, and a one-line summary of its change. Mark any file that isn't in the step's Files list.
  2. **Choices:** a table of each choice you made without asking: what you picked, and its source as a link (`file:line`, the note section or the doc). Leave out the choices the user answered in this session.
  3. **Tests:** each test and the branch or logic it covers.
  4. **Acceptance checks:** each one, and what you saw or why you couldn't run it.
  5. **As built:** a draft of anything that differs from the step's plan.

After the report:
1. **Checks your runs already cover:** ask the user whether to drop each one.
2. **Checks only the user can do:** walk them through each one. If one needs this step committed and pushed: for a Build Order step, ask them first to commit and push it, and for any other step, to review its changes, then commit and push it.

How you end depends on the step:
- **A Build Order step:** if it has Sarah checks the user hasn't done, ask them to do them. Otherwise, ask whether the step is done.
- **Any other step:** end with: "Please do the acceptance checks you haven't done yet, and review the step's changes if you haven't."

Then stop and wait.

## 4. Handle the user's feedback
Handle each piece of feedback as the `building-code` skill describes under "Handle the User's Feedback". If it's a change or addition, first sort where it goes, before you settle its open choices, so you don't ask the user about work that belongs elsewhere:
- **If the step's idea sentence, or a Build Order step's title, still holds:** it goes in this step, recorded as As built. This includes behaviors the user assumed but the plan never said, like a button that should focus a field.
- **If the idea sentence or title would have to change, or the work pulls in a later step or another story:** re-plan, as `re-planning.md` in this skill's folder describes.
- **If it's new work unrelated to this step:** put it on the out-of-scope list.

Report each change again in step 3's form, covering only what changed. Repeat until the user confirms the step is done. Then, before you update the note, triage the items added to the out-of-scope list since step 3's triage, handling one the user pulls in as the first two cases above describe.

## 5. Update the note
Once the user confirms:
1. Check the step's acceptance boxes, remove any check the user dropped, and add `**Status:** ✅ Complete`.
2. If it's a Build Order step, also check each box under `# Goals` that its Sarah checks proved.
3. If anything differs from the plan, was added at review or dropped, add an **As built:** note under the step. For a dropped check, it says which of your runs covered it.
4. If this was the last step, set `status` to `in-review`.
5. Update Where It Stands, with a `^status` line such as "In progress. Next: /implement Step 4", or "All steps implemented. Next: /final-review" after the last step.

## 6. Stop
Route the out-of-scope list. Then tell the user the step is done, and give them the next command from the `^status` line to run in a new session. Don't start it in this session: by now it has read the note, the docs and the whole step, and carrying that into the next step bloats the context.
