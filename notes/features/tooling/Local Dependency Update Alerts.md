---
type: 
status: idea
blocked-by:
  - "[[Desktop Inbox]]"
confirmed: 2026-09-28
---
# Where It Stands
Blocked until [[Desktop Inbox]] lands, then /shape ^status

# Notes
Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email. It's a Done When item of [[Dev Foundations]].

Sarah is the sole maintainer, so she doesn't check GitHub for new PRs every day, and an email from GitHub about an update is easy to miss among the rest. [[Desktop Inbox]] gets results onto her desktop. This story finds the updates and hands them to it. The watch-tools line under [[Dev Foundations]] on the Roadmap is a similar idea for tools and features rather than dependencies.

Finding the updates could use Dependabot for npm, moved here from [[Dev Tooling Tidy-Ups]] 2026-09-29 (there's no `.github/` yet), or a local scheduled check such as `pnpm outdated` and `pnpm audit`. Dependabot opens a PR for each update, and it pauses its updates when nobody interacts with its PRs, which fits badly with Sarah opening GitHub only to merge into `main`.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
- Dependabot PRs, or a local scheduled check?
- How often does it run, and are minor/patch updates grouped together (into one PR, if it's Dependabot)?
