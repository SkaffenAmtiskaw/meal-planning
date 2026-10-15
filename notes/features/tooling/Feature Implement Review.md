---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/implement` step, which builds the plan one step at a time.

**Full review here,** as the first story that uses them: `/implement` (with `first-pass.md`, `bugs.md` and `cleanup.md`), the `protect-config.sh` hook.

**Re-checks for this step:** `running-the-app` (reviewed in [[Feature Plan-Steps Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-8]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- "List every choice with its source" is said four times (:26, :53, :64, :111); keep :53 and :111.
- :62 restates AGENTS.md's "What to ask about" (plumbing).
- :141-143: both bullets open with the same sentence and restate the approval rule.
- :97's hook sentence; :97-99 and `cleanup.md:7` run the checks twice, so cleanup runs first and the checks once; step 3 (:81-82) is two pointers and folds into step 4; :33-35 keeps only its images clause.
- `first-pass.md:18` repeats the sentence before it; `:28`'s command parenthetical repeats the step and AGENTS.md's Commands; `:20`'s open-choice rule is also at `SKILL.md:79,132` and `bugs.md:14`.
- `bugs.md:4` is a placement note, not an instruction.
- :76 writes open choices to `.scratch` with no reader and no reason.
- :31 restates the building-goal check word for word from `tooling:29`, which restates the Roadmap.
- :43 points to an AGENTS.md section that loads anyway; :117's "one at a time" repeats AGENTS.md's question rule.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- **The `protect-config.sh` hook:** its header names `/implement`; it drops the name and says what the hook does.
- Wording difference at `implement:67`: ask about one choice at a time, "even when several belong to the same function or component". Where the rule is kept: AGENTS.md says one question at a time. Exception or drift?
- Wording difference at `implement/bugs.md:7`: a pure logic bug can be diagnosed from the code. Where the rule is kept: `/investigate`'s rule, and the `reproduce-bugs-before-diagnosing` memory, say diagnosing from code needs the user's sign-off. Exception or drift?
- Wording difference at `implement/cleanup.md:5`: count only factory bodies that are "word-for-word the same" (a codebase rule in an agent file). Where the rule is kept: `docs/unit_tests.md` "Creating Centralized Mocks" says "the same factory body". Exception or drift?

Moved from Agent Workflow Changes on 2026-10-06:
- **A change that affects another story gets buried in the summary** - AGENTS.md "Editing notes", the "Your change affects another story's remaining work" bullet, tells a session to leave the other note alone and tell Sarah in its summary what the change means for that story. It ends up inside a long summary block rather than as a decision, so it's easy to miss: every `/infra-design` session on 2026-10-06 ended that way. Sarah wants it either treated as part of the note's own work or put on the out-of-scope list. She also said planning sessions shouldn't update other notes in anticipation of their changes, especially notes likely to be finished first: "Other notes should only be updated when the work is done. If there is a high risk of conflict, then we can use blocked-by." A second example: `/shape` on [[Database Backup and Restore]] (2026-10-06) said a yes on its decision 2, a backup before each release into `main`, would change [[Branching and Releases]]' release process. Sarah said the step is the story's own work: if it's built before Branching and Releases builds the release process, the story adds an Inbox item there once the step is built. The other half: once a story's work is built, nothing finds other notes that still describe the old behavior. `/implement` updates only the story's own note, `/final-review` reviews only the story's code, and AGENTS.md "A note that's wrong or out of date" covers another story's remaining work but not notes that describe built work. Example: once [[Notes Vault Repo]] Step 7 is built, [[Local Dependency Update Alerts]] still says sweep items reach `develop` through the PR (Piece 4's sub-step 5 and Flow step 6). Sarah expects the session that builds the work to update such notes, with `/final-review` as the backstop. Decide how: a step in `/implement` that finds notes describing the changed behavior and updates them, a matching check in `/final-review`, and where AGENTS.md says it. Found 2026-10-06 during `/infra-design` (revision) on Notes Vault Repo.

# Questions
- Decision 8's open part: do feature, pattern, sweep, roundup, bug and cleanup all stay in `/implement`? Sarah couldn't judge it until the skills before `/implement` were reworked. If she can answer it here, record the answer under decision 8 in [[Agent Instructions Audit]]. If not, it moves to the Questions of the next type's Implement review, [[Bug Implement Review]].
