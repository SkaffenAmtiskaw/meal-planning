---
type: workflow
confirmed: 2026-09-26
---
# Where It Stands
Collecting items. Next: /tooling ^status

# Purpose
Changes to lint, format, CI and dependency config, found along the way and collected here until Sarah gets to them.

## What Belongs Here
Changes to tooling config: `biome.jsonc`, `lefthook.yml`, `.github/`, `tsconfig.json`, `vitest.config.ts` and the like. Each says what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. AGENTS.md forbids editing project config without Sarah's explicit instruction. Running /tooling on an item is that instruction for the config that item names, and for nothing else.

# Items
- [ ] In `.github/workflows/checks.yml`, stop the four check jobs (lint, type check, unit tests with coverage, build) from downloading MongoDB. `pnpm-workspace.yaml:5` lets `mongodb-memory-server`'s install script run, and it downloads `mongod` 8.0.32 on every `pnpm install` (`docs/e2e_tests.md`, "MongoDB Version"). Each job runs on its own runner with its own install, so every PR into `main`, opened or pushed to, downloads it four times, though only the E2E tests use it. This only makes the checks slower, not wrong. Two fixes: set `MONGOMS_DISABLE_POSTINSTALL` on the four check jobs (the package reads it at `mongodb-memory-server-core/lib/util/postinstallHelper.js:11`), leaving it unset for the E2E job [[E2E Tests in CI]] adds, or cache the binary. Found by the `rule-auditor` during `/architect` on CI Checks, 2026-09-29. 🎯 [[Dev Tooling]]
- [ ] Remove the pnpm pin from `package.json:70` (`"packageManager": "pnpm@10.14.0"`), so pnpm follows `latest` from `mise.toml:3` the way Node does. mise installs pnpm 11.8.0, but `pnpm --version` in the repo prints 10.14.0, because pnpm switches to the version `packageManager` names. Sarah wants her tools to follow `latest` so she never has to remember to update them (`docs/ci.md`, "Tools Come from `mise.toml`", records this for Node). Before removing the field, check how Vercel picks its pnpm version without it, so the production build doesn't change unnoticed. Found during `/infra-design` on CI Checks, 2026-09-30. 🎯 [[Dev Tooling]]
- [ ] In `.github/workflows/checks.yml`, stop the four check jobs (lint, type-check, unit-tests, build) from each repeating the same three setup steps: `actions/checkout@v7`, `jdx/mise-action@v4` with `install_args: node pnpm`, and `pnpm install --frozen-lockfile` (lines 30-34, 40-44, 50-54 and 60-64). Three options, and it needs a decision: 🎯 [[Dev Tooling]]
	- a local composite action such as `.github/actions/setup/action.yml` holding the mise and install steps;
	- YAML anchors, which GitHub Actions has supported since 2025-09-18 but which save only a few lines, since each job still lists three aliases;
	- leave it as it is.

	Sarah decided 2026-09-30 that this isn't urgent, because it saves only a few lines today, and that it's worth doing if the setup grows. Found by the leftovers-checker during `/final-review` of PR Checks, 2026-09-30.
- [ ] Make a Biome lint warning fail the checks. Biome reports an unused variable as a warning (`lint/correctness/noUnusedVariables`), and `pnpm lint:ci` (`biome ci`, run by the `lint` job at `.github/workflows/checks.yml:36`) exits 0 on warnings. So a warning never fails CI anywhere in the project (`src/`, `test/`, `e2e/`, `seed/`, `scripts/`), and lefthook's pre-commit `biome check --write` doesn't block on it either. There are two fixes, and choosing one needs a decision: change the `lint:ci` script in `package.json` to `biome ci --error-on-warnings`, or raise specific rules to `error` in `biome.jsonc`. Either may first need the existing warnings cleared, so check what `pnpm lint:ci` reports now. Found 2026-10-04 while running Step 2's acceptance check of [[Dependency Update PRs]]. 🎯 [[Dev Tooling]]
- [ ] **Upgrade `@biomejs/biome` 2.4.6 → 2.5.15** - the `dependency-updates` routine dropped this minor on 2026-10-05 because `pnpm lint:ci` fails on it ([PR #25](https://github.com/SkaffenAmtiskaw/meal-planning/pull/25), **Dropped**). It is now in the routine's reported list, so no later run mentions it until a newer Biome releases, and that session will likely drop it again for the same reason. In one change, apply what 2.5.15 reports, then bump it by hand with `pnpm update "@biomejs/biome@2.5.15"`:
  - `src/app/[planner]/recipes/[recipeId]/page.tsx:39:15` has a `lint/complexity/noExtraBooleanCast` finding.
  - Biome 2.5's formatting changes in `src/_actions/sharing/leavePlanner.test.ts` and `src/_actions/sharing/removeMember.test.ts`.

  Then `pnpm lint:ci` passes. Found 2026-10-05 in the session summary of the first real run. 🎯 [[Dev Tooling]]
