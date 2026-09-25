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

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.opencode/scratch/`.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once. A later question often depends on an earlier answer.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Out-of-scope items:** keep a running list of anything that belongs outside this story, whether you, the critic or Sarah found it. Don't stop to deal with them as they come up. Step 7 handles them.

## 1. Read the note
Find the note in `notes/features/`. `notes/Note Conventions.md` explains the frontmatter and markers. The note should be `type: feature` with `status: spec`. If it's missing or has a different status, tell Sarah what you found and stop. Turning rough notes into a design is done with her, not by this skill.

If the note has a Design Handoff, treat it as the source of truth for UX, not for implementation.

If the note already has a Suggested Approach, this is a re-assessment. Don't start from the old approach. It invites the same anchoring as old code. Do steps 2 to 5 fresh, then in step 6 show what changed compared with the old approach.

## 2. Confirm the behaviors
List the story as numbered behaviors, one line each. Cover what the user does and every way the app can respond: success, each kind of failure, empty states, and differences for read-only users.

Where the note doesn't say, ask Sarah, one question at a time. Don't fill gaps yourself.

Show the list and wait for her to confirm it before going on.

## 3. Design the target before reading existing modules
From the behaviors and the project docs (`.opencode/docs/project_conventions.md`, `project_structure.md` and `style_guidelines.md`), describe what you would build if the codebase were clean. Don't open existing modules yet. The point is a design that isn't anchored to what's already there.

For each piece, give:
- **Kind:** component, hook, utility, server action or model.
- **Job:** one sentence without "and". If it needs "and", it's two pieces.
- **Server or client:** default server. Use client only for a concrete reason (an event handler, React state, a browser API or a client-only library), and only on the smallest leaf that needs it.

Prefer Mantine components and hooks over custom ones. Read these only when the story needs them:
- Mantine: https://mantine.dev/llms.txt
- better-auth: https://better-auth.com/llms.txt
- Next.js: `node_modules/next/dist/docs/`

## 4. Find overlapping code and have it reviewed
For each target piece, search for existing code that does the same job in whole or in part. Search by pattern, not just by name: another modal, another form with a list of rows, another list grouped by day. Also list existing modules the story will have to change even though no target piece replaces them, such as callers, providers and contexts. That is where new behavior tends to get piled in.

Send the list to the `code-critic` subagent. Give it each target piece with its job and the existing files you mapped to it. It returns a verdict for each file. Don't pre-judge the code for it, and don't say what you're hoping to reuse.

Save the critic's full report, unedited, to `.opencode/scratch/<note name> - critic.md`. Add its "Outside this story" and "Duplication" items to your out-of-scope list.

## 5. Present the approach
Show Sarah:
1. **The critic's verdicts,** one line per file: the file, the verdict, and its main finding. Link the full report file. When she questions a line, read her that file's section of the report and discuss it.
2. **A table** with one row per target piece: Piece | Job | Decision | Existing code | Why. Decision is one of: build new, use as-is, refactor first, replace, or extract shared piece. Follow the critic's verdicts. If you disagree with one, say so in that row and explain why. Don't quietly override it.
3. **Client pieces:** which pieces are client, and the reason for each.

Refactors are part of the story by default. If one looks out of proportion to the story, don't defer it yourself. Ask Sarah whether to do it in this story or move it out.

When she pushes back, revise and show the changed rows again. Wait for her explicit approval.

## 6. Write it to the note
Once she approves, write the behavior list, the table and the client pieces under `# Suggested Approach` in the note. If a template comment is there, replace it.

For a re-assessment, first show Sarah what changed compared with the old approach, and replace it only once she approves. Leave `status` at `spec`. The note isn't ready until it has implementation steps.

## 7. Find a home for out-of-scope items
If the out-of-scope list is empty, you're done.

Otherwise, send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found (with `file:line` if it came from code) and why it's outside this story. The router reads the notes and suggests a home for each item. It doesn't change anything.

Then go through its suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.
