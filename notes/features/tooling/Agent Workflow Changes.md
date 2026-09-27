---
type: 
status: idea
confirmed: 2026-09-25
---
# Notes
Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25).

Known changes:
- **Subagents repeat AGENTS.md** - Claude Code subagents load `AGENTS.md` (per the Claude Code sub-agents docs, checked 2026-09-27), so agent text that restates it is duplicated. Examples: `.claude/agents/bug-reproducer.md` Procedure steps 1-3 repeat `.opencode/docs/running_the_app.md`. `decision-researcher.md` defines Sarah's comments and embedded sections, now in AGENTS.md "Editing notes". `decision-researcher.md` and `target-designer.md` list library doc sources, now in AGENTS.md "Library APIs". `plan-checker.md` explains embedded sections. The agents were deliberately left self-contained during the 2026-09-27 AGENTS.md cleanup. Open questions:
  - Should subagents rely on AGENTS.md or stay self-contained?
  - Where a subagent's wording deliberately differs, keep it? For example, bug-reproducer reports the `timeout` log lines instead of showing them to Sarah.
  - Does `!`command`` shell injection work in agent definition files, as it does in skills? If it does, `scope-router.md` could use `scripts/note-section.sh` instead of Grep-then-Read on Note Conventions.

  Once decided, each agent's edit can join [[Skill and Agent Tidy-Ups]]. Found 2026-09-27 while cleaning up AGENTS.md.
- [Sarah] - How exactly is a story scope decided? The agent gets to decide what work it wants to do? Or am I signing off on scope somewhere?
- **Boy Scout Rule (incidental cleanup)** - No existing convention says a story should leave a touched file a little cleaner than it found it (e.g. bringing a test file's ad-hoc mocks onto the centralized-mock convention while making an unrelated fix in the same file), though the `getUserInvites` server-only fix applied an informal version of it. Sarah: "if there isn't [a rule], there should be." Open questions: how far "a bit better" extends (any convention violation in a touched file, or only within the hunks already being edited); production code too, or tests only (the "Tests and shared mocks" section several notes already carry is a scoped version of the same idea for tests); whether it needs its own Enforcement or is just agent judgment; whether "Tests and shared mocks" should eventually just point at this rule instead of repeating it. Likely lands in `.opencode/docs/project_conventions.md` once decided. Found 2026-09-26 while planning that fix.

# Skill and Agent Changes
Specific skill and subagent fixes are collected in [[Skill and Agent Tidy-Ups]].

# Questions
- Once OpenCode is gone, keep `AGENTS.md` (loaded through `CLAUDE.md`), or move its contents into `CLAUDE.md`?
