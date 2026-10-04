---
type: workflow
confirmed: 2026-09-26
---
# Where It Stands
Kicked off. Next: /tooling ^status

Kicked off 2026-10-02 from [[Dev Tooling Tidy-Ups]] with the item that serves [[Dev Foundations]].

# Purpose
Changes to lint, format, CI and dependency config, found along the way and collected here until Sarah gets to them.

## What Belongs Here
Changes to tooling config: `biome.jsonc`, `lefthook.yml`, `.github/`, `tsconfig.json`, `vitest.config.ts` and the like. Each says what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. AGENTS.md forbids editing project config without Sarah's explicit instruction. Running /tooling on an item is that instruction for the config that item names, and for nothing else.

# Items
- [ ] Add the GitHub CLI to `mise.toml` (`gh = 'latest'`, after the `rtk` line at line 6), so local agent sessions can open PRs and read Actions runs. `gh` isn't on Sarah's PATH, and tools the repo's hooks, scripts or workflow need come from the repo, not her PATH. CI (`.github/workflows/checks.yml`, `install_args: node pnpm`) and the routines' cloud environment (setup script `mise install node pnpm`) install only node and pnpm. They already have `gh` from the runner and the cloud image, so they keep leaving it out, and neither the workflow nor the setup script changes. `docs/ci.md` "Tools Come from `mise.toml`" already covers that, so it needs no new line. Sarah still has to run `gh auth login` once on her machine, which no config can do for her. Found during `/implement` on CI Failure Sessions Step 4, when the agent tried to open the three acceptance-check PRs. Without `gh`, and with the built-in browser not signed in to GitHub, it couldn't, so Sarah opened them by hand. 🎯 [[Dev Foundations]]
