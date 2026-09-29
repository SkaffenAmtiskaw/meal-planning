---
type: 
status: idea
blocked-by: []
confirmed: 2026-09-28
---
# Where It Stands
Next: /shape ^status

# Notes
Run lint, type check, unit tests and build automatically on every PR into `main`. It's a Done When item of [[Dev Foundations]].

There's no `.github/` yet, so nothing is checked outside Sarah's machine. The lefthook pre-commit hook runs Biome, tests and type checks on staged files, and a full `pnpm build` on every commit that touches `src/`. Dependabot, if [[Local Dependency Update Alerts]] uses it, and [[E2E Tests in CI]] (which wants E2E tests to run when `develop` opens a PR into `main`) both assume CI exists.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

[[Desktop Inbox]] was folded in 2026-09-29: besides running the checks, this story makes a failed check start a Claude Code cloud session for Sarah, and does the one-time setup every later source of results shares. Sarah is the sole maintainer. She opens GitHub only to merge into `main` and doesn't check email often enough to rely on it, so results that happen away from her machine have to reach her another way.

Decided with /decide 2026-09-29, on Desktop Inbox:
- **What reaches Sarah:** a Claude Code session working on the issue, waiting for her input in the Code tab of the Claude desktop app. Sarah's call: she opens the desktop app whenever she works on the app, so sessions can wait until then; checked against the Claude Code docs, which show cloud routine runs as sessions there.
  - Rejected: a desktop notification (ntfy, Pushover, terminal-notifier) - not needed, since sessions can wait until she opens the app; something more urgent would be a new story.
- **Where it runs:** the cloud. Sarah's call: work there reacts to events as they happen and keeps running while her laptop is closed; Claude Code cloud routines are the cloud option that starts a session in her Code tab.
  - Rejected: her machine on a schedule (Claude Code desktop scheduled tasks) - runs only while her machine is on.
- **Each source's call:** what its session has done before Sarah opens it (some only write notes, some start digging into a bug), what starts its routine, and which branch it works from.
- **Every source:** a run that finds nothing leaves no session in Sarah's Code tab.
- **This story's delivery:** a failed check on the PR into `main` starts a session working from the PR's branch (usually `develop`).

One-time setup this story does, for [[E2E Tests in CI]], [[Sentry Root Cause Analysis]], [[Local Dependency Update Alerts]] and the watch-tools line under [[Dev Foundations]]:
- Install the Claude GitHub App on the repo, and create the cloud environment the routines run in.
- Settle where a routine's instructions live: only in the routine on claude.ai, or in a checked-in skill its prompt runs.
- Write a doc of the convention above for later sources.

Research from 2026-09-29:
- Routines start from a schedule, the API (`/fire`) or a GitHub pull request or release event. A failed check can't start one directly: an `if: failure()` workflow step calls `/fire`, with the routine's URL and token kept as Actions secrets, as Anthropic's `/fire` docs show. `/fire` allows 30 calls an hour per routine, doesn't dedupe retries and is still experimental. (code.claude.com/docs/en/routines, platform.claude.com/docs/en/api/claude-code/routines-fire)
- A routine clones the default branch (`main`) unless its prompt checks out another. It pushes to `claude/` branches, and its PRs can target `develop`. It sees only what Sarah has pushed.
- A cloud session gets only what's in the repo: not Sarah's `~/.claude` memory or user settings, and not gitignored files such as `.env*` or the test login in `.opencode/secrets`.
- `anthropics/claude-code-action` posts to PR comments or the workflow log, not a session.

# Questions
