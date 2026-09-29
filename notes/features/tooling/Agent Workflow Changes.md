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
- [ ] **Archived notes that lose their last `kept-for` story are easy to forget** - when `/close` removes the last entry from an archived note's `kept-for`, that note needs its own `/close`, but the only reminder is a follow-up line in `/close`'s report, and archived notes have no Roadmap line. Hubs had the same gap until `/close` started setting a finished hub's `^status` to "Next: /close" and giving it a Roadmap line. Change `.claude/skills/close/SKILL.md` step 5 ("Kept-for") to do the same for the archived note. Found 2026-09-28 while fixing how finished hubs resurface on the Roadmap. 🎯 [[Dev Foundations]]
- [ ] **Blocked by [[E2E Test Setup]]:** **When a story needs E2E tests** - no skill or agent says when a feature or fix should add E2E tests and when it isn't worth it. Settle the rule with Sarah, then add it where stories get planned and reviewed (likely `/assess`, `/plan-steps` and `/review`), with any codebase facts about the E2E setup going in `docs/`. Sarah: "we need to update agents to specify when a feature needs e2e tests added and when it's not worth doing". Found 2026-09-28 when `/shape` split [[E2E Testing]]. It also covers new feature areas: when a story adds a route that isn't in the route-to-area table in `docs/e2e_tests.md` ([[E2E Test Setup]] Rule 3), the planning agents should notice and make adding the route to the table an acceptance criterion. Sarah raised this 2026-09-29 during `/architect` on [[E2E Test Setup]]. 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
- [ ] **More scripts for deterministic checks** - three more checks in the skills could each be one script instead of several git commands read by hand: `story-range.sh` for `/review` step 2 (find the first ✅ Complete commit, propose the range, and list the changed code and test files split into those a step names and the rest), `sarah-comments.sh` for `/check-drift` step 2 (`git blame` the note, list the lines tagged `[Sarah]` or signed `- Sarah`, and mark each new or old against `confirmed`), and `commits-since.sh` for `/plan-steps` step 1 (read `confirmed` from the frontmatter and list the later commits touching `src/`, `test/` or `docs/`, with their files, plus uncommitted changes there). Sarah wants to see whether `vault-orphans.sh`, `note-refs.sh` and `vault-lint.sh` make sessions faster before building more. Found 2026-09-29 while going through the skills for deterministic checks during `/tooling` on Sarah's Sonnet question.
