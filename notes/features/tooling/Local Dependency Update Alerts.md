---
type: infra
status: idea
confirmed: 2026-10-02
---
# Where It Stands
Decisions made. Next: /infra-design ^status

Shaped 2026-10-02 as one infra story: a check finds dependency updates and starts a Claude Code session that opens PRs for small and security updates and assesses major updates of the libraries the app leans on. Decided 2026-10-02 that the check is a scheduled GitHub workflow that starts a cloud routine only when it finds something. The Design, Conventions and Setup Outside the Repo sections remain.

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
     - Dependabot: a routine's GitHub pull request trigger, filtered by author, can start a session when Dependabot opens a PR, with no workflow in between. The docs don't say whether bot-authored PRs trigger it, so one real PR should confirm it. Workflows that Dependabot triggers get no Actions secrets, but they do get Dependabot secrets, so a copy of the routine's URL and token stored there would let them start one. Security-update PRs target the default branch, which is `develop`. (code.claude.com/docs/en/routines, docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)
     - A scheduled check: a scheduled routine leaves a session on every run, and a run that finds nothing must leave no session in Sarah's Code tab (see `docs/ci.md`, "Starting a Routine"). So the check has to run somewhere else and start the routine only when it finds an update.
     - Either way, a cloud session sees only what Sarah has pushed, so it can miss dependencies she's added on `develop` but not pushed yet.
   - **Decided 2026-10-02:** a scheduled GitHub workflow on `develop` runs a `pnpm` script that checks for outdated packages and security advisories, and fires a routine through `/fire` only when it finds something. Turning on GitHub's Dependabot alerts (security only, no PRs) as a safety net that starts nothing is optional; Sarah may not need it if `pnpm audit` runs hourly. It's the only option that meets all four Goals with one mechanism, and it follows `docs/ci.md` ("Starting a Routine").
     - Rejected: Dependabot version updates with a routine PR trigger - it opens bare version-bump PRs for majors, against Goal 4, and ignoring majors means a second check has to find them anyway
     - Rejected: Renovate - a third-party app with write access to a public repo, and a major held on its dashboard can't start an assessment session
     - Rejected: a check on Sarah's machine - it doesn't run while the Mac is off, the handoff into the Desktop app is untested, and the unattended session would use her own `gh` login, which can reach production
     - Rejected: Dependabot security-update PRs, to start a session as soon as an alert lands - a fix that needs a major arrives as a PR without Sarah's say-so, and GitHub has no workflow or routine trigger for the alert itself

# Design
Questions for this section:
- How often does the check run?
  - Research 2026-10-02 (/decide, Open Decision 1): `pnpm audit` could run hourly on its own schedule, apart from a slower `pnpm outdated` run, so a new advisory reaches a session within about an hour (scheduled runs can start late). Actions minutes are free for a public repo. Whether Dependabot alerts are worth turning on depends on this.
- Which non-major updates get a PR (patches only, or minor versions too), and do the updates from one run go in one PR or one PR each?
- Which libraries get a major-update assessment, and what happens to major updates of the rest?
  - **Decided 2026-10-02:** React, Next and Mantine get one. Sarah's call.
  - **Leaning 2026-10-02:** better-auth probably, luxon might also make the list; Zod maybe, though it seems less critical, and Sarah is willing to hear arguments for it. Not checked yet.
  - **Leaning 2026-10-02:** smaller libraries that do one specific thing don't need an exhaustive evaluation; they're added to a list of updates that get rolled in whenever a goal is drawn from [[App Health]]. Not checked yet.
- Where does a major-update assessment end up?
  - **Decided 2026-10-02:** it stays in the session until Sarah reviews it. She may ask the session to create a note after she's looked at it, and she makes the final call on prioritizing it. Sarah's call.
- How does a run avoid starting a new session for updates it has already reported that Sarah hasn't handled yet?

# Conventions

# Setup Outside the Repo

# Out of Scope
- The tools in `mise.toml`: they ask for `latest`, so they update themselves.
- Watching tools and libraries for new features worth adopting: that's its own line under [[Dev Foundations]] on the Roadmap.

# Implementation
