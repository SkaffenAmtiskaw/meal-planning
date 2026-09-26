---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
Specific changes to skills (`.claude/skills/`) and subagents (`.claude/agents/`), found while using them. The planning skills block edits outside `notes/`, so an agent that spots a fix mid-run adds an item here instead.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Changes to one skill or subagent file, each saying what to change, where, and why. Changes to `AGENTS.md` or the move from OpenCode belong in [[Agent Workflow Changes]].

# Items
%% Add each item as an unchecked box. Say which file (with line numbers), exactly what changes, and how and when it was found, e.g. "found by reading code while planning [[Note]], 2026-09-26". Items go stale, so /check-drift re-checks every one when a sweep is scheduled. If an item can't be done until another story lands, start it with `**Blocked by [[Story]]:**`. Block the item, never the whole sweep. Blocked items stay here when a sweep is frozen and roll over to the next one. %%
- [ ] 

# Out of Scope
- The `AGENTS.md` rewrite for Claude Code and other OpenCode-move changes: [[Agent Workflow Changes]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] %% The existing flows that must behave as before. Name them. %%

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
