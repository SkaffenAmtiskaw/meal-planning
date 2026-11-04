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
- [ ] `jsdom` 29.0.1 → 30.1.3 and `@types/jsdom` 28.0.1 → 30.0.0: [release notes](https://github.com/jsdom/jsdom/releases/tag/v30.0.0). The only breaking change is the minimum Node version, `^22.22.2 || ^24.15.0 || >=26.0.0`, which `mise.toml`'s `node = 'latest'` meets. No file imports `jsdom`; `vitest.config.ts` sets `environment: 'jsdom'`. Bump both. On a trial bump `pnpm check:types` and `pnpm test:coverage` passed. Found by the dependency-updates routine, 2026-11-04.
- [ ] `@types/node` 24.3.3 → 26.6.6: [npm page](https://www.npmjs.com/package/@types/node) (no GitHub releases page). Node here is `latest` (26) per `mise.toml`, so the types should match it. Bump it. On a trial bump `pnpm check:types` passed. Found by the dependency-updates routine, 2026-11-04.

# Out of Scope
- Majors of the assessed libraries: [[Dependency Release Analysis]].
- An upgrade too big for a sweep, or one that fixes an advisory: it gets its own Roadmap line.

# Acceptance Criteria
- [ ] The flows each upgraded package is used in behave as before.

# Implementation
