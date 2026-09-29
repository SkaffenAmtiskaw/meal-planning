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

Scope: run the E2E tests in GitHub Actions when `develop` opens a PR into `main`, set up whatever environment that needs, and write a doc on how to create a new environment. It builds on [[CI Checks]] (which sets up CI) and [[E2E Test Setup]] (which gets the tests running locally).

Sarah's notes from [[E2E Testing]]:
- I want e2e tests to run automatically, but I don't want them to run locally every time I commit because they take goddamn forever. So this probably means it's time for GHA. The most obvious (to me) place to run them is when develop opens a PR into main.
- If e2e tests are running in CI, we might need a new environment. We need to figure out moving pieces for that. (note: it'd be super nice if this work created a document about creating a new environment I could refer back to later!)

# Questions

