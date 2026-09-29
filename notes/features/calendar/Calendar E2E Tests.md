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
The [[Calendar Page]] goal's Done When says E2E tests cover the calendar's major flows, including the ones this goal adds: editing meals, drag and drop, clicking a day to add a meal, and the phone workflows.

Under Dev Foundations, [[E2E Test Setup]] sets up E2E testing and [[Core Flows E2E Tests]] covers the app's core flows as they are now. The flows this goal adds don't exist yet, so that work can't cover them. This story can't start until [[E2E Test Setup]] has set up the tooling. Whether the tests are written as each flow is built, or in one pass before the goal ships, is for /shape to settle.

# Questions

