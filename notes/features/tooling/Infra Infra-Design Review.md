---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Infra's `/infra-design` step, which writes the Goals, Design, Conventions, Setup Outside the Repo and Build Order.

**Full review here,** as the first story that uses them: `/infra-design`.

**Re-checks for this step:** `rule-placement` (reviewed in Writing Standard Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `retyping-a-note` (reviewed in [[Feature Assess Review]]); `settling-a-decision`, the `decision-researcher` agent (reviewed in Feature Decide Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-10]]

![[Agent Instructions Audit#^decision-11]]

![[Agent Instructions Audit#^decision-12]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **A pass for repetitive or unnecessary work.** Sarah decided 2026-10-05 that infra stories skip `/plan-steps` and that `/infra-design` writes a Build Order into the Design instead, which makes its sessions longer. The pass goes through `.claude/skills/infra-design/SKILL.md` and the agents it calls, including the Build Order step, and cuts work that repeats itself or isn't needed.
- **Decision 10:** a revision reworks only what its trigger names. Today a revision re-approves every section; Branching and Releases' revision would take about 55 approvals.
- **Decision 11:** a Build Order's Implementer check says only what the Design doesn't, with Piece block IDs and links.
- **Decision 12:** a Design's Flow covers only what no single Piece holds.
- `/infra-design` makes a Piece whose exact form Sarah's answer already settled without asking for approval, as AGENTS.md's "Approval covers the edits" describes (`:63`).
- `/infra-design` stops saving the Build Order draft to `.scratch` (`:107`). It was copied from `/plan-steps`, where checkers read the file, and nothing reads it here.
- The description (:3) is imperative and doesn't say when to use it.
- "Step" means both a section of the skill and a Build Order step (:36, :45, :81, :103); the skill's sections are referred to by name.
- :51 opens with Design-section questions before "The design has:", and misses the case of a question the decisions don't settle (it's a Gap).
- :47, :63 and :68 restate the approval rule; they keep the unit of approval and point to AGENTS.md.
- :66 has no reason; :81's sentence on why they're called steps, :115 ("For an infra story …") and step 9 (folds into step 10) don't earn their place.
- :100 packs four rules into one bullet; it becomes sub-bullets, together with the Agent Workflow Changes item below, which changes the same rule.
- Two terms each: "Setup Outside the Repo" and "Setup", "Pieces" and "pieces", "the implementer" and "`/implement`".
- :73's "one at a time" repeats AGENTS.md's question rule.
- The "Save its report to `.scratch/<note name> - …`" line repeats AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- Split check: no split. Its only mode is new or revision.
- Wording difference at `infra-design:107,110`: approve the Build Order from an outline plus a link to the draft. Where the rule is kept: AGENTS.md "Drafts go in the chat". Exception or drift?
- Wording difference at `infra-design:78`: always show the change and wait for approval. Where the rule is kept: AGENTS.md "Approval covers the edits" says a change whose form is settled is made and listed. Exception or drift?

Moved from Agent Workflow Changes on 2026-10-06:
- **Build Order checks keep Sarah's part small** - `/infra-design` step 7's "Sarah checks" rule (`.claude/skills/infra-design/SKILL.md`) says when a step has Sarah checks and that each one is usable as written, but not that the agent kicks off everything it can, such as pushing a throwaway branch, opening a PR or running a skill locally, so that her part is only verifying the results, plus what needs her access or her eyes. Sarah: "I want to minimize the amount of steps I manually have to do. Ideally the agent kicks off what it can and then I verify the results." Found 2026-10-06 during `/infra-design` on [[Vercel Deploy Errors]], when choosing how to prove its production Goal.

# Questions
