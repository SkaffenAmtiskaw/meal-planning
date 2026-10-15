---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Infra's `/implement` step, which builds the Build Order one step at a time (today `/implement`'s infra path).

**Full review here,** as the first story that uses them: `/infra-build` (new, decision 8).

**Re-checks for this step:** `/implement` (with `first-pass.md`, `bugs.md` and `cleanup.md`), the `protect-config.sh` hook (reviewed in [[Feature Implement Review]]); `running-the-app` (reviewed in Feature Plan-Steps Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-8]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 8:** infra moves out of `/implement` into a new `/infra-build` command, with its own `protect-config.sh` hook. The infra path in `/implement`: `implement/SKILL.md:17-19,38-39,47,73,105,108,119-121,124-125,135-136,150,165-168` and `first-pass.md:10,15,35`.
- `/infra-design:3,17,81,101,117,125` name `/implement`, and change to `/infra-build`. Infra notes' `^status` lines change too.
- `implement:165-166` restates AGENTS.md's "Her decisions can change" in other words; it points to AGENTS.md.
- Wording difference at `implement:165-166`: change "choices Sarah merely signed off on, not ones she made herself or cares about", and only for infra. Where the rule is kept: AGENTS.md "Her decisions can change" covers every type, with "only approved" and "her call". Exception or drift?

# Questions
