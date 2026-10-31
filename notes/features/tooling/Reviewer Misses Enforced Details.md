---
type: workflow
confirmed: 2026-10-31
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

When `writing-reviewer` and the agent drafting an instruction check its exact details, they ask whether something depends on the detail, but not whether the agent needs the line at all. In Bug Investigate Review (2026-10-31), the `/investigate` draft told the agent to write its reproducing unit test in `.scratch/`. The `notes-only-edits.sh` hook already blocks edits anywhere but `notes/` and `.scratch/`, so the agent didn't need the line. Fourteen `writing-reviewer` runs (two rounds, every pass, including "The rest", which covers `writing-standard/instructions.md`'s "Match Freedom to How Fragile the Task Is") didn't flag it, and one listed the `.scratch/` rule as needed. Sarah caught it: "I've cautioned against prescriptive instructions like writing a scratch file to agents. Unless there is a reason why it NEEDS to be a scratch file the instructions are too prescriptive." The line is fixed in `/investigate`.

What's left is a check that catches a detail kept exact because a hook, script or other rule already enforces it, in both the review and the drafting. Where it goes is open: `writing-standard/instructions.md` (the exact-details paragraph), the `writing-reviewer` pass that holds it, and whatever the drafting agents read.

Sarah decided 2026-10-31 that this goes ahead of the remaining reviews in Next, because every review after it drafts and reviews agent instructions.

# Questions
