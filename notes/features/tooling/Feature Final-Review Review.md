---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/final-review` step, which reviews how the code fits together across the whole story.

**Full review here,** as the first story that uses them: `/final-review`, the `leftovers-checker` agent, the `target-designer` agent.

**Re-checks for this step:** the `code-critic` agent (reviewed in [[Feature Assess Review]]); the `protect-config.sh` hook, `/implement` (with `first-pass.md`, `bugs.md` and `cleanup.md`) (reviewed in [[Feature Implement Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-4]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-8]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 4:** today nothing in `/final-review` or its three agents checks the Purpose or names best practice (grep for "Purpose" and "best practice"); `:57` makes every difference from the approved Suggested Approach a finding, and `:59` checks other types only against their own Design, Conventions or Decided lines; nothing reads the "Sarah's call" marks, and `target-designer:15` can't see them.
- :17-24 repeat `leftovers-checker:27-31`; it becomes one sentence: the user reviewed each step's diff, so this review looks across steps.
- :61 uses "fix here / route / skip" where AGENTS.md says "pull in / route / drop", and sits in step 3 while governing steps 4–5.
- :96-97 restate the approval rule; :71 puts its condition after; :89 has no reason (fixes are ordered by dependency); :87 repeats AGENTS.md's "Drop it".
- **Building a step:** `final-review:85,94,96-97` points into `implement/SKILL.md`'s "Settle the open choices", "Write the tests first", "Run the checks" and "Handle her feedback", and into `cleanup.md` and `bugs.md`, so a fix loads all of `/implement`. These become shared-rule skills (decision 8). `bugs.md:4` already says any skill can follow it.
- **`code-critic`'s callers:** it's written for `/assess` reviewing code before it's built (`code-critic.md:11,17`). `/final-review` calls it on built code and `/investigate` with a fix's job; it says how its checks change for each.
- The "Save its report to `.scratch/<note name> - …`" line repeats AGENTS.md's "Subagent reports and scratch files"; only the file name is the skill's own.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- **`leftovers-checker`:** the description lists all five categories and runs 44–52 words; trim to about 20 words. :24's read-only Bash line differs from the two drift checkers'.
- **`target-designer`:** :18-19 point to sections of AGENTS.md that load anyway; "What not to read" stays.
- Wording difference at `final-review:108`: "Write nothing else to the note". Where the rule is kept: AGENTS.md "Where It Stands" says whoever moves a story forward updates the status line and the summary. Exception or drift?

Moved from Agent Workflow Changes on 2026-10-06:
- [Sarah] - `final-review` asks for approval to make a change and then subsequently asks for approval of the exact text - surely each item doesn't need two separate approvals
- **`vault-lint.sh` fails every `/final-review` of a story another note waits on** - `scripts/vault-lint.sh:153` reports a `blocked-by` entry for a story whose status is `done` or `dropped`. `/final-review` step 8 sets a story to `done`, but `/close`, in a later session, is what removes it from other notes' `blocked-by` and sets their next step. So the lint fails at the end of every such `/final-review`, and AGENTS.md's "Before you finish" rule pushes the session to do `/close`'s unblocking early. Low priority (Sarah, 2026-10-06). Decide which side changes: the lint stops flagging `done` until the story is closed, or `/final-review` says to leave that finding for `/close`. Found 2026-10-06 at the end of `/final-review` on What Makes a Good Doc.

# Questions
