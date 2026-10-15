---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Bug's `/plan-steps` step, which writes the implementation steps.

**Re-checks for this step:** `/plan-steps`, `running-the-app`, the `plan-checker` agent (reviewed in [[Feature Plan-Steps Review]]); the `split-checker` agent, `splitting-a-story` (reviewed in Feature Assess Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- `plan-steps:105` lists Coverage sources by type without cleanup's Current State, and calls Symptoms "a pattern's" though bugs have them too; `:132` handles a new piece only for a feature. Name every type's source, or state it generally.
- `plan-checker:18` lists the approach for feature, pattern, sweep and roundup but not bug (Fix and Root Cause) or cleanup (Current State), which `plan-steps:28-34` has, so bug and cleanup plans get no checks.

# Questions
