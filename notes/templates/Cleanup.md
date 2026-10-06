---
type: cleanup
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` says what the story needs next and nothing else: the next skill as a command, or a link to what blocks it and the skill after, as AGENTS.md describes under "Editing notes", e.g. "Next: design session in Claude Design, then /assess", "Next: /plan-steps. Building waits on [[Stale Data Issues]]" or "Blocked by [[Stale Data Issues]]; then /plan-steps". It may start with a state word or two, such as "Design approved.". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Below it goes a short summary of what work has been done and what remains, and nothing else. Anything for a later step goes at the top of the section that step writes, or in the Inbox, as AGENTS.md describes under "Editing notes". %%

No direction yet. ^status

# Inbox

%% What reaches the note from outside its usual flow: Sarah's items, items from another note's work, and why the note was sent back to an earlier step. A finding or question for a later step in the usual flow goes at the top of the section that step writes. Each skill that works on the note acts on the items that are its step's, then deletes them, as AGENTS.md describes under "Editing notes". %%

# Purpose
%% What is being removed or tidied, and why now. If this introduces a new convention that other code must follow, use the Pattern template instead. %%

# Current State
%% What exists now, with file paths. Say how it was checked (e.g. "static import scan on 2026-09-25", "grep for X") - cleanup notes go stale quickly, so re-check before planning. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%

# Out of Scope
%% Related cleanup that is deliberately left for another story. Each item should also be on the Roadmap. %%

# Acceptance Criteria
%% Cleanup rarely adds behavior, so criteria are usually "X no longer exists" plus "these existing flows are unchanged". Name the flows. %%
- [ ] 

# Implementation
%% The step plan goes here - then set status to `ready`. %%
