---
name: decide
description: Works through a note's open decisions with the user and records each answer in the note. Use when a note's next step is /decide.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Work through the open decisions on **$ARGUMENTS**. This skill settles decisions, not design: don't design the story, write steps, pick implementation details or change code, because each belongs to a later step with its own process and checks.

## 1. Read the note
Find the note in `notes/features/` and read all of it.

A decision is open if it's an item under `# Open Decisions` with no **Decided** line under it, including one with only a **Partly answered** line. A roundup's issues are the questions under its Open Decisions. A story with open decisions has one `"decision needed: ..."` entry in `blocked-by` that covers them all. A hub has no `blocked-by`.

If a story's Open Decisions and `blocked-by` don't match, raise it with the user:
- **A `decision needed` entry with no open question in Open Decisions:** draft the questions it stands for and add them once the user approves. If the note has no Open Decisions section, add one from the note's template.
- **Open questions with no `decision needed` entry:** ask whether they block the next step. If they do, add the entry.

If the note has no open decisions, or it's `done` or archived, tell the user what you found and stop.

## 2. The user picks the decisions
A hub can hold ten open decisions when the user only wants to settle two today, so each run covers only the ones they pick. List the open decisions, one line each: its number or short name, and any Partly answered progress. Say which ones depend on another's answer, from what the notes state, and mark any you're inferring. Then ask which ones they want to work through this run.

Take them in the order they give. If they pick one that depends on an unpicked one, say so once, and let them decide.

## 3. Settle each decision
Settle each decision the user picked as the `settling-a-decision` skill describes.

If the question is "Is this worth doing?" and the user decides it isn't, the story is dropped. Skip the other decisions they picked for this run, because they no longer matter, and go to step 4.

### Knock-on effects
After recording each answer, look at what it changes:
- **This note:** other sections the answer lands in, such as a section the question says to record it in, the chosen Fix Option, or a hub's Coverage or Child Stories table. Draft each change and go through them with the user.
- **New stories:** if the answer implies work no note covers yet, and the note is a hub, add it to a list of new child stories for step 5. Otherwise, add it to the out-of-scope list.
- **New questions:** if `decision-researcher` found a blocking question that isn't on the note, or the answer raised one, tell the user what needs deciding, add it to Open Decisions, and ask whether they already have an answer in mind:
  - **They have one:** go on from their answer as the `settling-a-decision` skill describes.
  - **They don't:** ask whether to research it now or leave it for a later run, since research takes time and each run covers only the decisions they pick. If they want it now, research it as the `settling-a-decision` skill describes.

## 4. Update the note's status
Once the picked decisions are done, set `confirmed` to today, since the user making decisions on a note counts as confirming it. Then update the note for the first case that fits:
- **The user decided the story isn't worth doing:** set `status: dropped`, remove the `decision needed` entry from `blocked-by`, and set the `^status` line to "Not worth doing. Next: /close".
- **Decisions remain open:** set the `^status` line to how many remain, such as "2 open decisions. Next: /decide".
- **A roundup with none left:** remove the `decision needed` entry from `blocked-by`, set `status: spec`, and set the `^status` line to "Decisions made. Next: /plan-steps".
- **A hub with none left:** set its `^status` line to "Next: its child stories" and remove its Roadmap line, since a hub has a line only while it has open decisions.
- **Any other story with none left:** remove the `decision needed` entry from `blocked-by`. Run `sh scripts/note-section.sh "Next Step by Note State"`, which prints Note Conventions' table of what each note state does next, and set the `^status` line to the story's next step from it, such as "Decisions made. Next: /assess".

If the user decided a story is worth doing and its Roadmap line is in Ideas, the story is now committed. Check its goals and place its line as the `roadmap-placement` skill describes.

## 5. New child stories
If the hub's list of new child stories is empty, skip this step. Otherwise, propose the child stories, each with a one-line scope and the decisions it comes from, and wait for the user to approve, change or drop each one. For each one they approve:
1. Create an idea note in `notes/features/<area>/` from `notes/templates/Idea.md`. Under Notes, link the hub, give the one-line scope, and quote the Decided lines it comes from.
2. Add it to the hub's Child Stories table.
3. Add a Roadmap line for it.

## 6. Out-of-scope work
Triage the out-of-scope list. For a new story from step 3, offer route or drop only, since it's another note's work. If you send `scope-router` an item that came from an answer, include the question it answers and its Decided line, so it can name the decision the item comes from.

## 7. Stop
Tell the user what's left:
- **The story was dropped:** say so, and give `/close <note name>` as its next step. Skip the other cases.
- **Open decisions remain:** list them, one line each. The next run is `/decide <note name>`.
- **None remain:** give the note's next step from its `^status` line, such as `/assess <note name>`.
- **Children were created:** list each one with the command to run, such as `/shape <child name>`.

Don't start the next step in this session, even if it's the obvious one, because it deserves a fresh context.
