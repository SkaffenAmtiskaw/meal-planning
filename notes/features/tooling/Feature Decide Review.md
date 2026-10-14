---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **A new shared skill, from Feature Shape Review on 2026-10-14:** `/decide`'s per-decision procedure (Ask first through Record) moved, as written, into the new `settling-a-decision` shared-rule skill, which `/decide`'s step 3 and `/shape`'s step 3 now use. Its full review is this note's, as Sarah decided, along with `/decide`'s opening line, step 3 and step 4's new `blocked-by` bullet, which that session changed. Shared Note Procedures Review then folded `answer-confidence` into it and cut it down on 2026-10-14, so this review starts from the skill as it now stands.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/decide` step, which works through the note's open decisions with the user.

**Full review here,** as the first story that uses them: `/decide`, the `decision-researcher` agent.

**Re-checks for this step:** `roadmap-placement` (reviewed in Shared Note Procedures Review); the `scope-router` agent (reviewed in [[Scope-Router Review]]); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `notes/templates/Idea.md` (reviewed in [[Feature Template Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- Check and Research (:58-66) spell out nearly the same message to `decision-researcher` twice; one send, with what differs.
- :29 keeps "a list of effects on other notes", which is AGENTS.md's out-of-scope list under another name, and :129's "the running list" doesn't say which; it becomes the out-of-scope list, plus a list of new child stories for a hub.
- :34-36 is a one-item list followed by a sentence; it becomes prose.
- :102 restates and points to the `ready` → `spec` rule; :79 restates the approval rule.
- Step 3's heading repeats AGENTS.md's one-question-at-a-time rule.
- The "Save its report to `.scratch/<note name> - …`" lines repeat AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own. Its link-the-report lines are at :61, :67 and :74.
- :139 injects Note Conventions' 969-word Next Step table on every run; `/decide` reads it only at the steps that use it.
- `/decide` and `/plan-steps` don't follow `retyping-a-note`'s "After a retype" (`infra-design:28`, `investigate:30`, `assess:24` and `architect:29` do), though a retype can leave a note at "Next: /decide" or send it to `/plan-steps`, so the retype line can sit in the Inbox past the next skill and approved content can be redrafted. Both follow it.
- Its description is imperative, where `writing-standard`'s `instructions.md:23` asks for the third person; it becomes what and when, in about 25 words.
- Split check: no split. Note type changes only small one-place branches.
- **`decision-researcher`:** :23 restates "Her decisions can change"; :70-71 echo the caller's input back; its opener (:10) says it only suggests, which its tools already show; :30, :31 and :51 point to AGENTS.md sections that load anyway; its description ends "Read-only." and runs 44–52 words.
- Wording difference at `decision-researcher:35` and `decide:72`: "stronger than AGENTS.md 'Recommendations'": always recommend unless it's preference, or say it "can't be decided yet". Where the rule is kept: the rule kept elsewhere is AGENTS.md "Recommendations". Exception or drift?

# Questions
