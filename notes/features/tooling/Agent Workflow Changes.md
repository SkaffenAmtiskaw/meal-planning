---
type: 
status: idea
confirmed: 2026-09-25
---
# Notes
Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25). `AGENTS.md` still assumes OpenCode and needs rewriting as the move goes on.

Known changes:
- **Scratch location** - `/assess` saves critic reports to `.opencode/scratch/`. Move scratch somewhere outside `.opencode/`.
- **`.opencode/` path rules and Project Knowledge docs** - the "File & Path Resolution" section and the docs in `.opencode/docs/` need a new home once OpenCode is gone.
- **Rules meant for the main session** - Claude Code subagents load `AGENTS.md` too, so rules like "summarize your instructions at session start" also reach `code-critic` and `scope-router`. Word them so they only apply to the main session, or have those subagents skip `CLAUDE.md`.
- **Tool Constraints and handoff rules** - written for OpenCode agents and permissions; check them against Claude Code.
- **One question at a time** - applies to every code project, so it goes in `~/repos/CLAUDE.md`, not here.

# Skill and Agent Changes
A running list of changes to make to skills (`.claude/skills/`) and subagents (`.claude/agents/`), found while using them. Agents in a session can't edit these files, so they add an entry here instead. Each entry says what to change, where, and why.

- **`/plan-steps` - save split drafts in the child note, not scratch.**
  - **The problem:** "Splitting a story", step 5, saves each child's draft to `.opencode/scratch/<child name> - plan.md`. Lefthook's pre-commit `cleanup` command (`rm -rf .opencode/scratch`) deletes those files on the next commit.
  - **Change step 5:** add a `# Draft Steps (from the split)` section just above `# Implementation` in each child note. Start it with a callout telling the agent running `/plan-steps` to start from the draft, and to delete the whole section once the approved plan is written under Implementation.
  - **Change step 1:** look for that section instead of the scratch file.
  - Done by hand for the [[Stale Data Issues]] split on 2026-09-25. See [[Calendar and Recipes Data Refresh]] for the format.

# Questions
- Once OpenCode is gone, keep `AGENTS.md` (loaded through `CLAUDE.md`), or move its contents into `CLAUDE.md`?
