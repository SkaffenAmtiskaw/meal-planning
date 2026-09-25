---
type: cleanup
status: idea
blocked-by: []
reviewed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

No direction yet. ^status

# Purpose
%% What is being removed or tidied, and why now. If this introduces a new convention that other code must follow, use the Pattern template instead. %%

# Current State
%% What exists now, with file paths. Say how it was checked (e.g. "static import scan on 2026-09-25", "grep for X") - cleanup notes go stale quickly, so re-check before planning. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. Each one also gets a `"decision needed: <short question>"` entry in `blocked-by`. Record the answer here once it's made and remove its `blocked-by` entry. Delete the section if there are none. %%

# Out of Scope
%% Related cleanup that is deliberately left for another story. Each item should also be on the Roadmap. %%

# Acceptance Criteria
%% Cleanup rarely adds behavior, so criteria are usually "X no longer exists" plus "these existing flows are unchanged". Name the flows. %%
- [ ] 

# Implementation
%% The step plan goes here - then set status to `ready`. %%
