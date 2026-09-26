---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
Small changes to lint, format, CI and dependency config. Each is too small for its own story, so they're collected here and handled in one sweep.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Changes to tooling config: `biome.jsonc`, `lefthook.yml`, `.github/`, `tsconfig.json`, `vitest.config.ts` and the like. AGENTS.md forbids editing project config without Sarah's explicit instruction. Scheduling this sweep is that instruction for the items in the frozen copy, and for nothing else.

# Items
%% Add each item as an unchecked box. Say which file (with line numbers), exactly what changes, and how and when it was found, e.g. "found by reading code while planning [[Note]], 2026-09-26". Items go stale, so /check-drift re-checks every one when a sweep is scheduled. If an item can't be done until another story lands, start it with `**Blocked by [[Story]]:**`. Block the item, never the whole sweep. Blocked items stay here when a sweep is frozen and roll over to the next one. %%
- [ ] In test files, put test libraries in their own import block at the top, the way `next`/`react` get their own block in other files. In the existing test override (`biome.jsonc:21-23`, `test/**/*` and `**/*/*.test.ts*`), add `assist.actions.source.organizeImports.options.groups`: a copy of the main list (`biome.jsonc:59`) with a new first group, `vitest`, `vitest/**`, `@vitest/*` and `@testing-library/*` (value imports, then type imports), followed by `:BLANK_LINE:`. An override replaces the whole list, so the copy has to be kept in step with the main one. Then run the formatter over the test files. Moved from the Roadmap 2026-09-26.

# Out of Scope
%% Related work that belongs to another story or sweep, with a link. %%

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] `pnpm lint` passes and the dev server starts as before.

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
