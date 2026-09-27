---
name: close
description: Close a story that is done or being dropped - keep its note in archive/ for the stories that still need it or delete it, unblock the stories that waited on it, and update every note that points to it.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh .opencode/docs'
---

Close the story **$ARGUMENTS**.

## Why this skill works the way it does
When a story leaves the board, two things happen: its note is kept or deleted, and the notes around it catch up. The second is where things get missed. A story that waited on it stays under Blocked, a Roadmap line still says "unblocks [[X]]", a sweep item keeps its **Blocked by** marker, or a note still sends readers to a design that's gone.

A few rules shape how it works:
- **A note is kept only while another story needs it.** A kept note moves to `archive/` and lists the stories it's kept for in `kept-for`. When the last of them closes, the note is deleted. Nothing is kept just as a record, because git history is the backup. If a note feels worth keeping for reference, that means `.opencode/docs/` is missing something. Ask Sarah about the doc update instead.
- **Done and dropped stories close the same way,** except for the stories that waited on them. A done story unblocks them. A dropped story doesn't, so each one needs a new decision about what it waits on.
- **Hubs close like any story.** A hub is often where the design lives, so it gets the same keep-or-delete check.
- **Unblocked stories go to `/check-drift` next.** They were planned before this story changed the code.
- **No unused files.** A file in the vault (an image, a `.dc.html` prototype, a script or SVG it loads) that nothing references anymore gets deleted. A close is when files lose their last reference: the note that embedded them is deleted, or content moves and pointers get reworded.
- **One note per run.** When closing this story means another note should close too, such as an archived note that loses its last `kept-for` entry or a hub with no open stories left, tell Sarah. She runs `/close` on it in a new session.

This is notes work only. Don't change code. A hook blocks edits outside `notes/`, `.scratch/` and `.opencode/docs/`. Move and delete notes with plain `mv` and `rm`, never `git mv` or `git rm`, so every change stays unstaged.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once.
- **Self-contained.** Put what a question is about inside it: the story, the note, the line. She may see only the question, not the text before it.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Choices, not mechanics.** Some edits have only one right answer once the story is closed, like removing it from a `blocked-by` list. Make those without asking, and list them in the report at the end. Ask only where there's a real choice.
- **Her comments:** a line where her name is a tag or a signature (`[Sarah] ...`, `... - Sarah`) is her own words. Never edit it. If one mentions this story and is now out of date, show it to her and let her decide.
- **Doc gaps:** the moment you notice something that belongs in `.opencode/docs/` (a convention the docs don't cover, or a rule that's wrong or out of date), stop and ask Sarah whether it should become doc. If it should, draft the change, show it to her and write it once she approves.
- **Out-of-scope items:** keep a running list of work that belongs to another story, whether you or Sarah found it. Step 6 handles them.

## 1. Read the note
Read `notes/Note Conventions.md` first. Then find the note in `notes/features/` or `notes/archive/` and read all of it, including each embedded section (`![[Hub#Section]]`), which is part of the note.

Where the note is and its `status` decide the kind of close:
- **`done`, in `notes/features/`:** a done close. Check that every step is marked ✅ Complete, ❌ Will Not Do or 🚛 Moved, and that each 🚛 target note really holds the moved work: the full step, its image embeds and the handoff text, not a summary. If anything is missing, tell Sarah what you found and stop.
- **A hub, in `notes/features/`:** check each story it lists. If any is still open (its note is in `notes/features/`), tell Sarah which ones and stop. Otherwise it's a done close. A hub has no `status`, so leave it without one.
- **Any other status, in `notes/features/`:** ask Sarah whether she's dropping the story. If not, stop. If she is, it's a dropped close. Then ask whether any part of it is still wanted somewhere else, such as a step or a piece of its design. Each part she names goes on the out-of-scope list, with its full text and images.
- **In `notes/archive/`, with an empty or missing `kept-for`:** a re-close. The story itself closed earlier, so steps 4 and 6 don't apply. A missing `kept-for` means the note is older than the property, not that it's kept for good.
- **In `notes/archive/`, with stories in `kept-for`:** tell Sarah which stories it's kept for, and stop.

## 2. Find everything that points to it
Search for the note's name, and for its files (the files in `notes/assets/<story-name>/` and every file it embeds or links, such as images and `.dc.html` prototypes):
- **The vault:** every note in `notes/`, including `notes/archive/` and the Roadmap, but not `notes/templates/`. Look for `[[Name]]`, `[[Name|`, `[[Name#`, `![[Name`, embeds of its files, and the name in plain text.
- **Outside the vault:** `src/`, `test/`, `.opencode/docs/`, `.claude/`, `AGENTS.md` and `CLAUDE.md`, for the name and for the note's path.

Sort each match into one kind:
- **Blocker:** an entry in another story's `blocked-by`, a sweep item's `**Blocked by [[Name]]:**` marker, or a Roadmap line that says it waits on this story.
- **Content:** a note that relies on this note's content. It embeds a section or image, or sends the reader here for a design, a decision or a rationale ("as the approved design in the archived [[Mobile Month View]] note specifies").
- **Kept-for:** an archived note with this story in its `kept-for`.
- **Hub list:** a hub that lists this story as one of its stories.
- **Passing mention:** anything else in the vault, like "unblocks [[X]]", "follow-up to [[X]]" or "Depends on: [[X]]". Some are now out of date, some are still true.
- **Sarah's comment:** a line tagged or signed with her name.
- **Outside the vault:** code comments, docs, skills and agents.

This story's own Roadmap line isn't on the list. Step 7 removes it.

Also note each archived note that this story links to, or that links to it, and has no `kept-for`. Step 5 asks about them.

Save the list to `.scratch/<note name> - close.md`, and mark each item as you handle it.

## 3. Keep or delete
The note is needed by every open story with a Content match. A Content match from an archived note counts for the stories in that note's `kept-for`, not for the archived note itself.

**If an open story needs it,** go through those stories one at a time. For each, ask Sarah whether to keep this note for that story, or move the content it relies on into the story so it no longer needs this note. Moving follows "Moving unfinished work" in Note Conventions: the full text, image embeds and handoff details, never a summary. Only offer to move a piece that no other story needs, because the design stays in one copy.

**If no open story needs it,** it will be deleted. First, if it holds something that seems worth keeping for reference, such as a convention or the reason the code is the way it is, ask Sarah whether `.opencode/docs/` should cover it. If it should, draft the change, show it to her and write it once she approves.

Then tell Sarah the outcome in one line, either "keep in `archive/` for [[A]] and [[B]]" or "delete", and wait for her to confirm.

## 4. Handle the stories that waited on it
Skip this for a re-close. Go through the Blocker matches one story at a time.

**For a done close:**
1. Remove this story from the `blocked-by` list, and from the "waiting on" wording of the story's Roadmap line.
2. If the list still has entries, the story stays blocked. Move on to the next one.
3. If the list is now empty, set the story's `^status` line to "Unblocked. Next: /check-drift" if it's `spec`, `ready` or `in-progress`. For an `idea` note, write the next step its type calls for in the Next Step by Note State table.
4. If its Roadmap line is under Blocked, show Sarah the story and the current Next list, and ask where it goes. Don't suggest a spot. Move the line where she says.

**For a dropped close:** ask Sarah what the story waits on now: nothing, another story, or a decision. Update its `blocked-by` and Roadmap line to match. If nothing blocks it anymore, finish as in steps 3 and 4 of a done close. It was planned expecting this story's changes, so it needs `/check-drift` too.

**Sweep items:** for a done close, remove the `**Blocked by [[Name]]:**` marker. For a dropped close, ask Sarah whether the item still stands, now waits on something else, or should be removed.

## 5. Update the other notes
Go through the remaining matches:
- **Content:** if a story's content was moved into it in step 3, make the move now, then reword the pointer so it no longer sends the reader to this note. If this note is kept, leave the pointers alone.
- **Kept-for:** remove this story from the archived note's `kept-for`. If the list is now empty, that note needs `/close` in a new session. Add it to the follow-ups in step 9.
- **Hub list:** mark this story done or dropped in the hub's list, following how the hub marks the others. If the hub now has no open stories left, add it to the follow-ups.
- **Passing mention:** if it's out of date, propose new wording to Sarah and wait for her approval. If this note is being deleted, every link to it would be left pointing at nothing, so reword or remove each one, even the ones that are still true. Never add a line saying the note was removed.
- **Sarah's comment:** if it's out of date, show it to her. Never edit it.
- **Archived notes with no `kept-for`:** for each one step 2 found, ask Sarah which open stories it's kept for. Write her answer into its `kept-for`. If none, add it to the follow-ups.
- **Outside the vault:** add it to the out-of-scope list.

## 6. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found (with `file:line`, or the note and section) and why it's outside this close. For a piece of a dropped story, include its full text and image embeds. Then go through its suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.

## 7. Close the note
1. Remove the note's own line from the Roadmap. For a hub, that's its line under Hubs.
2. For a dropped close, set `status` to `dropped`. A done close stays `done`.
3. Set the `^status` line to "Done." or "Dropped.". Don't touch `confirmed`.
4. Then keep or delete it, as Sarah confirmed in step 3:
   - **Keep:** add `kept-for` to the frontmatter with the stories she confirmed, each as a `"[[link]]"`. If the note is in `notes/features/`, move it to `notes/archive/` with `mv`. Leave its files where they are. Obsidian finds embeds by name.
   - **Delete:** run `git status` on the note. If it has uncommitted changes or isn't tracked, git can't bring it back, so ask Sarah before deleting it. Delete it with `rm`.

## 8. Delete unused files
The files to check are:
- every file in `notes/assets/<story-name>/`
- every file the closed note embeds or links
- every file whose embed or link this close removed from another note, or moved into one

For each, search all of `notes/` for its filename, not its path, because Obsidian finds files by name. A reference is an embed (`![[file]]`), a link (`[[file]]`), the filename or path in plain text ("see `archive/assets/dish-row-states.png`"), or another file loading it, like a `.dc.html` prototype loading `./support.js`. Only references from files that still exist count, so a reference from a note deleted in step 7 doesn't.

If nothing references a file, delete it. This is mechanical, but run `git status` on it first. If it has uncommitted changes or isn't tracked, ask Sarah before deleting it. Deleting a file can leave the files it loaded with nothing referencing them, such as a prototype's script, so check those too. Remove any assets folder left empty.

## 9. Report and stop
Tell Sarah:
- whether the note was kept (and for which stories) or deleted
- each mechanical edit, grouped by note
- each file deleted as unused
- the stories that were unblocked, and where their Roadmap lines went
- the follow-ups: each note that needs `/close` in a new session, and why

Leave every change unstaged. Stop there, and don't start on any other note.
