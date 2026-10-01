---
type: workflow
confirmed: 2026-09-26
---
# Where It Stands
Collecting items. ^status

# Purpose
Changes to lint, format, CI and dependency config, found along the way and collected here until Sarah gets to them.

## What Belongs Here
Changes to tooling config: `biome.jsonc`, `lefthook.yml`, `.github/`, `tsconfig.json`, `vitest.config.ts` and the like. Each says what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. AGENTS.md forbids editing project config without Sarah's explicit instruction. Running /tooling on an item is that instruction for the config that item names, and for nothing else.

# Items
- [ ] In `.github/workflows/checks.yml`, stop the four check jobs (lint, type check, unit tests with coverage, build) from downloading MongoDB. `pnpm-workspace.yaml:5` lets `mongodb-memory-server`'s install script run, and it downloads `mongod` 8.0.32 on every `pnpm install` (`docs/e2e_tests.md`, "MongoDB Version"). Each job runs on its own runner with its own install, so every PR into `main`, opened or pushed to, downloads it four times, though only the E2E tests use it. This only makes the checks slower, not wrong. Two fixes: set `MONGOMS_DISABLE_POSTINSTALL` on the four check jobs (the package reads it at `mongodb-memory-server-core/lib/util/postinstallHelper.js:11`), leaving it unset for the E2E job [[E2E Tests in CI]] adds, or cache the binary. Found by the `rule-auditor` during `/architect` on CI Checks, 2026-09-29.
- [ ] Remove the pnpm pin from `package.json:70` (`"packageManager": "pnpm@10.14.0"`), so pnpm follows `latest` from `mise.toml:3` the way Node does. mise installs pnpm 11.8.0, but `pnpm --version` in the repo prints 10.14.0, because pnpm switches to the version `packageManager` names. Sarah wants her tools to follow `latest` so she never has to remember to update them (`docs/ci.md`, "Tools Come from `mise.toml`", records this for Node). Before removing the field, check how Vercel picks its pnpm version without it, so the production build doesn't change unnoticed. Found during `/infra-design` on CI Checks, 2026-09-30.
- [ ] In `.github/workflows/checks.yml`, stop the four check jobs (lint, type-check, unit-tests, build) from each repeating the same three setup steps: `actions/checkout@v7`, `jdx/mise-action@v4` with `install_args: node pnpm`, and `pnpm install --frozen-lockfile` (lines 30-34, 40-44, 50-54 and 60-64). Three options, and it needs a decision:
	- a local composite action such as `.github/actions/setup/action.yml` holding the mise and install steps;
	- YAML anchors, which GitHub Actions has supported since 2025-09-18 but which save only a few lines, since each job still lists three aliases;
	- leave it as it is.

	Sarah decided 2026-09-30 that this isn't urgent, because it saves only a few lines today, and that it's worth doing if the setup grows. Found by the leftovers-checker during `/final-review` of PR Checks, 2026-09-30.
- [ ] Add the GitHub CLI to `mise.toml` (`gh = 'latest'`, after the `rtk` line at line 6), so local agent sessions can open PRs and read Actions runs. `gh` isn't on Sarah's PATH, and tools the repo's hooks, scripts or workflow need come from the repo, not her PATH. CI (`.github/workflows/checks.yml`, `install_args: node pnpm`) and the routines' cloud environment (setup script `mise install node pnpm`) install only node and pnpm. They already have `gh` from the runner and the cloud image, so they keep leaving it out, and neither the workflow nor the setup script changes. `docs/ci.md` "Tools Come from `mise.toml`" already covers that, so it needs no new line. Sarah still has to run `gh auth login` once on her machine, which no config can do for her. Found during `/implement` on CI Failure Sessions Step 4, when the agent tried to open the three acceptance-check PRs. Without `gh`, and with the built-in browser not signed in to GitHub, it couldn't, so Sarah opened them by hand. 🎯 [[Dev Foundations]]
