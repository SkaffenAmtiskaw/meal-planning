# Meal Planning
Meal Planning is a web app for planning a household's meals. You plan meals on a calendar, keep your recipes, and share a planner with other people at the access level you choose. It runs at https://www.meal-planning.net.

This README is for a web developer opening the repo for the first time.

## What It's Built With
The app is built with Next.js, React and Mantine, stores its data in MongoDB on Atlas, signs users in with better-auth and sends email through Resend. Unit tests run on Vitest, and E2E tests on Playwright.

## Running It Locally
The app needs the values in `.env.local` to start or build, and they come from the project's own accounts, such as its Atlas cluster and its Google sign-in client. `docs/services.md` lists each one and where it comes from. The pre-commit hook builds the app when you commit a change under `src/`, so committing one needs them too.

The one tool you install yourself is [mise](https://mise.jdx.dev), which installs every other command-line tool the repo needs, such as Node and pnpm, at the versions `mise.toml` declares. That way your machine runs the same versions as CI. Follow mise's [getting started guide](https://mise.jdx.dev/getting-started.html) to install it and activate it in your shell.

Then, from the repo's folder:
1. Run `mise trust`, then `mise install`.
2. Run `pnpm install`. This installs the dependencies, downloads the in-memory MongoDB that E2E tests run against, and sets up the pre-commit hook in `lefthook.yml`, which checks your staged changes before each commit.
3. Create `.env.local` with the variables `src/env.ts` declares. The app's database is on Atlas, so there's no local database to install.
4. Start the app at http://localhost:3000:
   - **To use it signed out:** run `pnpm dev`.
   - **To use it as a signed-in user:** run `pnpm seed`, then `pnpm dev:sign-in`. `pnpm dev:sign-in` starts the app along with a server that prints a sign-in link for each seeded user. Open one of the links to sign in as that user. `docs/seed.md` describes the seeded users and their data.

The tests need none of the `.env.local` values. `pnpm test` runs the unit tests. `pnpm test:e2e` runs the E2E tests, and first installs the browser they use. On Linux, Chromium also needs system libraries, so run `pnpm exec playwright install --with-deps chromium` once before your first E2E run. `docs/e2e_tests.md` says how a run works.

## Where to Read More
`docs/` describes the codebase, such as its structure, conventions, tests, CI and the services it runs on. `AGENTS.md` holds the instructions for AI agents working in the repo.
