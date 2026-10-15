---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Goal's `/roadmap` step, which shapes the goal and ranks it.

**Full review here,** as the first story that uses them: `/roadmap`, `notes/templates/Goal.md`.

**Re-checks for this step:** `/kickoff` (reviewed in [[Sweep Kickoff Review]]); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-9]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- The Why section (:16-27, 297 words) is mostly plain repeats of "How this file works", which step 1 reads next; it keeps :23's rule on judging dependencies.
- :35 reads the Goal and Standing Goal templates on every run; each is read at the step that drafts from it.
- :64 points to "How this file works" for the one-goal rule, which lives in `roadmap-placement:12`.
- :79 says standing goals are never ranked, for the third time (:19, :103); :96 packs three rules into a paragraph and repeats the 🚨/📌 rule; :117 and :51 repeat AGENTS.md and the Roadmap; :38-39 and :99 repeat themselves.
- "One at a time" at :55, :67, :92, :96 and :108 repeats AGENTS.md's question rule.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- Split check: no split. Its modes share step 3.
- **`Goal.md`:** :5 repeats Note Conventions and `/roadmap`. The Done When item format (`Goal.md:11`) moves to `/roadmap` step 2 (decision 9).
- Wording difference at `roadmap:56-61`: "In" outcomes include a line in Planning. Where the rule is kept: `roadmap-placement:15` says "A line already under a goal's heading, or in Now or Next, stays where it is". Exception or drift?

# Questions
