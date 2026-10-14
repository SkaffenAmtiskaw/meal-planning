---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/check-drift` step, which checks the remaining work against the code, conventions, other notes and the user's comments.

**Full review here,** as the first story that uses them: `/check-drift`, the `code-drift-checker` agent.

**Re-checks for this step:** the `note-drift-checker` agent (reviewed in [[Feature Assess Review]]); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- The routing by type is written three times (:23, :113-126, :143); :23 also repeats :107.
- One rule (apply her changes; ask only where applying it is open) three times (:27-28, :51, :67); keep :51.
- :128 says to mention status changes in the summary, but step 7's summary has no slot for it; :60 has no reason; :23 puts its exception after; :113 refers to "the findings' meanings in step 4" without naming them.
- The "Save its report to `.scratch/<note name> - …`" line repeats AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own.
- "A hook blocks edits outside `notes/` and `.scratch/`" repeats the hook's own message; "Don't change code" stays.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- Its description is imperative, where `writing-standard`'s `instructions.md:23` asks for the third person; it becomes what and when, in about 25 words.
- Split check: no split.
- **`code-drift-checker`:** :37-48 define the same Kind and Meaning sorting as `/check-drift` step 4 in other words; the skill sorts, so it leaves the agent, with the report fields at :57-58. :10's read-only Bash line matches `note-drift-checker:10` and differs from `leftovers-checker:24`; make them identical. :30 ("the docs in `docs/` lag far behind the code") may be stale; ask the user. :48's "Verification" is the same thing as `note-drift-checker`'s "Found by". Its opener (:8) says it only suggests, which its tools already show; its description ends "Read-only."
- Wording difference at `check-drift:102`: recommend one option. Where the rule is kept: AGENTS.md "Recommendations" says to say so when it comes down to her preference. Exception or drift?

Moved from Agent Workflow Changes on 2026-10-06:
- **More scripts for deterministic checks** - three more checks in the skills could each be one script instead of several git commands read by hand: `story-range.sh` for `/final-review` step 2 (find the first ✅ Complete commit, propose the range, and list the changed code and test files split into those a step names and the rest), `sarah-comments.sh` for `/check-drift` step 2 (`git blame` the note, list the lines tagged `[Sarah]` or signed `- Sarah`, and mark each new or old against `confirmed`), and `commits-since.sh` for `/plan-steps` step 1 (read `confirmed` from the frontmatter and list the later commits touching `src/`, `test/` or `docs/`, with their files, plus uncommitted changes there). Sarah wants to see whether `vault-orphans.sh`, `note-refs.sh` and `vault-lint.sh` make sessions faster before building more. Found 2026-09-29 while going through the skills for deterministic checks during `/tooling` on Sarah's Sonnet question.

# Questions
