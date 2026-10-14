---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Bug's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `notes/templates/Bug.md`.

**Re-checks for this step:** `/shape`, the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `answer-confidence`, `roadmap-placement` (reviewed in [[Shared Note Procedures Review]]); the `scope-router` agent (reviewed in [[Scope-Router Review]]); `notes/templates/Idea.md` (reviewed in [[Feature Template Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- `Bug.md:27` (create a Pattern note) contradicts `investigate:71` (add it to the out-of-scope list).
- `Bug.md:36` sets status, repeating the skills and Note Conventions.

# Questions
