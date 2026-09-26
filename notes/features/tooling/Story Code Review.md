---
type: 
status: idea
confirmed: 2026-09-25
---
# Where It Stands

Next: /shape, once /implement has had a few runs. ^status

# Notes
A code review of a whole story once every step is implemented. It's the next step for notes in `in-review` (see the Next Step by Note State table in [[Note Conventions]]).

**Why it's worth doing.** Sarah already reviews each step's diff, so re-reviewing steps adds little. This review is for what no single step shows:
- scaffolding a step planned to remove that is still there
- helpers or logic duplicated across two steps
- a module that picked up a second job gradually, one reasonable step at a time
- dead code left by **As built** changes: unused exports or props, branches nothing reaches
- a piece that made sense early in the story but doesn't once the later steps exist

Most of these can be checked mechanically, which is where most of the value should be. Architecture findings will be rarer but are the kind that get expensive later.

**The bias to design against.** The OpenCode review agent strongly favored whatever implement had built. It read the diff first, so the code became the frame, and it had no target of its own to compare against. Running it in a fresh session doesn't fix that: the anchor is the code, not the session.

**Ideas for avoiding it:**
- Design before reading. From the note's approach and the project conventions alone, sketch how the pieces should be divided, then compare with the code. Differences are findings for Sarah to decide; the implementation doesn't win by default.
- The `code-critic` agent already reviews modules against a target design for single concern and conventions. The review could reuse it rather than start from scratch.
- Go through findings with Sarah one at a time.

# Questions
- What's the skill called?
- Where do fixes happen: in the review session, following `/implement`'s rules, or routed to notes as new work?
- How does it find the story's code? Sarah commits each step herself, so it may need her to name a commit range.
