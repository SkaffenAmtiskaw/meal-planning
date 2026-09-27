---
type: sweep
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the sweep's status and nothing else, e.g. "Collecting items until you schedule a sweep" or, on a frozen copy, "Frozen. Next: /check-drift". The Roadmap embeds it with `![[<note>#^status]]`, so keep the ` ^status` ID on it. %%

Collecting items until you schedule a sweep. ^status

# Purpose
%% What this sweep collects and why it's handled as one batch, in a sentence or two. %%

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

%% This sweep's grouping rule, e.g. "unit test fixes that don't follow `.opencode/docs/unit_tests.md`; changes to test files only". Name any files or kinds of change it must not touch. %%

# Items
%% Add each item as an unchecked box. Say which file (with line numbers), exactly what changes, and how and when it was found, e.g. "found by reading code while planning [[Note]], 2026-09-26". Items go stale, so /check-drift re-checks every one when a sweep is scheduled. If an item can't be done until another story lands, start it with `**Blocked by [[Story]]:**`. Block the item, never the whole sweep. Blocked items stay here when a sweep is frozen and roll over to the next one. %%
- [ ] 

# Out of Scope
%% Related work that belongs to another story or sweep, with a link. %%

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] %% The existing flows that must behave as before. Name them. %%

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
