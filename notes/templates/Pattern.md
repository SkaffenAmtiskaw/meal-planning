---
type: pattern
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

No direction yet. ^status

# Purpose
%% The convention being introduced or standardized, in a sentence or two. Use this template when the fix is "everything should work this way" plus moving existing code over. For removing or tidying code without a new convention, use Cleanup instead. %%

# Symptoms
%% Optional: the bugs or problems that surfaced this. Write them as checkboxes - they are this story's acceptance criteria. Delete the section if there are none. %%
- [ ] 

# Root Cause
%% Why the current code produces the symptoms, or why the lack of a convention is a problem. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. Each one also gets a `"decision needed: <short question>"` entry in `blocked-by`. Record the answer here once it's made and remove its `blocked-by` entry. Delete the section if there are none. %%

# Rules
%% The convention itself, as numbered rules an agent can check code against. Once the rules are confirmed, set status to `spec`. %%
## Rule 1 - 

# Enforcement
%% Required. How future stories are kept from drifting: a lint rule, a type, a test, a module boundary, an agent instruction or a review checklist. If programmatic enforcement isn't possible, say so and describe the process instead. %%

# Migration Checklist
%% Every place that has to change, as checkboxes grouped by kind, with file paths. This is what gets split into implementation steps. %%

# Out of Scope
%% Related problems found along the way that this story won't fix. Each should also be on the Roadmap. %%

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
