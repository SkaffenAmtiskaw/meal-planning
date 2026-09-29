---
type: 
status: idea
blocked-by:
  - "[[Desktop Inbox]]"
confirmed: 2026-09-28
---
%% For jotting something down quickly. Leave `type` blank until it's clear what kind of story this is (feature / bug / pattern / cleanup / workflow), then move the content into that template. %%

# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Blocked until [[Desktop Inbox]] lands, then /shape ^status

# Notes
When Sentry logs an error or an E2E test fails, an agent kicks off on its own and runs a preliminary root cause analysis, so it's ready for Sarah to review when she starts working. It's a Done When item of [[Dev Foundations]].

Both triggers depend on other Dev Foundations work: Sentry isn't set up yet (the Sentry line under [[Dev Foundations]] on the Roadmap), and E2E tests don't exist or run in CI yet ([[E2E Test Setup]], [[E2E Tests in CI]]). The `/investigate` skill and its `bug-reproducer` subagent already reproduce and diagnose bugs by hand, which the analysis might build on.

Sarah's note from [[E2E Testing]], moved here 2026-09-28:
- I'd love if a failed e2e test automatically kicked off a Claude agent that did a preliminary root cause analysis for me to review

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
