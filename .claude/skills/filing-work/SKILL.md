---
name: filing-work
description: How to choose where a piece of work goes in the notes/ vault and how to write it there. Use when routing out-of-scope work, or when folding an idea into an existing note or a collecting note.
user-invocable: false
---

# Filing Work
Each piece of work gets one home in the vault, so it's found when that home is worked and isn't done twice. Two cases decide which homes are open:
- **If a story waits on the work,** its home is a note of its own, existing or new, as Note Conventions describes under `blocked-by`.
- **If the collecting note the work fits has an open dated copy,** which of the two is open depends on what the work is about:
  - **If it's about something not working as the user expected:** the dated copy is open, ranking ahead of the note it was copied from. The user counts this work as part of what was kicked off, even when no item says so.
  - **Otherwise:** the dated copy isn't open, so the items it was kicked off with stay a set it can finish. The note it was copied from is open instead.

Unless a story waits on the work, take the first open home that fits:
1. **A note or Roadmap line that already covers it.** Nothing needs adding.
2. **The note of a story or hub it belongs to.** Work belongs to a story or hub whose purpose directly addresses the problem the work is about. That holds even if the last story to deal with the problem is closed. Filed anywhere else, it waits while the effort meant to fix that problem goes on without it. Look first at prioritized work: the Roadmap's Now, Next and Planning lines, and the hubs their stories are children of. How it's filed depends on the work and the note:
   - **If it's design material,** such as part of a design handoff: add it to the Inbox of the story it most likely belongs to, and put "/place-design" first in that story's `^status` line, keeping its old next step after it, such as "Next: /place-design, then /implement Step 4". Leave its `status` as it is. `/place-design` decides where the design really goes and moves each story it reaches to its next step, so a likely home is enough here.
   - **If it belongs to a hub whose `^status` line says `Next: its child stories`:** make it a new workflow note as item 4 describes if the work changes how the app is built, and otherwise a new idea note as item 6 describes. No session works that hub's Inbox, so an item there would wait unseen. The new note joins the hub as `.claude/skills/filing-work/content-from-another-note.md` describes. Its Roadmap line goes with its siblings' lines in Next, Planning or Later, with their 🎯 links, so it's worked as part of that effort.
   - **Otherwise:** add it to the note's Inbox.

   If the work isn't design material, the note is `ready`, and none of its remaining steps covers the work, its approved plan no longer covers what it has to build, so it goes back to `spec`. Set its `^status` line to its next skill, and say in its Inbox that it went back for this work.
3. **A sweep whose What Belongs Here rule fits it,** if the work is small, with no ambiguity and no open decision. Add it in the format the note's template gives. If only one action makes sense, that isn't an open decision, so write that action into the item. For example, if an item's fix leaves a test file empty, the item says to delete the file. If the note is `ready`, check its steps as item 2 describes.
4. **A workflow note,** if the work changes how the app is built, as Note Conventions' Workflow type describes. It goes in a collecting workflow note whose What Belongs Here rule fits it, written as that rule describes. If none fits, it's a new workflow note from `notes/templates/Workflow.md`, with a Roadmap line that links to it. Either way:
   - **If it asks for a workflow behavior for one case,** as opposed to a pattern's Rules, which cover only the cases the code has: write it as the general capability that would let this case, and the next one like it, be set up without changing the skill again, with this case as its first use. A skill full of one-off cases is harder to maintain than one mechanism that each note configures.
   - **If it's the user's feedback** on a skill, subagent or the workflow: quote their words.
5. **A new Roadmap line,** if a line or two describes the work.
6. **A new idea note** in `notes/features/<area>/`, from `notes/templates/Idea.md`, with the work under Notes and a Roadmap line that links to it.

Write the work as the problem. For a workflow note, the problem can be that an agent isn't doing what the user wants. The cases where the work comes with a fix, and what to do in each:
- **If the user's own words name it:** keep them, because whether to drop a fix they named is their call.
- **Otherwise, if the user has already settled it, or it goes in a sweep item,** whose template asks for exactly what changes: keep it.
- **Otherwise:** leave it out of the text and out of a new note's name. Later sessions read what's written in the home as the direction, so they build a fix named there without weighing it. For example, write "the server's time zone can mark the wrong day", not "consider one source of today".

If the work relies on content from another note, such as part of its design, bring the content along as `.claude/skills/filing-work/content-from-another-note.md` describes.
