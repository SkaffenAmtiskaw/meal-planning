# .claude/
Claude Code skills, subagents and hooks
# .github/
GitHub Actions workflows: the PR checks, the dependency check and the hotfix back-merge (see `docs/ci.md`)
# docs/
project documentation: structure, code conventions, styling, theme, unit tests, E2E tests, CI, the dev seed, branching and releases, and the services and environments the app runs on
# e2e/
Playwright E2E specs, grouped in folders by feature area (see `docs/e2e_tests.md`)
## _fixtures/
Playwright support code: what specs import (the `test` fixture and the fixtures it's built from, `expect`, `signIn`, shared form steps and the email helpers), the launchers for the memory server and the fake Resend API, and the free-port utility `playwright.config.ts` uses
# Notes
notes on planned work, in Obsidian-flavored Markdown, live in the `meal-planning-notes` repo beside this one. Its `Roadmap.md` is the project roadmap, with links to detailed notes

The Obsidian Git plugin keeps that repo in sync with its `main` on GitHub: it commits and pushes changes five minutes after edits stop, and pulls every five minutes and when Obsidian opens. Routines and cloud sessions read the notes from GitHub, not from the copy on Sarah's Mac. So when one needs edits the plugin hasn't pushed yet, Sarah runs Obsidian Git's Commit-and-sync command by hand. Edits stay unpushed for five minutes after they stop, or until Obsidian next opens if it was closed before then.
# scripts/
lefthook scripts, scripts that check the notes vault, the two checks that decide whether CI starts a routine (the dependency check and the Vercel deployment check), the release freeze check, and the SessionStart hook's scripts, which keep `develop` current and set up and remove worktrees (see `docs/branching.md`)
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
