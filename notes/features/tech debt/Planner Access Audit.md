---
type: 
status: idea
confirmed: 2026-09-28
---
%% For jotting something down quickly. Leave `type` blank until it's clear what kind of story this is (feature / bug / pattern / cleanup / workflow), then move the content into that template. %%

# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Next: /shape ^status

# Notes
The [[Calendar Page]] goal's Done When says people can only see the planners they belong to, and can only change the planners they have permission to change, and that the goal checks this rather than assuming it.

Two known holes already have stories: [[Unchecked Planner Reads]] (reads that return planner data with no membership check) and [[Server-Only Creation and Pure Reads]] (`addPlanner` callable from the browser with no auth check). Nothing checks the rest. This audit goes through every server action and read that touches planner data and confirms each one checks membership, and the right permission level for writes. Anything it finds becomes its own fix.

# Questions

