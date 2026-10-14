---
type: workflow
confirmed: 2026-10-14
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

**The gap:** sessions read the `writing-standard` skill before they draft a doc or agent instruction, but nothing checks the draft against it before Sarah sees it, and she keeps correcting drafts that break it. Sarah, 2026-10-14: "When you create a new shared-rule skill as part of one of these `tooling` sessions it also needs to be subject to the `writing-guidelines` rules, not just the `skill` the session was originally intended to fix." And: "In multiple sessions (not this one) I had to correct proposed edits for breaking the writing guidelines. This is part of a hub whose entire purpose is to make these files conform to the writing guidelines. In a previous session we edited the shared instructions to make it more clear. And yet I still had to correct you. Why is this?"

**Why drafts slip through,** as the session that drafted `filing-work` found:
- The standard's only check after drafting is rereading each changed passage as one piece. Nothing goes through its other qualities.
- "How Each Review Works" in [[Agent Instructions Audit]] points the cut test at the files a step uses, so the lines a review adds, and any file it creates, never get it.
- The writer anchors on the text it's moving or the decision it's carrying out, and can't easily see past its own draft.

**The fix:** Sarah decided 2026-10-14 to add a reviewer subagent that preloads `writing-standard` and reviews each draft in a fresh context before she sees it, including any file the session creates. Sessions still read the standard before drafting. What Makes a Good Doc rejected "a reviewer subagent on its own"; this one works alongside reading the standard first, and the repeated corrections since are why it's back.

**What it reaches:** at least `/tooling` step 3 and "How Each Review Works".

**Decisions that apply:**

![[Agent Instructions Audit#^decision-17]]

# Questions
