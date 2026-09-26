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
- **The note is the only record.** `.opencode/scratch/` is wiped on commit. Anything the next run needs, including partial progress and findings that still matter, goes in the note.
- **Decisions, not design.** Settle the question. Don't design the story, write steps or pick implementation details the next step owns.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.opencode/scratch/`.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once. A later question often depends on an earlier answer.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Her decisions are made.** A line where her name is a tag or a signature (`[Sarah] ...`, `... - Sarah`) is her own words. If one already answers a question, show it to her and confirm it's still her answer rather than researching it again. Never edit her comments.
- **Recommendations:** give one when best practice supports it, and name the practice. When a question comes down to her preference, say so and don't guess. If she asks for a recommendation, always give one.
- **Running lists:** keep a list of effects on other notes and a list of new stories the answers imply. Don't stop to deal with them as they come up. Steps 5 and 6 handle them.

## 1. Read the note
Read `notes/Note Conventions.md` first. Then find the note in `notes/features/` and read all of it, including each embedded section (`![[Note#Section]]`), which is part of the note.

A decision is open if it's:
- an item under `# Open Decisions` with no **Decided** line under it. One with only a **Partly answered** line is still open.
- a `"decision needed: ..."` entry in `blocked-by`.

If the two don't match, raise each mismatch with Sarah, one at a time:
- **A `blocked-by` entry with no question in Open Decisions:** draft the question and add it once she approves. If the note has no Open Decisions section, add one from the note's template.
- **A question in Open Decisions with no `blocked-by` entry, on a story:** ask whether it blocks the next step. If it does, add the entry. Hubs have no `blocked-by`.

If the note has no open decisions, or it's `done` or archived, tell Sarah what you found and stop.

## 2. Sarah picks the decisions
List the open decisions, one line each: its number or short name, and any Partly answered progress. Say which ones depend on another's answer, from what the notes state, and mark any you're inferring. Then ask which ones she wants to work through this run.

Take them in the order she gives. If she picks one that depends on an unpicked one, say so once, and let her decide.

## 3. Each decision, one at a time
Don't research the next decision until this one is recorded. Its answer can change the next one's options.

### Research
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, and the answers Sarah has given earlier in this run. Don't tell it which answer you expect.

Save its brief, unedited, to `.opencode/scratch/<note name> - decision <N>.md`. That's for this session only. Sarah can read the whole brief, but it won't survive a commit.

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
One Rejected line per option she considered and turned down, so later agents don't propose it again. Then remove its `decision needed` entry from `blocked-by`.

**Partly answered, or not yet.** Under the question:
```
   - **Partly answered YYYY-MM-DD:** Settled: <...>. Still open: <...>. Waits on: <e.g. a design session in Claude Design, or [[Other Story]]>.
     - <each research finding the next run needs, one line, with where it came from>
```
The `blocked-by` entry stays. The findings lines matter because the brief will be gone by the next run. If Sarah just wants to skip it for now, write nothing.

**Don't reword the original question.** Progress goes in lines under it.

### Knock-on effects
After recording, look at what the answer changes:
- **This note:** other sections the answer lands in, e.g. a section the question says to record it in, the chosen Fix Option, or a hub's Coverage or Child Stories table. Draft each change and go through them with Sarah one at a time. If the note is `ready` and the change touches its design or steps, it goes back to `spec` (Note Conventions, Lifecycle). Say so when you show the change.
- **Other notes:** add each effect to the running list: which note, what changes and why. Step 6 handles them.
- **New stories:** if the answer implies work no note covers yet, add it to the running list of new stories. Step 5 handles them.
- **New questions:** if the brief found a blocking question that isn't on the note, or the answer raised one, show it to Sarah as a question, not a proposal. Once she approves, add it to Open Decisions (plus a `decision needed` entry in `blocked-by` on a story). Then ask whether to take it now or leave it for a later run.

Then go on to the next decision she picked.

## 4. Update the note's status
Once the picked decisions are done:
- **Where It Stands:** update the line ending in ` ^status` to say what work comes next or what the note waits on, e.g. "Decisions made. Next: /assess" or "2 open decisions. Next: /decide". Use the Next Step by Note State table in Note Conventions. It holds the status only, never a description of the story, because the Roadmap embeds it for scanning. Show Sarah the line and wait for her approval before writing it. If the note has no `# Where It Stands` section, add one at the top, right after the frontmatter, in the format from the note's template.
- **`confirmed`:** set it to today. Sarah making decisions on a note counts as confirming it.
- **The Roadmap:** make sure the note's line in `notes/Roadmap.md` embeds its status (`![[<note>#^status]]`). Never reorder the Roadmap.

## 5. New stories
Skip this if the running list of new stories is empty.

**On a hub:** propose the child stories, one at a time, each with a one-line scope and the decisions it comes from. Wait for Sarah to approve, change or drop each one. For each one she approves:
1. Create an idea note in `notes/features/<area>/` from `notes/templates/Idea.md`, with `type` left blank. Its Where It Stands line is "Next: /shape ^status". Under Notes, link the hub, give the one-line scope, and quote the Decided lines it comes from.
2. Add it to the hub's Child Stories table.
3. Add a Roadmap line that links to it and embeds its status (`[[Note]] ![[Note#^status]]`). Ask Sarah which section it goes in. Never reorder the Roadmap.

**On a story:** add the new stories to the list for step 6. They go through `scope-router` like any other work outside this note.

## 6. Other notes
Skip this if the running list is empty.

Send the whole list to the `scope-router` subagent. For each item, include which decision it comes from, the Decided line, what it changes and why it's outside this note. The router suggests a home for each item. It doesn't change anything.

Then go through its suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.

## 7. Stop
Tell Sarah what's left:
- **Open decisions remain:** list them in one line each. The next run is `/decide <note name>`.
- **None remain:** give the note's next step from Note Conventions, e.g. `/assess <note name>`.
- **Children were created:** list each one with the command to run in a new session, e.g. `/shape <child name>`.

Don't start the next step in this session, even if it's the obvious one. It deserves a fresh context.
