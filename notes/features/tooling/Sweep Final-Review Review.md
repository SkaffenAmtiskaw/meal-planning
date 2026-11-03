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

**Step:** Sweep's `/final-review` step, which reviews how the code fits together across the whole story.

**Re-checks for this step:** `/final-review`, the `leftovers-checker` agent, the `target-designer` agent (reviewed in Feature Final-Review Review); the `code-critic` agent (reviewed in Feature Assess Review); the `protect-config.sh` hook, the `building-code` skill (with `bugs.md`, `test-only-checks.md` and `design-comparison.md`) (reviewed in Feature Implement Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
None known yet. This review re-checks the files above for this step.

# Questions
