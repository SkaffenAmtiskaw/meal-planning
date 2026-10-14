---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/assess` step, which writes the Suggested Approach from the design.

**Full review here,** as the first story that uses them: `/assess`, `retyping-a-note`, the `split-checker` agent, the `note-drift-checker` agent, the `code-critic` agent.

**Re-checks for this step:** `answer-confidence` (reviewed in [[Shared Note Procedures Review]]); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); the `decision-researcher` agent (reviewed in [[Feature Decide Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- :48-49 repeat AGENTS.md's Check Drift rules; :24 doesn't earn its place; :94's "explicit" is emphasis.
- **The wrong-type check:** `assess:27`, `investigate:32`, `architect:32` and `infra-design:31` restate AGENTS.md's "A note with the wrong type". Only "if the type fits, name the skill it needs and stop" is new, and it joins that rule.
- **Splitting a story:** `assess:111-120` and `plan-steps:168-176`. Items 1–4 are word for word the same, and only the child's handoff and the stop command differ.
- **The Single Concern test as a procedure:** `target-designer:21-27` is a near copy of `assess:67-74` (Kind, a Job in one sentence without "and", server or client).
- :75 points to an AGENTS.md section that loads anyway.
- The "Save its report to `.scratch/<note name> - …`" lines repeat AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own. Its link-the-report lines are at :64 and :88.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- :34 and :99 say to replace a template comment, which AGENTS.md:88 already covers.
- Its description is imperative, where `writing-standard`'s `instructions.md:23` asks for the third person; it becomes what and when, in about 25 words.
- Split check: no split.
- **`retyping-a-note`:** :8-10 open with background (about 90 words to cut); :24 restates "Drafts go in the chat"; :26 and AGENTS.md:75 both say to stop; :32 restates the Inbox rule and keeps only its timing.
- **`split-checker`:** :42 and :62 repeat the Hub template and the Roadmap; :34 repeats test 2; its opener (:8) says it only suggests, which its tools already show; its description ends "Read-only." and runs 44–52 words.
- **`note-drift-checker`:** :36-45 hold the same Kind and Meaning sorting as `/check-drift` step 4; `/assess:47-50` relies on its labels, so a short definition stays (or `/assess` sorts instead; ask the user). :56's "Found by" never varies; :15 names its caller; :22 is background; :24 puts its exception after; its opener (:8) says it only suggests. Its "Found by", `code-drift-checker`'s "Verification" and `/check-drift`'s "how it was found" are one thing.
- **`code-critic`:** :22-29 give three examples where two do.
- Wording difference at `retyping-a-note:31`: raise a carried piece that new information makes look wrong, and let her decide. Where the rule is kept: AGENTS.md "Her decisions can change" says a choice only approved is changed and reported. Exception or drift?
- Wording difference at `split-checker:51-52`: a child's Where It Stands holds just its next step, and Purpose says it was split from the hub. Where the rule is kept: AGENTS.md says the status line plus a summary, and the split-from line goes in the summary. Exception or drift?
- Wording difference at `code-critic:16`: list every job; more than one is a finding. Where the rule is kept: `project_conventions.md` Single Concern says two jobs are separate if each can be described without the other, and `assess` and `target-designer` use one sentence without "and". Exception or drift?

# Questions
