---
type:
status: idea
blocked-by:
  - "[[E2E Tests in CI]]"
confirmed: 2026-09-30
---
# Where It Stands
Blocked until [[E2E Tests in CI]] lands, then /shape ^status

# Notes
Add Sentry so production errors get reported to Sarah, and a routine that runs a preliminary root cause analysis on each new Sentry error, so it's ready for her to review when she starts working. It covers two Done When items of [[Dev Foundations]]: production errors get reported (Sentry), and an agent runs a root cause analysis when Sentry logs an error. Sarah merged the "Add Sentry for logging" Roadmap line into this note on 2026-09-30. It can be split later.

It depends on other Dev Foundations work: [[E2E Tests in CI]] builds the first root cause analysis, for failed E2E tests, and this story reuses it for Sentry errors (moved there 2026-09-29). The `/investigate` skill and its `bug-reproducer` subagent already reproduce and diagnose bugs by hand, which the analysis might build on.

The session follows the convention for Claude Code cloud sessions in `docs/ci.md` ("Starting a Routine") and the `routine-sessions` skill. Sarah decided 2026-09-29 that it works from `main`, since Sentry errors come from the deployed app, which runs `main`.

Research from 2026-09-29:
- Sentry can't start a routine itself: its webhooks can't send the auth header the routine's `/fire` API needs. A Sentry alert rule can create a GitHub issue, and a workflow on `issues: opened` then calls `/fire`. Sentry's own Claude Agent integration runs a managed agent in the Claude Console, not a session in Sarah's Code tab. (docs.sentry.io/organization/integrations/source-code-mgmt/github/, docs.sentry.io/integrations/coding-agents/claude/)
- A cloud session can't reproduce a bug in the running app as things stand: `.env*` and the test login in `.opencode/secrets` are gitignored, and the Claude Code docs don't say whether preview tools run in cloud sessions. Every bug is reproduced before a root cause is written down, so the session needs a way to run the app.
	- Test users and data that work in cloud sessions were left out of [[Manual and Agent Test Environment]] and routed here 2026-09-30, since Sarah decided that story covers only her machine. They need a database the cloud can reach, the app's secrets on the cloud environment and a way to run the app in a cloud session. That story's seed and agent sign-in (better-auth `testUtils` `getCookies`) may be reusable.

## If the routine needs Sentry access
The expected convention, moved here from CI Checks on 2026-09-30 because no story needed it yet. If the routine's session turns out to need Sentry, for example Sentry's API for more detailed logs:
- The key is stored on the routine's cloud environment as an API credential, or reached through a claude.ai connector added to the routine. It's never an environment variable, a file, or part of the `/fire` payload. The cloud environments docs say an API credential is attached to requests for the hosts it lists after they leave the session, so the key never reaches Claude, its commands or its environment variables. API credentials are available on Pro and Max plans.
- The key gets the narrowest scope Sentry offers, read-only where possible, because a routine's session runs without permission prompts while it reads untrusted text such as error messages.
- The routine's `routine.md` names the credential or connector, the hosts it's sent to and its scope, never its value.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
