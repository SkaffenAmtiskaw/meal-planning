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

## 1. Find the Step
Find the note. If its `status` isn't `ready` or `in-progress`, tell the user what you found, and stop. If the Roadmap's "How this file works" says under "Goals" that the story can't be built yet, tell them which goal it waits on, and stop.

Read the whole note. The step to build is the first one under `# Implementation` with no `**Status:**` line. Tell the user in one line which step you're building. If `status` is `ready`, set it to `in-progress`, and move the story's Roadmap line into Now.

## 2. Build It
Build the step as the `building-code` skill describes, through "Do the Acceptance Checks".

As you build, a change or addition to the plan can turn up, or come from the user at review. Sort where each one goes, so this step builds only the work that belongs in it. The cases, in the order to check them:
- **If it's new work for a later step or another story, or new work unrelated to this step:** put it on the out-of-scope list.
- **If a bug story's planned fix leaves the symptom and you find the cause isn't the one Root Cause names:** send the story back to `/investigate`, as `sending-back.md` in the `building-code` skill's folder describes. The user approved the Fix for the cause the note gives, so a fix for another cause is theirs to choose.
- **If a place can't follow a pattern's Rule as written, or the Rule turns out wrong:** send the story back to `/architect`, as that file describes. Changing a Rule can change its Enforcement and which places break it, and `/architect` re-audits the code.
- **If another part of the plan has to change,** such as the step's idea sentence, the order of the steps or a check's wording: change it in the note and keep building. A bug's Root Cause and a pattern's Rule are the only parts of a plan that need an earlier skill to rework them.
- **Otherwise:** it goes in this step. This includes behaviors the user assumed but the plan never said, like a button that should focus a field.

## 3. Report
Triage the out-of-scope list first. For each item the user pulls in:
- **If it belongs in a later step, needs a new step or would change this step's idea sentence:** change the plan in the note, as step 2 describes.
- **Otherwise:** build it in this step before you report.

Then report, in these sections, in this order:
1. **Files:** a table with one row per changed file: the file as a markdown link, and a one-line summary of its change. Mark any file that isn't in the step's Files list.
2. **Choices:** a table of each choice you made without asking: what you picked, and what settles it, with a link to its source where it has one.
3. **Tests:** each test and the branch or logic it covers.
4. **Acceptance checks:** each one, and what you saw or why you couldn't run it.
5. **As built:** a draft of anything that differs from the step's plan.

After the report:
1. **Checks your runs already cover:** ask the user whether to drop each one.
2. **Checks only the user can do:** if one needs this step committed and pushed, first ask the user to review its changes and then to commit and push it. Then walk them through each check.
3. **End by handing the step to the user:** ask them to do the acceptance checks they haven't done yet, and to review the step's changes if they haven't.

## 4. Handle the User's Feedback
1. **If a piece of feedback is a change or addition,** sort where it goes, as step 2 describes.
2. **Handle the feedback that stays in this step** as the `building-code` skill describes under "Handle the User's Feedback", and report each change again in step 3's form, covering only what changed. Repeat items 1 and 2 until the user confirms the step is done.
3. **Triage the items added to the out-of-scope list since step 3's triage.** Handle each item the user pulls in as step 3 describes. If one goes in this step, report it as item 2 describes, then wait for the user to confirm the step again.

## 5. Update the Note
1. If the story is a pattern, confirm in the code that each Migration Checklist item this step took on is done, because the acceptance checks cover a place or two, not every place the step migrated. If an item isn't done, build it, report it as step 4's item 2 describes, and wait for the user to confirm the step again. Once every item is done, check each item's box.
2. Check the step's acceptance boxes, remove any check the user dropped, and add `**Status:** ✅ Complete`.
3. If anything differs from the plan, was added at review or dropped, add an **As built:** note under the step. For a dropped check, it says which of your runs covered it.
4. If this was the last step, set `status` to `in-review`.
5. Update Where It Stands, with a `^status` line such as "In progress. Next: /implement Step 4", or "All steps implemented. Next: /final-review" after the last step.

## 6. Stop
Route the out-of-scope list. Then tell the user the step is done, and give them the next command from the `^status` line to run in a new session, because this session has already read the note, the docs and the whole step, and carrying that into the next step bloats the context.
