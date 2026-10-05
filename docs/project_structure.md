# .claude/
Claude Code skills, subagents, hooks and rules
# .github/
GitHub Actions workflows (see `docs/ci.md`)
# docs/
project documentation: structure, code conventions, styling, theme, unit tests, E2E tests, CI and the dev seed
# e2e/
Playwright E2E specs, grouped in folders by feature area (see `docs/e2e_tests.md`)
## _fixtures/
Playwright support code: the `test` and `expect` specs import, `signIn` and the memory-server launcher
# notes/                      
notes on planned work in Obsidian-flavored Markdown
## Roadmap.md
project roadmap with links to detailed notes
# scripts/
lefthook scripts, and scripts that check the notes vault
# seed/
`pnpm seed`, which fills the dev database with seeded users and sample data, and the sign-in link server (see `docs/seed.md`)
# src/
project source code
## _actions/
Next.js server functions
## _auth/
better-auth config and email actions
## _components/
reusable React components
## _hooks/
reusable React hooks
## _models/
Mongoose schemas + Zod types
## _theme/
Mantine theme
## _utils/
reusable utilities for global use in application
## app/
Next.js app directory
## env.ts
environment variables typed with Zod
# test/
test support code shared by unit tests, E2E tests and the seed
## auth.ts
test-only better-auth instance, used by the E2E factories, `signIn` and the seed, imported through `#auth`
## factories/
plain functions that create test data in the database for E2E tests and the seed, and their connection, imported through `#factories`
## fixtures/
unit-test data builders, imported through `#fixtures`
## mocks/
reusable unit-test mocks, imported through `#mocks`
## setup.ts
unit-test setup script
## utils/
unit-test helpers such as `it.byAccessLevels`, imported through `#test`
