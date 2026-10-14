---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Infra's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `notes/templates/Infra.md`.

**Re-checks for this step:** `/shape`, the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `settling-a-decision` (reviewed in [[Feature Decide Review]]); `roadmap-placement`, `deleting-a-note` (reviewed in Shared Note Procedures Review); the `scope-router` agent (reviewed in [[Scope-Router Review]]); `notes/templates/Idea.md` (reviewed in [[Feature Template Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- `Infra.md:28` sets status and `:18` says to use another template, repeating the skills and Note Conventions.
- Wording difference at the Out of Scope comment in `Infra.md:37`: "each item should also be on the Roadmap". Where the rule is kept: AGENTS.md "Out-of-scope work" routes items to a note, a sweep, a roundup or a Roadmap line, or drops them. Exception or drift?

# Questions
