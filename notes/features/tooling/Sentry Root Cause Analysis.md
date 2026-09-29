---
type: 
status: idea
blocked-by:
  - "[[E2E Tests in CI]]"
confirmed: 2026-09-28
---
# Where It Stands
Blocked until [[E2E Tests in CI]] lands, then /shape ^status

# Notes
When Sentry logs an error, an agent kicks off on its own and runs a preliminary root cause analysis, so it's ready for Sarah to review when she starts working. It's a Done When item of [[Dev Foundations]].

It depends on other Dev Foundations work: Sentry isn't set up yet (the Sentry line under [[Dev Foundations]] on the Roadmap). [[E2E Tests in CI]] builds the first root cause analysis, for failed E2E tests, and this story reuses it for Sentry errors (moved there 2026-09-29). The `/investigate` skill and its `bug-reproducer` subagent already reproduce and diagnose bugs by hand, which the analysis might build on.

The session follows the convention [[CI Checks]] sets up for Claude Code cloud sessions. Sarah decided 2026-09-29 that it works from `main`, since Sentry errors come from the deployed app, which runs `main`.

Research from 2026-09-29:
- Sentry can't start a routine itself: its webhooks can't send the auth header the routine's `/fire` API needs. A Sentry alert rule can create a GitHub issue, and a workflow on `issues: opened` then calls `/fire`. Sentry's own Claude Agent integration runs a managed agent in the Claude Console, not a session in Sarah's Code tab. (docs.sentry.io/organization/integrations/source-code-mgmt/github/, docs.sentry.io/integrations/coding-agents/claude/)
- A cloud session can't reproduce a bug in the running app as things stand: `.env*` and the test login in `.opencode/secrets` are gitignored, and the Claude Code docs don't say whether preview tools run in cloud sessions. Every bug is reproduced before a root cause is written down, so the session needs a way to run the app.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
