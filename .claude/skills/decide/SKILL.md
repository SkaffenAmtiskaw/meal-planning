---
name: decide
description: Work through a note's open decisions with Sarah one at a time, researching each with a subagent, and record each answer, partial answer or new question in the note. Sarah picks which decisions each run covers.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Work through the open decisions on **$ARGUMENTS**.

## Why this skill works the way it does
`/shape` and other skills list the questions that must be answered before a story's next step, but on purpose they don't answer them. Answering one takes research and Sarah. That's this skill's job.

A few things shape how it works:
- **Sarah picks the scope.** A hub can hold ten open decisions, and she may only want to tackle two today. Each run covers the ones she picks.
- **Research happens in a subagent,** one decision at a time. Each decision can need its own look at the code, the other notes and library docs. Doing that inline would fill the context before the third decision. The `decision-researcher` agent returns a brief. You walk Sarah through it.
- **The note is the only record.** `.scratch/` is wiped on commit. Anything the next run needs, including partial progress and findings that still matter, goes in the note.
- **Decisions, not design.** Settle the question. Don't design the story, write steps or pick implementation details the next step owns.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## Talking with Sarah
- **Her decisions are made.** If one of Sarah's comments already answers a question, show it to her and confirm it's still her answer rather than researching it again.
- **Running lists:** keep a list of effects on other notes and a list of new stories the answers imply. Don't stop to deal with them as they come up. Steps 5 and 6 handle them.

## 1. Read the note
Find the note in `notes/features/` and read all of it.

A decision is open if it's:
- an item under `# Open Decisions` with no **Decided** line under it. One with only a **Partly answered** line is still open.
A story with open decisions has one `"decision needed: ..."` entry in `blocked-by` that covers them all. A roundup's issues are the questions under its Open Decisions.

If the two don't match, raise it with Sarah:
- **A `decision needed` entry with no open question in Open Decisions:** draft the questions it stands for and add them once she approves. If the note has no Open Decisions section, add one from the note's template.
- **Open questions with no `decision needed` entry, on a story:** ask whether they block the next step. If they do, add the entry. Hubs have no `blocked-by`.

If the note has no open decisions, or it's `done` or archived, tell Sarah what you found and stop.

## 2. Sarah picks the decisions
List the open decisions, one line each: its number or short name, and any Partly answered progress. Say which ones depend on another's answer, from what the notes state, and mark any you're inferring. Then ask which ones she wants to work through this run.

Take them in the order she gives. If she picks one that depends on an unpicked one, say so once, and let her decide.

## 3. Each decision, one at a time
Don't research the next decision until this one is recorded. Its answer can change the next one's options.

### Research
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, and the answers Sarah has given earlier in this run. Don't tell it which answer you expect.

Save its brief, unedited, to `.scratch/<note name> - decision <N>.md`. That's for this session only. Sarah can read the whole brief, but it won't survive a commit.

### Present
Show Sarah:
1. **The question** as the brief restates it, and what's already fixed.
2. **The options,** each with its trade-offs and what it touches.
3. **The recommendation,** with the practice it rests on. Or say it's a preference call and what separates the options. Or say it can't be decided yet, and why.

Link the brief. When she questions an option, read her the relevant part of the brief and discuss it. If she wants more research, send the researcher a follow-up with her question and the earlier brief's path.

### Record
She'll decide, partly decide, or set it aside. Draft the note change, show it and wait for her approval before writing it.

**Decided.** Under the question in Open Decisions:
```
   - **Decided YYYY-MM-DD:** <the answer>. <one sentence on why>
     - Rejected: <option> - <one-line reason>
```
One Rejected line per option she considered and turned down, so later agents don't propose it again. If no open decisions remain, remove the `decision needed` entry from `blocked-by`.

**Partly answered, or not yet.** Under the question:
```
   - **Partly answered YYYY-MM-DD:** Settled: <...>. Still open: <...>. Waits on: <e.g. a design session in Claude Design, or [[Other Story]]>.
     - <each research finding the next run needs, one line, with where it came from>
```
The `decision needed` entry stays. The findings lines matter because the brief will be gone by the next run. If Sarah just wants to skip it for now, write nothing.

**Don't reword the original question.** Progress goes in lines under it.

### Knock-on effects
After recording, look at what the answer changes:
- **This note:** other sections the answer lands in, e.g. a section the question says to record it in, the chosen Fix Option, or a hub's Coverage or Child Stories table. Draft each change and go through them with Sarah one at a time. If the note is `ready` and the change touches its design or steps, it goes back to `spec` (AGENTS.md, "Editing notes"). Say so when you show the change.
- **Other notes:** add each effect to the running list: which note, what changes and why. Step 6 handles them.
- **New stories:** if the answer implies work no note covers yet, add it to the running list of new stories. Step 5 handles them.
- **New questions:** if the brief found a blocking question that isn't on the note, or the answer raised one, show it to Sarah as a question, not a proposal. Once she approves, add it to Open Decisions (plus a `decision needed` entry in `blocked-by` on a story, if it doesn't have one). Then ask whether to take it now or leave it for a later run.

Then go on to the next decision she picked.

## 4. Update the note's status
Once the picked decisions are done:
- **Where It Stands:** update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Decisions made. Next: /assess" or "2 open decisions. Next: /decide".
- **`confirmed`:** set it to today. Sarah making decisions on a note counts as confirming it.
- **A roundup with no open decisions left:** set `status: spec`. Its next step is `/plan-steps`.

## 5. New stories
Skip this if the running list of new stories is empty.

**On a hub:** propose the child stories, one at a time, each with a one-line scope and the decisions it comes from. Wait for Sarah to approve, change or drop each one. For each one she approves:
1. Create an idea note in `notes/features/<area>/` from `notes/templates/Idea.md`, with `type` left blank. Its Where It Stands line is "Next: /shape ^status". Under Notes, link the hub, give the one-line scope, and quote the Decided lines it comes from.
2. Add it to the hub's Child Stories table.
3. Add a Roadmap line that links to it and embeds its status (`[[Note]] ![[Note#^status]]`). Ask Sarah which section it goes in.

**On a story:** add the new stories to the list for step 6. They go through `scope-router` like any other work outside this note.

## 6. Other notes
Skip this if the running list is empty.

Route it as AGENTS.md describes under "Out-of-scope work". For each item, also include which decision it comes from and its Decided line.

## 7. Stop
Tell Sarah what's left:
- **Open decisions remain:** list them in one line each. The next run is `/decide <note name>`.
- **None remain:** give the note's next step from the table below, e.g. `/assess <note name>`.
- **Children were created:** list each one with the command to run in a new session, e.g. `/shape <child name>`.

!`sh scripts/note-section.sh "Next Step by Note State"`

Don't start the next step in this session, even if it's the obvious one. It deserves a fresh context.
