# CI
- CI runs on [GitHub Actions](https://docs.github.com/en/actions). The workflows live in `.github/workflows/`.
- `checks.yml` runs lint, type check, unit tests and build on every PR, and starts the `ci-failure` routine when one of them fails.

# Workflows

## Every Check Is a `package.json` Script
Every check a workflow runs is a `package.json` script, called as `pnpm <script>`. The only other steps are setup (checking out the code, installing tools and dependencies) and the step that starts a routine. That way you, or a cloud session looking into a failure, can rerun exactly what CI ran with the same command.

No script CI runs writes fixes. CI would pass on code it had silently fixed, then throw the fix away. That's why the lint job runs `pnpm lint:ci` (`biome ci`, which only reports) and not `pnpm lint` (`biome check --write`).

## Tools Come from `mise.toml`
A workflow installs Node, pnpm and any other tool it needs with [`jdx/mise-action`](https://github.com/jdx/mise-action), which runs `mise install` against `mise.toml`. So CI runs the same versions as your machine. `mise.toml` asks for `latest`, so a new release reaches CI and your machine alike, without anyone updating a version.

A routine's cloud session gets its tools the same way: the cloud environment's setup script installs mise, then runs `mise install node pnpm` against the repo's `mise.toml`, and the session runs those rather than the Node and pnpm that come in the cloud image (see "The Cloud Environment").

No workflow or setup script names a Node or pnpm version of its own, or uses `actions/setup-node` or the cloud image's Node.

CI and the cloud environment install only `node` and `pnpm` (the action's `install_args`, and the setup script's `mise install`), since they don't need the other tools in `mise.toml`. If a workflow needs another tool, add it to `mise.toml` and to that workflow's `install_args`, and to the setup script if routine sessions need it too. If they don't, add it to `MISE_DISABLE_TOOLS` in the setup script and in the file the script writes, as `rtk` is, or mise may look up its latest version on GitHub and get a 403.

# Checks on PRs
`checks.yml` runs on every PR, whatever its base branch. It has four check jobs:

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

Each check job checks out the code, installs Node and pnpm from `mise.toml`, runs `pnpm install --frozen-lockfile`, then runs its one script.

The workflow's token can only read the repo (`permissions: contents: read`), since no check needs more. A new push to a PR cancels that PR's run still in progress, so the PR shows only the newest commit's results.

## The Job That Starts `ci-failure`
A fifth job, `start-ci-failure`, runs after the four checks. When at least one of them failed, it starts the [`ci-failure` routine](#routines) by calling its `/fire` endpoint once (see "Starting a Routine"). The session that starts checks out the commit the failed run tested on the PR's head branch, reruns the failed checks and either fixes the failure or tells a flake from a real failure.

It fires only when all of these hold:
- at least one check failed, and the run wasn't cancelled. A new push that cancels a run starts nothing, even if a check had already failed, since the new push's run gets its own chance.
- it's the run's first attempt. A re-run, whether the `ci-failure` session starts it or you do, never starts another session. The session watches its own re-run.
- the PR's head branch doesn't start with `claude/`. That's a routine's own fix, so a failing fix doesn't start session after session, and you see its checks when you open it to merge.
- the PR comes from this repo, not a fork. GitHub gives a fork's PR no Actions secrets, so the call would always fail, and a session can't fix a branch in someone else's fork.

Otherwise the job shows as skipped. It `needs` each check job, so when you add a check job, add it there too, or its failure starts nothing.

The `text` it sends names only identifiers: the PR number, its head branch, the run's ID and URL, and the failed jobs. Its exact shape is in step 1 of the [`ci-failure` skill](../.claude/skills/ci-failure/SKILL.md), which reads it, so a change to the shape changes the job and the skill together. It sends no logs: the session reads the failure itself from the branch and the run. The PR's values reach the script only through the step's `env:`, and `jq` builds the JSON body, since the repo is public and a branch name is untrusted input ([GitHub's security guide](https://docs.github.com/en/actions/reference/security/secure-use)).

**When the call fails** (a wrong secret, the API down, or the routine's limit of 30 calls an hour), `start-ci-failure` fails on the PR, next to the failed check, and no session starts. Its log shows the error `/fire` returned, such as a 401 for a wrong token. On success, the log shows the new session's link. The job never retries, since `/fire` doesn't dedupe calls and a retry could start two sessions.

# Starting a Routine
Results that happen away from your machine, such as a failed check, reach you as a Claude Code cloud session: a routine starts it, and it waits for you in the Code tab of the Claude desktop app, under **Routines**. Nothing in the repo delivers a result any other way: no `anthropics/claude-code-action`, no email, chat or push-notification step, and no bot comment on a PR or issue. GitHub's own check status on a PR doesn't count, since it isn't a delivery. Neither does a step that only passes the result along to start a routine, such as a Sentry alert opening an issue that a workflow then picks up.

A routine starts only on an event that is itself a result for you: a failed check, a new Sentry issue, an update found. No routine has a schedule trigger, since a scheduled run leaves a session even when it finds nothing. A scheduled check that runs somewhere else, such as a workflow on a `schedule`, is fine, as long as it starts the routine only when it finds something.

A failed check can't start a routine directly, so a workflow job calls the routine's `/fire` endpoint, as `start-ci-failure` does (see "The Job That Starts `ci-failure`"). The [`/fire` API reference](https://platform.claude.com/docs/en/api/claude-code/routines-fire) has the request's shape. The routine's saved prompt runs its skill on the `text`, which arrives in the session wrapped in a `routine-fire-payload` block.

# Secrets and Environment Values
## The App's Variables
Wherever a workflow or the routines' cloud environment sets a variable from `src/env.ts`, the value is a dummy that passes the schema, such as `mongodb://localhost:27017/ci` for `DB_URL`. It's never a real value, such as the production database URL or a Resend API key, and never read from an Actions secret. The checks only need values that pass validation, and a routine's session runs without permission prompts while it reads untrusted text, such as CI logs.

The dummies live in two places, with the same values:
- the `env:` block at the top of `checks.yml`, so every job sees them
- the cloud environment's variables (see "The Cloud Environment")

When you add a variable to `src/env.ts`, give it a dummy in both, beside the unit-test value in `test/mocks/env.ts` and the E2E value in `playwright.config.ts` (see `docs/e2e_tests.md`, "Environment Variables"). For the cloud environment, that means its variables on claude.ai and their record in this doc.

## A Routine's URL and Token
A workflow that starts a routine reads its `/fire` URL and bearer token from two Actions secrets (Settings → Secrets and variables → Actions), named after the routine: `ROUTINE_<NAME>_URL` and `ROUTINE_<NAME>_TOKEN`, such as `ROUTINE_CI_FAILURE_URL`. Neither value is written anywhere in the repo. Each routine's `routine.md` names its two secrets.

Both come from the routine's API trigger on claude.ai (open the routine → Edit → **Select a trigger** → **API**). The token is shown only once, when it's generated, so it goes straight into the secret. If it's lost, **Regenerate** makes a new one, which revokes the old one, and the new one replaces the secret's value.

# Setup Outside the Repo
Some of what CI and the routines need lives in GitHub's and claude.ai's settings, not in the repo. This section is its record.

## `develop` Is the Default Branch
The repo's default branch on GitHub (Settings → General → Default branch) is `develop`. A routine clones the default branch and runs the skills committed there, so a change to a routine's skill reaches the routine once it's pushed to `develop`.

The default branch changes nothing else here: the ruleset below targets `main` by name, and Vercel's production branch (Settings → Environments → Production → Branch Tracking) is its own setting, which stays `main`.

## The Ruleset on `main`
A branch ruleset named `main` (Settings → Rules → Rulesets) targets `main` by name, not the default branch, with enforcement active and no bypass list. It has three rules:
- **Require status checks to pass:** `lint`, `type-check`, `unit-tests` and `build`, the four check jobs in `checks.yml`. A PR into `main` can't be merged while any of them is failing. `start-ci-failure` isn't a check, so it isn't required. "Require branches to be up to date before merging" is off, since merging `develop` into `main` leaves merge commits on `main` that would make `develop` look out of date.
- **Restrict deletions:** `main` can't be deleted.
- **Block force pushes:** nobody can force-push to `main`.

The ruleset covers only `main`, so you can still push straight to `develop`.

When a check job in `checks.yml` is renamed, added or removed, change the ruleset's required checks and this record in the same change. That way every check job is required, and every required check has a job to report it. A required check with no job never reports, and blocks every merge.

## The Claude GitHub App
The [Claude GitHub App](https://github.com/apps/claude) is installed on the repo, with access to only `meal-planning`. It lets routines clone the repo and push their `claude/` branches. A cloud session reaches GitHub through the cloud GitHub proxy, which authenticates `git` and `gh` with the app's access, so no GitHub token is stored anywhere.

The app's access covers what the `ci-failure` session does on GitHub: opening a PR, reading a run (`gh run view`), re-running its failed jobs (`gh run rerun --failed`) and reading their logs (`gh run view --log-failed`). The logs need one more allowed host in the cloud environment (see "The Cloud Environment").

## The Cloud Environment
Routines run in a claude.ai cloud environment named `Meal Planning Routines` (at https://claude.ai/code, the cloud button above the message box). A new session starts from a snapshot of what its setup script installed, which claude.ai rebuilds about every seven days, or when the script changes.

**Network access:** Custom, with **Also include default list of common package managers** checked, and one allowed domain:

```text
results-receiver.actions.githubusercontent.com
```

The default (Trusted) list allows the npm registry, `nodejs.org` (where mise gets Node) and Google Fonts (which `pnpm build` downloads). GitHub's API goes through its own proxy whatever the level, but a run's logs don't: `gh run view --log-failed` asks the API, which redirects to a signed download on `results-receiver.actions.githubusercontent.com`, and that host isn't on the Trusted list.

**Variables:** the dummy values from `checks.yml` (see "Secrets and Environment Values"), plus `CLAUDE_ENV_FILE`, a file Claude Code runs before each command in the session, which the setup script writes. There's no `GH_TOKEN` or `GITHUB_TOKEN`: a token set here would pass into the session, where Claude and its commands could read it, and the GitHub proxy needs none.

```text
DB_URL=mongodb://localhost:27017/ci
BETTER_AUTH_SECRET=ci-dummy-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=ci-google-client-id
GOOGLE_CLIENT_SECRET=ci-google-client-secret
RESEND_API_KEY=ci-resend-api-key
RESEND_FROM_EMAIL=ci@example.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=ci-google-client-id
CLAUDE_ENV_FILE=/opt/mise-session-env.sh
```

**Setup script:** it runs before Claude Code starts, and only the files it writes carry over into sessions. Its comments say why each part is there. One reason lives outside it: with the `aqua` backend off, mise installs pnpm from npm, and skips a package's install scripts unless they're approved. pnpm's install script puts its native binary in place, so `mise.toml` approves it (`allow_builds`).

```bash
#!/bin/bash
# Setup script for the `Meal Planning Routines` cloud environment. Its record is in docs/ci.md, "The Cloud Environment".
set -euo pipefail

# mise's own download hosts aren't on the Trusted list, so it comes from npm.
npm install -g @jdxcode/mise

# mise's default backend for pnpm downloads from GitHub releases, which the GitHub proxy blocks for
# repos not attached to the session. With it off, mise installs pnpm from npm.
export MISE_DISABLE_BACKENDS=aqua
# Sessions need only node and pnpm. Without this, mise looks up rtk's latest version on GitHub, and gets a 403.
export MISE_DISABLE_TOOLS=rtk

# Find the cloned repo, to install the versions its mise.toml names.
repo=""
for f in $(find / -maxdepth 4 -path /proc -prune -o -name mise.toml -print 2>/dev/null); do
  if grep -q '"name": "meal-planner"' "$(dirname "$f")/package.json" 2>/dev/null; then
    repo=$(dirname "$f")
    break
  fi
done
if [ -z "$repo" ]; then
  echo "setup: can't find the meal-planning repo, so there's no mise.toml to install from" >&2
  exit 1
fi
echo "setup: repo found at $repo"
cd "$repo"
mise trust mise.toml
mise install node pnpm

# Claude Code runs this file before each Bash command (CLAUDE_ENV_FILE, set in the environment's
# variables), so the session runs mise's Node and pnpm, not the image's /opt/node22.
shims="${MISE_DATA_DIR:-$HOME/.local/share/mise}/shims"
cat > /opt/mise-session-env.sh <<EOF
export MISE_DISABLE_BACKENDS=aqua
export MISE_DISABLE_TOOLS=rtk
export PATH="$shims:\$PATH"
EOF

# Warms the pnpm store for the cached snapshot. Each session installs again after its checkout.
export PATH="$shims:$PATH"
pnpm install --frozen-lockfile || echo "setup: pnpm install failed; each session installs on its own" >&2
```

When you change the network access, the variables or the script on claude.ai, change this record in the same change.

## Routines
Each routine's configuration on claude.ai (its prompt, trigger, model and environment) is in the `routine.md` beside its skill. This list says only what each one is for:
- **`ci-failure`:** looks into a failed check on a PR, so the result reaches you as a session in the Code tab, under **Routines** in the sidebar. Its skill is [`.claude/skills/ci-failure/`](../.claude/skills/ci-failure/SKILL.md).

To add a routine, go to https://claude.ai/code/routines → **New routine**. The form adds a **Pull request: Opened** GitHub trigger by default. Remove it with ✕, then add the trigger the routine needs with **+ Add another trigger**. To try a routine that reads the `text` it's sent, call its API trigger with `curl`, as the trigger's sample command shows. **Run now** has no text field.
