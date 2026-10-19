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

## 1. Find the step
Find the note in `notes/features/`. If its `status` isn't `ready` or `in-progress`, tell the user what you found, and stop. If the Roadmap's "How this file works" says under "Goals" that the story can't be built yet, tell them which goal it waits on, and stop.

Read the whole note. The step to build is the first one with no `**Status:**` line:
- **An infra story:** under `## Build Order`, at the end of `# Design`.
- **Any other story:** under `# Implementation`.

Tell the user in one line which step you're building. If `status` is `ready`, set it to `in-progress`, and move the story's line in `notes/Roadmap.md` into Now.

## 2. Build it
If it's a Build Order step whose **Setup first:** line names an item from Setup Outside the Repo, walk the user through it before you build.

A change or addition the plan doesn't have can turn up as you build, or come from the user at review. Apart from work the story needs and Boy Scout fixes, sort where each one goes, so this step builds only the work that belongs in it:
- **If it's work for a later step or another story, or new work unrelated to this step:** put it on the out-of-scope list, so the user decides whether to pull it in.
- **If the step's idea sentence, or a Build Order step's title, would have to change:** re-plan, as `re-planning.md` in this skill's folder describes.
- **Otherwise:** it goes in this step, recorded as As built. This includes behaviors the user assumed but the plan never said, like a button that should focus a field.

Build the step as the `building-code` skill describes, through "Do the Acceptance Checks".

## 3. Report
Triage the out-of-scope list first. For each item the user pulls in:
- **If it's work for a later step or another story, or it would change the step's idea sentence or a Build Order step's title:** re-plan, as `re-planning.md` in this skill's folder describes.
- **Otherwise:** build it in this step before you report, recorded as As built.

Then report. What the report holds depends on the step:
- **A Build Order step:** one table with one row per changed file: the file as a markdown link the user can click, a one-line summary of its change, and any choice you made in it without asking, with what settles it. If anything differs from the step's plan, say so in a line or two under the table, as the draft of its As built note. Then open the Code tab's diff pane, so the full diff is at hand. Add no other tables. Don't ask the user to review the diff, since for an infra story they care more that it works than how it's built.
- **Any other step:** these sections, in this order:
  1. **Files:** a table with one row per changed file: the file as a markdown link the user can click, and a one-line summary of its change. Mark any file that isn't in the step's Files list.
  2. **Choices:** a table of each choice you made without asking: what you picked, and what settles it, with a link to its source (`file:line`, the note section or the doc) where it has one.
  3. **Tests:** each test and the branch or logic it covers.
  4. **Acceptance checks:** each one, and what you saw or why you couldn't run it.
  5. **As built:** a draft of anything that differs from the step's plan.

After the report:
1. **Checks your runs already cover:** ask the user whether to drop each one.
2. **Checks only the user can do:** if one needs this step committed and pushed, first ask the user:
   - **For a Build Order step:** to commit and push it.
   - **For any other step:** to review its changes, then commit and push it.

   Then walk them through each check.
3. **End by handing the step to the user:**
   - **A Build Order step:** if it has Sarah checks the user hasn't done, ask them to do them. Otherwise, ask whether the step is done.
   - **Any other step:** end with: "Please do the acceptance checks you haven't done yet, and review the step's changes if you haven't."

## 4. Handle the user's feedback
1. **If a piece of feedback is a change or addition,** sort where it goes, as step 2 describes.
2. **Handle the feedback that stays in this step** as the `building-code` skill describes under "Handle the User's Feedback", and report each change again in step 3's form, covering only what changed. Repeat items 1 and 2 until the user confirms the step is done.
3. **Triage the items added to the out-of-scope list since step 3's triage.** Handle each item the user pulls in as step 3 describes. If one goes in this step, report it as item 2 describes, then wait for the user to confirm the step again.

## 5. Update the note
1. Check the step's acceptance boxes, remove any check the user dropped, and add `**Status:** ✅ Complete`.
2. If it's a Build Order step, also check each box under `# Goals` that its Sarah checks proved.
3. If anything differs from the plan, was added at review or dropped, add an **As built:** note under the step. For a dropped check, it says which of your runs covered it.
4. If this was the last step, set `status` to `in-review`.
5. Update Where It Stands, with a `^status` line such as "In progress. Next: /implement Step 4", or "All steps implemented. Next: /final-review" after the last step.

## 6. Stop
Route the out-of-scope list. Then tell the user the step is done, and give them the next command from the `^status` line to run in a new session. Don't start it in this session: by now the session has read the note, the docs and the whole step, and carrying that into the next step bloats the context.
