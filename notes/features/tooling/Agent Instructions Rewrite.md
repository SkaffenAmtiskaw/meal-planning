---
type: 
status: idea
reviewed: 2026-09-25
---
# Notes
Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25). `AGENTS.md` still assumes OpenCode and needs rewriting as the move goes on.

Known changes:
- **Scratch location** - `/assess` saves critic reports to `.opencode/scratch/`. Move scratch somewhere outside `.opencode/`.
- **`.opencode/` path rules and Project Knowledge docs** - the "File & Path Resolution" section and the docs in `.opencode/docs/` need a new home once OpenCode is gone.
- **Apology rule** - "an apology is USELESS without an explanation of why it happened." Agents treat any correction as being called out, so they apologize and explain at length even when a question just rested on a wrong assumption. Narrow it to actually breaking an instruction.
- **Rules meant for the main session** - Claude Code subagents load `AGENTS.md` too, so rules like "summarize your instructions at session start" also reach `code-critic` and `scope-router`. Word them so they only apply to the main session, or have those subagents skip `CLAUDE.md`.
- **Tool Constraints and handoff rules** - written for OpenCode agents and permissions; check them against Claude Code.
- **One question at a time** - applies to every code project, so it goes in `~/repos/CLAUDE.md`, not here.

# Questions
- Once OpenCode is gone, keep `AGENTS.md` (loaded through `CLAUDE.md`), or move its contents into `CLAUDE.md`?
