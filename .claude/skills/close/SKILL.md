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
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh docs'
---

Close the story **$ARGUMENTS**.

## Why this skill works the way it does
When a story leaves the board, two things happen: its note is kept or deleted, and the notes around it catch up. The second is where things get missed. A story that waited on it still lists it in `blocked-by`, a goal whose last story this was never gets flagged for release, a Roadmap line still says "unblocks [[X]]", a sweep or roundup item keeps its **Blocked by** marker, or a note still sends readers to a design that's gone.

A few rules shape how it works:
- **A note is kept only while another story needs it.** A kept note moves to `archive/` and lists the stories it's kept for in `kept-for`. When the last of them closes, the note is deleted. Nothing is kept just as a record, because git history is the backup. If a note feels worth keeping for reference, that means `docs/` is missing something. Ask Sarah about the doc update instead.
- **Done and dropped stories close the same way,** except for the stories that waited on them. A done story unblocks them. A dropped story doesn't, so each one needs a new decision about what it waits on.
- **Hubs close like any story.** A hub is often where the design lives, so it gets the same keep-or-delete check.
- **An unblocked story goes to `/check-drift` only if it sat waiting.** A story that waited in the backlog was planned before this story changed the code. A story whose `^status` line names a step it could take while this story was still open is moving forward, possibly in another session, so its next step stays.
- **No unused files.** A file in the vault (an image, a `.dc.html` prototype, a script or SVG it loads) that nothing references anymore gets deleted. A close is when files lose their last reference: the note that embedded them is deleted, or content moves and pointers get reworded. Files don't always sit where the conventions say, and references get missed, so every close checks the whole vault, not just this story's files.
- **One note per run.** When closing this story means another note should close too, such as an archived note that loses its last `kept-for` entry or a hub with no open stories left, tell Sarah. She runs `/close` on it in a new session.

This is notes work only. Don't change code. A hook blocks edits outside `notes/`, `.scratch/` and `docs/`. Move and delete notes with plain `mv` and `rm`, never `git mv` or `git rm`, so every change stays unstaged.

## Talking with Sarah
- **Choices, not mechanics.** Some edits have only one right answer once the story is closed, like removing it from a `blocked-by` list. Make those without asking, and list them in the report at the end. Ask only where there's a real choice.

## 1. Read the note
Find the note in `notes/features/` or `notes/archive/` and read all of it.

Where the note is and its `status` decide the kind of close:
- **`done`, in `notes/features/`:** a done close. Check that every step is marked ✅ Complete, ❌ Will Not Do or 🚛 Moved, and that each 🚛 target note really holds the moved work: the full step, its image embeds and the handoff text, not a summary. If anything is missing, tell Sarah what you found and stop.
- **A goal or standing goal, in `notes/goals/`:** `/close` doesn't close these. A goal closes through a release process, which isn't built yet, and a standing goal never closes. Tell Sarah, and stop.
- **A hub, in `notes/features/`:** check each story it lists. If any is still open (its note is in `notes/features/`), tell Sarah which ones and stop. Otherwise it's a done close. A hub has no `status`, so leave it without one.
- **Any other status, in `notes/features/`:** ask Sarah whether she's dropping the story. If not, stop. If she is, it's a dropped close. Then ask whether any part of it is still wanted somewhere else, such as a step or a piece of its design. Each part she names goes on the out-of-scope list, with its full text and images.
- **In `notes/archive/`, with an empty or missing `kept-for`:** a re-close. The story itself closed earlier, so steps 4 and 6 don't apply. A missing `kept-for` means the note is older than the property, not that it's kept for good.
- **In `notes/archive/`, with stories in `kept-for`:** tell Sarah which stories it's kept for, and stop.

## 2. Find everything that points to it
Run `sh scripts/note-refs.sh "<note name>"`. It lists the note's files (everything it embeds or links, plus the rest of any assets folder they sit in), then every reference to the note and to its files, each with `file:line`. It searches the vault (except `notes/templates/`), and outside it `src/`, `test/`, `docs/`, `.claude/`, `AGENTS.md` and `CLAUDE.md`. It tags each vault reference by its form: a `blocked-by` or `kept-for` entry, a **Blocked by** marker, its own Roadmap line, another Roadmap line, an embed, a link or plain text. It also marks lines tagged `[Sarah]` or signed `- Sarah`.

Sort each match into one kind. The tags settle Kept-for and Outside the vault, and most Blockers. Read the line for the rest. A comment of Sarah's the script didn't mark is still her comment.
- **Blocker:** an entry in another story's `blocked-by`, a sweep or roundup item's `**Blocked by [[Name]]:**` marker, or a Roadmap line that says it waits on this story.
- **Content:** a note that relies on this note's content. It embeds a section or image, or sends the reader here for a design, a decision or a rationale ("as the approved design in the archived [[Mobile Month View]] note specifies").
- **Kept-for:** an archived note with this story in its `kept-for`.
- **Hub list:** a hub that lists this story as one of its stories.
- **Passing mention:** anything else in the vault, like "unblocks [[X]]", "follow-up to [[X]]" or "Depends on: [[X]]". Some are now out of date, some are still true.
- **Sarah's comment:** a line tagged or signed with her name.
- **Outside the vault:** code comments, docs, skills and agents.

This story's own Roadmap line isn't on the list. Step 7 removes it.

The script's last section lists each archived note that this story links to, or that links to it, and has no `kept-for`. Step 5 asks about them.

Save the list to `.scratch/<note name> - close.md`, and mark each item as you handle it.

## 3. Keep or delete
The note is needed by every open story with a Content match. A Content match from an archived note counts for the stories in that note's `kept-for`, not for the archived note itself.

**If an open story needs it,** go through those stories. For each: if another story also needs the content it relies on, that content can't move, because the design stays in one copy, so ask Sarah only to confirm keeping this note for that story. Otherwise, ask her whether to keep this note for that story, or move the content it relies on into the story so it no longer needs this note. Move the full step or section, its image embeds and the handoff text it relies on, never a summary, and leave a 🚛 pointer behind. Archived notes are effectively invisible, so design references must travel with the work.

**If no open story needs it,** it will be deleted. First, if it holds something that seems worth keeping for reference, such as a convention or the reason the code is the way it is, that's a doc gap. Handle it as AGENTS.md describes under "Doc gaps".

Then tell Sarah the outcome in one line, either "keep in `archive/` for [[A]] and [[B]]" or "delete", and wait for her to confirm.

## 4. Handle the stories that waited on it
Skip this for a re-close. Go through the Blocker matches.

**For a done close:**
1. Remove this story from the `blocked-by` list, and from the "waiting on" wording of the story's Roadmap line.
2. If the list still has entries, the story stays blocked. Move on to the next one.
3. If the list is now empty, read the story's `^status` line:
   - **It names a next step that didn't wait on this story,** such as "Next: /plan-steps" for a story being planned while this one was built: the story is moving forward, possibly in another session. Keep that step, and remove only any wording about waiting on this story.
   - **It waits on this story,** such as "Waiting on [[X]]" or "Blocked until [[X]] lands, then /shape": the story sat in the backlog. If it's `spec`, `ready` or `in-progress`, set the line to "Unblocked. Next: /check-drift". If it's an `idea` note, write the next step its type calls for in the table below.
   - **You can't tell which:** show Sarah the line, and ask whether the story goes to `/check-drift` or keeps its next step.
4. If its Roadmap line is in Later and it serves an active goal, show Sarah the story and the current Next list, and ask whether it moves into Next and where, as AGENTS.md describes under "Roadmap order". Move the line where she says, with a 🎯 link for each goal it serves. Otherwise, leave the line where it is.

!`sh scripts/note-section.sh "Next Step by Note State"`

**For a dropped close:** ask Sarah what the story waits on now: nothing, another story, or a decision. Update its `blocked-by` and Roadmap line to match. If nothing blocks it anymore, finish as in steps 3 and 4 of a done close, with one difference. The story was planned expecting this story's changes, which will never land, and `/plan-steps` checks for drift only in commits that did. So if it's `spec`, `ready` or `in-progress` and its `^status` line names a next step, don't keep that step without asking: tell Sarah the story was planned expecting this story's changes, show her the line, and ask whether to set it to "Unblocked. Next: /check-drift" or keep its next step.

**Sweep and roundup items:** for a done close, remove the `**Blocked by [[Name]]:**` marker. For a dropped close, ask Sarah whether the item still stands, now waits on something else, or should be removed.

## 5. Update the other notes
Go through the remaining matches:
- **Content:** if a story's content was moved into it in step 3, make the move now, then reword the pointer so it no longer sends the reader to this note. If this note is kept, leave the pointers alone.
- **Kept-for:** remove this story from the archived note's `kept-for`. If the list is now empty, that note needs its own `/close`, as the paragraph below this list describes.
- **Hub list:** mark this story done or dropped in the hub's list, following how the hub marks the others. If the hub now has no open stories left, it needs its own `/close`, as the paragraph below this list describes.
- **Passing mention:** if this note is being deleted, every link to it would be left pointing at nothing, so reword or remove each one, even the ones that are still true. Otherwise, only the out-of-date ones need it. For an out-of-date one: if the only change is swapping the link to this note for a link to the doc section that now holds its content, such as a pattern's Rule that landed in `docs/`, make it and list it in the step 9 report. Otherwise, propose new wording to Sarah and wait for her approval. Never add a line saying the note was removed.
- **Sarah's comment:** if it's done or out of date, handle it as AGENTS.md describes under "Editing notes".
- **Archived notes with no `kept-for`:** for each one step 2 found, ask Sarah which open stories it's kept for. Write her answer into its `kept-for`. If none, that note needs its own `/close`, as the paragraph below this list describes.
- **Outside the vault:** add it to the out-of-scope list.

**A note that now needs its own `/close`** is easy to forget, because an archived note has no Roadmap line, and neither does a hub with no open decisions. So set its `^status` line to "Next: /close", give it a Roadmap line that links to it and embeds its status, and ask Sarah where the line goes, as AGENTS.md describes under "Roadmap order". Then add it to the follow-ups in step 9.

## 6. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, a piece of a dropped story that Sarah asked to keep in step 1 skips the triage. For the other items, the story is closing, so the triage offers route or drop only. Then route the list as AGENTS.md describes under "Out-of-scope work". For a piece of a dropped story, include its full text and image embeds.

## 7. Close the note
1. Remove the note's own line from the Roadmap. First note the goals it served: the goal heading it sat under and its 🎯 links. For each one that isn't a standing goal, which never ships, if no other open line sits under its heading or carries its 🎯 link, and no collecting-note item carries its 🎯 link, add ` - waiting on a release process` to the goal's line under Goals.
2. For a dropped close, set `status` to `dropped`. A done close stays `done`.
3. Set the `^status` line to "Done." or "Dropped.". Don't touch `confirmed`.
4. Then keep or delete it, as Sarah confirmed in step 3:
   - **Keep:** add `kept-for` to the frontmatter with the stories she confirmed, each as a `"[[link]]"`. If the note is in `notes/features/`, move it to `notes/archive/` with `mv`. Leave its files where they are. Obsidian finds embeds by name.
   - **Delete:** delete it with `rm`, as AGENTS.md describes under "Git and files".

## 8. Delete unused files
Run `sh scripts/vault-orphans.sh`. It checks the whole vault except `notes/templates/`, and lists every file that isn't a note and that nothing references anymore, each with its git state. Any mention of the filename counts as a reference: an embed, a link, plain text, or a prototype loading it. A file that only other unreferenced files load, such as a deleted prototype's script, is listed too. Run it after step 7, so a reference from a note deleted there doesn't count.

Delete each file it lists as AGENTS.md describes under "Git and files", using the git state it prints. Then remove each folder it says is left empty.

## 9. Report and stop
Tell Sarah:
- whether the note was kept (and for which stories) or deleted
- each mechanical edit, grouped by note
- each file deleted as unused
- the stories that were unblocked, and where their Roadmap lines went
- each goal now waiting on a release process
- the follow-ups: each note that needs `/close` in a new session, why, and where its Roadmap line went

Leave every change unstaged. Stop there, and don't start on any other note.
