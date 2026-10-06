---
type: cleanup
status: idea
blocked-by:
  - "[[What Makes a Good Doc]]"
  - "decision needed: when a skill should be split into separate skills that share rules"
confirmed: 2026-10-06
---
# Where It Stands
Next: /decide. Investigating waits on [[What Makes a Good Doc]] ^status

Shaped 2026-10-06 as a cleanup: `/investigate` scans every agent instruction file against the `writing-standard` skill and records where each falls short, then the fixes are planned in steps. The scan waits on What Makes a Good Doc's `rule-placement` skill, which it needs to tell a plain repeat of a rule from a deliberate exception.

# Inbox

# Purpose
Check every agent instruction against the standard [[What Makes a Good Doc]] sets, and slim it down to what the agent needs. Sarah, 2026-10-06: "I mostly expect this to be just like Docs Audit but for agent files. It audits them all and makes sure they conform to the standard set forth in What Makes a Good Doc."

[Sarah] Agents are starting to disregard their instructions, doing things like saving notes in `.scratch`. This is almost certainly a context problem - they have too many instructions. We need to go through the agent instructions and look for sections which can be slimmed down and still retain the information the agent needs. I also wonder if we need to evaluate whether certain skills are trying to do too much, and should be separated into separate skills that share rules between them.

The agent instructions are AGENTS.md, every skill in `.claude/skills/` with its supporting files, and every agent in `.claude/agents/`. The standard itself stays as What Makes a Good Doc sets it, so `writing-standard` and `rule-placement` are checked but not reworked. Apart from the `/infra-design` pass below and any skill splits, what each skill and agent does stays the same, and only its wording changes.

**A pass over `/infra-design` for repetitive or unnecessary work** - Sarah decided 2026-10-05 that infra stories skip `/plan-steps` and that `/infra-design` writes a Build Order into the Design instead. That makes `/infra-design` sessions longer, so go through `.claude/skills/infra-design/SKILL.md` and the agents it calls, including its Build Order step, and cut any work that repeats itself or isn't needed.

It's a story rather than a `/tooling` change because it's too big for one session: it reads every skill, every agent and AGENTS.md against the standard.

# Current State

# Open Decisions
1. When should a skill be split into separate skills that share rules?

# Out of Scope
- The docs in `docs/` and `README.md`: [[Docs Audit]].
- Notes in `notes/`, their templates and Note Conventions.
- Claude's memory folder (`MEMORY.md` and the memory files).

# Acceptance Criteria

# Implementation
