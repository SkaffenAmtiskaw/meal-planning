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

**Re-checks for this step:** `/implement` (with `re-planning.md`), the `building-code` skill (with `bugs.md`, `test-only-checks.md` and `design-comparison.md`), the `protect-config.sh` hook (reviewed in Feature Implement Review); `running-the-app` (reviewed in Feature Plan-Steps Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-8]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 8:** infra moves out of `/implement` into a new `/infra-build` command, with its own `protect-config.sh` hook. The infra path, as of 2026-10-18: `implement/SKILL.md:20,26,30,37,41,52,57,67`, `implement/re-planning.md:3-6,12` and `building-code/SKILL.md:38`.
- `/infra-design:3,17,81,101,117,125` name `/implement`, and change to `/infra-build`. Infra notes' `^status` lines change too.
- `implement/re-planning.md:5-6` restates AGENTS.md's "Her decisions can change" in other words; it points to AGENTS.md.
- Wording difference at `implement/re-planning.md:5-6`: change "choices the user merely signed off on", and only for infra. Where the rule is kept: AGENTS.md "Her decisions can change" covers every type, with "only approved" and "her call". Exception or drift?

# Questions
