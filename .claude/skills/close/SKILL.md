---
name: close
description: Closes a done or dropped story, archiving or deleting its note, and updates the notes around it. Use when a story is done or being dropped.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh docs'
---

Close the story **$ARGUMENTS**: keep its note in `archive/` while an open story needs it, or delete it, and bring the notes around it up to date.

## 1. Read the Note
Find the note in `notes/` and read all of it. Where it is and its `status` decide the kind of close:
- **`done`, in `notes/features/`:** a done close. Check that every step is marked ✅ Complete, ❌ Will Not Do or 🚛 Moved, and that each 🚛 target note holds the moved work in full, with its image embeds and handoff text. If anything is missing, tell the user what you found and stop.
- **A hub, in `notes/features/`:** check each story it lists. If any is still open (its note is in `notes/features/`), tell the user which ones and stop. Otherwise, it's a done close. A hub has no `status`, so leave it without one.
- **`dropped`, in `notes/features/`:** a dropped close. Ask the user whether any part of the story is still wanted somewhere else, such as a step or a piece of its design. Each part they name goes on the out-of-scope list.
- **Any other status, in `notes/features/`:** ask the user whether they're dropping the story. If they are, it's a dropped close, so ask about its parts as the case above describes. Otherwise, stop.
- **In `notes/archive/`, with an empty or missing `kept-for`:** a re-close, since the story itself closed earlier.
- **In `notes/archive/`, with stories in `kept-for`:** tell the user which stories it's kept for, and stop.
- **A goal or standing goal, in `notes/goals/`:** tell the user `/close` doesn't close these, and stop.

## 2. Find Everything That Points to It
Run `sh scripts/note-refs.sh "<note name>"`. Leave out this story's own Roadmap line, which step 7 removes, and sort the rest of what it lists into the kinds below.
- **Content:** a note that relies on this note's content. It embeds a section or image, or sends the reader here for a design, a decision or a rationale ("as the approved design in the archived [[Mobile Month View]] note specifies").
- **Blocker:** an entry in another story's `blocked-by`, a sweep or roundup item's `**Blocked by [[Name]]:**` marker, or a Roadmap line that says it waits on this story.
- **Kept-for:** an archived note with this story in its `kept-for`.
- **Hub list:** a hub that lists this story as one of its stories.
- **The user's comment:** a line tagged or signed with the user's name, whether or not the script labels it as the user's comment.
- **Passing mention:** any other line in the vault, like "unblocks [[X]]", "follow-up to [[X]]" or "Depends on: [[X]]".
- **Outside the vault:** code comments, docs, skills and agents.
- **Archived with no `kept-for`:** each note the script lists in its last section.

Save the list in `.scratch/`, and mark each match as you handle it.

## 3. Keep or Delete
The note is needed by every open story with a Content match. If a Content match is in an archived note, the stories in that note's `kept-for` need this note. So first, take each archived note the script listed with no `kept-for`. Ask the user which open stories it's kept for, and write their answer into its `kept-for`. If they name none, that note needs its own `/close`, which the end of step 5 sets up.

Then go through the open stories that need this note:
- **If another open story needs the same content,** the content can't move, because a design stays in one copy. Keep this note for the story without asking.
- **Otherwise,** ask the user which they want: keep this note for the story, or move the content the story relies on into the story's own note, so the story no longer needs this one. Step 5 makes the move.

If the note is kept for no story, it will be deleted. First, check it for anything worth keeping, as the `deleting-a-note` skill describes in step 1.

Then tell the user the outcome in one line, either "keep in `archive/` for [[A]] and [[B]]" or "delete". This lets them catch a wrong one before step 7 acts on it. Go on without waiting for a reply.

## 4. Handle the Stories That Waited on It
Skip this for a re-close. Otherwise, take each waiting story, a story with a Blocker match, in turn:
1. **For a dropped close,** ask the user what the waiting story waits on now: nothing, another story or a decision. If something still blocks it, update its `blocked-by`, its `^status` line and its Roadmap line to match, and go on to the next story.
2. Remove this story from the waiting story's `blocked-by` list, and from any "waiting on" wording on its `^status` line and Roadmap line. If its `blocked-by` still has entries, go on to the next story.
3. Decide whether the waiting story goes to `/check-drift` before its next step. Its note may hold work planned while this story was open, such as an approach or steps, and that work may not fit the code once this story closes. If this story is done, its changes have landed. If it's dropped, they never will. So the waiting story needs `/check-drift` if its next step would build on that work without first checking the work against the code. For example, `/plan-steps` checks the note against the commits since it was confirmed, so it catches a done story's changes but not the ones a dropped story never made. If it needs `/check-drift`, make that the next step on its `^status` line. Otherwise, keep the next step its `^status` line names.
4. If its Roadmap line is in Later and the story serves the building or planning goal, show the user the story and that goal's queue, and ask whether it moves there.

**Sweep and roundup items:** for a done close, remove the `**Blocked by [[Name]]:**` marker. For a dropped close, ask the user whether the item still stands, now waits on something else, or should be removed.

## 5. Update the Other Notes
Go through the rest of the matches, other than the user's comments:
- **Content:** if the user chose in step 3 to move the content a story relies on into the story's own note, move it now, as `.claude/skills/filing-work/content-from-another-note.md` describes for work moving out of a note. Then reword the line in the story's note so it no longer sends the reader here. Leave the matches from the stories this note is kept for as they are.
- **Kept-for:** remove this story from the archived note's `kept-for`. If the list is now empty, that note needs its own `/close`.
- **Hub list:** mark this story done or dropped in the hub's list, following how the hub marks the others. If the hub now has no open stories left, it needs its own `/close`.
- **Passing mention:** if this note is being deleted, reword or remove each one, as the `deleting-a-note` skill describes in step 3. Otherwise, reword each one that's out of date, such as by swapping the link to this note for one to the `docs/` section that now holds its content.
- **Outside the vault:** add it to the out-of-scope list.

**A note that now needs its own `/close`:** set its `^status` line to "Next: /close" and give it a Roadmap line, so it isn't forgotten.

## 6. Route the Out-of-Scope Items
Triage and route the out-of-scope list now, before step 7 deletes the note and step 8 deletes the files only it embeds. Skip triage for the parts of this story the user named in step 1, since they've already said those are wanted. For the other items, offer only route or drop, since the story is closing.

## 7. Close the Note
1. Remove the note's own line from the Roadmap, as the `deleting-a-note` skill describes in step 4.
2. Keep or delete the note, as step 3 settled:
   - **Keep:** for a dropped close, set `status` to `dropped`. Set the `^status` line to "Done." or "Dropped.", and leave `confirmed` as it is. Add `kept-for` to the frontmatter with the stories it's kept for, each as a `"[[link]]"`. If the note is in `notes/features/`, move it to `notes/archive/`. Leave its files where they are, since Obsidian finds embeds by name.
   - **Delete:** delete the note.

## 8. Delete Unused Files
Delete the files nothing references anymore, as the `deleting-a-note` skill describes in step 6.

## 9. Report and Stop
Report these to the user:
- whether the note was kept, and for which stories, or deleted
- each mechanical edit, grouped by note
- each file deleted as unused
- the stories that were unblocked, and where their Roadmap lines went
- each goal now waiting on a release process
- the follow-ups: each note that needs `/close` in a new session, why, and where its Roadmap line went

Stop there, and don't start on any other note. A session that has worked through one note's references has too little room left to work another one well.
