---
type: infra
status: idea
blocked-by: []
confirmed: 2026-11-04
---
# Where It Stands
Next: /infra-design ^status

Shaped as an infra story: add Sentry's error reporting to the deployed app. Nothing is installed or set up yet.

# Inbox

# Purpose
Add Sentry so production errors get reported to Sarah. It covers one Done When item of [[Dev Foundations]]: production errors get reported (Sentry). Sarah merged the "Add Sentry for logging" Roadmap line into the original note on 2026-09-30.

Split from Sentry Logging and Root Cause Analysis by `/shape` on 2026-10-06. Scope: add Sentry to the deployed app, so errors from production and previews, on the server and in the browser, are reported to Sarah.

Scope Sarah confirmed while shaping the original on 2026-10-06:
- Error reporting only.
- Sentry reports from production and Vercel previews.
- Sarah hears about errors through Sentry's own alert, and through the root cause analysis session under **Routines**.
- It's Sentry, with no comparison of alternatives.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Goals

# Design

# Conventions

# Setup Outside the Repo

# Out of Scope
- Performance tracing, Session Replay and Sentry's Logs feature.
- Reporting from local dev.
- The root cause analysis of each new Sentry error, including the Sentry alert that opens a GitHub issue for a workflow to pick up: [[Sentry Root Cause Analysis]], which waits on this story.
- Failed deployments: [[Vercel Deploy Errors]].
