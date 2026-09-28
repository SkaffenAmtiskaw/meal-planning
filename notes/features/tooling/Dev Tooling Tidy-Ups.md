---
type: workflow
confirmed: 2026-09-26
---
# Where It Stands
Collecting items. Next: /workflow ^status

# Purpose
Changes to lint, format, CI and dependency config, found along the way and collected here until Sarah gets to them.

## What Belongs Here
Changes to tooling config: `biome.jsonc`, `lefthook.yml`, `.github/`, `tsconfig.json`, `vitest.config.ts` and the like. Each says what to change, where, why, and how and when it was found. An item may still need a decision: /workflow settles it with Sarah. AGENTS.md forbids editing project config without Sarah's explicit instruction. Running /workflow on an item is that instruction for the config that item names, and for nothing else.

# Items
- [ ] In test files, put test libraries in their own import block at the top, the way `next`/`react` get their own block in other files. In the existing test override (`biome.jsonc:21-23`, `test/**/*` and `**/*/*.test.ts*`), add `assist.actions.source.organizeImports.options.groups`: a copy of the main list (`biome.jsonc:59`) with a new first group, `vitest`, `vitest/**`, `@vitest/*` and `@testing-library/*` (value imports, then type imports), followed by `:BLANK_LINE:`. An override replaces the whole list, so the copy has to be kept in step with the main one. Then run the formatter over the test files. Moved from the Roadmap 2026-09-26.
- [ ] Enable Dependabot for npm (there's no `.github/` yet). Open questions: how often it runs, and whether minor/patch updates are grouped into one PR. Moved from the Roadmap 2026-09-27.
- [ ] Turn off Biome's a11y checks for unit test mocks: inline mocks in `*.test.tsx` files, and the shared mocks in `test/mocks/**`. Moved from the Roadmap 2026-09-27.
