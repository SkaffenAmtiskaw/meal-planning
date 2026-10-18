---
name: filing-work
description: How to choose where a piece of work goes in the notes/ vault and how to write it there. Use when routing out-of-scope work, or when folding an idea into an existing note or a collecting note.
user-invocable: false
---

# Filing Work
Each piece of work gets one home in the vault, so it's found when that home is worked and isn't done twice. Two cases rule out some homes:
- **If a story waits on the work,** its home is a note of its own, existing or new, as Note Conventions describes under `blocked-by`.
- **If the collecting note it fits has been kicked off,** that note takes no new items, because a kicked-off note works a fixed set. Work for a dated copy (`<name> YYYY-MM-DD`) goes to the note it was copied from. A note kicked off in place, which is a sweep at `spec` or later or a roundup with a `decision needed` entry, has no such note, so the work gets a new Roadmap line or idea note.

Otherwise, take the first home that fits:
1. **A note or Roadmap line that already covers it.** Nothing needs adding.
2. **The note of a story or hub it belongs to:**
   - **If it's an impact from another story's decision,** such as a risk that this story's work could break something the other story adds: write it as a `> [!warning]` callout directly above the text it's about. Name the risk, the story and decision it comes from, and what must not break, as an acceptance criterion. Leave out how to resolve it, because the story works that out against the code as it stands when it's planned. If the note is `ready` or `in-progress` and one of its remaining steps touches the code at risk, also add the criterion to that step as a check.
   - **If it's design material,** such as part of a design handoff: add it to the Inbox of the story it most likely belongs to, and put "/place-design" first in that story's `^status` line, keeping its old next step after it, such as "Next: /place-design, then /implement Step 4". Leave its `status` as it is. `/place-design` decides where the design really goes and moves each story it reaches to its next step, so a likely home is enough here.
   - **Otherwise:** add it to the note's Inbox.

   If the work isn't design material, the note is `ready`, and none of its remaining steps covers the work, its approved plan no longer covers what it has to build, so it goes back to `spec`. Set its `^status` line to its next skill, and say in its Inbox that it went back for this work.
3. **A sweep or roundup whose What Belongs Here rule fits it.** Add it in the format the note's template gives.
4. **A workflow note,** if the work changes how the app is built, as Note Conventions' Workflow type describes. It goes in a collecting workflow note whose What Belongs Here rule fits it, written as that rule describes. If none fits, it's a new workflow note from `notes/templates/Workflow.md`, with a Roadmap line that links to it. Either way:
   - **If it asks for a workflow behavior for one case,** as opposed to a pattern's Rules, which cover only the cases the code has: write it as the general capability that would let this case, and the next one like it, be set up without changing the skill again, with this case as its first use. A skill full of one-off cases is harder to maintain than one mechanism that each note configures.
   - **If it's the user's feedback** on a skill, subagent or the workflow: quote their words.
5. **A new Roadmap line,** if a line or two describes the work.
6. **A new idea note** in `notes/features/<area>/`, from `notes/templates/Idea.md`, with the work under Notes and a Roadmap line that links to it.

If the work relies on content from another note, such as part of its design, bring the content along as `.claude/skills/filing-work/content-from-another-note.md` describes.
