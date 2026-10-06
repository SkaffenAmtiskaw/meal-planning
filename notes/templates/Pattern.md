---
type: pattern
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
%% The convention being introduced or standardized, in a sentence or two. Use this template when the fix is "everything should work this way" plus moving existing code over. For removing or tidying code without a new convention, use Cleanup instead. %%

# Symptoms
%% Optional: the bugs or problems that surfaced this. Write them as checkboxes - they are this story's acceptance criteria. Delete the section if there are none. %%
- [ ] 

# Root Cause
%% Why the current code produces the symptoms, or why the lack of a convention is a problem. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%

# Rules
%% The convention itself, as numbered rules an agent can check code against. Written with Sarah by `/architect`, along with Enforcement and the Migration Checklist, once Open Decisions are settled. It sets status to `spec` when all three are approved. %%
## Rule 1 - 

# Enforcement
%% Required. How future stories are kept from drifting: a lint rule, a type, a test, a module boundary, an agent instruction or a review checklist. If programmatic enforcement isn't possible, say so and describe the process instead. %%

# Migration Checklist
%% Every place that has to change, as checkboxes grouped by kind, with file paths. This is what gets split into implementation steps. %%

# Out of Scope
%% Related problems found along the way that this story won't fix. Each should also be on the Roadmap. %%

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
