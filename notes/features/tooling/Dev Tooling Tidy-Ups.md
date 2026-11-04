---
type: workflow
confirmed: 2026-09-26
---
# Where It Stands
Collecting items. Next: /tooling ^status

# Purpose
Changes to lint, format, CI and dependency config, found along the way and collected here until Sarah gets to them.

## What Belongs Here
Changes to tooling config: `biome.jsonc`, `lefthook.yml`, `.github/`, `tsconfig.json`, `vitest.config.ts` and the like. Each says what's wrong, where it reaches and why. An item may still need a decision: /tooling settles it with Sarah. AGENTS.md forbids editing project config without Sarah's explicit instruction. Running /tooling on an item is that instruction for the config that item names, and for nothing else.

# Items
- [ ] In `.github/workflows/checks.yml`, stop the four check jobs (lint, type check, unit tests with coverage, build) from downloading MongoDB. `pnpm-workspace.yaml:5` lets `mongodb-memory-server`'s install script run, and it downloads `mongod` 8.0.32 on every `pnpm install` (`docs/e2e_tests.md`, "MongoDB Version"). Each job runs on its own runner with its own install, so every PR into `main`, opened or pushed to, downloads it four times, though only the E2E tests use it. This only makes the checks slower, not wrong. Two fixes: set `MONGOMS_DISABLE_POSTINSTALL` on the four check jobs (the package reads it at `mongodb-memory-server-core/lib/util/postinstallHelper.js:11`), leaving it unset for the E2E job [[E2E Tests in CI]] adds, or cache the binary. Found by the `rule-auditor` during `/architect` on CI Checks, 2026-09-29.
- [ ] pnpm in the repo isn't the latest version, though Sarah expects mise to keep her on it: "Shouldn't mise be keeping me up to date on pnpm? Maybe make a note to investigate that". Seen on her machine 2026-11-03:
  - `pnpm install` in the repo runs pnpm 10.14.0 and prints an update banner for 12.16.1.
  - `package.json:76` has `"packageManager": "pnpm@10.14.0"`, and `pnpm --version` in the repo prints that version.
  - `mise.toml:5` asks for pnpm `latest`, but `mise outdated pnpm` reports current 11.8.0 and latest 12.16.1, so `latest` doesn't move an installed version on its own.
  - `which -a pnpm` lists a corepack shim first (`~/.local/share/mise/installs/node/lts/bin/pnpm`, `-> ../lib/node_modules/corepack/dist/pnpm.js`), and mise's own `installs/pnpm/latest/pnpm` second.

  Sarah wants her tools to follow `latest` so she never has to remember to update them (`docs/ci.md`, "Tools Come from `mise.toml`", records this for Node). Investigate which of these keeps her off the latest pnpm. Also check how Vercel picks its pnpm version, so the production build doesn't change unnoticed. Found during `/infra-design` on CI Checks, 2026-09-30; widened 2026-11-03 after a `pnpm install` at the end of a `/tooling` session on Sweep Implement Review.
- [ ] In `.github/workflows/checks.yml`, stop the four check jobs (lint, type-check, unit-tests, build) from each repeating the same three setup steps: `actions/checkout@v7`, `jdx/mise-action@v4` with `install_args: node pnpm`, and `pnpm install --frozen-lockfile` (lines 30-34, 40-44, 50-54 and 60-64). Three options, and it needs a decision:
	- a local composite action such as `.github/actions/setup/action.yml` holding the mise and install steps;
	- YAML anchors, which GitHub Actions has supported since 2025-09-18 but which save only a few lines, since each job still lists three aliases;
	- leave it as it is.

	Sarah decided 2026-09-30 that this isn't urgent, because it saves only a few lines today, and that it's worth doing if the setup grows. Found by the leftovers-checker during `/final-review` of PR Checks, 2026-09-30.
- [ ] Make a Biome lint warning fail the checks. Biome reports an unused variable as a warning (`lint/correctness/noUnusedVariables`), and `pnpm lint:ci` (`biome ci`, run by the `lint` job at `.github/workflows/checks.yml:36`) exits 0 on warnings. So a warning never fails CI anywhere in the project (`src/`, `test/`, `e2e/`, `seed/`, `scripts/`), and lefthook's pre-commit `biome check --write` doesn't block on it either. There are two fixes, and choosing one needs a decision: change the `lint:ci` script in `package.json` to `biome ci --error-on-warnings`, or raise specific rules to `error` in `biome.jsonc`. Either may first need the existing warnings cleared, so check what `pnpm lint:ci` reports now. Found 2026-10-04 while running Step 2's acceptance check of Dependency Update PRs.
