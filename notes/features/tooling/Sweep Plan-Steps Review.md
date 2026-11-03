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
- `/plan-steps` step 2 (:22) says what a note's approach is by listing each type's sections ("such as a feature's Suggested Approach, a bug's Fix, a cleanup's Current State and **Decided** lines or a sweep's remaining Items"), and `hidden-story-checker` (:13) does the same with "such as a feature's Suggested Approach or a bug's Fix". A new type would need another clause on each line. The two lists have already drifted apart. This breaks the Conventions entry "Give general guidance on finding a section, not a list of each type's headers". Found in Cleanup Final-Review Review, 2026-11-02.

This review also re-checks the files above for this step.

# Questions
