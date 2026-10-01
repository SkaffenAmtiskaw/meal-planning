---
name: assess
description: Compare a feature note's design to the existing code and decide, piece by piece, what to build new, use as-is, refactor or replace. Writes the approved result to the note's Suggested Approach.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Assess the feature note **$ARGUMENTS** against the codebase and produce its Suggested Approach.

## Why this skill works the way it does
Sarah wants to know, for a feature design, what already exists in the code and what has to be built, refactored or replaced. Past planning agents started from the existing code, reused it because it was there, and piled new behavior into components that already had a job. The result was god components, which break Single Concern in `docs/project_conventions.md`.

So the order here is deliberate. First decide what *should* exist. Then judge the existing code against that. "Use it as-is" is the claim that needs evidence, not "refactor it."

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Read the note
Find the note in `notes/features/`. If it's missing, tell Sarah and stop. If the Inbox has a retype line, follow the `retyping-a-note` skill's "After a retype".

Check that it's ready for this skill:
- **`type: feature`.** If it's another type, check whether that type fits the work. If it doesn't, offer to retype the note, as AGENTS.md describes under "Editing notes". If it does, tell Sarah which skill the note needs, and stop.
- **`status: spec`.** If it has a different status, tell Sarah what you found and stop. Turning rough notes into a design is done with her, not by this skill.

If the note has a Design Handoff, treat it as the source of truth for UX, not for implementation.

If the Suggested Approach section lists questions for this step, each one gets an answer in the Suggested Approach by the end of this run.

If the note's Suggested Approach holds anything besides a template comment or that list of questions, this is a re-assessment. Don't start from the old approach. It invites the same anchoring as old code. Do steps 2 to 5 fresh, then in step 6 show what changed compared with the old approach.

### Check other notes for design changes
Another story's design or build may have changed shared UI or a shared module since this note was confirmed. Catch it now, before the behaviors are confirmed, since a changed design changes them.

Write the story's footprint to `.scratch/<note name> - footprint.md`:
- **UI areas:** e.g. the mobile day section header, the today marker.
- **Kinds of things it builds:** e.g. a modal form, a list grouped by day.
- **Named code:** only what the note itself names. Don't search the code for more. That's step 4.
- **Related notes:** its hub, the notes it links to, the stories in `blocked-by`.

Send the `note-drift-checker` subagent the note path, its `confirmed` date, the footprint file and "the whole design and behaviors" as the remaining work. Save its report to `.scratch/<note name> - drift (notes).md`. Add its "Outside this story" items to your out-of-scope list.

If it found nothing, tell Sarah in one line and go on. Otherwise, handle each finding before step 2:
- **Mechanical:** correct the name or path in place, as AGENTS.md describes under "Editing notes". Don't ask.
- **Needs a decision:** show Sarah the finding, the other note and what conflicts, and recommend as AGENTS.md describes under "Recommendations". Wait for her answer, then write it into the design or behaviors it affects, with no callout. If she wants to decide later, add the question to Open Decisions, with a `decision needed` entry in `blocked-by` if the note doesn't have one. Set the `^status` line to "Next: /decide", and stop.
- **Blocked:** if a finding means the story can't go ahead until another story lands, tell Sarah and ask whether to go on anyway. If she says no, add the story to `blocked-by` and stop.

## 2. Confirm the behaviors
If the note has a `# From the Split` section because this story was split from a larger one, start from its behaviors. Show them and ask Sarah to confirm they still hold.

Otherwise, list the story as numbered behaviors, one line each. Cover what the user does and every way the app can respond: success, each kind of failure, empty states, and differences for read-only users. Where the note doesn't say, ask Sarah. Don't fill gaps yourself.

Show the list and wait for her to confirm it before going on.

### Check whether it's several stories
Skip this check if you started from a `# From the Split` section and its behaviors haven't changed since.

The confirmed behavior list is the first point where the story's real size shows, and splitting is cheapest before an approach exists. Send the note path and the confirmed behaviors to the `split-checker` subagent, as the **Behaviors** checkpoint. Save its report to `.scratch/<note name> - split check.md`.

- **One story:** tell Sarah in one line, link the report, and go on to step 3.
- **Split:** follow "Splitting a story" at the end of this skill. That ends this session. Each child gets its own `/assess` in a new session.

## 3. Design the target before reading existing modules
From the behaviors and the project docs (`docs/project_conventions.md`, `project_structure.md` and `style_guidelines.md`), describe what you would build if the codebase were clean. Don't open existing modules yet. The point is a design that isn't anchored to what's already there.

For each piece, give:
- **Kind:** component, hook, utility, server action or model.
- **Job:** one sentence without "and". If it needs "and", it's two pieces.
- **Server or client:** follow "Prefer Server Components" in `docs/project_conventions.md`.

Check library docs only when the story needs them, as AGENTS.md describes under "Library APIs".

## 4. Find overlapping code and have it reviewed
For each target piece, search for existing code that does the same job in whole or in part. Search by pattern, not just by name: another modal, another form with a list of rows, another list grouped by day. Also list existing modules the story will have to change even though no target piece replaces them, such as callers, providers and contexts. That is where new behavior tends to get piled in.

Send the list to the `code-critic` subagent. Give it each target piece with its job and the existing files you mapped to it. It returns a verdict for each file. Don't pre-judge the code for it, and don't say what you're hoping to reuse.

Save the critic's report to `.scratch/<note name> - critic.md`. Add its "Outside this story" and "Duplication" items to your out-of-scope list.

Then triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes one or more behaviors: show her the new lines for the behavior list, then give them target pieces (step 3) and map and review their overlapping code (this step) before you present the approach.

## 5. Present the approach
Show Sarah:
1. **The critic's verdicts,** one line per file: the file, the verdict, and its main finding. Link the full report file. When she questions a line, read her that file's section of the report and discuss it.
2. **A table** with one row per target piece: Piece | Job | Decision | Existing code | Why. Decision is one of: build new, use as-is, refactor first, replace, or extract shared piece. Follow the critic's verdicts. If you disagree with one, say so in that row and explain why. Don't quietly override it.
3. **Client pieces:** which pieces are client, and the reason for each.

If a refactor looks out of proportion to the story, don't defer it yourself. Ask Sarah whether to do it in this story or move it out. Otherwise, refactors are part of the story.

When she pushes back, revise and show the changed rows again. Wait for her explicit approval.

## 6. Write it to the note
Once she approves, if this is a re-assessment, first show Sarah what changed compared with the old approach, and replace it only once she approves that too.

Then write the behavior list, the table and the client pieces under `# Suggested Approach` in the note. If a template comment or the list of questions for this step is there, replace it. If the note has a `# From the Split` section, delete it. The approved behaviors now live in the Suggested Approach.

Leave `status` at `spec`. The note isn't ready until it has implementation steps.

Then:
- Set `confirmed` to today. `code-critic` just reviewed the code and `note-drift-checker` the notes, so the note matches both as of now.
- Update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Approach approved. Next: /plan-steps".

## 7. Find a home for out-of-scope items
If the out-of-scope list is empty, you're done.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## Splitting a story
`split-checker` proposes the split. Sarah decides:
1. **Whether to split.** Show the verdict and the reason, plus each child's name and scope line, then ask whether to split. If she says no, carry on as one story.
2. **Each child.** Show what it takes, what blocks it and which design sections it embeds. Wait for her to approve or change it. If a change moves something to another child, update that child before you get to it.
3. **Leftovers.** Raise anything under Unclaimed, and each move to an existing story.
4. **Apply.** Once she has approved every child, apply the note changes from the report. Create the children first, then rewrite the original as the hub, then update the links in other notes. Write each child's Roadmap line as the report gives it, and ask Sarah only where each one goes, as AGENTS.md describes under "Roadmap order".
5. **Check each child's handoff.** Make sure each child's `# From the Split` section holds its full share of the confirmed behaviors, including any changes Sarah made while approving the children. Its own `/assess` runs in a new session and starts from that section.
6. **Route out-of-scope items.** If you've collected any, handle them as in step 7.
7. **Stop.** Don't start work on any child in this session. By now it has read the whole design and the split report, and carrying that into a child's assessment bloats the context. Tell Sarah the split is done, and list each child with the command to run in a new session, e.g. `/assess <child name>`.
