---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **"Is it a story?" asks too often** - step 1's check asks Sarah whether to spin a task off into a story whenever one of its cases applies, even though she started the session with `/tooling` on purpose. Sarah's feedback 2026-11-01: it shouldn't ask every time whether she really meant it, and the check should be saved for when there's an actual problem. Found while running `/tooling` on the design and exploration workflow change, where "needs several decisions" set it off.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Workflow's `/tooling` step, which settles a change to the agent workflow or tooling with the user and makes it everywhere it reaches.

**Full review here,** as the first story that uses them: `/tooling`, `notes/templates/Workflow.md`.

**Re-checks for this step:** `roadmap-placement`, `deleting-a-note` (reviewed in Shared Note Procedures Review); `writing-standard`, `rule-placement`, `keeping-sessions-lean` (reviewed in Writing Standard Review); the `writing-reviewer` agent (reviewed in Writing Standard Reviewer); the `scope-router` agent and `filing-work` (reviewed in Scope-Router Review); `notes/templates/Idea.md` (reviewed in Feature Template Review); the `bug-reproducer` agent (reviewed in Bug Investigate Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-13]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 13:** a blank-type note in `notes/features/tooling/` is story work for `/shape`; the case that calls it a pre-workflow note goes.
- The spin-off branch (:39-50, about 415 words) moves to a supporting file; its restatements of `roadmap-placement` (:47) and the Roadmap's Ideas and Markers (:48, :49) become pointers.
- The Why section (:10-15, 232 words) re-describes workflow and collecting notes; it keeps only the reason a tooling change skips the lifecycle.
- :18 repeats the description and :35; :53-55 (step 2's opening) mostly repeats AGENTS.md; :29 restates the building-goal check; :93 describes the script's output.
- :45's "one at a time" repeats AGENTS.md's question rule; :31 ("or AGENTS.md") points to AGENTS.md, which loads anyway.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- Split check: no split.
- **`Workflow.md`:** :5 repeats Note Conventions and `/roadmap`; it keeps only its sentence on a collecting workflow note's format.
- Wording difference at `tooling:62-64`: small, clear edits are written without showing them first. Where the rule is kept: AGENTS.md "Approval covers the edits" says new wording is shown first. Exception or drift?
- Wording difference at `tooling:15`: another approach is suggested "once", with its reason. Where the rule is kept: AGENTS.md "Open choices are hers" and "Recommendations". Exception or drift?
- Wording difference at `Workflow.md:9`: no Inbox and no summary under the status line. Where the rule is kept: AGENTS.md says every story and hub has both. Exception or drift?

# Questions
