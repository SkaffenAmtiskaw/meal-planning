---
type: infra
status: idea
blocked-by:
  - "decision needed: where the check for updates runs, and so where its session runs"
confirmed: 2026-10-02
---
# Where It Stands
Next: /decide, then /infra-design ^status

Shaped 2026-10-02 as one infra story: a check finds dependency updates and starts a Claude Code session that opens PRs for small and security updates and assesses major updates of the libraries the app leans on. Where the check runs, and so whether that session is local or a cloud routine's, is still open.

# Inbox
- Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Purpose
Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email. It's a Done When item of [[Dev Foundations]].

Sarah is the sole maintainer, so she doesn't check GitHub for new PRs every day, and an email from GitHub about an update is easy to miss among the rest. This story finds the updates and hands them to Sarah as a Claude Code session.

# Goals
- [ ] New versions of the npm dependencies in `package.json`, including security advisories, are found without Sarah checking for them.
- [ ] What's found reaches Sarah as a Claude Code session she sees in the Claude desktop app, started only when something is found.
- [ ] Small patches, especially security ones, get a PR without Sarah asking.
- [ ] A major update to a library the app depends on heavily gets an assessment of how much effort the upgrade would be and how much the app would benefit, and no PR without Sarah's say-so.

# Open Decisions
1. Where does the check that finds updates run? Sarah sees pros and cons for both a local and a cloud check, and wants them laid out.
   - Candidates: Dependabot (moved here from [[Dev Tooling Tidy-Ups]] 2026-09-29; there's no `.github/dependabot.yml` yet) or Renovate on GitHub; a scheduled GitHub workflow running something like `pnpm outdated` and `pnpm audit`; a scheduled check on Sarah's machine.
   - Where the check runs decides what kind of session it starts. A cloud check starts a routine, following `docs/ci.md` ("Starting a Routine"). A local check could start a local session instead, which would also see dependencies Sarah hasn't pushed yet.
   - Dependabot opens a PR for each update, and it pauses its updates when nobody interacts with its PRs, which fits badly with Sarah opening GitHub only to merge into `main`.
   - Research from 2026-09-29:
     - Dependabot: a routine's GitHub pull request trigger, filtered by author, can start a session when Dependabot opens a PR, with no workflow in between. The docs don't say whether bot-authored PRs trigger it, so one real PR should confirm it. Workflows that Dependabot triggers get no Actions secrets, so they can't start a routine themselves. `target-branch: develop` in `dependabot.yml` covers version updates only; security-update PRs always target `main`. (code.claude.com/docs/en/routines, docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)
     - A scheduled check: a scheduled routine leaves a session on every run, and a run that finds nothing must leave no session in Sarah's Code tab (see `docs/ci.md`, "Starting a Routine"). So the check has to run somewhere else and start the routine only when it finds an update.
     - Either way, a cloud session sees only what Sarah has pushed, so it can miss dependencies she's added on `develop` but not pushed yet.

# Design
Questions for this section:
- How often does the check run?
- Which non-major updates get a PR (patches only, or minor versions too), and do the updates from one run go in one PR or one PR each?
- Which libraries get a major-update assessment, and what happens to major updates of the rest?
  - **Decided 2026-10-02:** React, Next and Mantine get one. Sarah's call.
  - **Leaning 2026-10-02:** better-auth probably, luxon might also make the list; Zod maybe, though it seems less critical, and Sarah is willing to hear arguments for it. Not checked yet.
  - **Leaning 2026-10-02:** smaller libraries that do one specific thing don't need an exhaustive evaluation; they're added to a list of updates that get rolled in whenever a goal is drawn from [[App Health]]. Not checked yet.
- Where does a major-update assessment end up?
  - **Decided 2026-10-02:** it stays in the session until Sarah reviews it. She may ask the session to create a note after she's looked at it, and she makes the final call on prioritizing it. Sarah's call.

# Conventions

# Setup Outside the Repo

# Out of Scope
- The tools in `mise.toml`: they ask for `latest`, so they update themselves.
- Watching tools and libraries for new features worth adopting: that's its own line under [[Dev Foundations]] on the Roadmap.

# Implementation
