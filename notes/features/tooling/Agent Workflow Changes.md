---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands
Collecting items. Next: /tooling ^status

# Purpose
Changes to how agents work in this repo: skills (`.claude/skills/`), subagents (`.claude/agents/`), AGENTS.md, agent conventions and the move from OpenCode to Claude Code. This includes Sarah's feedback on how they behave. The planning skills block edits outside `notes/`, so an agent that spots a fix mid-run adds an item here instead.

Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25).

## What Belongs Here
Changes to skills, subagents, AGENTS.md, agent conventions or the OpenCode move, each saying what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. Changes to the docs in `docs/`, which describe the codebase, go in [[Docs Updates]]. Tooling config goes in [[Dev Tooling Tidy-Ups]].

# Items
- [ ] **Blocked by [[E2E Test Setup]]:** **When a story needs E2E tests** - no skill or agent says when a feature or fix should add E2E tests and when it isn't worth it. Settle the rule with Sarah, then add it where stories get planned and reviewed (likely `/assess`, `/plan-steps` and `/review`), with any codebase facts about the E2E setup going in `docs/`. Sarah: "we need to update agents to specify when a feature needs e2e tests added and when it's not worth doing". Found 2026-09-28 when `/shape` split [[E2E Testing]]. It also covers new feature areas: when a story adds a route that isn't in the route-to-area table in `docs/e2e_tests.md` ([[E2E Test Setup]] Rule 3), the planning agents should notice and make adding the route to the table an acceptance criterion. Sarah raised this 2026-09-29 during `/architect` on [[E2E Test Setup]]. 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
- [ ] **More scripts for deterministic checks** - three more checks in the skills could each be one script instead of several git commands read by hand: `story-range.sh` for `/review` step 2 (find the first ✅ Complete commit, propose the range, and list the changed code and test files split into those a step names and the rest), `sarah-comments.sh` for `/check-drift` step 2 (`git blame` the note, list the lines tagged `[Sarah]` or signed `- Sarah`, and mark each new or old against `confirmed`), and `commits-since.sh` for `/plan-steps` step 1 (read `confirmed` from the frontmatter and list the later commits touching `src/`, `test/` or `docs/`, with their files, plus uncommitted changes there). Sarah wants to see whether `vault-orphans.sh`, `note-refs.sh` and `vault-lint.sh` make sessions faster before building more. Found 2026-09-29 while going through the skills for deterministic checks during `/tooling` on Sarah's Sonnet question.
- [ ] **E2E steps get run-and-see checks** - `/plan-steps` ("Test-only steps: break-it checks") and `plan-checker` say a step that changes only test files gets only break-it checks. That rule is about unit tests, whose changes show nothing new in the running app. A step that changes only E2E test code should also get a run-and-see check: run the E2E suite and watch the trace or report, since the trace is a recording of the running app. Break-it checks still belong in those steps too. Sarah agreed "e2e tests are not the same as unit tests" on 2026-09-29, when `plan-checker` flagged the trace check in Step 2 of [[E2E Test Setup]] during `/plan-steps`. 🎯 [[Dev Foundations]]
- [ ] **Manual checks prove the finished step with a case or two** - `/plan-steps` ("Checks") and `plan-checker` push Sarah's acceptance checks toward verification that isn't about proving the finished step. Her checks should give one or two cases that prove the finished step works. Other verification goes into the step's Approach as the implementing agent's static work. Two cases came up in `/plan-steps` on [[E2E Test Setup]] on 2026-09-29:
	- **Every case of a rule:** the draft of Step 5 (Biome import bans) had Sarah check every ban in every file set, and `plan-checker` asked for more. A block of cases sharing one mechanism, like the bans in one Biome override, fails together. Where exhaustive verification adds value, or an edge case might slip through, the implementer does it.
	- **The state before the change:** the drafts of Steps 4 and 6 had her run commands before the change to see the old behavior, then again after, and `plan-checker` suggested one. The implementer confirms or records the before state, such as test counts, and her checks compare against what it recorded. Break-it checks stay, since they're edits she makes on the spot to the finished step.

	🎯 [[Dev Foundations]]
- [ ] [Sarah] - Sessions are _still_ wanting to write "Check Drift" callouts when they should fucking _not_. 🎯 [[Dev Foundations]]
