# CI
CI runs on [GitHub Actions](https://docs.github.com/en/actions), and the routines that report results from CI, Vercel and PostHog run as Claude Code cloud sessions. This doc is for anyone changing a workflow or a routine. It explains what a workflow file can't show: why the workflows and routines are built the way they are, and what has to change together. It assumes you know what a GitHub Actions workflow is.

The workflows live in `.github/workflows/`, and each one's header comment says what it does. The settings they rely on outside the repo, such as the rulesets, the Actions secrets and the routines' cloud environment, are recorded in `docs/services.md`, under the service that holds them.

# How the Workflows and Routines Are Built

## Every Check Is a `package.json` Script
Every check a workflow runs is a `package.json` script, called as `pnpm <script>`. That way you, or a cloud session looking into a failure, can rerun exactly what CI ran with the same command. That covers `checks.yml`'s five checks and the three checks that decide whether to start a routine, `deps:check`, `vercel:check` and `errors:check`.

No script CI runs writes fixes. CI would pass on code it had silently fixed, then throw the fix away. That's why the lint job runs `pnpm lint:ci` (`biome ci`, which only reports) and not `pnpm lint` (`biome check --write`).

## The Repo Declares Its Tools
Apart from what every machine and runner comes with, such as `git`, `curl` and `jq`, the repo declares every tool its workflows, hooks and scripts need, so they work from a fresh clone, whatever is already on your PATH. A tool that runs from the repo's `node_modules`, such as Biome or lefthook, is a pnpm dependency. Any other command-line tool, such as `rtk`, goes in `mise.toml`.

A workflow installs only the `mise.toml` tools it uses, so a run doesn't spend time on the rest. It installs them with [`jdx/mise-action`](https://github.com/jdx/mise-action), naming them in the step's `install_args`. Most install only `node` and `pnpm`, and `backup.yml` adds the backup's tools (see "Database Backup"). Either way, CI runs the same versions as your machine, and no workflow names a Node or pnpm version of its own or uses `actions/setup-node`. `mise.toml` asks for `latest`, so a new release reaches CI and your machine alike, without anyone updating a version.

A routine's cloud session gets its tools the same way. The cloud environment's setup script installs mise, then runs `mise install node pnpm` against the repo's `mise.toml`, and the session runs those rather than the Node and pnpm that come in the cloud image. The setup script has mise install pnpm from npm. pnpm's own install script puts its native binary in place, and it runs only because `mise.toml` approves it (`allow_builds`). The setup script is recorded in `docs/services.md`, "The Cloud Environment".

When you add a tool to `mise.toml`, add it to the `install_args` of any workflow that needs it. If routine sessions need it too, add it to the setup script. If they don't, add it to `MISE_DISABLE_TOOLS`, as `rtk` is, in both the setup script and the file the script writes. Without that, mise may look up the tool's latest version on a host the session can't reach.

# Routines
Results that happen away from your machine, such as a failed check, reach you as a Claude Code cloud session. A routine starts the session, and the session waits for you in the Code tab of the Claude desktop app, under **Routines**. The routines, and what each is for:
- **`ci-failure`:** looks into a failed check on a PR. Its skill is [`.claude/skills/ci-failure/`](../.claude/skills/ci-failure/SKILL.md).
- **`dependency-updates`:** handles the new dependency versions and security advisories the dependency check finds. Its skill is [`.claude/skills/dependency-updates/`](../.claude/skills/dependency-updates/SKILL.md).
- **`vercel-deploy-errors`:** works out why a Vercel deployment failed, then fixes it or says what you need to change in Vercel. Its skill is [`.claude/skills/vercel-deploy-errors/`](../.claude/skills/vercel-deploy-errors/SKILL.md).
- **`production-errors`:** turns a new or reopened PostHog error issue into a bug note with a root cause analysis. Its skill is [`.claude/skills/production-errors/`](../.claude/skills/production-errors/SKILL.md).

How each routine is set up on claude.ai, and which version of its skill it runs, is in `docs/services.md`, "Routines".

A routine starts only on an event that is itself a result for you: a failed check, a new production error, an update found. No routine has a schedule trigger, since a scheduled run leaves a session even when it finds nothing. A scheduled check that runs somewhere else, such as a workflow on a `schedule`, is fine, as long as it starts the routine only when it finds something.

Nothing in the repo delivers a result other than by starting a routine: no `anthropics/claude-code-action`, no email, chat or push-notification step, and no bot comment on a PR or issue. GitHub's own check status on a PR doesn't count, since it isn't a delivery. Neither does a step that only passes the result along to start a routine, such as an alert opening an issue that a workflow then picks up.

A failed backup is the one result that doesn't reach you as a session. It reaches you through GitHub's own email for a failed workflow run, which GitHub sends already, so nothing in the repo is built for it. `docs/backups.md`, "When a Backup Fails", says what to do when one arrives.

A workflow starts a routine with a job that calls the routine's `/fire` endpoint. The [`/fire` API reference](https://platform.claude.com/docs/en/api/claude-code/routines-fire) has the request's shape. The routine's saved prompt runs its skill on the call's `text`, which arrives in the session wrapped in a `routine-fire-payload` block. Each job makes its call once and never retries, so one result never starts two sessions. Its log shows the new session's link, or the error the call got back. What each job does when its call fails is in its workflow's section.

A routine's credentials follow least privilege ([OWASP Top 10 for LLM Applications, LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)). A session needs the data, not the service, so by default it gets no credential: the workflow that starts the routine holds the credential as an Actions secret, fetches the data and sends it in the `text`. A story with a good reason for a session to hold a credential lays out the trade-off, and you decide. `vercel-deploy-errors.yml`'s Vercel token and `production-errors.yml`'s PostHog read key are held this way.

# Checks on PRs
`checks.yml` runs on every PR, whatever its base branch. It has five check jobs. Four run on every PR, and `e2e` runs only on a PR into a protected branch, meaning one with a ruleset: `develop` or `main`. The E2E tests take several minutes, so on a PR into any other branch, such as a `ci-failure` fix PR into a story's branch, the job shows as skipped. The fix still gets the E2E tests once the story's PR into `develop` runs.

| Job | Runs |
|-----|------|
| `lint` | `pnpm lint:ci` |
| `type-check` | `pnpm check:types`, which generates Next's route types (`next typegen`) before running `tsc`, since a fresh checkout has none |
| `unit-tests` | `pnpm test:coverage`, so the 100% coverage thresholds in `vitest.config.ts` hold across `src/`. The pre-commit hook checks only staged files. |
| `build` | `pnpm build` |
| `e2e` | `pnpm test:e2e`, which builds the app and runs every spec against it (see `docs/e2e_tests.md`, "Running E2E Tests"). Both of the E2E projects, desktop and phone, run in Chromium. |

Each check is its own job, so:
- the PR shows which check failed
- the rulesets on `develop` and `main` can require each check by its job name (see `docs/services.md`, "The Rulesets on `develop` and `main`")
- each job runs in its own checkout, so the `e2e` job's build never shares a `.next` folder with the `build` job's

`e2e` has one more setup step before its script, `pnpm exec playwright install --with-deps chromium`, as [Playwright's CI guide](https://playwright.dev/docs/ci-intro) does, so a fresh runner has the system libraries Chromium needs.

The workflow's token can only read the repo (`permissions: contents: read`), since no check needs more. A new push to a PR cancels that PR's run still in progress, so the PR shows only the newest commit's results.

## Keeping the Checks in Step
Every check job is a required check in both rulesets, so every PR into `develop` or `main` is held to the same checks. Every check job's failure also starts `ci-failure`. So when a check job in `checks.yml` is renamed, added or removed, change these to match:
- both rulesets' required checks, and their record in `docs/services.md`. A required check with no job never reports, and blocks every merge.
- `start-ci-failure`'s `needs`, or a new job's failure starts nothing (see "The Job That Starts `ci-failure`").

> [!NOTE]
> When a job's name is added, by a new job or a rename, it goes into both rulesets once the PR that adds the job shows it passing, just before that PR merges. Until the next release brings the job to `main`, a hotfix PR into `main` comes from a branch without the job, so it would wait on a check that never reports. If a hotfix comes up in that window, take the name off `main`'s ruleset until the hotfix merges.

`e2e`'s `if` lists the protected branches, so change it when a branch gets or loses a ruleset. When a branch gets one, add it to the list, and add `e2e` to its required checks once PRs into it run the job, as above. A protected branch missing from the list would skip `e2e`, and GitHub counts a skipped check as a pass.

## The Job That Starts `ci-failure`
A sixth job, `start-ci-failure`, runs after the check jobs and starts the [`ci-failure` routine](#routines). It starts it only when all of these hold:
- at least one check failed, and the run wasn't cancelled. A new push that cancels a run starts nothing, even if a check had already failed, since the new push's run gets its own chance.
- it's the run's first attempt. A re-run, whether the `ci-failure` session starts it or you do, never starts another session. The session watches its own re-run.
- the PR's head branch doesn't start with `claude/`. A `claude/` branch is a routine's own fix. Skipping it keeps a failing fix from starting session after session, and you see its checks when you open it to merge.
- the PR comes from this repo, not a fork. A fork's PR gets no Actions secrets, so the call would always fail, and a session can't fix a branch in someone else's fork.

Otherwise the job shows as skipped. If the call to start the routine fails, `start-ci-failure` fails on the PR, next to the failed check, and no session starts.

The session it starts checks out the commit the failed run tested on the PR's head branch, reruns the failed checks and either fixes the failure or tells a flake from a real failure. An `e2e` failure is sorted before anything is fixed. If a spec wasn't updated for a change the PR meant to make, the session updates the spec and opens a fix PR, as it would for a failure in any other check. If the app is broken, or the session can't tell, it hands the failure to the `root-cause-analyst` subagent, makes no fix and offers to turn the analyst's report into a bug note, because every fix to the app goes through the bug workflow.

> [!NOTE]
> The analyst runs on Opus, a stronger model than the routine's Sonnet, because a bug note builds on the root cause it writes. The routine selects the notes repo for two reasons: the session writes that note there, and it can read the story a commit names, which says whether a change was meant.

The `text` it sends names only identifiers: the PR number, its head branch, the run's ID and URL, and the failed jobs. Its exact shape is in step 1 of the [`ci-failure` skill](../.claude/skills/ci-failure/SKILL.md), which reads it, so a change to the shape changes the job and the skill together. It sends no logs: the session reads the failure itself from the branch and the run. The PR's values reach the script only through the step's `env:`, and `jq` builds the JSON body, since the repo is public and a branch name is untrusted input ([GitHub's security guide](https://docs.github.com/en/actions/reference/security/secure-use)).

# Dependency Updates
`dependency-updates.yml` checks the dependencies with `pnpm deps:check` (`scripts/dependencyCheck.ts`) and starts the [`dependency-updates` routine](#routines) when it finds something you haven't been told about. It runs on `develop`, the default branch, on two schedules:
- **Hourly, at minute 17:** the security audit only (`pnpm deps:check`). It's off the top of the hour, when GitHub drops scheduled runs most often.
- **Weekly, Mondays at 13:47 UTC:** the audit plus new versions of the packages in `package.json` (`pnpm deps:check --weekly`).

Scheduled runs can start late. To run it by hand, open Actions → **Dependency Updates** → **Run workflow** and pick hourly or weekly.

The workflow's token can only read the repo (`permissions: contents: read`). Runs wait their turn rather than cancelling each other, so two never read the same reported list.

If GitHub turns the workflow off because the repo has had no activity for a while, turn it back on from its page in Actions.

## The Two Jobs
The workflow has two jobs, so the routine's token never shares a job with third-party install scripts:
- **`check`** installs Node and pnpm from `mise.toml`, runs `pnpm install --frozen-lockfile` on the weekly run only (`pnpm audit` reads only the lockfile, but `pnpm outdated` needs an install), restores the reported list and runs `pnpm -s deps:check`. It passes the new findings, the reminders and the updated list on to the next job.
- **`start-dependency-updates`** runs no install. It runs when `check` found something new, or, on the weekly run, any advisory that's still unfixed. It also runs when the weekly run's `check` failed, as "When the Check Fails" describes. It starts the routine, then saves the updated list, unless `check` failed.

When there's nothing to send, `start-dependency-updates` shows as skipped, no session starts and the reported list stays as it was. If the call to start the routine fails, the job fails, no session starts and the list isn't saved, so the next run sends the same findings again.

The `text` it sends names only identifiers: the run, then each new finding and each reminder, one per line. Its exact shape is in step 1 of the [`dependency-updates` skill](../.claude/skills/dependency-updates/SKILL.md), which reads it, so a change to the shape changes the job and the skill together, as for `start-ci-failure`. Package names come from the registry, so the findings reach the script only through the step's `env:`, and `jq` builds the `text` and the JSON body.

## When the Check Fails
When the weekly run's `check` fails, `start-dependency-updates` still runs. It sends only the run and `check failed`, and saves nothing. The session checks out the commit the run tested and runs the check again. If it fails there too, the session fixes it on a `claude/` branch with a pull request into the run's branch, or explains what it found. If it passes there, the session re-runs the failed job on GitHub once, as `ci-failure` does, to tell a flake from a failure only GitHub's runner has. When the re-run passes, `start-dependency-updates` sends that week's findings, which start a session of their own.

A failed hourly run starts nothing, since an outage usually clears by the next hour. Neither does a re-run that fails again, whether the session starts it or you do.

## The Reported List
The Actions cache holds the identifiers already reported: each advisory's ID, and each new version as `package@version`. A finding in the list isn't new, so a run starts the routine only for findings no earlier run sent. A reported version stays quiet until a newer one comes out. The weekly run is the exception for advisories: it sends every one that's still unfixed as a reminder, until it's fixed.

`check` restores the newest cache entry whose key starts with `dependency-alerts-reported-`, and `start-dependency-updates` saves the updated list as `dependency-alerts-reported-<run ID>`, since a cache entry can't be changed once saved. The updated list keeps only what's still current, so a fixed advisory, or a version that's been merged or superseded, drops out.

With no entry to restore, every finding is new, and the next run that finds something sends the whole backlog. That happens on the first run, after the entries are cleared, and when GitHub deletes the entries because no run has read them for a while, such as while the workflow is off. To clear the list on purpose, delete the entries, from Actions → Caches or with `gh cache delete <key>`.

# Vercel Deploy Errors
`vercel-deploy-errors.yml` starts the [`vercel-deploy-errors` routine](#routines) when a Vercel deployment fails and the failure is one you should hear about. Vercel sends GitHub a `repository_dispatch` event of type `vercel.deployment.failed` for each failed deployment, and GitHub runs `develop`'s copy of the workflow for it, whatever branch the deployment came from. So no branch can change the code that runs with the Vercel token ([GitHub's security guide](https://docs.github.com/en/actions/reference/security/secure-use)).

To run it by hand, open Actions → **Vercel Deploy Errors** → **Run workflow** and give the failed deployment's environment, branch and full commit SHA.

The workflow's token can read the repo, its check runs and its PRs (`contents: read`, `checks: read` and `pull-requests: read`), since the check looks up a preview's open PR and its commit's `build` check.

## When It Stays Quiet
The check, `pnpm -s vercel:check` (`scripts/vercelDeployCheck.ts`), decides whether a failure starts a session. It stays quiet in these cases, in the order it checks them, and the `check` job's log says which one:
- **A `claude/` branch:** it's a routine's own fix, and skipping it keeps a failing fix from starting session after session. `start-ci-failure` skips these branches for the same reason. The fix's session watches its own deployment.
- **A preview of a branch other than `develop` with no open PR from this repo:** nobody is waiting on it. A fork's PR falls here too, since its branch isn't one of this repo's.
- **A preview of a PR's branch whose commit's `build` check ended as failed, cancelled or timed out:** a code cause that breaks `pnpm build` fails both the deployment and the `build` check. `ci-failure` already has it, so one cause starts one session.
- **A repeat failure:** the commit already has a failed deployment in that environment, such as when you press **Redeploy** and it fails again. Only a commit's first failure in an environment fires, just as a re-run never starts another `ci-failure` session.

None of the first three cases applies to a failed production deployment, so it always starts a session unless it's a repeat.

> [!NOTE]
> For the third case, `vercel:check` waits for the `build` check run, looking every 30 seconds for up to 20 minutes. If the `build` check hasn't finished by then, it starts a session anyway, and in the rare case `ci-failure` also runs, you get two sessions.

## The Two Jobs
The workflow has two jobs, split as `dependency-updates.yml`'s are, so each secret sits in one job:
- **`check`** installs Node and pnpm from `mise.toml` and runs `pnpm -s vercel:check` with the Vercel token. The script uses only Node's built-in modules, so the job runs no `pnpm install`, and no package's install script runs beside the token. Its outputs are whether to fire and the `text`.
- **`start-vercel-deploy-errors`** runs only when `check` says to fire. It starts the routine, and holds the routine's two secrets and nothing else.

A branch name and the build log are untrusted input, so the event's values reach the check only through its step's `env:`, and `start-vercel-deploy-errors` builds the `/fire` body with `jq`.

If the call to start the routine fails, `start-vercel-deploy-errors` fails and no session starts. The failed run shows in Actions, and Vercel's failed status stays on the commit. Once the cause is fixed, run the workflow by hand to start the session.

## The Text
The other routines' `text` names only identifiers, but this one carries the evidence too, because the session has no Vercel access to fetch it (see "Routines"). It opens with one line of identifiers (the environment, the deployment's ID and inspector link, the branch and the commit). Then come Vercel's status and any unresolved incidents, from https://www.vercel-status.com, and the build log's error lines and its last 100 lines. The check drops the oldest of those log lines until the whole `text` fits in `/fire`'s size limit.

If one of the check's Vercel requests fails, the `text` carries the error where the log would be, and the session still starts. If Vercel refused the request (a 401 or 403), such as once the token has expired, the session's summary says to renew the token, as `docs/services.md`, "Renewing the Vercel Token", describes.

Its exact shape is in step 1 of the [`vercel-deploy-errors` skill](../.claude/skills/vercel-deploy-errors/SKILL.md), which reads it, so a change to the shape changes the script and the skill together.

## The Session's Fix PRs
When the cause is in the repo, the session opens a fix PR from a `claude/vercel-fix-<deployment ID>` branch into the deployment's branch: `main` for production, and `develop` or the PR's branch for a preview.

A routine never merges, so you merge each fix PR once its checks pass, with the merge method of its base branch:
- **`main`:** with a merge commit, as for a hotfix (see `docs/branching.md`, "A Hotfix"). It deploys, and back-merge carries the fix into `develop`.
- **`develop`:** with a squash, like a story's PR.
- **A PR's branch:** with any method, as for a `ci-failure` fix, since no ruleset covers the branch. The PR then runs its checks again (see `docs/branching.md`, "When Something Goes Wrong").

# Production Errors
`production-errors.yml` checks PostHog's error tracking every hour, at minute 37, off the top of the hour as `dependency-updates.yml` is, and starts the [`production-errors` routine](#routines) once for each new or reopened issue. The workflow runs on `develop`, the default branch, like every scheduled workflow. Each session writes a bug note with a root cause analysis from `root-cause-analyst`, and puts its line on the Roadmap.

To run it by hand, open Actions → **Production Errors** → **Run workflow**.

The workflow's token can only read the repo (`permissions: contents: read`). Runs wait their turn rather than cancelling each other, so two never read the same reported list. If GitHub turns it off for inactivity, turn it back on from its page in Actions, as for `dependency-updates.yml`.

## What Starts a Session
The check, `pnpm -s errors:check` (`scripts/productionErrorCheck.ts`), starts a session for each issue that's active and either new or reopened. An issue is new when the reported list has no entry for it, and reopened when the list last recorded it as resolved. So an issue starts one session, and starts another only if it's resolved and comes back.

> [!NOTE]
> The check reads every issue with an occurrence in the last 7 days, whatever its status. A resolved error that comes back reopens the same issue, so the list finds it by its ID.

These cases hold back issues the check would otherwise choose:
- **No reported list:** on the first run, or after the cache is lost, the check records every current issue and chooses none. Without that, every error already in PostHog, such as the test errors from setting up error reporting, would start a session.
- **More than 5 issues at once:** a run chooses at most the 5 oldest by first-seen time, and the rest wait for the next run. That keeps a burst of errors well under the routine's hourly call limit.
- **Texts too big to pass on together:** a run stops choosing once the chosen texts would pass 100,000 bytes, and the rest wait for the next run, so a newer issue never jumps ahead of an older one. Each text is shortened to fit on its own, as "The Text" describes.

> [!NOTE]
> The 100,000-byte budget exists because the step that starts the routine reads the chosen texts from one env var, as a JSON array, and the runner limits an env var's size. The budget leaves room under that limit for `jq` to re-encode the array.

## The Two Jobs
The workflow has two jobs, split as `dependency-updates.yml`'s are, so each secret sits in one job:
- **`check`** installs Node and pnpm from `mise.toml`, restores the reported list and runs `pnpm -s errors:check` with the PostHog read key. The script uses only Node's built-in modules, so the job runs no `pnpm install`, and no package's install script runs beside the key. Its outputs are a `text` for each chosen issue and the updated list.
- **`start-production-errors`** runs whenever `check` succeeds, even with nothing chosen, so the list keeps up with each issue's status. It starts the routine once per `text`, then saves the list. It holds the routine's two secrets and nothing else.

If a call to start the routine fails, `start-production-errors` still makes the remaining calls, then saves the list. An issue whose call failed keeps the entry it had, or still has none, so the next run sends it again. Then the job fails, so the run shows in Actions.

## The Text
Like `vercel-deploy-errors.yml`'s, the `text` carries the evidence, because the session has no PostHog access (see "Routines"). It opens with one line of identifiers: whether the issue is new or reopened, its ID and its PostHog link. Then come the issue's details, its latest event, and each exception with its stack frames. The frames run from the one that raised the error outward. If the text is longer than `/fire`'s size limit, or its JSON is over the 100,000-byte budget in "What Starts a Session", the check drops frames from the bottom until it fits.

Error messages are untrusted input: the app reports whatever text an error holds. So the texts reach the `/fire` call only through its step's `env:`, and `jq` builds each body. The check also puts each value on one line, so a newline in a message can't pass for a line of the text.

Its exact shape is in step 1 of the [`production-errors` skill](../.claude/skills/production-errors/SKILL.md), which reads it, so a change to the shape changes the script and the skill together.

## The Reported List
The Actions cache holds each issue's last known status, keyed by issue ID. Each run records the status of every issue it read, except the ones it would choose. A chosen issue is recorded once its routine has started, and one held back by the limit of 5 or the 100,000-byte budget keeps the entry it had, or still has none, until a later run chooses it. The list keeps an issue's entry after the issue has gone 7 days without an occurrence. So if it occurs again, it isn't taken for new: it starts nothing if it was active, and counts as reopened if it was resolved.

`check` restores the newest cache entry whose key starts with `production-errors-reported-`, and `start-production-errors` saves the updated list as `production-errors-reported-<run ID>`, since a cache entry can't be changed once saved. GitHub deletes entries that no run has read for a while, so the list is lost only when the workflow has been off. To clear it on purpose, delete the entries, from Actions → Caches or with `gh cache delete <key>`. The next run then records the current issues and starts nothing.

## When PostHog Fails
If PostHog refuses the read key (a 401 or 403), such as once the key is revoked, the check chooses no issues. It sends one text in their place: `PostHog refused the read key: HTTP <status> <message>`. Its session writes no note, and its summary tells you to replace the key, as `docs/services.md`, "Replacing the PostHog Read Key", describes. The list records that the refusal was reported, so the runs after it stay quiet until the key works again, rather than starting a session every hour.

Any other PostHog failure, such as an outage, fails `check` before any routine starts. Nothing is saved, so the next run tries again.

# Back-Merge
A hotfix reaches `main` through its own PR, without going through `develop`. If nothing brought it back, the next release from `develop` into `main` could undo it. `back-merge.yml` brings it back on every push to `main`: it merges `main` into `develop` and pushes the merge straight to `develop`, with no PR. Both sides already passed their checks, so the merge runs none.

The workflow first lists the commits on `main` that `develop` lacks, leaving out merge commits (`git rev-list --no-merges origin/develop..origin/main`). If the list is empty, the run stops and pushes nothing. That's the case after a release, when the only commit `develop` lacks is the release's merge commit. Otherwise it merges `main` into `develop` and pushes the merge as the back-merge App (see `docs/services.md`, "The Back-Merge App").

The `develop` ruleset refuses every direct push except the App's, so the push goes out with the App's token. The workflow's own token stays `contents: read`. The App's token asks only for Contents and Workflows write. It needs Workflows because GitHub refuses an App's push of any commit that changes `.github/workflows/` unless the token has that permission.

**When the merge conflicts,** the job fails and pushes nothing. Bring the hotfix back by hand: in a worktree session, merge `origin/main` into a branch from `develop`, resolve the conflict and open a PR into `develop`. Merge it with a merge commit, not a squash. A squash would leave `main`'s commits out of `develop`'s history, so git would still count them as missing from `develop`.

**When `develop` moves during a run,** such as a PR merging between the checkout and the push, GitHub refuses the push as not a fast-forward, and the job fails. Rerun it, and it merges again onto the new `develop`. Another back-merge never causes this, since runs wait their turn.

# Database Backup
`backup.yml` backs up production's database to a private R2 bucket. `docs/backups.md` covers when it runs, what the backups hold, how to restore one and what to do when a run fails. The Actions secrets and variables it reads are recorded in `docs/services.md`, "Actions Secrets and Variables".

The workflow needs no `pnpm install`, since `scripts/db-backup.sh` uses only the tools mise installs (`age`, `rclone` and `mongodump`). Skipping it means no package's install script runs beside the `backup` user's connection string and the workflow's R2 token.

# The App's Variables
Wherever a workflow or the routines' cloud environment sets a variable from `src/env.ts`, the value is a dummy that passes the schema, such as `mongodb://localhost:27017/ci` for `DB_URL`. It's never a real value, such as the production database URL or a Resend API key, and never read from an Actions secret. The checks only need values that pass validation. A routine's session also runs without permission prompts while it reads untrusted text, such as CI logs, so a real secret in its environment could be leaked by injected text. `docs/services.md`, "The Environments", says where each environment's real values are stored.

The dummies live in two places, with the same values:
- the `env:` block at the top of `checks.yml`, so every job sees them
- the cloud environment's variables (see `docs/services.md`, "The Cloud Environment")

When you add a variable to `src/env.ts`, where it needs a value depends on whether the schema requires it:
- **If it's required:** give it a dummy in both, beside the unit-test value in `test/mocks/env.ts` and the E2E value in `playwright.config.ts` (see `docs/e2e_tests.md`, "Environment Variables"). For the cloud environment, that means its variables on claude.ai and their record in `docs/services.md`. It also needs a value in Vercel (Settings → Environment Variables), for Production and for Preview. A variable missing from either can fail that environment's deploy, since `src/env.ts` checks every variable.
- **If it's optional:** it gets no dummy in either, because the checks pass without it. Error reporting's two, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_VERCEL_ENV`, are like this. Each still gets an E2E value in `playwright.config.ts`, which lists every app variable. `docs/services.md`, "The Environments", says where each one is set on Vercel.

The build's `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` aren't in `src/env.ts`, so CI and the cloud environment leave them unset, and their builds skip the source-map upload (see `docs/services.md`, "The Environments").
