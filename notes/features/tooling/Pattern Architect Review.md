---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **A pattern's convention, from Feature Shape Review on 2026-10-14:** Sarah decided that `/shape` never treats choosing a pattern's convention as a blocking decision, so a pattern story can reach `/architect` with no convention chosen. Today `/architect` stops when the convention isn't chosen (its "A chosen convention" check, `architect:36`) and sends the note to `/decide`. Sarah wants this review either to make `/architect` handle choosing a pattern's convention itself, or to move the issue to the Inbox of the note it belongs in.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Pattern's `/architect` step, which writes the Rules, Enforcement and an audited Migration Checklist.

**Full review here,** as the first story that uses them: `/architect`, the `rule-auditor` agent.

**Re-checks for this step:** the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `retyping-a-note` (reviewed in [[Feature Assess Review]]); `settling-a-decision`, the `decision-researcher` agent (reviewed in [[Feature Decide Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-10]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- :18-19 are repeated at :49 and :84; :25-26 repeat :42; :86 restates AGENTS.md's "Work the story needs"; :124 trims to the next command.
- **Where a pattern's Rules land:** `architect:51` ("usually a section of `docs/project_conventions.md`") stays in `/architect`. `rule-placement` would always answer "a doc in `docs/`" for a pattern, and the real choice, which doc and section, is one only `/architect` makes. Its "usually … `project_conventions.md`" anchors a choice that's wrong for some patterns, such as Unit Testing - New Centralized Mocks, whose Rules belong in `unit_tests.md`, so it becomes "the doc and section in `docs/` it lands in". Found by reading `architect:51,98` and `rule-placement`.
- `/architect` stops sending `rule-auditor` the Enforcement (`architect:81`, `rule-auditor:12`). The auditor lists every place, including ones a later lint rule would catch, since the migration fixes them first.
- **Readiness checks shared by `/infra-design` and `/architect`:** `infra-design:31,37,38` match `architect:31,33,34`.
- **Decision 10:** a revision reworks only what its trigger names; today a revision re-approves every section.
- :38 points to an AGENTS.md section that loads anyway; :63 says to replace a template comment, which AGENTS.md:88 already covers.
- The "Save its report to `.scratch/<note name> - …`" line repeats AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- Its description is imperative, where `writing-standard`'s `instructions.md:23` asks for the third person; it becomes what and when, in about 25 words.
- Split check: no split.
- **`rule-auditor`:** :15 (you don't get the story's list) is also at `architect:84`; it leaves the agent. :8's "Be thorough." goes, and its opener says it only suggests, which its tools already show. Its description ends "Read-only."

# Questions
