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
Sarah wants to know, for a feature design, what already exists in the code and what has to be built, refactored or replaced. Past planning agents started from the existing code, reused it because it was there, and piled new behavior into components that already had a job. The result was god components. Single concern is one of Sarah's top priorities.

So the order here is deliberate. First decide what *should* exist. Then judge the existing code against that. "Use it as-is" is the claim that needs evidence, not "refactor it."

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Read the note
Find the note in `notes/features/`. The note should be `type: feature` with `status: spec`. If it's missing or has a different status, tell Sarah what you found and stop. Turning rough notes into a design is done with her, not by this skill.

If the note has a Design Handoff, treat it as the source of truth for UX, not for implementation.

If the note already has a Suggested Approach, this is a re-assessment. Don't start from the old approach. It invites the same anchoring as old code. Do steps 2 to 5 fresh, then in step 6 show what changed compared with the old approach.

## 2. Confirm the behaviors
If the note has a `# From the Split` section because this story was split from a larger one, start from its behaviors. Show them and ask Sarah to confirm they still hold.

Otherwise, list the story as numbered behaviors, one line each. Cover what the user does and every way the app can respond: success, each kind of failure, empty states, and differences for read-only users. Where the note doesn't say, ask Sarah, one question at a time. Don't fill gaps yourself.

Show the list and wait for her to confirm it before going on.

### Check whether it's several stories
Skip this check if you started from a `# From the Split` section and its behaviors haven't changed since.

The confirmed behavior list is the first point where the story's real size shows, and splitting is cheapest before an approach exists. Send the note path and the confirmed behaviors to the `split-checker` subagent, as the **Behaviors** checkpoint. Save its report to `.scratch/<note name> - split check.md`.

- **One story:** tell Sarah in one line, link the report, and go on to step 3.
- **Split:** follow "Splitting a story" at the end of this skill. That ends this session. Each child gets its own `/assess` in a new session.

## 3. Design the target before reading existing modules
From the behaviors and the project docs (`.opencode/docs/project_conventions.md`, `project_structure.md` and `style_guidelines.md`), describe what you would build if the codebase were clean. Don't open existing modules yet. The point is a design that isn't anchored to what's already there.

For each piece, give:
- **Kind:** component, hook, utility, server action or model.
- **Job:** one sentence without "and". If it needs "and", it's two pieces.
- **Server or client:** client if the piece has a concrete reason (an event handler, React state, a browser API or a client-only library) and is the smallest leaf that needs it. Otherwise, server.

Prefer Mantine components and hooks over custom ones. Check library docs only when the story needs them, as AGENTS.md describes under "Library APIs".

## 4. Find overlapping code and have it reviewed
For each target piece, search for existing code that does the same job in whole or in part. Search by pattern, not just by name: another modal, another form with a list of rows, another list grouped by day. Also list existing modules the story will have to change even though no target piece replaces them, such as callers, providers and contexts. That is where new behavior tends to get piled in.

Send the list to the `code-critic` subagent. Give it each target piece with its job and the existing files you mapped to it. It returns a verdict for each file. Don't pre-judge the code for it, and don't say what you're hoping to reuse.

Save the critic's full report, unedited, to `.scratch/<note name> - critic.md`. Add its "Outside this story" and "Duplication" items to your out-of-scope list.

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

Then write the behavior list, the table and the client pieces under `# Suggested Approach` in the note. If a template comment is there, replace it. If the note has a `# From the Split` section, delete it. The approved behaviors now live in the Suggested Approach.

Leave `status` at `spec`. The note isn't ready until it has implementation steps.

Then:
- Update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Approach approved. Next: /plan-steps".

## 7. Find a home for out-of-scope items
If the out-of-scope list is empty, you're done.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## Splitting a story
`split-checker` proposes the split. Sarah decides, one piece at a time:
1. **Whether to split.** Show the verdict and the reason, plus each child's name and scope line, then ask whether to split. If she says no, carry on as one story.
2. **Each child, one at a time.** Show what it takes, what blocks it and which design sections it embeds. Wait for her to approve or change it. If a change moves something to another child, update that child before you get to it.
3. **Leftovers, one at a time.** Raise anything under Unclaimed, and each move to an existing story.
4. **Apply.** Once she has approved every child, apply the note changes from the report. Create the children first, then rewrite the original as the hub, then update the links in other notes. Show each Roadmap line before you write it.
5. **Check each child's handoff.** Make sure each child's `# From the Split` section holds its full share of the confirmed behaviors, including any changes Sarah made while approving the children. Its own `/assess` runs in a new session and starts from that section. Never hand this over through scratch, which is wiped on commit.
6. **Route out-of-scope items.** If you've collected any, handle them as in step 7.
7. **Stop.** Don't start work on any child in this session. By now it has read the whole design and the split report, and carrying that into a child's assessment bloats the context. Tell Sarah the split is done, and list each child with the command to run in a new session, e.g. `/assess <child name>`.
