---
type: hub
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is this hub's status and nothing else: which child story is moving now and what is waiting on a decision. Don't describe the area here; Purpose does that. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when needed. %%

No direction yet. ^status

# Purpose
%% What area of the app this hub covers, and why the work is spread across several stories. A hub is not a story and is never implemented directly. %%

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Design Handoff
%% Only for a hub made by splitting a story. The full design handoff moves here unchanged, with its images and its own Meta-Instructions, and each child story embeds the sections it builds with `![[<this hub>#Section]]`. Change the design here, never in a child. Delete this section otherwise. %%

# Coverage
%% A table of what is planned where, e.g. actions × views or devices. Mark every combination no note plans with ❓, and link the story that covers each one. %%

# Child Stories
| Story | Status | Scope in this area | Blocked by |
|---|---|---|---|
|  |  |  |  |

%% Related notes that touch this area but aren't child stories go in a short list below the table. %%

# Build Order
%% The order the child stories depend on each other in. Say which dependencies are stated in the notes and which are inferred. %%

# Open Decisions
%% Questions for the user, not proposals. Note any constraints existing stories already impose. %%

# Deferred Work
%% Unfinished pieces moved here from stories that are otherwise done. Move the full step, its image embeds and the relevant handoff text - not a summary - so whoever builds it doesn't have to go back to the archived note. Leave a "🚛 Moved to [[<this hub>]]" pointer in the original. %%
