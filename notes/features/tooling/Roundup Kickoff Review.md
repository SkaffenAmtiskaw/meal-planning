---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Roundup's `/kickoff` step, which kicks off the collecting note into a dated copy.

**Full review here,** as the first story that uses them: `notes/templates/Roundup.md`.

**Re-checks for this step:** `/kickoff` (reviewed in [[Sweep Kickoff Review]]); `roadmap-placement` (reviewed in Shared Note Procedures Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **`Roundup.md`:** :21 (body text) copies the general sweep-or-roundup rule into every new note; each note keeps only its own topic rule, and its lifecycle sentences go.
- **Style Decisions** carries the general sweep-or-roundup rule in What Belongs Here; it keeps only its own topic rule.
- Wording difference at the Out of Scope comment in `Roundup.md:30`: "work that belongs to another story, sweep or roundup, with a link". Where the rule is kept: AGENTS.md "Out-of-scope work" routes items to a note, a sweep, a roundup or a Roadmap line, or drops them. Exception or drift?

# Questions
