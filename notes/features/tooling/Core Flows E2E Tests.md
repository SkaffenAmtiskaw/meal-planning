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
Split from [[E2E Testing]] on 2026-09-28.

Scope: review the whole app for which flows need E2E tests now, then write those tests, including the auth flows. The flows the [[Calendar Page]] goal adds are covered by [[Calendar E2E Tests]], not here.

Sarah decided 2026-09-28 that handling email confirmation belongs here, with the auth flow tests, not in E2E Test Setup. She expects the review to propose splitting this into logical groups, since otherwise it would be a massive story.

Sarah's notes from [[E2E Testing]]:
- Part of this will be an app-wide review to determine what needs e2e tests added now.
- the auth workflows will need e2e tests, but we have email confirmation for things like account creation - how the hell will we manage that in e2e tests?

# Questions

