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
- [ ] **Blocked by [[CI Checks]]:** In `.github/workflows/checks.yml` (which CI Checks creates), stop the four check jobs (lint, type check, unit tests with coverage, build) from downloading MongoDB. `pnpm-workspace.yaml:5` lets `mongodb-memory-server`'s install script run, and it downloads `mongod` 8.0.32 on every `pnpm install` (`docs/e2e_tests.md`, "MongoDB Version"). Each job runs on its own runner with its own install, so every PR into `main`, opened or pushed to, downloads it four times, though only the E2E tests use it. This only makes the checks slower, not wrong. Two fixes: set `MONGOMS_DISABLE_POSTINSTALL` on the four check jobs (the package reads it at `mongodb-memory-server-core/lib/util/postinstallHelper.js:11`), leaving it unset for the E2E job [[E2E Tests in CI]] adds, or cache the binary. Found by the `rule-auditor` during `/architect` on [[CI Checks]], 2026-09-29.
