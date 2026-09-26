---
type: bug
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

No direction yet. ^status

# Symptoms
%% What goes wrong, as a user sees it. Include steps to reproduce if known, and say whether it was reproduced in the running app or found by reading code. %%

# Who Can Hit This
%% Which users, in which situations. "Everyone" is a valid answer. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. Each one also gets a `"decision needed: <short question>"` entry in `blocked-by`. Record the answer here once it's made and remove its `blocked-by` entry. Delete the section if there are none. %%

# Root Cause
%% Where in the code it happens and why, with file paths. If the cause is systemic (the same mistake in many places), don't grow this note into a refactor - create a Pattern note, link it here, and keep this note about these symptoms. %%

# Fix Options
%% If there is more than one reasonable fix, list them and add "decision needed on which fix to use" to blocked-by. Record the decision here once it's made. Delete this section if the fix is obvious. %%

# Acceptance Criteria
- [ ] %% the symptom no longer happens, checked in the running app %%

# Implementation
%% A small bug may need only one step, but it still goes here so it can be reviewed. Once it exists, set status to `ready`. %%
