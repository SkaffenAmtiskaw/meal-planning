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

**Step:** Sweep's `/check-drift` step, which checks the remaining work against the code, conventions, other notes and the user's comments.

**Re-checks for this step:** `/check-drift`, the `code-drift-checker` agent (reviewed in Feature Check-Drift Review); the `note-drift-checker` agent (reviewed in Feature Assess Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- The sweep branch (`check-drift:69-75` and the sweep half of `:87`, about 280 words) moves to a supporting file.
- The pattern branch in `/check-drift`'s step 4 moves to a supporting file too, since only pattern runs use it (from Infra Check-Drift Review, 2026-11-01).
- `/check-drift` step 1 (:22) says what a `spec` note's approach is by listing each type's sections ("such as a feature's design, behaviors and Suggested Approach, a cleanup's Current State and **Decided** lines, or a sweep's unchecked Items"), so a new type would need another clause. This breaks the Conventions entry "Give general guidance on finding a section, not a list of each type's headers". Found in Cleanup Final-Review Review, 2026-11-02, which reworded `/final-review`'s definition that way.

# Questions
