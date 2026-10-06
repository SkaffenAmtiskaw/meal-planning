---
type: sweep
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the sweep's status and nothing else, e.g. "Collecting items. Next: /kickoff when you schedule it" or, once /kickoff has run, "Kicked off. Next: /check-drift". The Roadmap embeds it with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Below it goes a short summary of what work has been done and what remains, and nothing else. Anything for a later step goes at the top of the section that step writes, or in the Inbox, as AGENTS.md describes under "Editing notes". %%

Collecting items. Next: /kickoff when you schedule it ^status

# Inbox

%% What reaches the note from outside its usual flow: Sarah's items, items from another note's work, and why the note was sent back to an earlier step. A finding or question for a later step in the usual flow goes at the top of the section that step writes. Each skill that works on the note acts on the items that are its step's, then deletes them, as AGENTS.md describes under "Editing notes". %%

# Purpose
%% What this sweep collects and why it's handled as one batch, in a sentence or two. %%

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. It goes in a roundup on its topic, or gets its own Roadmap line until it's decided.

%% This sweep's grouping rule, e.g. "unit test fixes that don't follow `docs/unit_tests.md`; changes to test files only". Name any files or kinds of change it must not touch. %%

# Items
%% Add each item as an unchecked box. Say which file (with line numbers), exactly what changes, and how and when it was found, e.g. "found by reading code while planning [[Note]], 2026-09-26". Items go stale, so /check-drift re-checks every one once the sweep is kicked off. If an item can't be done until another story lands, start it with `**Blocked by [[Story]]:**`. Block the item, never the whole sweep. Blocked items stay here when /kickoff freezes a copy, and roll over to the next one. %%
- [ ] 

# Out of Scope
%% Related work that belongs to another story or sweep, with a link. %%

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] %% The existing flows that must behave as before. Name them. %%

# Implementation
%% Empty while collecting. Once the sweep is kicked off and /check-drift has run, /plan-steps writes the steps there. %%
