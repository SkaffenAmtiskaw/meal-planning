---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-11-03
---
# Where It Stands
Collecting items. Next: /roadmap when a goal starts building ^status

# Inbox

# Purpose
Small upgrades of packages in `devDependencies` that the `dependency-updates` routine's session finds but can't apply in its pull request. The session adds the items here, and they join the next release.

## What Belongs Here
A small upgrade with no decision to make, of one of two kinds: a major of any package other than the assessed libraries that the `dependency-updates` skill names, or the fix for an update of any package that the session dropped because it broke a check.

- One item per upgrade. Packages that have to move together share one item, such as `vitest` and `@vitest/coverage-v8`.
- Each item names the package, its current and new versions, and a link to its release notes or migration guide. It also names the work, with its files: each breaking change the app hits, or each finding or failure that got the update dropped. It ends "found by the dependency-updates routine" and the date.
- An `@types/*` package goes where its library goes. If its library isn't in `package.json`, it goes by its own section, so `@types/node` goes here.
- Never here: a major of an assessed library's `@types/*` package, and any security fix.

# Items

# Out of Scope
- Majors of the assessed libraries: [[Dependency Release Analysis]].
- An upgrade too big for a sweep, or one that fixes an advisory: it gets its own Roadmap line.

# Acceptance Criteria
- [ ] The flows each upgraded package is used in behave as before.

# Implementation
