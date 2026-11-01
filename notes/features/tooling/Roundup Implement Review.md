---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Roundup's `/implement` step, which builds the plan one step at a time.

**Re-checks for this step:** `/implement`, the `building-code` skill (with `bugs.md`, `sending-back.md`, `test-only-checks.md` and `design-comparison.md`), the `protect-config.sh` hook (reviewed in Feature Implement Review); `running-the-app` (reviewed in Feature Plan-Steps Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-8]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
None known yet. This review re-checks the files above for this step.

# Questions
- Decision 8's open part, for roundup stories: does a roundup story stay in `/implement`, or does its step need a command of its own? Sarah decided 2026-10-15 that each type is judged in its own Implement review. Record the answer under decision 8 in [[Agent Instructions Audit]].
