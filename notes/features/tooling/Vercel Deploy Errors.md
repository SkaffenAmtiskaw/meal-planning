---
type: infra
status: idea
blocked-by: []
confirmed: 2026-10-05
---
# Where It Stands
Next: /infra-design ^status

Shaped as an infra story: a trigger, a routine and a skill that diagnose a failed Vercel deployment and fix it where they can, built the way the `ci-failure` routine was. Nothing is designed yet.

# Inbox

# Purpose
"We also need a routine to handle Vercel deploy failures, just like the planned ones for CI failures and Sentry errors." When a Vercel deployment fails, a routine starts a cloud session that works out why, so the result is waiting for Sarah in the Code tab under **Routines**, following `docs/ci.md` "Starting a Routine".

# Goals
- [ ] A failed Vercel deployment, preview or production, starts a routine session.
- [ ] The session diagnoses the failure. Where it can, it fixes it on a `claude/` branch and opens a PR, the way `ci-failure` does. Otherwise it stops with its findings.

# Design
Questions for this section:
1. How does a failed deployment start the routine? Vercel can't call `/fire` itself. Candidates found while shaping: a GitHub workflow on the `deployment_status` events Vercel sends (state `failure` or `error`), a workflow on Vercel's `repository_dispatch` events, or a Vercel webhook pointed at something that can call `/fire`.
2. Which Vercel token does the session use to read the failed build's logs, and with what scope? Sarah assumed one is needed, and wants that confirmed as part of this story. Vercel's Build Logs and Source Protection setting is on by default, which keeps build logs private. The credential rule in [[Sentry Logging and Root Cause Analysis]] ("If the routine needs Sentry access") applies.
3. When a production deploy from `main` fails, which branch does the fix PR go into? Vercel keeps serving the last successful deploy, so the app stays up. [[Branching and Releases]] decided that an urgent fix reaches `main` on a hotfix branch, and a semi-urgent one goes into `develop` and ships with the next release. A failed preview deploy's fix would go into that preview's own branch, as `ci-failure` targets the PR's head branch.
4. If the failure looks like it's on Vercel's side, such as an outage or a flaky build, does the session redeploy?
   - **Leaning 2026-10-05:** check for Vercel outages first, since if Vercel is down a redeploy isn't going to do anything. Then try a redeploy to see if it's just flakiness. Not checked yet.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Errors in the running deployed app: [[Sentry Logging and Root Cause Analysis]].
- Auditing Vercel's setup and how production differs from local: [[Services and Environments Audit]].
- Vercel's plugin for coding agents: [[Vercel Plugin]].

# Implementation
