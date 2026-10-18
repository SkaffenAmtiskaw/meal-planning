---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Sweep's `/final-review` step, which reviews how the code fits together across the whole story.

**Re-checks for this step:** `/final-review`, the `leftovers-checker` agent, the `target-designer` agent (reviewed in [[Feature Final-Review Review]]); the `code-critic` agent (reviewed in Feature Assess Review); the `protect-config.sh` hook, the `building-code` skill (with `bugs.md`, `test-only-checks.md` and `design-comparison.md`) (reviewed in Feature Implement Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
None known yet. This review re-checks the files above for this step.

# Questions
