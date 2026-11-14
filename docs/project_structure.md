This doc is a map of the repo for anyone new to it: each top-level folder, the main folders and files inside `src/`, `test/` and `e2e/`, and the separate notes repo. Each entry says what it holds and, where there is one, the doc that covers it. It assumes nothing about the project.

# .claude/
Claude Code skills, subagents and hooks
# .github/
GitHub Actions workflows (see `docs/ci.md`)
# docs/
project documentation, one doc for each part of the codebase or its setup
# e2e/
Playwright E2E specs, grouped in folders by feature area, with what an area's specs share in its `_helpers/` folder (see `docs/e2e_tests.md`)
## _fixtures/
Playwright support code, and what `playwright.config.ts` uses to start a run
# Notes
notes on planned work, in Obsidian-flavored Markdown, live in the `meal-planning-notes` repo beside this one. Its `Roadmap.md` is the project roadmap, with links to detailed notes (see `docs/services.md`, "The Notes Repo", for how it's kept in sync)
# scripts/
scripts that the git hooks, the workflows and the SessionStart hook run, such as the notes vault checks, the database backups (see `docs/backups.md`) and the worktree scripts (see `docs/branching.md`)
# seed/
`pnpm seed`, which fills the dev database with seeded users and sample data, the sign-in link server, and the script that empties a worktree's database (see `docs/seed.md`)
# src/
project source code
## _actions/
Next.js server functions
## _auth/
better-auth config and email actions
## _components/
reusable React components
## _hooks/
reusable React hooks, each with any component that only supports it (see `docs/project_conventions.md`)
## _models/
Mongoose schemas + Zod types
## _theme/
the Mantine theme and the app's color values (see `docs/theme.md`)
## _utils/
reusable utilities for global use in application
## app/
Next.js app directory
## env.ts
environment variables typed with Zod
## instrumentation.ts, instrumentation-client.ts
error reporting setup for the server and the browser (see `docs/project_conventions.md`, "Error Reporting")
# test/
test support code shared by unit tests, E2E tests and the seed
## auth.ts
test-only better-auth instance, used by the E2E factories, `signIn` and the seed, imported through `#auth`
## factories/
plain functions that create test data in the database for E2E tests and the seed, and their connection, imported through `#factories/<name>`
## fixtures/
unit-test data builders, imported through `#fixtures`
## mocks/
reusable unit-test mocks, imported through `#mocks`
## setup.ts
unit-test setup script
## utils/
unit-test helpers, imported through `#test`
