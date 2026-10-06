---
type: bug
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` says what the story needs next and nothing else: the next skill as a command, or a link to what blocks it and the skill after, as AGENTS.md describes under "Editing notes", e.g. "Next: design session in Claude Design, then /assess", "Next: /plan-steps. Building waits on [[Stale Data Issues]]" or "Blocked by [[Stale Data Issues]]; then /plan-steps". It may start with a state word or two, such as "Design approved.". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Below it goes a short summary of what work has been done and what remains, and nothing else. Anything for a later step goes at the top of the section that step writes, or in the Inbox, as AGENTS.md describes under "Editing notes". %%

No direction yet. ^status

# Inbox

%% What reaches the note from outside its usual flow: Sarah's items, items from another note's work, and why the note was sent back to an earlier step. A finding or question for a later step in the usual flow goes at the top of the section that step writes. Each skill that works on the note acts on the items that are its step's, then deletes them, as AGENTS.md describes under "Editing notes". %%

# Symptoms
%% What goes wrong, as a user sees it. Include steps to reproduce if known, and say whether it was reproduced in the running app or found by reading code. %%

# Who Can Hit This
%% Which users, in which situations. "Everyone" is a valid answer. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%

# Root Cause
%% Where in the code it happens and why, with file paths. If the cause is systemic (the same mistake in many places), don't grow this note into a refactor - create a Pattern note, link it here, and keep this note about these symptoms. %%

# Fix
%% The chosen fix: what changes, where, and why. If there were other reasonable options, one line says why this one won. If the choice is still open, it's an Open Decisions question with the options under it, and this section says which question it waits on. Filled in by /investigate. %%

# Acceptance Criteria
- [ ] %% the symptom no longer happens, checked in the running app %%

# Implementation
%% A small bug may need only one step, but it still goes here so it can be reviewed. Once it exists, set status to `ready`. %%
