---
name: assess
description: Works out with the user which pieces of a feature to build new and which existing code to use as-is, refactor or replace, and writes the result to the note's Suggested Approach. Use when a note's next step is /assess.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Assess the feature note **$ARGUMENTS** against the codebase and write its Suggested Approach. This skill plans, so don't change code.

Past planning agents started from the existing code, reused it because it was there, and piled new behavior into modules that already had a job, which broke Single Concern in `docs/project_conventions.md`. So this skill has a target designed before anyone reads the existing modules, then judges those modules against it, and "use as-is" is the verdict that needs evidence.

## 1. Read the note
Find the note in `notes/features/` and read all of it. Check that it's ready for this skill:
- **`type: feature`.**
- **`status: spec`.** If it's `idea`, tell the user that `/place-design` moves it to `spec` once its design from Claude Design is placed, and stop. If it has any other status, tell the user what you found and stop.

If the Suggested Approach lists questions for this step, answer each one in the Suggested Approach by the end of this run. If it holds an earlier approach, this is a re-assessment. Don't start from the old approach, because it anchors you the same way old code does. Do steps 2 to 5 fresh, then in step 6 show what changed compared with the old approach.

### Check other notes for design changes
Another story's design or build may have changed shared UI or a shared module since this note was confirmed. Check now, before the behaviors are confirmed, since a changed design changes them.

Write the story's footprint to a scratch file:
- **UI areas:** e.g. the mobile day section header, the today marker.
- **Kinds of things it builds:** e.g. a modal form, a list grouped by day.
- **Named code:** only what the note itself names. Don't search the code for more, since that's step 4.
- **Related notes:** its hub, the notes it links to, the stories in `blocked-by`.

Send the `note-drift-checker` subagent the note path, its `confirmed` date, the footprint file and "the whole design and behaviors" as the remaining work.

If it found nothing, tell the user in one line and go on. Otherwise, settle each finding before step 2:
- **If it blocks the story** until another story lands, tell the user and ask whether to go on anyway. If they say no, add that story to `blocked-by` and stop.
- **If it changes what the design or behaviors say,** beyond a name or path, such as a conflict between two designs, **or another story plans to build something this one needs:** show the user the finding, the other note and what conflicts, and ask what they want. If they want to decide it later, stop.
- **Otherwise,** such as another story having built or changed a module this one will use: tell the user in one line, and keep it for step 4.

## 2. Confirm the behaviors
If the note has a `# From the Split` section because this story was split from a larger one, start from its behaviors. Show them and ask the user to confirm they still hold.

Otherwise, list the story as numbered behaviors, one line each. Cover what a person using the app does and every way the app can respond: success, each kind of failure, empty states, and differences for people with read-only access. Where the note doesn't say, ask the user rather than filling the gap yourself.

Show the list and wait for the user to confirm it before going on.

### Check whether it's several stories
Skip this check if you started from a `# From the Split` section and its behaviors haven't changed since.

Send the note path and the confirmed behaviors to the `hidden-story-checker` subagent, as the **Behaviors** checkpoint.
- **One story:** tell the user in one line, and go on to step 3.
- **Hidden stories:**
  1. Put each one whose Shared design is "none" on the out-of-scope list with its behaviors, and triage it right away. The rest of this run works from the behavior list. If the user doesn't pull it in, take its behaviors out of the list.
  2. If no hidden story shares design, go on to step 3. Otherwise, they need a hub to keep the shared design whole, so send `split-checker` the note path, the confirmed behaviors as the **Behaviors** checkpoint, the path of `hidden-story-checker`'s report and the hidden stories that share design. Then go through the split with the user as the `splitting-a-story` skill describes.
  3. If they don't split the story, go on to step 3. If they split it:
     1. Triage the out-of-scope list. An item the user pulls in becomes one or more behaviors in the `# From the Split` section of each child they belong to.
     2. Check that each child's `# From the Split` section holds its full share of the confirmed behaviors, including any changes the user made while approving the children, since the child's own `/assess` starts from it.
     3. Route the out-of-scope list.
     4. Stop, and tell the user the split is done. Give `/assess <child name>` for each child, to run in a new session, since this one has read the whole design and the split report, and carrying them into a child's assessment bloats it.

## 3. Design the target
Send the `target-designer` subagent the confirmed behaviors, numbered, and the paths to the note's Meta-Instructions, its Design Handoff sections and its images. Give it nothing else, and don't describe the existing code or an old approach to it, so its design isn't anchored to what's already there.

When its design comes back, show the user its Assumptions and ask about each one the note doesn't settle, since each fills a gap that step 2 leaves to the user. If an answer adds or changes a behavior, update the list and run this step again.

## 4. Find overlapping code and have it reviewed
For each target piece, search for existing code that does the same job in whole or in part. Search by pattern, not just by name: another modal, another form with a list of rows, another list grouped by day. Also list existing modules the story will have to change even though no target piece replaces them, such as callers, providers and contexts, because that's where new behavior tends to get piled in, and each module a drift finding from step 1 was kept for.

Send the list to the `code-critic` subagent: each target piece with its job, and the existing files you mapped to it. It returns a verdict for each file. Don't pre-judge the code for it, and don't say what you're hoping to reuse.

Then triage the out-of-scope list. An item the user pulls in becomes one or more behaviors. Show them the new lines for the behavior list, then run step 3 again with the updated list. A piece is new or changed if its job or its behaviors differ from those in the design you mapped the code against. Map and review the overlapping code for those pieces before you present the approach.

## 5. Present the approach
Show the user:
1. **The critic's verdicts,** one line per file: the file, the verdict and its main finding. When the user questions a line, show them that file's section of the report and discuss it.
2. **A table** with one row per target piece: Piece | Job | Decision | Existing code | Why. Decision is one of: build new, use as-is, refactor first, replace, or extract shared piece. Follow the critic's verdicts. If you disagree with one, say so in that row and explain why, rather than quietly overriding it.
3. **Client pieces:** which pieces are client, and the reason for each.

If a refactor looks out of proportion to the story, ask the user whether to do it in this story or move it out, rather than deferring it yourself. Otherwise, refactors are part of the story.

When the user pushes back, revise and show the changed rows again. Wait for their approval.

## 6. Write it to the note
Once the user approves, if this is a re-assessment, first show them what changed compared with the old approach, and replace it only once they approve that too.

Then write the behavior list, the table and the client pieces under `# Suggested Approach`, in place of the list of questions for this step if there is one. If the note has a `# From the Split` section, delete it, since the approved behaviors now live in the Suggested Approach.

Then:
- Leave `status` at `spec`, since the note isn't ready until it has implementation steps.
- Set `confirmed` to today. `code-critic` just reviewed the code and `note-drift-checker` the notes, so the note matches both as of now.
- Update the `^status` line, for example to "Approach approved. Next: /plan-steps".

Last, route the out-of-scope list.
