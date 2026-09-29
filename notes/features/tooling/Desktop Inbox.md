---
type: pattern
status: idea
blocked-by:
  - "decision needed: what reaches Sarah's desktop, and whether the inbox runs in the cloud or on her machine"
confirmed: 2026-09-29
---
# Where It Stands
Next: /decide, then /architect ^status

A convention for how every source of results reaches Sarah's desktop, proven with one first delivery, the way [[E2E Test Setup]] proved its Rules with one first test. [[Local Dependency Update Alerts]], [[Automatic Root Cause Analysis]], [[CI Checks]] and [[E2E Tests in CI]] build on it.

# Purpose
Results that happen away from Sarah's machine reach her desktop, in one place she sees when she sits down to work, without her opening GitHub or checking her email. Every source hands its results over the same way.

Split out 2026-09-29 with `/tooling`, while looking at the Dependabot item in [[Dev Tooling Tidy-Ups]]: these stories all needed the same way of reaching Sarah.

# Root Cause
Sarah is the sole maintainer: she opens GitHub only to merge into `main`, and she doesn't check her email often enough to rely on it. So results that GitHub or email would normally deliver don't reach her, and without one convention each story that produces them would invent its own way.

These stories produce results for it to deliver, and wait for it:
- [[Local Dependency Update Alerts]]: new dependency versions and security advisories.
- [[Automatic Root Cause Analysis]]: the agent's analysis of a Sentry error or a failed E2E test.
- [[CI Checks]] and [[E2E Tests in CI]]: failed checks on the PR from `develop` into `main`.

The watch-tools line under [[Dev Foundations]] on the Roadmap needs it too, for new releases or features in tools Sarah follows. Its agent is meant to write an idea note into the vault, so it may only need to point to that note.

# Open Decisions
1. What reaches Sarah's desktop when something happens: a Claude Code session working on the issue, a note in the vault, a desktop notification or something else? Candidates for notifications: ntfy, Pushover, terminal-notifier.
   - **Leaning 2026-09-29:** a Claude Code session addressing whatever the issue is. Not checked yet. Sarah has questions about what it will look like.
2. Where does the inbox's work run: in the cloud, where it can react to an event as it happens and keeps running while her laptop is closed, or on her machine on a schedule, only while it's on? Candidates: Claude Code cloud routines (scheduled, GitHub-event and API triggers), `anthropics/claude-code-action` in GitHub Actions, Claude Code desktop scheduled tasks.
   - **Leaning 2026-09-29:** the cloud. Not checked yet. Sarah has detailed questions to go over in `/decide`.

# Rules
Questions for this section:
- What does an inbox entry contain?
- How does a source hand a result to the inbox?
- Which result is the first delivery that proves the Rules?

# Enforcement

# Migration Checklist

# Out of Scope
- Finding dependency updates, whether with Dependabot or a local `pnpm outdated` / `pnpm audit` check: [[Local Dependency Update Alerts]].
- Watching tools that aren't npm packages, such as Vercel or MongoDB, for new releases or features: the watch-tools line under [[Dev Foundations]] on the Roadmap.

# Implementation
