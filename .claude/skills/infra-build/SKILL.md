---
name: infra-build
description: Builds the next step of an infra story's Build Order. Use when an infra note's next step is /infra-build.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-config.sh'
---

Build the next step of the infra note **$ARGUMENTS**.

## 1. Find the Step
Find the note. If its `status` isn't `ready` or `in-progress`, tell the user what you found, and stop. If the Roadmap's "How this file works" says under "Goals" that the story can't be built yet, tell them which goal it waits on, and stop.

Read the whole note. The step to build is the first one under `## Build Order` with no `**Status:**` line. Tell the user in one line which step you're building. If `status` is `ready`, set it to `in-progress`, and move the story's Roadmap line into Now.

## 2. Build It
If the step's **Setup first:** line names an item from Setup Outside the Repo, walk the user through it before you build.

Build the step as the `building-code` skill describes, through "Do the Acceptance Checks". When you reach that section, first do the step's Implementer checks, which are yours alone and never go to the user, because they cover requirements the user doesn't look at. Then do its Sarah checks as the acceptance checks.

As you build, a change or addition to the Design or the Build Order can turn up, or come from the user's feedback. Sort where each one goes, so this step builds only the work that belongs in it. The cases, in the order to check them:
- **If it's new work for a later step or another story, or new work unrelated to this step:** put it on the out-of-scope list.
- **If a Piece can't work as designed, or the Design otherwise has to be reworked:** send the story back to `/infra-design`, as `sending-back.md` in the `building-code` skill's folder describes. The user approved the Design piece by piece, and `/infra-design` re-checks a changed Piece against its docs and gets it approved again.
- **If a smaller part of the Design or the Build Order has to change,** such as the step a Piece is built in or a check's wording: change it in the note and keep building. A change like this leaves the Pieces as they were approved, so there's nothing to re-check.
- **Otherwise:** it goes in this step.

## 3. Report
Triage the out-of-scope list first. For each item the user pulls in:
- **If the Design has to be reworked:** send the story back, as step 2 describes.
- **If it belongs in a later step or needs a new one:** add it to the Build Order.
- **Otherwise:** build it in this step before you report.

Then report in one table, with one row per changed file. Its columns are the file as a markdown link, a one-line summary of its change, and any choice you made in that file without asking, with what settles that choice. If anything differs from the step as written, say so in a line or two under the table, as the draft of its As built note. Then open the Code tab's diff pane, so the full diff is at hand. Don't ask the user to review the diff, since for an infra story they care more that it works than how it's built.

After the report:
1. **Sarah checks your runs already cover:** ask the user whether to drop each one.
2. **Sarah checks only the user can do:** if one needs this step committed and pushed to a branch that will be merged, first ask the user to commit and push it. Then walk them through each check.
3. **End by handing the step to the user:** if it has Sarah checks the user hasn't done, ask the user to do those checks. Otherwise, ask whether the step is done.

## 4. Handle the User's Feedback
1. **If a piece of feedback is a change or addition,** sort where it goes, as step 2 describes.
2. **Handle the feedback that stays in this step** as the `building-code` skill describes under "Handle the User's Feedback", and report each change again in step 3's form, covering only what changed. Repeat items 1 and 2 until the user confirms the step is done.
3. **Triage the items added to the out-of-scope list since step 3's triage.** Handle each item the user pulls in as step 3 describes. If one goes in this step, report it as item 2 describes, then wait for the user to confirm the step again.

## 5. Update the Note
1. Check the step's Sarah check boxes, remove any check the user dropped, and add `**Status:** ✅ Complete`.
2. Under `# Goals`, check each box that the step's Sarah checks proved.
3. If anything differs from the step as written, was added from the user's feedback or dropped, add an **As built:** note under the step. For a dropped check, it says which of your runs covered it.
4. If this was the last step, set `status` to `in-review`.
5. Update Where It Stands, with a `^status` line such as "In progress. Next: /infra-build Step 4", or "All steps implemented. Next: /final-review" after the last step.

## 6. Stop
Route the out-of-scope list. Then tell the user the step is done, and give them the next command from the `^status` line to run in a new session, because this session has already read the note, the docs and the whole step, and carrying that into the next step bloats the context.
