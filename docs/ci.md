# CI
- CI runs on [GitHub Actions](https://docs.github.com/en/actions). The workflows live in `.github/workflows/`.
- `checks.yml` runs lint, type check, unit tests and build on every PR, and the E2E tests on every PR into `develop` or `main`. It starts the `ci-failure` routine when one of them fails.
- `dependency-updates.yml` checks the dependencies for security advisories every hour and for new versions every week, and starts the `dependency-updates` routine when it finds something new.
- `vercel-deploy-errors.yml` starts the `vercel-deploy-errors` routine when a Vercel deployment you should hear about fails.
- `production-errors.yml` checks PostHog for new and reopened error issues every hour, and starts the `production-errors` routine for each one.
- `back-merge.yml` brings a hotfix on `main` back into `develop`, so the next release doesn't undo it.

# Workflows

## Every Check Is a `package.json` Script
Every check a workflow runs is a `package.json` script, called as `pnpm <script>`. That covers `checks.yml`'s five checks and the three checks that decide whether to start a routine, `deps:check`, `vercel:check` and `errors:check`. The only other steps are setup (checking out the code, installing tools and dependencies, and the `e2e` job's install of Chromium), the step that starts a routine, the steps that restore and save `dependency-updates.yml`'s and `production-errors.yml`'s reported lists in the Actions cache, and `back-merge.yml`'s git steps, which check nothing. That way you, or a cloud session looking into a failure, can rerun exactly what CI ran with the same command.

No script CI runs writes fixes. CI would pass on code it had silently fixed, then throw the fix away. That's why the lint job runs `pnpm lint:ci` (`biome ci`, which only reports) and not `pnpm lint` (`biome check --write`).

## The Repo Declares Its Tools
Apart from what every machine and runner comes with, such as `git`, `curl` and `jq`, the repo declares every tool its workflows, hooks and scripts need, so they work from a fresh clone, whatever is already on your PATH. A tool that runs from the repo's `node_modules`, such as Biome or lefthook, is a pnpm dependency. Any other command-line tool, such as `rtk`, goes in `mise.toml`.

A workflow installs Node, pnpm and any other `mise.toml` tool it needs with [`jdx/mise-action`](https://github.com/jdx/mise-action), which runs `mise install` against `mise.toml`. So CI runs the same versions as your machine. `mise.toml` asks for `latest`, so a new release reaches CI and your machine alike, without anyone updating a version.

A routine's cloud session gets its tools the same way: the cloud environment's setup script installs mise, then runs `mise install node pnpm` against the repo's `mise.toml`, and the session runs those rather than the Node and pnpm that come in the cloud image (see "The Cloud Environment").

No workflow or setup script names a Node or pnpm version of its own, or uses `actions/setup-node` or the cloud image's Node.

CI and the cloud environment install only `node` and `pnpm` (the action's `install_args`, and the setup script's `mise install`), since they don't need the other tools in `mise.toml`. When you add a tool to `mise.toml`, add it to the `install_args` of any workflow that needs it. If routine sessions need it too, add it to the setup script. If they don't, add it to `MISE_DISABLE_TOOLS`, as `rtk` is, in both the setup script and the file the script writes. Without that, mise may look up the tool's latest version on GitHub and get a 403.

# Checks on PRs
`checks.yml` runs on every PR, whatever its base branch. It has five check jobs. Four run on every PR, and `e2e` runs only on a PR into a protected branch, meaning one with a ruleset: `develop` or `main`.

| Job | Runs |
|-----|------|
| `lint` | `pnpm lint:ci` |
| `type-check` | `pnpm check:types`, which generates Next's route types (`next typegen`) before running `tsc`, since a fresh checkout has none |
| `unit-tests` | `pnpm test:coverage`, so the 100% coverage thresholds in `vitest.config.ts` hold across `src/`. The pre-commit hook checks only staged files. |
| `build` | `pnpm build` |
| `e2e` | `pnpm test:e2e`, which builds the app and runs every spec against it (see `docs/e2e_tests.md`, "Running E2E Tests"). Both of the E2E projects, desktop and phone, run in Chromium. |

Each check is its own job, so:
- the PR shows which check failed
- the rulesets on `develop` and `main` can require each check by its job name (see "Setup Outside the Repo")
- each job runs in its own checkout, so the `e2e` job's build never shares a `.next` folder with the `build` job's

Each check job checks out the code, installs Node and pnpm from `mise.toml`, runs `pnpm install --frozen-lockfile`, then runs its one script. `e2e` has one more setup step before its script, `pnpm exec playwright install --with-deps chromium`, as [Playwright's CI guide](https://playwright.dev/docs/ci-intro) does. `pnpm test:e2e` installs Chromium itself, but not the system libraries a fresh runner lacks, which `--with-deps` adds.

The E2E tests take several minutes, so `e2e` runs only on PRs into protected branches. Its `if` lists those branches. On a PR into any other branch, such as a `ci-failure` fix PR into a story's branch, the job shows as skipped. The fix still gets the E2E tests once the story's PR into `develop` runs. How the list stays in step with the rulesets is in "The Rulesets on `develop` and `main`".

The workflow's token can only read the repo (`permissions: contents: read`), since no check needs more. A new push to a PR cancels that PR's run still in progress, so the PR shows only the newest commit's results.

## The Job That Starts `ci-failure`
A sixth job, `start-ci-failure`, runs after the check jobs. When at least one of them failed, it starts the [`ci-failure` routine](#routines) by calling its `/fire` endpoint once (see "Starting a Routine"). The session that starts checks out the commit the failed run tested on the PR's head branch, reruns the failed checks and either fixes the failure or tells a flake from a real failure.

An `e2e` failure is sorted before anything is fixed. If a spec wasn't updated for a change the PR meant to make, the session updates the spec and opens a fix PR, as it would for a failure in any other check. If the app is broken, or the session can't tell, it hands the failure to the `root-cause-analyst` subagent. The analyst runs on Opus, a stronger model than the routine's Sonnet, because a bug note builds on the root cause it writes. The session then makes no fix and offers to turn the analyst's report into a bug note, because every fix to the app goes through the bug workflow. The routine selects the notes repo for that note, and so the session can read the story a commit names, which says whether a change was meant.

`start-ci-failure` fires only when all of these hold:
- at least one check failed, and the run wasn't cancelled. A new push that cancels a run starts nothing, even if a check had already failed, since the new push's run gets its own chance.
- it's the run's first attempt. A re-run, whether the `ci-failure` session starts it or you do, never starts another session. The session watches its own re-run.
- the PR's head branch doesn't start with `claude/`. That's a routine's own fix, so a failing fix doesn't start session after session, and you see its checks when you open it to merge.
- the PR comes from this repo, not a fork. GitHub gives a fork's PR no Actions secrets, so the call would always fail, and a session can't fix a branch in someone else's fork.

Otherwise the job shows as skipped. It `needs` each check job, so when you add a check job, add it there too, or its failure starts nothing.

The `text` it sends names only identifiers: the PR number, its head branch, the run's ID and URL, and the failed jobs. Its exact shape is in step 1 of the [`ci-failure` skill](../.claude/skills/ci-failure/SKILL.md), which reads it, so a change to the shape changes the job and the skill together. It sends no logs: the session reads the failure itself from the branch and the run. The PR's values reach the script only through the step's `env:`, and `jq` builds the JSON body, since the repo is public and a branch name is untrusted input ([GitHub's security guide](https://docs.github.com/en/actions/reference/security/secure-use)).

**When the call fails** (a wrong secret, the API down, or the routine's limit of 30 calls an hour), `start-ci-failure` fails on the PR, next to the failed check, and no session starts. Its log shows the error `/fire` returned, such as a 401 for a wrong token. On success, the log shows the new session's link. The job never retries, since `/fire` doesn't dedupe calls and a retry could start two sessions.

# Dependency Updates
`dependency-updates.yml` checks the dependencies with `pnpm deps:check` (`scripts/dependencyCheck.ts`) and starts the [`dependency-updates` routine](#routines) when it finds something you haven't been told about. It runs on `develop`, the default branch, on two schedules:
- **Hourly, at minute 17:** the security audit only (`pnpm deps:check`). It's off the top of the hour, when GitHub drops scheduled runs most often.
- **Weekly, Mondays at 13:47 UTC:** the audit plus new versions of the packages in `package.json` (`pnpm deps:check --weekly`).

Scheduled runs can start late. To run it by hand, open Actions → **Dependency Updates** → **Run workflow** and pick hourly or weekly. The form starts on hourly.

The workflow's token can only read the repo (`permissions: contents: read`). Runs wait their turn rather than cancelling each other, so two never read the same reported list.

GitHub turns off a public repo's scheduled workflows after 60 days with no activity in the repo. If that happens, turn the workflow back on from its page in Actions.

## The Two Jobs
They're split like `checks.yml`'s, so the routine's token never shares a job with third-party install scripts:
- **`check`** installs Node and pnpm from `mise.toml`, runs `pnpm install --frozen-lockfile` on the weekly run only (`pnpm audit` reads only the lockfile, but `pnpm outdated` needs an install), restores the reported list and runs `pnpm -s deps:check`. It passes the new findings, the reminders and the updated list on to the next job.
- **`start-dependency-updates`** runs no install. It runs when `check` found something new, or, on the weekly run, any advisory that's still unfixed. It also runs when the weekly run's `check` failed, as "When the Check Fails" describes. It calls the routine's `/fire` once, then saves the updated list, unless `check` failed.

When nothing is new, `start-dependency-updates` shows as skipped, no session starts and the reported list stays as it was.

The `text` it sends names only identifiers: the run, then each new finding and each reminder, one per line. Its exact shape is in step 1 of the [`dependency-updates` skill](../.claude/skills/dependency-updates/SKILL.md), which reads it, so a change to the shape changes the job and the skill together, as for `start-ci-failure`. Package names come from the registry, so the findings reach the script only through the step's `env:`, and `jq` builds the `text` and the JSON body.

## When the Check Fails
When the weekly run's `check` fails, `start-dependency-updates` still runs. It sends only the run and `check failed`, and saves nothing. The session checks out the commit the run tested and runs the check again. If it fails there too, the session fixes it on a `claude/` branch with a pull request into the run's branch, or explains what it found. If it passes there, the session re-runs the failed job on GitHub once, as `ci-failure` does, to tell a flake from a failure only GitHub's runner has. When the re-run passes, `start-dependency-updates` sends that week's findings, which start a session of their own.

A failed hourly run starts nothing, since an outage usually clears by the next hour. Neither does a re-run that fails again, whether the session starts it or you do.

## The Reported List
The Actions cache holds the identifiers already reported: each advisory's ID, and each new version as `package@version`. A finding in the list isn't new, so a run starts the routine only for findings no earlier run sent. A reported version stays quiet until a newer one comes out. The weekly run is the exception for advisories: it sends every one that's still unfixed as a reminder, until it's fixed.

`check` restores the newest cache entry whose key starts with `dependency-alerts-reported-`, and `start-dependency-updates` saves the updated list as `dependency-alerts-reported-<run ID>`, since a cache entry can't be changed once saved. The updated list keeps only what's still current, so a fixed advisory, or a version that's been merged or superseded, drops out.

With no entry to restore, every finding is new, and the next run that finds something sends the whole backlog. That happens on the first run, after the entries are cleared, and when the cache is lost: GitHub deletes an entry no run has read in 7 days, so a workflow that's been off that long starts over. To clear the list on purpose, delete the entries, from Actions → Caches or with `gh cache delete <key>`.

## When the Call Fails
If `/fire` fails (a wrong secret, the API down, or the routine's limit of 30 calls an hour), `start-dependency-updates` fails, no session starts and the list isn't saved. The next run finds the same findings and sends them again. The job's log shows the error `/fire` returned, such as a 401 for a wrong token. On success, the log shows the new session's link. Like `start-ci-failure`, it never retries.

# Vercel Deploy Errors
`vercel-deploy-errors.yml` starts the [`vercel-deploy-errors` routine](#routines) when a Vercel deployment fails and the failure is one you should hear about. Vercel sends GitHub a `repository_dispatch` event of type `vercel.deployment.failed` for each failed deployment, and GitHub runs `develop`'s copy of the workflow for it, whatever branch the deployment came from. So no branch can change the code that runs with the Vercel token ([GitHub's security guide](https://docs.github.com/en/actions/reference/security/secure-use)).

To run it by hand, open Actions → **Vercel Deploy Errors** → **Run workflow** and give the failed deployment's environment, branch and full commit SHA.

The workflow's token can read the repo, its check runs and its PRs (`contents: read`, `checks: read` and `pull-requests: read`), since the check looks up a preview's open PR and its commit's `build` check.

## When It Stays Quiet
The check, `pnpm -s vercel:check` (`scripts/vercelDeployCheck.ts`), decides whether a failure starts a session. It stays quiet in these cases, in the order it checks them, and the `check` job's log says which one:
- **A `claude/` branch:** it's a routine's own fix, and skipping it keeps a failing fix from starting session after session. `start-ci-failure` skips these branches for the same reason. The fix's session watches its own deployment.
- **A preview of a branch other than `develop` with no open PR from this repo:** nobody is waiting on it. A fork's PR falls here too, since its branch isn't one of this repo's. Vercel doesn't deploy it at all until you authorize it.
- **A preview of a PR's branch whose commit's `build` check ended as failed, cancelled or timed out (GitHub's conclusions for a job):** a code cause that breaks `pnpm build` fails both the deployment and the `build` check. `ci-failure` already has it, so one cause starts one session.
- **A repeat failure:** the commit already has a failed deployment in that environment, such as when you press **Redeploy** and it fails again. Only a commit's first failure in an environment fires, just as a re-run never starts another `ci-failure` session.

For the third case, `vercel:check` waits for the `build` check run, looking every 30 seconds for up to 20 minutes. If the `build` check hasn't finished by then, it starts a session anyway, and in the rare case `ci-failure` also runs, you get two sessions. None of the first three cases applies to a failed production deployment, so it always starts a session unless it's a repeat.

## The Two Jobs
The workflow has two jobs, split as `dependency-updates.yml`'s are, so each secret sits in one job:
- **`check`** installs Node and pnpm from `mise.toml` and runs `pnpm -s vercel:check` with the Vercel token. The script uses only Node's built-in modules, so the job runs no `pnpm install`, and no package's install script runs beside the token. Its outputs are whether to fire and the `text`.
- **`start-vercel-deploy-errors`** runs only when `check` says to fire. It calls the routine's `/fire` once, and holds the routine's two secrets and nothing else.

A branch name and the build log are untrusted input, so the event's values reach the check only through its step's `env:`, and `start-vercel-deploy-errors` builds the `/fire` body with `jq`.

## The Text
The other routines' `text` names only identifiers, but this one carries the evidence too, because the session has no Vercel access to fetch it (see "The Vercel Token"). It opens with one line of identifiers (the environment, the deployment's ID and inspector link, the branch and the commit). Then come Vercel's status and any unresolved incidents, from https://www.vercel-status.com, and the build log's error lines and its last 100 lines. The check drops the oldest of those log lines until the whole `text` fits in `/fire`'s limit of 65,536 characters.

If one of the check's Vercel requests fails, the `text` carries the error where the log would be, and the session still starts. If Vercel refused the request (a 401 or 403), such as once the token has expired, the session's summary says to renew the token.

Its exact shape is in step 1 of the [`vercel-deploy-errors` skill](../.claude/skills/vercel-deploy-errors/SKILL.md), which reads it, so a change to the shape changes the script and the skill together.

## When the Call Fails
If `/fire` fails (a wrong secret, the API down, or the routine's limit of 30 calls an hour), `start-vercel-deploy-errors` fails and no session starts. The failed run shows in Actions, and Vercel's failed status stays on the commit. The job's log shows the error `/fire` returned, such as a 401 for a wrong token. Once the cause is fixed, run the workflow by hand to start the session. Like `start-ci-failure`, the job never retries. On success, its log shows the new session's link.

## The Session's Fix PRs
When the cause is in the repo, the session opens a fix PR from a `claude/vercel-fix-<deployment ID>` branch into the deployment's branch: `main` for production, and `develop` or the PR's branch for a preview.

A routine never merges, so you merge each fix PR once its checks pass, with the merge method of its base branch:
- **`main`:** with a merge commit, as for a hotfix (see `docs/branching.md`, "A Hotfix"). It deploys, and back-merge carries the fix into `develop`.
- **`develop`:** with a squash, like a story's PR.
- **A PR's branch:** with any method, as for a `ci-failure` fix, since no ruleset covers the branch. The PR then runs its checks again (see `docs/branching.md`, "When Something Goes Wrong").

## The Vercel Token
`check` reads the project's deployments and build logs with a Vercel access token, kept in the Actions secret `VERCEL_TOKEN`. It's made at Vercel → Account Tokens (https://vercel.com/account/tokens) and expires a year after it's made. It's scoped to the meal-planning project only, so its API calls need no team ID.

Even a project-scoped token can deploy to production and read and change environment variables. The workflow holds it, not the session, as "Starting a Routine" describes. It's never in the cloud environment or the routine.

## Renewing the Vercel Token
You'll know the token has expired when a session's summary says Vercel refused the workflow's log fetch, or when the Account Tokens page shows its expiry date has passed. To renew it, in order:
1. At https://vercel.com/account/tokens, create a token scoped to the meal-planning project, with a one-year expiry.
2. In GitHub → Settings → Secrets and variables → Actions, replace `VERCEL_TOKEN`'s value with it.
3. Delete the old token on the Account Tokens page.

# Production Errors
`production-errors.yml` checks PostHog's error tracking every hour, at minute 37, off the top of the hour as `dependency-updates.yml` is, and starts the [`production-errors` routine](#routines) once for each new or reopened issue. The workflow runs on `develop`, the default branch, like every scheduled workflow. Each session writes a bug note with a root cause analysis from `root-cause-analyst`, and puts its line on the Roadmap.

To run it by hand, open Actions → **Production Errors** → **Run workflow**.

The workflow's token can only read the repo (`permissions: contents: read`). Runs wait their turn rather than cancelling each other, so two never read the same reported list. Like `dependency-updates.yml`, it's turned off after 60 days with no activity in the repo, and you turn it back on from its page in Actions.

## What Starts a Session
The check, `pnpm -s errors:check` (`scripts/productionErrorCheck.ts`), reads every issue with an occurrence in the last 7 days, whatever its status. The 7 days are PostHog's default range, since the check sets none. It compares each issue with the reported list, and chooses an issue that's active and either new or reopened. An issue is new when the list has no entry for it, and reopened when the list last recorded it as resolved. PostHog reopens the same issue when a resolved error comes back, and keeps its old first-seen time. So an issue starts one session, and starts another only if it's resolved and comes back.

These cases hold back issues the check would otherwise choose:
- **No reported list:** on the first run, or after the cache is lost, the check records every current issue and chooses none. Without that, every error already in PostHog, such as the test errors from setting up error reporting, would start a session.
- **More than 5 issues at once:** a run chooses at most the 5 oldest by first-seen time, and the rest wait for the next run. That keeps a burst of errors well under the routine's limit of 30 calls an hour.
- **Texts too big to pass on together:** the step that calls `/fire` reads the chosen texts from one env var, as a JSON array. Linux won't start a step with an env var over 128 KiB. So a run stops choosing once the array would pass 100,000 bytes, and the rest wait for the next run, so a newer issue never jumps ahead of an older one. The gap below 128 KiB leaves room for `jq` to re-encode the array. Each text is shortened to fit on its own, as "The Text" describes.

## The Two Jobs
The workflow has two jobs, split as `dependency-updates.yml`'s are, so each secret sits in one job:
- **`check`** installs Node and pnpm from `mise.toml`, restores the reported list and runs `pnpm -s errors:check` with the PostHog read key. The script uses only Node's built-in modules, so the job runs no `pnpm install`, and no package's install script runs beside the key. Its outputs are a `text` for each chosen issue and the updated list.
- **`start-production-errors`** runs whenever `check` succeeds, even with nothing chosen, so the list keeps up with each issue's status. It calls the routine's `/fire` once per `text`, then saves the list. It holds the routine's two secrets and nothing else.

## The Text
Like `vercel-deploy-errors.yml`'s, the `text` carries the evidence, because the session has no PostHog access (see "The PostHog Read Key"). It opens with one line of identifiers: whether the issue is new or reopened, its ID and its PostHog link. Then come the issue's details, its latest event, and each exception with its stack frames. The frames run from the one that raised the error outward. If the text is longer than `/fire`'s limit of 65,536 characters, or its JSON is over the 100,000-byte budget in "What Starts a Session", the check drops frames from the bottom until it fits.

Error messages are untrusted input: the app reports whatever text an error holds. So the texts reach the `/fire` call only through its step's `env:`, and `jq` builds each body. The check also puts each value on one line, so a newline in a message can't pass for a line of the text.

Its exact shape is in step 1 of the [`production-errors` skill](../.claude/skills/production-errors/SKILL.md), which reads it, so a change to the shape changes the script and the skill together.

## The Reported List
The Actions cache holds each issue's last known status, keyed by issue ID. Each run records the status of every issue it read, except the ones it would choose. A chosen issue is recorded once its `/fire` call succeeds, and one held back by the limit of 5 or the 100,000-byte budget keeps the entry it had, or still has none, until a later run chooses it. The list keeps an issue's entry after the issue has gone 7 days without an occurrence. So if it occurs again, it isn't taken for new: it starts nothing if it was active, and counts as reopened if it was resolved.

`check` restores the newest cache entry whose key starts with `production-errors-reported-`, and `start-production-errors` saves the updated list as `production-errors-reported-<run ID>`, since a cache entry can't be changed once saved. GitHub deletes an entry no run has read in 7 days, so the list is lost only when the workflow has been off that long. To clear it on purpose, delete the entries, from Actions → Caches or with `gh cache delete <key>`. The next run then records the current issues and starts nothing.

## When PostHog Fails
If PostHog refuses the read key (a 401 or 403), such as once the key is revoked, the check chooses no issues. It sends one text in their place: `PostHog refused the read key: HTTP <status> <message>`. Its session writes no note, and its summary tells you to replace the key. The list records that the refusal was reported, so the runs after it stay quiet until the key works again, rather than starting a session every hour.

Any other PostHog failure, such as an outage, fails `check` before any `/fire` call. Nothing is saved, so the next run tries again.

## When the Call Fails
If a `/fire` call fails (a wrong secret, the API down, or the routine's limit of 30 calls an hour), `start-production-errors` still tries the rest. It then saves the list. An issue whose call failed keeps the entry it had, or still has none, so the next run sends it again. Then the job fails, so the run shows in Actions. The job's log shows the error `/fire` returned, such as a 401 for a wrong token, and on success it shows the new session's link. Like `start-ci-failure`, it never retries a call.

## The PostHog Read Key
`check` reads issues and events with a PostHog personal API key that has only the `error_tracking:read` scope, limited to the project. It's kept in the Actions secret `POSTHOG_READ_KEY`. The project's ID is in the Actions variable `POSTHOG_PROJECT_ID`, since it isn't secret. Both are set in GitHub → Settings → Secrets and variables → Actions. The key is separate from the build's source-map key, which can write (see `docs/services.md`, "PostHog").

The key can only read, but it reads every error the app reports, and errors can hold users' data. So the workflow holds it, as "Starting a Routine" describes, and the session gets no PostHog access.

## Replacing the PostHog Read Key
You'll know the key needs replacing when a session's summary says PostHog refused it. To replace it, in order:
1. In PostHog → account settings → Personal API keys, create a key with only the `error_tracking:read` scope, limited to the project.
2. In GitHub → Settings → Secrets and variables → Actions, replace `POSTHOG_READ_KEY`'s value with it.
3. Delete the old key in PostHog.

# Back-Merge
A hotfix reaches `main` through its own PR, without going through `develop`. If nothing brought it back, the next release from `develop` into `main` could undo it. `back-merge.yml` brings it back on every push to `main`: it merges `main` into `develop` and pushes the merge straight to `develop`, with no PR. Both sides already passed their checks, so the merge runs none.

The workflow first lists the commits on `main` that `develop` lacks, leaving out merge commits (`git rev-list --no-merges origin/develop..origin/main`). If the list is empty, the run stops and pushes nothing. That's the case after a release, when the only commit `develop` lacks is the release's merge commit. Otherwise it merges `main` into `develop` and pushes the merge as the back-merge App (see "The Back-Merge App").

The `develop` ruleset refuses every direct push except the App's, so the push goes out with the App's token. The workflow's own token stays `contents: read`. The App's token asks only for Contents and Workflows write. It needs Workflows because GitHub refuses an App's push of any commit that changes `.github/workflows/` unless the token has that permission.

**When the merge conflicts,** the job fails and pushes nothing. Bring the hotfix back by hand: in a worktree session, merge `origin/main` into a branch from `develop`, resolve the conflict and open a PR into `develop`. Merge it with a merge commit, not a squash. A squash would leave `main`'s commits out of `develop`'s history, so git would still count them as missing from `develop`.

**When `develop` moves during a run,** such as a PR merging between the checkout and the push, GitHub refuses the push as not a fast-forward, and the job fails. Rerun it, and it merges again onto the new `develop`. Another back-merge never causes this, since runs wait their turn.

# Starting a Routine
Results that happen away from your machine, such as a failed check, reach you as a Claude Code cloud session: a routine starts it, and it waits for you in the Code tab of the Claude desktop app, under **Routines**. Nothing in the repo delivers a result any other way: no `anthropics/claude-code-action`, no email, chat or push-notification step, and no bot comment on a PR or issue. GitHub's own check status on a PR doesn't count, since it isn't a delivery. Neither does a step that only passes the result along to start a routine, such as an alert opening an issue that a workflow then picks up.

A routine starts only on an event that is itself a result for you: a failed check, a new production error, an update found. No routine has a schedule trigger, since a scheduled run leaves a session even when it finds nothing. A scheduled check that runs somewhere else, such as a workflow on a `schedule`, is fine, as long as it starts the routine only when it finds something.

A failed check can't start a routine directly, so a workflow job calls the routine's `/fire` endpoint, as `start-ci-failure` does (see "The Job That Starts `ci-failure`"). The [`/fire` API reference](https://platform.claude.com/docs/en/api/claude-code/routines-fire) has the request's shape. The routine's saved prompt runs its skill on the `text`, which arrives in the session wrapped in a `routine-fire-payload` block.

A routine's credentials follow least privilege ([OWASP Top 10 for LLM Applications, LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)). A session needs the data, not the service, so by default it gets no credential: the workflow that starts the routine holds the credential as an Actions secret, fetches the data and sends it in the `text`. A story with a good reason for a session to hold a credential lays out the trade-off, and you decide. `vercel-deploy-errors.yml`'s Vercel token and `production-errors.yml`'s PostHog read key are held this way (see "The Vercel Token" and "The PostHog Read Key").

# Secrets and Environment Values
## The App's Variables
Wherever a workflow or the routines' cloud environment sets a variable from `src/env.ts`, the value is a dummy that passes the schema, such as `mongodb://localhost:27017/ci` for `DB_URL`. It's never a real value, such as the production database URL or a Resend API key, and never read from an Actions secret. The checks only need values that pass validation, and a routine's session runs without permission prompts while it reads untrusted text, such as CI logs. `docs/services.md`, "The Environments", says where each environment's real values are stored.

The dummies live in two places, with the same values:
- the `env:` block at the top of `checks.yml`, so every job sees them
- the cloud environment's variables (see "The Cloud Environment")

When you add a variable to `src/env.ts`, where it needs a value depends on whether the schema requires it:
- **If it's required:** give it a dummy in both, beside the unit-test value in `test/mocks/env.ts` and the E2E value in `playwright.config.ts` (see `docs/e2e_tests.md`, "Environment Variables"). For the cloud environment, that means its variables on claude.ai and their record in this doc. It also needs a value in Vercel (Settings → Environment Variables), for Production and for Preview. A variable missing from either can fail that environment's deploy, since `src/env.ts` checks every variable.
- **If it's optional:** it gets no dummy in either, because the checks pass without it. Error reporting's two, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_VERCEL_ENV`, are like this. Each still gets an E2E value in `playwright.config.ts`, which lists every app variable. `docs/services.md`, "The Environments", says where each one is set on Vercel.

The build's own PostHog variables, `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID`, aren't in `src/env.ts`. CI's builds and the cloud environment leave them unset, so the build skips its source-map upload there (see `docs/services.md`, "PostHog"). `production-errors.yml`'s `check` job sets a `POSTHOG_PROJECT_ID` of its own, from an Actions variable, but runs no build (see "The PostHog Read Key").

## A Routine's URL and Token
A workflow that starts a routine reads its `/fire` URL and bearer token from two Actions secrets (Settings → Secrets and variables → Actions), named after the routine: `ROUTINE_<NAME>_URL` and `ROUTINE_<NAME>_TOKEN`, such as `ROUTINE_CI_FAILURE_URL`. Neither value is written anywhere in the repo. Each routine's `routine.md` names its two secrets.

Both come from the routine's API trigger on claude.ai (open the routine → Edit → **Select a trigger** → **API**). The token is shown only once, when it's generated, so it goes straight into the secret. If it's lost, **Regenerate** makes a new one, which revokes the old one, and the new one replaces the secret's value.

# Setup Outside the Repo
Some of what CI and the routines need lives in settings outside the repo, on GitHub, on claude.ai and in the Claude desktop app. Most of it is recorded in this section. Some is recorded beside the workflow or routine it serves: the routines' Actions secrets in "A Routine's URL and Token", the Vercel access token and its `VERCEL_TOKEN` secret in "The Vercel Token", and the PostHog read key and project ID in "The PostHog Read Key". The rest of what the app relies on outside the repo, such as Vercel, Atlas and the domain, is in `docs/services.md`.

When you set up something outside the repo, record it where it'll be found when it next needs changing. Which doc that is depends on what the setting is for:
- **If it exists only so a workflow or routine works,** such as an Actions secret: record it in this doc, beside that workflow or routine, and link it from its service's entry in `docs/services.md`.
- **If it serves both the app and a workflow or routine:** record it in the doc that covers the repo files it has to stay in step with. Then a change to those files and the update to its record land in the same commit.
- **Otherwise,** such as a setting the app or your machine depends on in any environment, an account or a bill: record it in `docs/services.md`, in its service's entry.

`docs/services.md` gives the same rule in "Which Doc Records a New Setting", so a change to the rule goes in both docs.

## `develop` Is the Default Branch
The repo's default branch on GitHub (Settings → General → Default branch) is `develop`. A routine clones the default branch and runs the skills committed there, so a change to a routine's skill reaches the routine once its PR merges into `develop`.

Scheduled workflows run on the default branch too, so `dependency-updates.yml` runs on `develop` (see "Dependency Updates"). The rulesets below name their branches, so they don't change with it. Vercel's production branch is a separate setting (see `docs/services.md`, "Vercel").

## The Rulesets on `develop` and `main`
Every change reaches `develop` and `main` through a PR whose checks passed, so neither branch can go red, and nothing reaches production except through a PR. The one exception is `back-merge.yml`'s push of a hotfix from `main` straight to `develop`, which merges two sides that each passed (see "Back-Merge"). How work flows between the branches is in `docs/branching.md`.

Two branch rulesets (Settings → Rules → Rulesets) hold this, with enforcement active. Each is named after its branch and targets it by name, not as the default branch. Both have these rules:
- **Require a pull request before merging,** with 0 approvals, since the review happens in the story's sessions, not on GitHub. A direct push is refused, from your account and so from a routine, which pushes as you.
- **Require status checks to pass:** `lint`, `type-check`, `unit-tests`, `build` and `e2e`, the five check jobs in `checks.yml`. `start-ci-failure` isn't a check, so it isn't required.
- **Restrict deletions** and **Block force pushes.**

The settings that differ between the two rulesets, with each one's value and why:

| | `develop` | `main` |
|---|---|---|
| Merge methods | Squash, for a story or `/tooling` PR, so each lands as one commit dated when it lands. Merge commit, for a hotfix brought back by hand. | Merge commit only, so `main`'s history shows each release and hotfix as it shipped. |
| "Require branches to be up to date before merging" | On, so every PR is tested against the latest `develop` and two PRs that each pass alone can't break it together. After a merge into `develop`, each other open PR needs **Update branch** (or `gh pr update-branch`) and another check run before it can merge. | Off, since merging `develop` into `main` leaves merge commits on `main` that would make `develop` look out of date. |
| Bypass list | The back-merge App only, so `back-merge.yml` can push (see "Back-Merge"). | Empty. |

No ruleset setting stops a routine from merging a PR as you, so the `routine-sessions` skill's rule that a routine never merges is the only guard there.

When a check job in `checks.yml` is renamed, added or removed, change both rulesets' required checks and this record to match. That way every PR, into either branch, is held to the same checks, every check job is required, and every required check has a job to report it. A required check with no job never reports, and blocks every merge. So when a job's name is added, by a new job or a rename, it goes into both rulesets once the PR that adds the job shows it passing, just before that PR merges. Until the next release brings the job to `main`, a hotfix PR into `main` comes from a branch without the job, so it would wait on a check that never reports. If a hotfix comes up in that window, take the name off `main`'s ruleset until the hotfix merges.

`e2e`'s `if` lists the protected branches. When a branch gets a ruleset, add it to the list, and add `e2e` to its required checks once PRs into it run the job, as above. When a branch loses its ruleset, take it off the list. A protected branch missing from the list would skip `e2e`, and GitHub counts a skipped check as a pass.

## Pull Request Settings
The settings in Settings → General → Pull Requests, with their values and why:
- **Merge methods:** merge commits and squash allowed, rebase off, to match the rulesets' merge methods.
- **Default commit messages:** a merge commit's message is the PR title, so `main`'s history lists the goals shipped. A squash's is the PR title with its commit details, so a story's step messages survive on `develop`.
- **Allow auto-merge:** on, so a story's PR into `develop` merges by itself once its checks pass.
- **Automatically delete head branches:** on, so after a merge only the local branch and worktree are left, which the SessionStart hook's sweep (`scripts/worktree-sweep.sh`) removes.

## The `notes-pending` Label
The repo has a `notes-pending` label, made once with `gh label create notes-pending --description "Merged PR with notes work still to do"`, since `gh pr create --label` fails on a label that doesn't exist.

While notes work waits on a PR's merge, such as a `/tooling` change's Roadmap edits, the PR carries the label, and its body lists that work under "Held until the merge". What the SessionStart hook's sweep does with a merged PR that still has the label is in `docs/branching.md`, "Cleaning Up After a Merge".

## The Back-Merge App
`back-merge.yml` pushes as a GitHub App of your own, `meal-planning-back-merge` (your Settings → Developer settings → GitHub Apps), the one actor on the `develop` ruleset's bypass list. Your account mustn't be on the list, because routines push as you and would get through too. GitHub doesn't let a workflow's built-in token be on a bypass list at all. That leaves an App as the only actor that can be on the list by itself.

The App has no webhook, is installed on `meal-planning` only, and has Contents and Workflows read and write. Its Client ID and private key are the Actions secrets `BACK_MERGE_APP_CLIENT_ID` and `BACK_MERGE_APP_PRIVATE_KEY`. If the key is lost or leaked, generate a new one on the App's page, replace the secret's value and delete the old key there.
## The Claude GitHub App
The [Claude GitHub App](https://github.com/apps/claude) is installed with access to `meal-planning` and `meal-planning-notes`. It lets routines clone both repos, push `claude/` branches in `meal-planning` and push to `main` in `meal-planning-notes`. A cloud session reaches GitHub through the cloud GitHub proxy, which authenticates `git` and `gh` with the app's access, so no GitHub token is stored anywhere.

The app's access covers what the `ci-failure` and `dependency-updates` sessions do on GitHub: opening and editing a PR (`gh api`), finding a run (`gh run list`), reading one (`gh run view`), re-running its failed jobs (`gh run rerun --failed`) and reading their logs (`gh run view --log-failed`). The logs need one more allowed host in the cloud environment (see "The Cloud Environment").

## The Desktop App's Branch Prefix
The Claude desktop app names each worktree branch from its branch prefix (Settings → Claude Code), which is `feature/`, so a story's or `/tooling` change's branch is `feature/<generated name>`. It isn't the app's default, `claude/`. With that default, a story's branch would start with `claude/`. `start-ci-failure` and `vercel-deploy-errors.yml` treat a `claude/` branch as a routine's own fix and start no session for it, so a story's failed check or failed preview would start nothing.

## The Cloud Environment
Routines run in a claude.ai cloud environment named `Meal Planning Routines` (at https://claude.ai/code, the cloud button above the message box). A new session starts from a snapshot of what its setup script installed, which claude.ai rebuilds about every seven days, or when the script changes.

**Network access:** Custom, with **Also include default list of common package managers** checked, and these allowed domains:

```text
results-receiver.actions.githubusercontent.com
tuf-repo-cdn.sigstore.dev
cdn.playwright.dev
fastdl.mongodb.org
react.dev
nextjs.org
mantine.dev
better-auth.com
zod.dev
```

The default (Trusted) list allows the npm registry, `nodejs.org` (where mise gets Node) and Google Fonts (which `pnpm build` downloads). GitHub's API goes through its own proxy whatever the level, but a run's logs don't: `gh run view --log-failed` asks the API, which redirects to a signed download on `results-receiver.actions.githubusercontent.com`, and that host isn't on the Trusted list.

When mise installs pnpm from npm, it verifies pnpm's provenance, and that check needs `tuf-repo-cdn.sigstore.dev`. Without that domain, `mise install` fails and stops the setup script, so sessions don't get mise's Node and pnpm.

The next two domains let a session run `pnpm test:e2e`, as the `ci-failure` routine does when the `e2e` check fails. Playwright downloads Chromium, its headless shell and ffmpeg from `cdn.playwright.dev`, and `mongodb-memory-server` downloads `mongod` from `fastdl.mongodb.org`. Neither host is on the Trusted list. The setup script makes both downloads, so Chromium and `mongod` are in the snapshot. A session fetches them only if the script's download failed.

The other five domains hold the release notes and guides of the libraries that the `dependency-updates` routine's `upgrade-assessor` subagent assesses. It also assesses Luxon, but Luxon's docs site isn't allowed, because `moment.github.io` builds its pages in the browser and `WebFetch` gets only their titles. The same docs are in `docs/` in `moment/luxon` on GitHub, which the session can already read.

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
# The install also downloads mongod for the E2E tests' database, through mongodb-memory-server's postinstall.
export PATH="$shims:$PATH"
pnpm install --frozen-lockfile || echo "setup: pnpm install failed; each session installs on its own" >&2

# pnpm test:e2e downloads Chromium itself, but not the system libraries it needs, which --with-deps installs
# through apt. Installing both here puts them in the snapshot. apt needs root, and this script runs as root.
pnpm exec playwright install --with-deps chromium || echo "setup: Chromium install failed, so sessions may lack the system libraries pnpm test:e2e needs" >&2
```

When you change the network access, the variables or the script on claude.ai, change this record in the same change.

## Routines
Each routine's configuration on claude.ai (its prompt, trigger, model and environment) is in the `routine.md` beside its skill. This list says only what each one is for:
- **`ci-failure`:** looks into a failed check on a PR, so the result reaches you as a session in the Code tab, under **Routines** in the sidebar. Its skill is [`.claude/skills/ci-failure/`](../.claude/skills/ci-failure/SKILL.md).
- **`dependency-updates`:** handles the new dependency versions and security advisories the dependency check finds, so they reach you as a session in the Code tab, under **Routines**. Its skill is [`.claude/skills/dependency-updates/`](../.claude/skills/dependency-updates/SKILL.md).
- **`vercel-deploy-errors`:** works out why a Vercel deployment failed, then fixes it or says what you need to change in Vercel, so the result reaches you as a session in the Code tab, under **Routines**. Its skill is [`.claude/skills/vercel-deploy-errors/`](../.claude/skills/vercel-deploy-errors/SKILL.md).
- **`production-errors`:** turns a new or reopened PostHog error issue into a bug note with a root cause analysis, so the analysis waits for you as a session in the Code tab, under **Routines**. Its skill is [`.claude/skills/production-errors/`](../.claude/skills/production-errors/SKILL.md).

To add a routine, go to https://claude.ai/code/routines → **New routine**. The form adds a **Pull request: Opened** GitHub trigger by default. Remove it with ✕, then add the trigger the routine needs with **+ Add another trigger**. To try a routine that reads the `text` it's sent, call its API trigger with `curl`, as the trigger's sample command shows. **Run now** has no text field.
