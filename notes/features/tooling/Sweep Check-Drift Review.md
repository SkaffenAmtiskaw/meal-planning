---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Sweep's `/check-drift` step, which checks the remaining work against the code, conventions, other notes and the user's comments.

**Re-checks for this step:** `/check-drift`, the `code-drift-checker` agent (reviewed in Feature Check-Drift Review); the `note-drift-checker` agent (reviewed in Feature Assess Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- The sweep branch (`check-drift:69-75` and the sweep half of `:87`, about 280 words) moves to a supporting file.

# Questions
