---
type: 
status: idea
confirmed: 2026-10-06
---
# Where It Stands
Next: /shape ^status

# Inbox
- Since 2026-10-31, `/investigate` and `building-code` reproduce a bug in the running app only when it involves layout, position, size, scrolling, what's visible or timing, and reproduce any other bug in a failing unit test, as `.claude/skills/building-code/reproducing-a-bug.md` describes. The Notes' research says every bug is reproduced in the running app before a root cause is written down, so a cloud session needs a way to run the app. That now holds only for the layout and timing kind.

# Notes
Split from Sentry Logging and Root Cause Analysis by `/shape` on 2026-10-06. Scope: a routine that starts a cloud session for each new Sentry error, which leaves a preliminary root cause analysis from `root-cause-analyst` waiting under **Routines**.

A routine that runs a preliminary root cause analysis on each new Sentry error, so it's ready for Sarah to review when she starts working. It covers one Done When item of [[Dev Foundations]]: an agent runs a root cause analysis when Sentry logs an error. Sentry itself is added by [[Sentry Error Reporting]].

It depends on other Dev Foundations work: [[E2E Tests in CI]] builds the first root cause analysis, for failed E2E tests, and this story reuses it for Sentry errors (moved there 2026-09-29). The `/investigate` skill and its `bug-reproducer` subagent already reproduce and diagnose bugs by hand, which the analysis might build on.

The session follows the convention for Claude Code cloud sessions in `docs/ci.md` ("Starting a Routine") and the `routine-sessions` skill. Sarah decided 2026-09-29 that it works from `main`, since Sentry errors come from the deployed app, which runs `main`.

Scope Sarah confirmed while shaping the original on 2026-10-06: the session only analyzes and never opens a fix PR, as [[E2E Tests in CI]] does for a broken app (no fix, and an offer to create a bug note).

Research from 2026-09-29:
- Sentry can't start a routine itself: its webhooks can't send the auth header the routine's `/fire` API needs. A Sentry alert rule can create a GitHub issue, and a workflow on `issues: opened` then calls `/fire`. Sentry's own Claude Agent integration runs a managed agent in the Claude Console, not a session in Sarah's Code tab. (docs.sentry.io/organization/integrations/source-code-mgmt/github/, docs.sentry.io/integrations/coding-agents/claude/)
- A cloud session can't reproduce a bug in the running app as things stand: `.env*` is gitignored, and the Claude Code docs don't say whether preview tools run in cloud sessions. Every bug is reproduced before a root cause is written down, so the session needs a way to run the app.
	- Test users and data that work in cloud sessions belong here, since the dev seed (`docs/seed.md`) covers only Sarah's machine. They need a database the cloud can reach, the app's secrets on the cloud environment and a way to run the app in a cloud session. The seed in `seed/` and its sign-in links (better-auth `testUtils` `getCookies`) may be reusable.

## If the routine needs Sentry access
The expected convention, moved here from CI Checks on 2026-09-30 because no story needed it yet. If the routine's session turns out to need Sentry, for example Sentry's API for more detailed logs:
- The key is stored on the routine's cloud environment as an API credential, or reached through a claude.ai connector added to the routine. It's never an environment variable, a file, or part of the `/fire` payload. The cloud environments docs say an API credential is attached to requests for the hosts it lists after they leave the session, so the key never reaches Claude, its commands or its environment variables. API credentials are available on Pro and Max plans.
- The key gets the narrowest scope Sentry offers, read-only where possible, because a routine's session runs without permission prompts while it reads untrusted text such as error messages.
- The routine's `routine.md` names the credential or connector, the hosts it's sent to and its scope, never its value.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
- How does the routine's cloud session reproduce a production error before it writes a root cause? `routine-sessions` rules out `running-the-app` and `bug-reproducer`. The ways found: reproduce it with a failing unit test or E2E spec against the throwaway database, which [[E2E Tests in CI]] makes runnable in the cloud environment; build a way to run the real app in the cloud (a reachable database, seeded test users and the app's secrets), possibly as its own story; or don't reproduce it, and mark the analysis as unconfirmed from Sentry's stack trace and the code until Sarah runs `/investigate` on the bug note. Later routines that diagnose runtime errors would follow the same answer. Found by `/shape` on 2026-10-06, and Sarah left it for `/decide`.
