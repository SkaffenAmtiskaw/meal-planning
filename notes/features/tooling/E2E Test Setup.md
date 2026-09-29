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

Scope: pick the E2E tool and install it, get E2E tests running locally against test data that stays consistent, and prove it with one first test. Handling email confirmation in auth flows isn't part of this. Sarah decided 2026-09-28 that it gets worked out with the auth flow tests in [[Core Flows E2E Tests]].

Sarah's notes from [[E2E Testing]]:
- I guess I'm most familiar with Playwright, and assumed we'd use it, but we should do at least a cursory check that it's the best tool to use.
- The E2E tests will either need to involve cleanup steps so the data stays consistent or we'll need to reset the database after it runs.

# Questions

