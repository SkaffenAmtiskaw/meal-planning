---
name: plan-steps
description: Breaks a story's approved approach into implementation steps. Use when a note's next step is /plan-steps.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Plan the implementation steps for the note **$ARGUMENTS**. When this skill ends, give the user the command for the next skill, to run in a new session, since this session's reading and draft would bloat or anchor it.

## 1. Read the note
Find the note in `notes/features/` and read all of it. If its status isn't `spec`, or its `^status` line doesn't say `/plan-steps` can run now, tell the user what you found and stop. The approach is the section that says what to build, such as a feature's Suggested Approach, a bug's Fix or a sweep's remaining Items.

Then run `sh scripts/commits-since.sh <confirmed>` with the note's `confirmed` date, and ignore what this story's own steps built, committed or not. If anything else it lists could touch what the note builds, or you can't tell, tell the user which changes and why, send the note to `/check-drift`, and stop. Otherwise, say so in one line.

## 2. Draft the steps
Draft the steps as the `writing-implementation-steps` skill describes. If the note has a `# From the Split` section, start from its draft steps. If it already has an Implementation section, this is a re-plan: plan only the remaining work, and leave steps marked ✅ Complete as they are.

If a step needs a piece the approach doesn't have:
- **If the piece only takes over work the approach already holds,** such as one that keeps an existing module to its job, add it to the note's approach once the user agrees.
- **Otherwise,** it's new design for the skill that settled the approach, such as `/assess` for a feature: once the user agrees, send the note to that skill, route the out-of-scope list, and stop.

Then triage the out-of-scope list. An item the user pulls in becomes its own step, and a piece it needs is handled as above. If it needs a decision the user leaves for `/decide`, send the note to `/decide`, route the out-of-scope list, and stop.

Write the draft to a file in `.scratch/` for the checkers.

## 3. Have the plan checked
If the draft holds the same steps its `# From the Split` section handed over, skip `hidden-story-checker`, because those steps were checked for hidden stories when the story was split, and go on to `plan-checker` below. Otherwise, send `hidden-story-checker` the note path and the draft path as the **Plan** checkpoint. If it finds one story, say so in one line. Otherwise:
1. Put each hidden story whose Shared design is "none" on the out-of-scope list with its steps, and triage it right away. The outline the user reviews next depends on whether those steps stay. If the user doesn't pull it in, take its steps out of the draft.
2. If any hidden story shares design, they need a hub to keep the shared design whole. Send `split-checker` the note path, the draft path as the **Plan** checkpoint, the path of `hidden-story-checker`'s report and the hidden stories that share design. Then go through the split with the user as the `splitting-a-story` skill describes. If they split the story, copy each child's share of the draft steps, in full, into its `# From the Split` section, route the out-of-scope list, and stop, giving `/plan-steps <child name>` for each child.

Then send `plan-checker` the note path, the draft path, where the approach and source material are, and what to leave out: anything a ⚠️ Check Drift callout drops, anything the ✅ Complete steps already cover, and the hidden stories the user didn't pull in. If you agree with any findings, fix them and run it once more.

## 4. Review with the user
1. **The outline.** Show each step's title, idea sentence and a one-line summary of its checks: a regression check ("everything looks the same as before") or the new behavior it tests. In a re-plan, show what changed from the old steps.

   The steps' order and size are settled when all of these hold:
   - `hidden-story-checker` was skipped, found one story, or found only hidden stories the user has triaged.
   - No finding you disagree with is about order or size.
   - No step's place was your own pick between two orders that would both work.

   If they're settled, say why in one line and go on. Otherwise, ask whether they're right.
2. **Findings you disagree with.** Raise each one with why you disagree.
3. **The steps.** Show each step in full for the user to approve or change. If a change affects a later step, update that step before you get there.

## 5. Write it to the note
Once the user has approved every step, write the plan under `# Implementation`, delete any `# From the Split` section, set `status` to `ready` and the `^status` line to something like "Ready. Next: /implement Step 1", and route the out-of-scope list.
