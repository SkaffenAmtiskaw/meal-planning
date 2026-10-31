---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- In `/investigate`'s cleanup path, step 3a says "If the scan shows the thing is already gone". Sarah read "the thing" as the bug that step 2 reproduces, since the two paths sit one after the other in the file. It means what the cleanup note sets out to remove or tidy.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Cleanup's `/investigate` step, which scans the code in scope, writes Current State and settles the cleanup's decisions (today `/investigate`'s cleanup path).

**Full review here,** as the first story that uses them: `/audit` (new, decision 7).

**Re-checks for this step:** `/investigate` (reviewed in Bug Investigate Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-7]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 7:** `/investigate` keeps bug notes, and a new `/audit` command takes a cleanup note to `spec`. Note Conventions' Next Step table and cleanup notes whose `^status` says `/investigate` name `/audit`.
- `/investigate` has the user approve all of Current State before it's written (AGENTS.md's "Approval covers the edits", since a scan's findings are wording she hasn't seen): for Agent Instructions Audit that was a 7,000-word draft, which Sarah said was too much to review, so the findings went in unreviewed. `/audit` writes the scan's findings without approval, and keeps approval for decisions and for sections that change the plan.

# Questions
