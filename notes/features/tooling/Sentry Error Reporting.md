---
type: 
status: idea
confirmed: 2026-10-06
---
# Where It Stands
Next: /shape ^status

# Notes
Split from Sentry Logging and Root Cause Analysis by `/shape` on 2026-10-06. Scope: add Sentry to the deployed app, so errors from production and previews, on the server and in the browser, are reported to Sarah.

Add Sentry so production errors get reported to Sarah. It covers one Done When item of [[Dev Foundations]]: production errors get reported (Sentry). Sarah merged the "Add Sentry for logging" Roadmap line into the original note on 2026-09-30. The root cause analysis of each new Sentry error is [[Sentry Root Cause Analysis]], which waits on this story.

Scope Sarah confirmed while shaping the original on 2026-10-06:
- Error reporting only. Performance tracing, Session Replay and Sentry's Logs feature are out.
- Sentry reports from production and Vercel previews, not from local dev.
- Sarah hears about errors through Sentry's own alert, and through the root cause analysis session under **Routines**.
- It's Sentry, with no comparison of alternatives.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
