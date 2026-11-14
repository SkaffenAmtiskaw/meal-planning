---
name: infra-build
description: Builds the next step of an infra story's Build Order. Use when the user or a session's brief asks for /infra-build.
argument-hint: "[note name]"
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-config.sh'
---

Build the next step of the infra note **$ARGUMENTS**.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Find the Step
Find the note. If its `status` isn't `ready` or `in-progress`, tell the user what you found, and stop. Then run the checks in `starting-on-a-branch.md`, in the `building-code` skill's folder, and stop wherever they say to.

Invoke the `roadmap-rules` skill and read the story's line on the Roadmap. If, by the skill's "Goals" rules, the story can't be built yet, tell the user which goal it waits on, and stop.

Read the whole note. The step to build is the first one under `## Build Order` with no `**Status:**` line. Tell the user in one line which step you're building. If `status` is `ready`, set it to `in-progress`, and move the story's Roadmap line into Now.

## 2. Build It
If the step's **Setup first:** line names an item from Setup Outside the Repo, walk the user through it before you build.

Build the step as the `building-code` skill describes, through "Do the Acceptance Checks". When you reach that section, do the step's Implementer checks, then its Sarah checks as the acceptance checks. For each Sarah check, first try to see its result with what you have, such as a CLI or API that's already signed in, the browser pane where the user is already signed in, or a screenshot through computer use. What you do next depends on what you found:
- **If you can see the result, or one of your runs covers the check as "Do the Acceptance Checks" describes:** take the check over without asking. The user wants infra work done, not handed back to them.
- **Otherwise:** leave it to the user for now, such as a check that needs them to sign in for you, a judgment only they can make, or a push you can't make yet.

For each check that proves a Goal, keep its evidence, such as its output or a screenshot. The report shows it.

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

Then show the evidence from each check that proved a Goal, so the user sees each Goal proved without opening anything. Below it, show the table of changed files, with a column for any choice you made in that file without asking and what settles it. If anything differs from the step as written, such as a Sarah check you took over, say so in a line or two under the table, as the draft of its As built note. Then open the Code tab's diff pane, so the full diff is at hand. Don't ask the user to review the diff, since for an infra story they care more that it works than how it's built.

After the report:
1. **Walk the user through their Sarah checks:** if one needs this step committed and pushed to a branch that will be merged, first ask the user to commit and push it. Then take over each check whose result you can now see, as step 2 describes, and walk them through the rest.
2. **End by handing the step to the user:** if it has Sarah checks the user hasn't done, ask the user to do those checks. Otherwise, ask whether the step is done.

## 4. Handle the User's Feedback
1. **If a piece of feedback is a change or addition,** sort where it goes, as step 2 describes.
2. **Handle the feedback that stays in this step** as the `building-code` skill describes under "Handle the User's Feedback", and report each change again in step 3's form, covering only what changed. Repeat items 1 and 2 until the user confirms the step is done.
3. **Triage the items added to the out-of-scope list since step 3's triage.** Handle each item the user pulls in as step 3 describes. If one goes in this step, report it as item 2 describes, then wait for the user to confirm the step again.

## 5. Update the Note
1. Check the step's Sarah check boxes, including the ones you took over, remove any check the user dropped, and add `**Status:** ✅ Complete`.
2. Under `# Goals`, check each box that the step's checks proved.
3. If anything differs from the step as written, was added from the user's feedback, taken over or dropped, add an **As built:** note under the step. For a check you took over, it says how you saw the result, such as the command, the screenshot or the run that covers it.
4. If this was the last step, set `status` to `in-review`.
5. Update Where It Stands, with a `^status` line such as "In progress. Next: /infra-build Step 4", or "All steps implemented. Next: /final-review" after the last step.

## 6. Stop
Route the out-of-scope list. Then tell the user the step is done, and hand on the next command from the `^status` line. `offering-the-next-session.md`, in the `building-code` skill's folder, says how.
