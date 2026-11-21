This doc is a map of the repo for anyone new to it: each top-level folder, the main folders and files inside `src/`, `test/` and `e2e/`, and the separate notes repo. Each entry says what it holds and, where there is one, the doc that covers it. It assumes nothing about the project.

# .claude/
Claude Code skills, subagents and hooks
# .github/
GitHub Actions workflows (see `docs/ci.md`)
# biome-plugins/
Biome lint rules written as GritQL plugins, which `biome.jsonc` loads
# docs/
project documentation, one doc for each part of the codebase or its setup
# e2e/
Playwright E2E specs, grouped in folders by feature area, with what an area's specs share in its `_helpers/` folder (see `docs/e2e_tests.md`)
## _fixtures/
Playwright support code, and what `playwright.config.ts` uses to start a run
# Notes
notes on planned work, in Obsidian-flavored Markdown, live in the `meal-planning-notes` repo beside this one. Its `Roadmap.md` is the project roadmap, with links to detailed notes (see `docs/services.md`, "The Notes Repo", for how it's kept in sync)
# scripts/
scripts that the git hooks, the workflows and the SessionStart hook run, such as the notes vault checks, the database backups (see `docs/backups.md`) and the worktree scripts (see `docs/branching.md`). `release-tasks/` holds the one-off changes to production's data that the next release runs (see `docs/release_tasks.md`)
# seed/
`pnpm seed`, which fills the dev database with seeded users and sample data, the sign-in link server, and the script that empties a worktree's database (see `docs/seed.md`). In a story's worktree, `stories/` holds the story's data file, which git ignores and `pnpm seed <story>` loads on top of the seed
# src/
project source code
## _actions/
Next.js server functions
## _auth/
better-auth's server setup, and the browser client the app signs users in with
## _components/
generic React components that know nothing about the app's domain (see `docs/project_conventions.md`, "Generic vs Domain-Specific Code")
## _email/
the email senders, which send the app's emails through Resend
## _hooks/
generic React hooks, each with any component that only supports it (see `docs/project_conventions.md`, "Generic vs Domain-Specific Code" and "Hooks and Their Supporting Components")
## _models/
the zod schemas of the stored data, and in `database/` the data module that reads and writes it (see `docs/project_conventions.md`, "Stored Data")
## _reporting/
the PostHog error reporting (see `docs/project_conventions.md`, "Error Reporting")
## _theme/
the Mantine theme and the app's color values (see `docs/theme.md`). If a component's theme default needs a CSS module, such as for a hover rule the theme can't set, the default and its CSS module share a folder, `components/<Component>/`. Otherwise the default sits in `theme.ts`. The folder keeps everything that sets the component's look in one place
## _utils/
generic utilities that know nothing about the app's domain (see `docs/project_conventions.md`, "Generic vs Domain-Specific Code")
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
plain functions that create test data for E2E tests and the seed, writing through the data module, and the functions that open and close the module's database connection. All are imported through `#factories/<name>`
## fixtures/
unit-test data builders, imported through `#fixtures`
## mocks/
reusable unit-test mocks, imported through `#mocks`
## setup.ts
unit-test setup script
## utils/
unit-test helpers, imported through `#test`
