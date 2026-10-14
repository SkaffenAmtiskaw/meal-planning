---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Cleanup's `/plan-steps` step, which writes the implementation steps.

**Re-checks for this step:** `/plan-steps`, `running-the-app`, the `plan-checker` agent (reviewed in [[Feature Plan-Steps Review]]); the `split-checker` agent (reviewed in [[Feature Assess Review]]); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
None known yet. This review re-checks the files above for this step.

# Questions
- If [[Cleanup Shape Review]] didn't settle it: is `/plan-steps` the right skill for a `cleanup`? For [[Agent Instructions Audit]], an audit of agent instructions typed `cleanup`, Sarah said on 2026-10-06 that `/plan-steps` was a bad fit: its checks assume a running app, and it led to a plan of single-problem steps. Either `cleanup` was the wrong type, or `/plan-steps` isn't the right skill for it.
