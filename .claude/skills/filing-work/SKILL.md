---
name: filing-work
description: How to choose where a piece of work goes in the notes repo and how to write it there. Use when routing out-of-scope work, or when folding an idea into an existing note or a collecting note.
user-invocable: false
---

# Filing Work
Each piece of work gets one home in the vault, so it's found when that home is worked and isn't done twice. Two cases decide which homes are open:
- **If a story waits on the work,** its home is a note of its own, existing or new, as Note Conventions describes under `blocked-by`.
- **If the work fits a collecting note,** whether the note or a dated copy of it is open depends on where the problem came from. This release's work is everything done in it so far, in the code or the notes, and every line in Now and Next. A problem it caused includes one it left behind, such as a doc that a story's change made wrong. The user wants a release to fix what it broke before it ships, so that no release makes the app worse.
  - **If this release's work caused it:** the note itself isn't open. Which copy is open depends on the item:
    - **If it's a sweep item whose fix has to wait for a story still to be built in this release:** the copy that waits for that story is open, if one is still `spec`. Otherwise, a new copy is open, so only the items that wait for that story wait.
    - **Otherwise:** the note's newest dated copy with nothing in `blocked-by` is open. A sweep's copy is open only while it's `spec`, because once its steps are planned, a new item would send it back to re-plan them. If no copy is open, a new copy is open instead.
  - **Otherwise:** the note itself is open, and its dated copy isn't, so the items the copy was kicked off with stay a set it can finish.

Unless a story waits on the work, take the first open home that fits:
1. **A note or Roadmap line that already covers it.** Nothing needs adding.
2. **The note of a story or hub it belongs to.** Work belongs to a story or hub whose purpose directly addresses the problem the work is about. That holds even if the last story to deal with the problem is closed. Filed anywhere else, it waits while the effort meant to fix that problem goes on without it. Look first at prioritized work: the Roadmap's Now, Next and Planning lines, and the hubs their stories are children of. How it's filed depends on the work and the note:
   - **If it's design material,** such as part of a design handoff: add it to the Inbox of the story it most likely belongs to, and put "/place-design" first in that story's `^status` line, keeping its old next step after it, such as "Next: /place-design, then /implement Step 4". Leave its `status` as it is. `/place-design` decides where the design really goes and moves each story it reaches to its next step, so a likely home is enough here.
   - **If it belongs to a hub whose `^status` line says `Next: its child stories`:** make it a new workflow note as item 4 describes if the work changes how the app is built, and otherwise a new idea note as item 6 describes. No session works that hub's Inbox, so an item there would wait unseen. The new note joins the hub as `.claude/skills/filing-work/content-from-another-note.md` describes. Its Roadmap line goes with its siblings' lines in Next, Planning or Later, with their 🎯 links, so it's worked as part of that effort.
   - **Otherwise:** add it to the note's Inbox. If the note has none, add one right after Where It Stands, or at the top if it has no Where It Stands either. Leave the note's other sections as they are, because the note's own skills decide what the work changes there.

   If the work isn't design material, the note is `ready`, and none of its remaining steps covers the work, its approved plan no longer covers what it has to build, so it goes back to `spec`. Set its `^status` line to its next skill, and say in its Inbox that it went back for this work.
3. **A sweep whose What Belongs Here rule fits it,** if the work is small, with no ambiguity and no open decision. Write it in the format the note's template gives. If only one action makes sense, that isn't an open decision, so write that action into the item. For example, if an item's fix leaves a test file empty, the item says to delete the file. If the open home is a new dated copy, freeze one for this item, with its Roadmap line, as `.claude/skills/filing-work/freezing-a-copy.md` describes. Otherwise, add it to the open home.
4. **A workflow note,** if the work changes how the app is built, as Note Conventions' Workflow type describes. It goes in a collecting workflow note whose What Belongs Here rule fits it, or in that note's dated copy if that's the open home, written as the rule describes. If it's a new copy, freeze one as item 3 describes. If no collecting workflow note fits, it's a new workflow note from `.claude/note-templates/Workflow.md`, with a Roadmap line that links to it. Either way:
   - **If it asks for a workflow behavior for one case,** as opposed to a pattern's Convention, which covers only the cases the code has: write it as the general capability that would let this case, and the next one like it, be set up without changing the skill again, with this case as its first use. A skill full of one-off cases is harder to maintain than one mechanism that each note configures.
   - **If it's the user's feedback** on a skill, subagent or the workflow: quote their words.
5. **A new Roadmap line,** if the work fits within the line length the `roadmap-rules` skill sets.
6. **A new idea note** in `features/<area>/` in the notes repo, from `.claude/note-templates/Idea.md`, with the work under Notes and a Roadmap line that links to it.

Write the work as the problem. For a workflow note, the problem can be that an agent isn't doing what the user wants. The cases where the work comes with a fix, and what to do in each:
- **If the user's own words name it:** keep them, because whether to drop a fix they named is their call.
- **Otherwise, if the user has already settled it, or it goes in a sweep item,** whose template asks for exactly what changes: keep it.
- **Otherwise:** leave it out of the text and out of a new note's name. Later sessions read what's written in the home as the direction, so they build a fix named there without weighing it. For example, write "the server's time zone can mark the wrong day", not "consider one source of today".

If the work relies on content from another note, such as part of its design, bring the content along as `.claude/skills/filing-work/content-from-another-note.md` describes.
