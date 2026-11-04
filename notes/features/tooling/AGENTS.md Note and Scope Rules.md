---
type: workflow
---
# Where It Stands
Next: /tooling ^status

# Inbox
- Sarah, on this review: "I think this is where the overly prescriptive instructions will be really critical. Agent instructions are too brittle, causing context bloat and agents to do things even when they don't make sense. Fixing that issue needs to be a priority in this story. For every change you make, defend it to me in the chat how it is not overly prescriptive."
- From a `/decide` session on One Source of Today (2026-11-01): agents are too aggressive about suggesting `blocked-by` entries between stories. The `decision-researcher` report listed "Should One Source of Today and Calendar and Recipes Data Refresh Step 2 be tied together with a blocked-by?" as a new question, and the session asked Sarah. She said no: the story doesn't need to wait, because it can use an old way of getting today and One Source of Today corrects it later. It was the second session to suggest that same `blocked-by`. Sarah: "agents are being too aggressive about blocked-by this is silly." AGENTS.md's "An effect your change has on another story", the "only decided or planned" case, names a `blocked-by` entry as its example of a major effect worth asking about, and it loads into every session. `decision-researcher.md` never mentions `blocked-by`, but its "What it implies" and Check "Problems" lines ask for follow-up decisions and stories. Check both.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Full review here:** AGENTS.md's "Editing notes" and "Out-of-scope work", and the shared-rule skills they move into. If you notice a problem with the structure of AGENTS.md as a whole, add an Inbox item to [[AGENTS.md Structure Review]] rather than fixing it here.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-5]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.

- **Decision 5:** "Editing notes" moves into an `editing-notes` shared-rule skill, and the out-of-scope triage procedure moves to a shared-rule skill the same way. The rules for reading embeds and links stay.
- **Following links:** AGENTS.md gets a rule for following links, next to the embed rule: a link to a heading or a block (`[[#^piece-7]]`, `[[Note#Section]]`) points to content the line depends on, so read the target when that line matters to the work. Both rules stay in AGENTS.md when "Editing notes" moves out (decision 5).
- **"One at a time"** at :106 and :115, in bold, which is emphasis too, repeats the question rule.
- **The 📌 question** (:80) is also in the Roadmap's Markers and `tooling:49`; it gets one home in `roadmap-placement`, with the Roadmap rules below.
- **Inside "Editing notes", before it moves:** Where It Stands and the `^status` formats (:53-66, 436 words) are restated in five templates' comments, which decision 9 removes. :66 and :72 both say a finding for a later step goes at the top of that step's section. :47 puts the Check Drift prohibition between the bullet's opening and its cases; it becomes its own bullet. :85 ("A `ready` note goes back to `spec`") counts "Three changes don't count"; it becomes a condition with one example.
- **Roadmap rules that belong in `roadmap-placement`:** "A blocker outside the queue" (:77, no reason) and "Starting on a story in the backlog" (:78-83, whose exception for `/implement` and `/tooling` comes after the instruction). :80's marker rule is also in the Roadmap's Markers and `tooling:49`; the 📌 question gets one home in `roadmap-placement`.
- **:98, Immature stories:** an edge-case list of three kinds; it becomes the principle with one example.
- **Out-of-scope work:** another note's gaps against current conventions aren't an item, next to "Immature stories" (from `update-notes-when-touched`).
- **Rules in "Working with the User" that may belong with these moves,** from a writing review on 2026-11-04: "Open questions in notes" and the recording and marking steps in "Decisions can change" are about writing notes, and "Rare cases" only applies to a story past `/shape`, so each loads into sessions that never use it.
- **Memories that move here, then are deleted:** `update-notes-when-touched` (Out-of-scope work above), and `block-on-unbuilt-skills` and `remove-without-tombstones` (to `editing-notes`).

Moved from Agent Workflow Changes 2026-10-02 on 2026-10-06:
- [Sarah] - agents should only ask for approval for the "Where It Stands" status updates if there's genuine ambiguity.
