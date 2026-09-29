---
type: pattern
status: idea
blocked-by:
  - "decision needed: which E2E tool, how test data stays consistent, which database the tests run against, and whether manual and agent testing share the seed data"
confirmed: 2026-09-28
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Next: /decide, then /architect ^status

Set up E2E testing as a convention (where tests live, how they get their data, how they sign in and how they're run) and prove it with one first test that follows the Rules. [[Core Flows E2E Tests]] and [[Calendar E2E Tests]] build on it.

Questions `/architect` answers as part of writing the Rules:
- Where E2E tests and their helpers live.
- How tests sign in, and where test users' credentials live.
- How the tests are run locally: the command, and whether they run against the dev server or a production build.
- Which flow the first test covers.

# Purpose
%% The convention being introduced or standardized, in a sentence or two. Use this template when the fix is "everything should work this way" plus moving existing code over. For removing or tidying code without a new convention, use Cleanup instead. %%
E2E tests run locally against test data that stays consistent, following one written convention, with one first test to prove it. Split from [[E2E Testing]] on 2026-09-28.

# Root Cause
%% Why the current code produces the symptoms, or why the lack of a convention is a problem. %%

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%
1. Which E2E tool should the app use? Candidates: Playwright, Cypress, WebdriverIO, Puppeteer, TestCafe, Selenium WebDriver.
	- Sarah's note: I guess I'm most familiar with Playwright, and assumed we'd use it, but we should do at least a cursory check that it's the best tool to use.
2. How does test data stay consistent between runs: cleanup steps in the tests, or resetting the database after a run?
	- Sarah's note: The E2E tests will either need to involve cleanup steps so the data stays consistent or we'll need to reset the database after it runs.
3. Which database do the E2E tests run against? Candidates: a separate database on the existing MongoDB setup, mongodb-memory-server, MongoDB in Docker through Testcontainers.
4. Should the E2E tests and manual and agent testing share one seed data set, run against both databases?
	- [ ] [Sarah] - I need to create a better local environment so the `first-pass` agent can be more useful. First I need to create a planner with some test data, and users with different access levels on it. Then I need to find a more permanent place for the credentials (is there an existing convention for agent only environment variables?). I assume this is mostly work I have to do myself, but I should work with the agent to figure out what the useful things to add are (and help me figure out some of the parts I get stuck on). The agent can also help me document some of this for eventual use in [[E2E Testing]] (where I imagine I'll need to add users with different access levels again). 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]

# Rules
%% The convention itself, as numbered rules an agent can check code against. Written with Sarah by `/architect`, along with Enforcement and the Migration Checklist, once Open Decisions are settled. It sets status to `spec` when all three are approved. %%
## Rule 1 - 

# Enforcement
%% Required. How future stories are kept from drifting: a lint rule, a type, a test, a module boundary, an agent instruction or a review checklist. If programmatic enforcement isn't possible, say so and describe the process instead. %%

# Migration Checklist
%% Every place that has to change, as checkboxes grouped by kind, with file paths. This is what gets split into implementation steps. %%

# Out of Scope
%% Related problems found along the way that this story won't fix. Each should also be on the Roadmap. %%
- Handling email confirmation in auth flows. Sarah decided 2026-09-28 that it gets worked out with the auth flow tests in [[Core Flows E2E Tests]].

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
