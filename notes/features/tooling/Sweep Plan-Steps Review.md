---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Sweep's `/plan-steps` step, which writes the implementation steps.

**Re-checks for this step:** `/plan-steps`, `writing-implementation-steps` (with `test-only-checks.md`), `running-the-app` (with `which-user.md`), the `plan-checker` agent (reviewed in Feature Plan-Steps Review); the `hidden-story-checker` agent (reviewed in Bug Plan-Steps Review); the `split-checker` agent, `splitting-a-story` (reviewed in Feature Assess Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
- `/plan-steps` sends a sweep to `hidden-story-checker`, and a sweep is built from separate items that could each ship alone, so the checker may report most of them as hidden stories. The test's condition 4 keeps a cleanup's one job together, but a sweep's items aren't one job. Not tested on a sweep yet. Found by `writing-reviewer` in Cleanup Plan-Steps Review, 2026-11-01.

This review also re-checks the files above for this step.

# Questions
