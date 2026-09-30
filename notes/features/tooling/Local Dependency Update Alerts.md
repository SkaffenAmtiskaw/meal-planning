---
type: 
status: idea
blocked-by:
  - "[[CI Failure Sessions]]"
confirmed: 2026-09-28
---
# Where It Stands
Blocked until [[CI Failure Sessions]] lands, then /shape ^status

# Notes
Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email. It's a Done When item of [[Dev Foundations]].

Sarah is the sole maintainer, so she doesn't check GitHub for new PRs every day, and an email from GitHub about an update is easy to miss among the rest. This story finds the updates and hands them to Sarah as a Claude Code cloud session, following the convention [[CI Checks]] sets up. The watch-tools line under [[Dev Foundations]] on the Roadmap is a similar idea for tools and features rather than dependencies.

Finding the updates could use Dependabot for npm, moved here from [[Dev Tooling Tidy-Ups]] 2026-09-29 (there's no `.github/` yet), or a local scheduled check such as `pnpm outdated` and `pnpm audit`. Dependabot opens a PR for each update, and it pauses its updates when nobody interacts with its PRs, which fits badly with Sarah opening GitHub only to merge into `main`.

Research from 2026-09-29, for the Dependabot-or-local-check question:
- Dependabot: a routine's GitHub pull request trigger, filtered by author, can start a session when Dependabot opens a PR, with no workflow in between. The docs don't say whether bot-authored PRs trigger it, so one real PR should confirm it. Workflows that Dependabot triggers get no Actions secrets, so they can't start a routine themselves. `target-branch: develop` in `dependabot.yml` covers version updates only; security-update PRs always target `main`. (code.claude.com/docs/en/routines, docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)
- A scheduled check: a scheduled routine leaves a session on every run, and a run that finds nothing must leave no session in Sarah's Code tab (see [[CI Checks]]). So the check has to run somewhere else and start the routine only when it finds an update.
- Either way, a cloud session sees only what Sarah has pushed, so it can miss dependencies she's added on `develop` but not pushed yet.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
- Dependabot PRs, or a local scheduled check?
- How often does it run, and are minor/patch updates grouped together (into one PR, if it's Dependabot)?
