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
- [ ] `jsdom` 29.0.1 → 30.1.3 with `@types/jsdom` 28.0.1 → 30.0.0: the only breaking change is the minimum Node, now `^22.22.2 || ^24.15.0 || >=26.0.0`. Work: confirm the Node used by CI and Vercel meets it, then bump both. [Release notes](https://github.com/jsdom/jsdom/releases), found by the dependency-updates routine, 2026-11-04.
- [ ] `@types/node` 24.3.3 → 26.6.6: work: match it to the Node major CI and Vercel run, then fix any type errors `pnpm check:types` reports. [npm page](https://www.npmjs.com/package/@types/node) (no GitHub releases page), found by the dependency-updates routine, 2026-11-04.
- [ ] `@biomejs/biome` 2.4.6 → 2.6.4: dropped because it breaks `pnpm lint:ci` with 9 errors. Work: fix the errors, including 7 `lint/correctness/noComponentHookFactories` errors in `CalendarContext.test.tsx`, `CalendarProvider.test.tsx`, `PlannerProvider.test.tsx`, `ToggleProvider.test.tsx` and `CalendarModalContext.test.tsx`, and 1 `lint/complexity/noExtraBooleanCast` error in `src/app/[planner]/recipes/[recipeId]/page.tsx:39`. 2.6.4 also warns that `linter.rules.recommended` in `biome.jsonc` is deprecated in favor of `preset`, which is a config change for Sarah to ask for. [Release notes](https://github.com/biomejs/biome/releases), found by the dependency-updates routine, 2026-11-04.

# Out of Scope
- Majors of the assessed libraries: [[Dependency Release Analysis]].
- An upgrade too big for a sweep, or one that fixes an advisory: it gets its own Roadmap line.

# Acceptance Criteria
- [ ] The flows each upgraded package is used in behave as before.

# Implementation
