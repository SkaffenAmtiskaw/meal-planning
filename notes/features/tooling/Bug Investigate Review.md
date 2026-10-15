---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Bug's `/investigate` step, which reproduces the bug, finds the root cause and settles the fix.

**Full review here,** as the first story that uses them: `/investigate`, the `bug-reproducer` agent.

**Re-checks for this step:** the `notes-only-edits.sh` hook (reviewed in Feature Shape Review); the `code-critic` agent (reviewed in Feature Assess Review); the `decision-researcher` agent (reviewed in Feature Decide Review); `running-the-app` (reviewed in Feature Plan-Steps Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- Leftovers from before the skill existed: :37 and :119 (an entry that waited on this skill being built), :107 (an older `# Fix Options` section; none exist), :120 (its Roadmap example), :39 and :117 ("or under Where It Stands in an older note").
- "Don't tell `bug-reproducer` the theory" three times (:21, :53, :69); keep the reason and one instruction.
- The re-investigation rule is split between :34 and :116.
- :101 restates AGENTS.md's "Approval covers the edits".
- :74 points to an AGENTS.md section that loads anyway.
- The "Save its report to `.scratch/<note name> - …`" line repeats AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- **`bug-reproducer`:** :20 repeats what its tools already enforce; :19 and :21 merge; :11's reason is restated at `investigate:21`, which keeps only "don't send it a theory"; :27 and :29 put conditions after. :25 and :27 are deliberate exceptions and stay.
- Wording difference at `investigate:82,96`: recommend one option. Where the rule is kept: AGENTS.md "Recommendations" says to say so when it comes down to her preference. Exception or drift?
- Wording difference at `bug-reproducer:29`: set the screen size "with `resize_window`". Where the rule is kept: `running-the-app:21` says use the `mobile` preset, then set it back to `desktop`. Exception or drift?

# Questions
