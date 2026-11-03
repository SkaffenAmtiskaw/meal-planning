---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- From Sweep Kickoff Review (`/tooling`, 2026-11-02): how sweeps work changed. Sarah retired `/kickoff`, so `/roadmap` freezes a dated copy of every collecting note when a goal starts building, as `.claude/skills/roadmap/freezing-a-copy.md` describes. A sweep is never kicked off by hand or worked in place, and the general sweep rule moved from the Sweep template and the collecting sweeps to `filing-work`. Assess this review's skill in light of that. Sarah asked that if part of this note no longer makes sense because of the change, it gets fixed.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Sweep's `/implement` step, which builds the plan one step at a time.

**Re-checks for this step:** `/implement`, the `building-code` skill (with `bugs.md`, `sending-back.md`, `test-only-checks.md` and `design-comparison.md`), the `protect-config.sh` hook (reviewed in Feature Implement Review); `running-the-app` (reviewed in Feature Plan-Steps Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-8]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
None known yet. This review re-checks the files above for this step.

# Questions
- Decision 8's open part, for sweep stories: does a sweep story stay in `/implement`, or does its step need a command of its own? Sarah decided 2026-10-15 that each type is judged in its own Implement review. Record the answer under decision 8 in [[Agent Instructions Audit]].
