---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/close` step, which archives or deletes the finished note and updates the notes around it.

**Full review here,** as the first story that uses them: `/close`.

**Re-checks for this step:** the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); `deleting-a-note` (reviewed in Shared Note Procedures Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- "A few rules" (:19-25) restates each step's reason; each reason moves into its step, once (about 250 words).
- :29-30 restate AGENTS.md's approval and open-choice rules; :44 and :114 describe what each script prints; "full step … not a summary" four times (:36, :39, :64, :103); :103 repeats AGENTS.md's route-or-drop line.
- The dropped-close branch (:84-86) could move to a supporting file; the saving is small.
- :82 injects Note Conventions' 969-word Next Step table on every run; `/close` reads it only in the idea-note case at `:78`.
- The "Save its report to `.scratch/<note name> - …`" line repeats AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- Split check: no split.

# Questions
