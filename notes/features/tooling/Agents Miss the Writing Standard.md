---
type: workflow
confirmed: 2026-10-15
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

Agents that draft or review agent instructions keep producing text that misses the `writing-standard` skill, and Sarah has to point it out in session after session.

Sarah, 2026-10-15: "It's a repeated issue across multiple sessions, as well as the writing-reviewer. (In fact, the writing-reviewer was the _first_ attempt to solve this problem!) It's not _just_ that it's too wordy, it's also that the instructions are too prescriptive, and overall consistently preserve patterns that don't conform to the standards."

Sarah, 2026-10-15: "agents are consistently being too prescriptive and too detailed even when I've repeatedly given instructions to avoid that."

**Earlier attempts, none of which stopped it:**
- The `writing-reviewer` agent (Writing Standard Reviewer).
- `writing-standard`'s check of each exact detail, and the rule that a change gets only the length its point earns (Overly Prescriptive Instructions).
- Sarah's line in step 1 of [[Agent Instructions Audit#How Each Review Works]], added after the same problem in Feature Check-Drift Review.

**Seen in Feature Plan-Steps Review, 2026-10-15:**
- The first draft of the new `writing-implementation-steps` skill passed a `writing-reviewer` review and re-check, and Sarah still found it wordy, with lines that didn't earn their place. A fresh reviewer cut much more once its prompt made "does every line earn its place" the main question.
- The next `/plan-steps` draft kept the old file's per-type readiness list and a spelled-out drift check until Sarah asked whether it needed to be so prescriptive. A `^status` check and one judgment replaced both.

# Questions
