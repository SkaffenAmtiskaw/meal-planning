# CI
- CI runs on [GitHub Actions](https://docs.github.com/en/actions). The workflows live in `.github/workflows/`.
- `checks.yml` runs lint, type check, unit tests and build on every PR.

# Workflows

## Every Check Is a `package.json` Script
Every check a workflow runs is a `package.json` script, called as `pnpm <script>`. The only other steps are setup (checking out the code, installing tools and dependencies) and, later, the step that starts a routine. That way you, or a cloud session looking into a failure, can rerun exactly what CI ran with the same command.

No script CI runs writes fixes. CI would pass on code it had silently fixed, then throw the fix away. That's why the lint job runs `pnpm lint:ci` (`biome ci`, which only reports) and not `pnpm lint` (`biome check --write`).

## Tools Come from `mise.toml`
A workflow installs Node, pnpm and any other tool it needs with [`jdx/mise-action`](https://github.com/jdx/mise-action), which runs `mise install` against `mise.toml`. So CI runs the same versions as your machine. `mise.toml` asks for `latest`, so a new release reaches CI and your machine alike, without anyone updating a version.

No workflow names a Node or pnpm version of its own, or uses `actions/setup-node`.

CI installs only `node` and `pnpm` (the action's `install_args`), since it doesn't need the other tools in `mise.toml`. If a workflow needs another tool, add it to `mise.toml` and to that workflow's `install_args`.

# Checks on PRs
`checks.yml` runs on every PR, whatever its base branch. It has four jobs:

| Job | Runs |
|-----|------|
| `lint` | `pnpm lint:ci` |
| `type-check` | `pnpm check:types`, which generates Next's route types (`next typegen`) before running `tsc`, since a fresh checkout has none |
| `unit-tests` | `pnpm test:coverage`, so the 100% coverage thresholds in `vitest.config.ts` hold across the whole codebase. The pre-commit hook checks only staged files. |
| `build` | `pnpm build` |

Each check is its own job, so:
- the PR shows which check failed
- the ruleset on `main` can require each check by its job name (see "Setup Outside the Repo")
- each job runs in its own checkout, so the build never shares a `.next` folder with another job

Each job checks out the code, installs Node and pnpm from `mise.toml`, runs `pnpm install --frozen-lockfile`, then runs its one script.

The workflow's token can only read the repo (`permissions: contents: read`), since no check needs more. A new push to a PR cancels that PR's run still in progress, so the PR shows only the newest commit's results.

# Secrets and Environment Values
Wherever a workflow sets a variable from `src/env.ts`, the value is a dummy that passes the schema, such as `mongodb://localhost:27017/ci` for `DB_URL`. It's never a real value, such as the production database URL or a Resend API key, and never read from an Actions secret. The checks only need values that pass validation.

The dummies live in the `env:` block at the top of `checks.yml`, so every job sees the same values. When you add a variable to `src/env.ts`, give it a dummy there too, beside the unit-test value in `test/mocks/env.ts` and the E2E value in `playwright.config.ts` (see `docs/e2e_tests.md`, "Environment Variables").

# Setup Outside the Repo
Some of what CI needs lives in GitHub's settings, not in the repo. This section is its record.

## The Ruleset on `main`
A branch ruleset named `main` (Settings → Rules → Rulesets) targets `main`, with enforcement active and no bypass list. It has three rules:
- **Require status checks to pass:** `lint`, `type-check`, `unit-tests` and `build`, the four jobs in `checks.yml`. A PR into `main` can't be merged while any of them is failing. "Require branches to be up to date before merging" is off, since merging `develop` into `main` leaves merge commits on `main` that would make `develop` look out of date.
- **Restrict deletions:** `main` can't be deleted.
- **Block force pushes:** nobody can force-push to `main`.

The ruleset covers only `main`, so you can still push straight to `develop`.

When a check job in `checks.yml` is renamed, added or removed, change the ruleset's required checks and this record in the same change. That way every job is required, and every required check has a job to report it. A required check with no job never reports, and blocks every merge.
