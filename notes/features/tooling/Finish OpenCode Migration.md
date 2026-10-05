---
type: workflow
confirmed: 2026-10-05
---

# Where It Stands

Next: /tooling ^status

# Notes
Finish the move from OpenCode to Claude Code, so no OpenCode files remain. It's a Done When item of [[Dev Foundations]].

What's left in `.opencode/`:
- `.opencode/agents/`: 10 old agents (`apply`, `architect`, `bugfix`, `cleanup`, `design`, `develop`, `implement`, `inspect`, `resolve`, `review`). They stay until the whole move is finished, even where a Claude skill already replaces one.
- `.opencode/lib/delegation-decision.md`: how the OpenCode `implement` agent picks `@develop`, `@resolve` or `@apply` for delegated work.
- `.opencode/package.json`, `package-lock.json` and `node_modules/`.
- `opencode.jsonc` at the repo root.

Rules that point at `.opencode/` and go with it:
- AGENTS.md's Project section, which has agents leave `.opencode/` out of searches.
- `/final-review` step 2, which leaves `.opencode/` out of the story's changed files.
- `/tooling`'s rule that the OpenCode agents in `.opencode/agents/` stay until the whole move is finished (`.claude/skills/tooling/SKILL.md`).

Notes that still name `.opencode/docs/` or `.opencode/scratch/` paths, which are already gone: Meal Editing, Today and Selected Day Markers, Settings Data Refresh, Data Rules Enforcement, Calendar and Recipes Data Refresh, Remove Schedule-X, Server-Only Creation and Pure Reads, Shared Types Directory, Stale Data Issues and Unchecked Planner Reads. Found 2026-10-05 while shaping this note.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
- When is it safe to drop the old OpenCode agents and files?
  - **Leaning 2026-10-05:** nothing should block it any more. Not checked yet. `/tooling` checks it before removing anything, for example that every old agent's job and `.opencode/lib/delegation-decision.md` is covered by a Claude skill or agent, or no longer needed.
