---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/plan-steps` step, which writes the implementation steps.

**Full review here,** as the first story that uses them: `/plan-steps`, `running-the-app`, the `plan-checker` agent.

**Re-checks for this step:** the `split-checker` agent, `splitting-a-story` (reviewed in Feature Assess Review); the `notes-only-edits.sh` hook (reviewed in Feature Shape Review).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- The test-only and E2E check sections (:84-100, about 350 words) move to a supporting file read when a step changes only test files; `plan-checker:24-25` and `split-checker`'s test 2 point to them by name and change too.
- :160 (update the status on the Roadmap line) is out of date, since lines embed `^status`; it goes.
- :131-133 restate AGENTS.md's "Open questions in notes are hers too"; only "Next: /decide" and the stop are the skill's.
- :151 puts its condition after the instruction; :93-95 are an edge-case list ("break behavior, not imports" plus two "counts" bullets); :23's hook sentence; :21 and :76 both ban "tests pass" as a check; :103 restates where a Boy Scout fix goes.
- **Writing acceptance checks** (the proves line, usable as written, one or two cases per rule, nothing already shown): `plan-steps:57,74,80-82`, `infra-design:96,100,101`, `plan-checker:26-28`. `plan-checker` and `split-checker` preload the shared skill.
- The `trust-mantine-defaults` memory moves here, where checks are written: no check that only proves a Mantine default.
- `/plan-steps` alone says "save to `.scratch`" three times, which is a likely reason agents treat `.scratch` as a place to save things, as the hub's Purpose describes. AGENTS.md's "Subagent reports and scratch files" already holds the rule; only each file name is the skill's own.
- The "Find a home for out-of-scope items" step ("if the list is empty, skip; otherwise route as AGENTS.md describes") repeats AGENTS.md; it becomes one line in the last step.
- :156 says to replace a template comment, which AGENTS.md:88 already covers.
- Its description is imperative, where `writing-standard`'s `instructions.md` asks for the third person under Descriptions; it becomes what and when, in about 25 words.
- Split check: no split. Type matters only in step 1 and in Coverage's source list.
- **`plan-checker`:** :21, :23-31, :35-36 and :39 restate `/plan-steps` (they go to the shared acceptance-checks skill or point to `/plan-steps`); :10-15 become one sentence; :38 puts its exception after; :27 is a 150-word bullet; its opener (:8) says it only suggests; its description ends "Read-only."
- **`running-the-app`:** :13 gets its reason (the user starts their own server with `pnpm dev`), and the `stop-servers-you-start` memory goes; :13's last sentence goes; :9 and :18 both give the `seed/users.ts` path; :21 gets a reason for resetting to desktop.
- **A `commits-since.sh` script for step 1:** it would read `confirmed` from the note's frontmatter and list the later commits touching `src/`, `test/` or `docs/` with their files, plus uncommitted changes there, so the session doesn't run several git commands and read them by hand. Feature Check-Drift Review built the first script of this kind, `scripts/user-comments.sh` for `/check-drift` step 2. Found 2026-09-29 while going through the skills for deterministic checks; moved here 2026-10-15 from Feature Check-Drift Review.

# Questions
