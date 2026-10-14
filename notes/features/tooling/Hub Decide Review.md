---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Hub's `/decide` step, which works through the note's open decisions with the user.

**Re-checks for this step:** `/decide`, `settling-a-decision`, the `decision-researcher` agent (reviewed in [[Feature Decide Review]]); `roadmap-placement` (reviewed in Shared Note Procedures Review); the `scope-router` agent (reviewed in [[Scope-Router Review]]); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `notes/templates/Idea.md` (reviewed in [[Feature Template Review]]); `notes/templates/Hub.md` (reviewed in [[Hub Shape Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-14]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 14:** when `/decide` creates a child, it embeds `![[<hub>#Purpose]]` in the child's Purpose.
- `/decide` writes a hub's Coverage (`decide:102`) and takes its format from the Hub template (decision 9).

# Questions
