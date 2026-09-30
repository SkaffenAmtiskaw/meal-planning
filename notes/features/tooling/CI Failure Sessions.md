---
type: infra
status: spec
blocked-by:
  - "[[PR Checks]]"
confirmed: 2026-09-30
---
# Where It Stands
Next: /plan-steps ^status

# Purpose
Make a failed check on a PR start a Claude Code cloud session. The session reproduces the failure, then either fixes it through a PR or tells a flake from a real failure, so the result reaches Sarah in the Code tab of the Claude desktop app instead of on GitHub. This story also does the one-time setup and writes the convention every later source of results shares: the Claude GitHub App, the cloud environment, the `routine-sessions` skill and the routine parts of `docs/ci.md`. Those later sources are [[E2E Tests in CI]], [[Sentry Logging and Root Cause Analysis]], [[Local Dependency Update Alerts]] and the watch-tools line under [[Dev Foundations]]. Split from [[CI Checks]] on 2026-09-30.

# Goals
- [ ] A PR with a failed check starts one `ci-failure` cloud session, which appears in the Code tab of the Claude desktop app.
- [ ] A PR where every check passes starts no session.
- [ ] A failed check on a PR whose head branch starts with `claude/` starts no session.
- [ ] The session runs each failed job's script on the failing PR's head branch, to see whether the failure reproduces in the cloud.
- [ ] When the failure reproduces, the session leaves a PR from a `claude/` branch into the failing PR's head branch with a fix, and its summary names the cause.
- [ ] When the failure doesn't reproduce in the cloud, the session re-runs the failed jobs on GitHub once.
- [ ] If that re-run passes, the session leaves only a flake verdict: which check flaked, with the failed run, the cloud pass and the passing re-run.
- [ ] If that re-run fails too, the session diagnoses it from both runs. It either leaves a fix PR the same way as a failure that reproduces, or says what it found and what it needs from Sarah.
- [ ] Re-running failed jobs never starts another session, whether the `ci-failure` session starts the re-run or Sarah does.
- [ ] `docs/ci.md` covers the job that starts `ci-failure`, how a routine gets started, the routine's secrets, the cloud environment's values, and the rest of the setup outside the repo (the Claude GitHub App, the cloud environment and the routine list).
- [ ] The `routine-sessions` skill holds the rules for how a routine's session behaves, so later sources can follow them.

# Design
The design lives in [[CI Checks]]. The sections embedded below are part of this note.

![[CI Checks#Decisions]]

![[CI Checks#Research]]

![[CI Checks#`.github/workflows/checks.yml` - the job that starts `ci-failure`]]

![[CI Checks#`.claude/skills/ci-failure/` - the `ci-failure` routine's skill]]

![[CI Checks#`.claude/skills/routine-sessions/SKILL.md` - the shared rules for routine sessions]]

![[CI Checks#`docs/ci.md` - the CI doc]]

![[CI Checks#The flow]]

Already built by a sibling: `checks.yml`'s four check jobs, the `lint:ci` script, `docs/ci.md` with its first sections, and the ruleset on `main`, all by [[PR Checks]].

# Conventions
![[CI Checks#Convention 1 - Results reach Sarah only as a routine session]]

![[CI Checks#Convention 2 - A routine starts only when there's something for Sarah]]

![[CI Checks#Convention 3 - A routine's prompt only runs its skill]]

![[CI Checks#Convention 4 - A routine's skill keeps the default invocation settings]]

![[CI Checks#Convention 5 - Each routine's configuration is in its skill's `routine.md`]]

![[CI Checks#Convention 6 - `docs/ci.md` lists every routine with its purpose]]

![[CI Checks#Convention 7 - A routine's skill names the branch it works from]]

![[CI Checks#Convention 8 - A routine's skill says how the session ends, for each outcome]]

![[CI Checks#Convention 9 - A routine's session pushes only to `claude/` branches]]

![[CI Checks#Convention 10 - A routine's skill uses only what's in the repo and its cloud environment]]

![[CI Checks#Convention 11 - The app's variables get dummy values in CI and cloud environments]]

![[CI Checks#Convention 12 - A routine's `/fire` URL and token are Actions secrets]]

![[CI Checks#Convention 13 - CI runs only `package.json` scripts, and none of them writes fixes]]

![[CI Checks#Convention 15 - Every environment installs its tools from `mise.toml`]]

# Setup Outside the Repo
![[CI Checks#The Claude GitHub App]]

![[CI Checks#The cloud environment]]

![[CI Checks#The `ci-failure` routine]]

# From the Split
%% Draft handed over when this story was split from [[CI Checks]]. Not approved yet. /plan-steps starts from it and deletes this section when it writes Implementation. %%

Decisions Sarah made 2026-09-30 while planning, cited in the steps below:
- **Skill on `main`:** a routine clones `main` and runs the skills committed there (routines docs: "uses skills committed to the cloned repository", "Each repository is cloned at the start of a run, starting from the default branch"). So before a routine step's checks, the `.claude/skills/` changes go into `main` through a PR from a branch cut from `main` that holds only those files, so no app code reaches production.
- **Tools:** the cloud setup script installs only node and pnpm from `mise.toml`, not rtk.

## Step 1: The routine, run by hand
**Idea:** Running the `ci-failure` routine by hand starts a cloud session that checks out the head branch named in its text.

**Source:** Design: `.claude/skills/ci-failure/` (step 1 of its session only); Design: `.claude/skills/routine-sessions/SKILL.md`; Design: `docs/ci.md` ("Setup Outside the Repo" for the app, the cloud environment and the routine list); Setup Outside the Repo: The Claude GitHub App, The cloud environment, The `ci-failure` routine (created, without its token); the `routine-sessions` Goal; Conventions 3, 4, 5, 6, 7, 8, 9, 10, 11 (cloud side), 15 (cloud side). Sarah decided 2026-09-30: the skill reaches `main` through a skill-only PR; only node and pnpm in the cloud.

**Approach:**
- `routine-sessions/SKILL.md` (new, `user-invocable: false`): "Instructions" (Conventions 3, 4, 5, plus the fact behind Sarah's 2026-09-30 decision: a routine runs its skill as it is on `main`, so a change to it reaches the routine only once it's merged into `main`), "What the Session Does" (Conventions 7, 8), "Branches" (Convention 9), "What the Session Can Use" (Convention 10). Follow the shape of `running-the-app/SKILL.md`, the existing shared-rule skill.
- `ci-failure/SKILL.md` (new, default invocation frontmatter, Convention 4): points to `routine-sessions` and `docs/ci.md`; reads the PR number, head branch, run ID and URL and failed jobs from the `routine-fire-payload` block; checks out the head branch (Convention 7), then runs `pnpm install --frozen-lockfile`, since the head branch's lockfile may differ from `main`'s. **Scaffolding:** it then stops with a placeholder summary listing what it read from the payload and the branch it's on, and says the rest isn't built yet. Step 3 replaces the placeholder. It never loads `running-the-app` or anything that reaches it (Convention 10).
- `ci-failure/routine.md` (new, Convention 5): name `ci-failure`, the prompt word for word ("Run `/ci-failure` on the failed run described in the routine-fire-payload block."), the API trigger (its caller and secrets come in Step 2), the cloud environment and its variables. `SKILL.md` doesn't point to it.
- Setup Sarah does before the checks, with instructions in the step:
  - Install the Claude GitHub App on the repo, if it isn't already.
  - Create the cloud environment: Trusted network; the eight dummy values, the same as `checks.yml`'s; no `GH_TOKEN` or `GITHUB_TOKEN`. The setup script installs mise from npm (`npm install -g @jdxcode/mise`), because `mise.run` and `mise.jdx.dev` aren't on the Trusted list and GitHub release downloads reach only repos attached to the session. It then runs `mise trust` and `mise install node pnpm`, and puts mise's shims ahead of `/opt/node22` on `PATH` for the session's shell. If pnpm's default `aqua:pnpm/pnpm` backend is blocked, it sets `MISE_DISABLE_BACKENDS=aqua` so mise uses `npm:pnpm`. If node or pnpm can't be installed from the Trusted list at all, stop and bring it to Sarah, since that changes the network choice in the design.
  - Create the `ci-failure` routine on claude.ai: this repo, that environment, no connectors, the prompt above, an API trigger (no token yet).
- Before the checks, a branch cut from `main` gets only `.claude/skills/routine-sessions/` and `.claude/skills/ci-failure/` from `develop` and goes into `main` through a PR. If `main` doesn't have `checks.yml` yet, the branch also takes `.github/workflows/checks.yml` and the `package.json` script changes from [[PR Checks]], so its required checks can run. No app code goes to `main`.
- `docs/ci.md` "Setup Outside the Repo": the Claude GitHub App, the cloud environment (network level, which variables it sets, what the setup script does), and one line for the `ci-failure` routine with its purpose and a link to its skill (Convention 6).

**Files:**
- `.claude/skills/routine-sessions/SKILL.md` (new) - the rules the session follows
- `.claude/skills/ci-failure/SKILL.md` (new) - the session's first step, with a placeholder ending
- `.claude/skills/ci-failure/routine.md` (new) - the routine's configuration on claude.ai
- `docs/ci.md` - records the app, the cloud environment and the routine

**Acceptance:**
- [ ] On the `ci-failure` routine's page on claude.ai, click **Run now** with the text "PR #1, head branch develop, run 1 https://example.com, failed jobs: lint". See a new session appear in the Code tab of the desktop app. Its summary lists the PR, the head branch, the run and `lint` from the text, says it's on `develop`, and says the rest isn't built yet.
- [ ] In that session, ask it to run `git branch --show-current`, `node --version` and `pnpm --version`. See `develop`, and the Node and pnpm versions `mise latest node` and `mise latest pnpm` print on your machine.
- [ ] In the same session, ask it to run `echo $DB_URL $GH_TOKEN`. See the dummy `DB_URL` and `proxy-injected`.

## Step 2: A failed check starts the routine
**Idea:** A failed check on a PR fires the `ci-failure` routine once.

**Source:** Goals: a failed check starts one session; a passing PR starts none; a `claude/` PR starts none; a re-run Sarah starts starts none. Design: `.github/workflows/checks.yml`: the job that starts `ci-failure`; Design: `docs/ci.md` ("Checks on PRs" for the start job, "Starting a Routine", "Secrets and Environment Values" for Convention 12); Setup Outside the Repo: The `ci-failure` routine (its token and secrets); Design: The flow ("When the plumbing fails"); Conventions 1, 2, 12; Decisions 8 and 9.

**Approach:**
- `checks.yml` gets a `start-ci-failure` job that needs the four check jobs and runs only if `failure()`, `github.run_attempt == 1` and the head branch (`github.head_ref`) doesn't start with `claude/`. It POSTs to `/fire` with `curl`, reading the URL and token from `ROUTINE_CI_FAILURE_URL` and `ROUTINE_CI_FAILURE_TOKEN`, with the headers the routines docs show (`anthropic-beta`, `anthropic-version`). The `text` names the PR number, head branch, run ID and URL, and the failed jobs (each needed job whose result is `failure`). Identifiers only, no logs. `curl --fail`, so a rejected call fails the job.
- Sarah generates the routine's token on claude.ai and stores both secrets before the checks, with the step's instructions (Convention 12: the token goes straight into the secret).
- `ci-failure/routine.md`: the trigger's caller (`checks.yml`, `start-ci-failure`) and the two secret names.
- `docs/ci.md`: "Checks on PRs" gets the start job and when it runs; "Starting a Routine" (new: Conventions 1 and 2); "Secrets and Environment Values" gets Convention 12; the plumbing failure (a failed `/fire` fails the start job on the PR, and no session starts).

**Files:**
- `.github/workflows/checks.yml` - the job that fires the routine
- `.claude/skills/ci-failure/routine.md` - the API trigger's caller and secrets
- `docs/ci.md` - documents the start job, how routines start and the secrets

**Acceptance:**
- [ ] Cut a branch from `develop`, break the formatting of one line in a `src/` file, push, and open a PR into `develop`. See `lint` fail, `start-ci-failure` pass, and one new session in the Code tab whose placeholder summary names this PR, its head branch, this run and `lint`.
- [ ] On that PR, click **Re-run failed jobs** on GitHub. See `lint` fail again, `start-ci-failure` skipped, and no new session.
- [ ] Fix the formatting and push to the same branch. See all four checks pass, `start-ci-failure` skipped, and no new session. Close the PR and delete the branch.
- [ ] Cut a branch named `claude/ci-test` from `develop` with the same formatting break, push, and open a PR into `develop`. See `lint` fail, `start-ci-failure` skipped, and no new session. Close the PR and delete the branch.
- [ ] Temporarily change the `ROUTINE_CI_FAILURE_URL` secret to the URL with its last character removed, then repeat the first check on a new branch. See `start-ci-failure` fail on the PR and no new session. Set the secret back, close the PR and delete the branch.

## Step 3: Fix a failure that reproduces
**Idea:** A `ci-failure` session fixes a failure that reproduces in the cloud.

**Source:** Goals: the session runs each failed job's script; a failure that reproduces gets a fix PR. Design: `.claude/skills/ci-failure/` (steps 2 and 3 of its session); Design: The flow (steps 5 and 6, the fix-PR path); Convention 8 (something to act on), Convention 9. Sarah decided 2026-09-30: the skill reaches `main` through a skill-only PR.

**Approach:**
- `ci-failure/SKILL.md`: after checkout and install, run each failed job's script once (the job-to-script mapping in `docs/ci.md` "Checks on PRs"). If any fails, diagnose the cause, commit a fix to a `claude/` branch cut from the head branch, rerun the script to confirm it passes, open a PR from that branch into the head branch, and stop with a summary: the cause, the fix, the PR link and anything Sarah needs to decide. Replace the Step 1 placeholder for this path. If every script passes, it stops with a placeholder saying the failure didn't reproduce and re-running isn't built yet; Step 4 replaces it.
- Confirm the fix commit in the session runs the lefthook pre-commit hooks (`pnpm install` runs lefthook's postinstall, since `lefthook` is in `pnpm-workspace.yaml`'s `onlyBuiltDependencies`). If the hooks don't install in the cloud, the skill installs them (`pnpm lefthook install`) after `pnpm install`.
- Skill-only PR into `main` before the checks, as in Step 1.

**Files:**
- `.claude/skills/ci-failure/SKILL.md` - runs the failed scripts and fixes a failure that reproduces

**Acceptance:**
- [ ] Cut a branch from `develop`, add a type error to a `src/` file (for example, pass a number where a string prop is expected), push, and open a PR into `develop`. See `type-check` and `build` fail. See one session in the Code tab that ran `pnpm check:types` and `pnpm build`, both failed, committed a fix to a `claude/` branch, reran them passing, and opened a PR from that branch into your branch. Its summary names the type error as the cause and links the PR.
- [ ] In that session's transcript, see the pre-commit hooks run on its fix commit.
- [ ] Merge the fix PR on GitHub. See the original PR's checks run again and all four pass. Close the PR and delete both branches.

## Step 4: Re-run a failure that passes in the cloud
**Idea:** A `ci-failure` session re-runs a failure that passes in the cloud once on GitHub.

**Source:** Goals: a failure that doesn't reproduce is re-run once; a passing re-run leaves only a flake verdict; a failing re-run is diagnosed; a re-run the session starts starts no session. Design: `.claude/skills/ci-failure/` (step 4 of its session, and "It re-runs on GitHub at most once"); Setup Outside the Repo: The Claude GitHub App (confirm `gh run rerun` works from a cloud session); Convention 8 (nothing to act on); Decision 8.

**Approach:**
- `ci-failure/SKILL.md`: if every failed script passes in the cloud, run `gh run rerun <run_id> --failed` and wait for it, up to 30 minutes (checking with `gh run view`, within the session's command timeouts). Then: a passing re-run ends with only a flake verdict (which check flaked, the failed run, the cloud pass, the passing re-run; no fix, no note). A failing re-run is diagnosed from both runs' logs (`gh run view --log-failed`) and from what differs between the cloud and the Actions runner, such as tool versions; if it finds the cause it fixes it as in Step 3, otherwise it stops with what it found and what it needs from Sarah. A timeout stops with the re-run's link and says it's still going. It re-runs at most once. Replaces the Step 3 placeholder, which removes the last scaffolding.
- First confirm `gh run rerun` works from a cloud session through the GitHub proxy (only a user report says the app's access covers it). If it doesn't, stop and bring it to Sarah, since the design depends on it. Record the result in `docs/ci.md` "Setup Outside the Repo" under the Claude GitHub App.
- Skill-only PR into `main` before the checks, as in Step 1.

**Files:**
- `.claude/skills/ci-failure/SKILL.md` - re-runs a failure that passes in the cloud and reports the outcome
- `docs/ci.md` - records that the app's access covers re-running jobs

**Acceptance:**
- [ ] Cut a branch from `develop` and add `src/ci-flake.test.ts` with one test that fails only when `process.env.GITHUB_RUN_ATTEMPT === '1'`. Push and open a PR into `develop`. See `unit-tests` fail, then pass on attempt 2 without you re-running it. See one session in the Code tab whose verdict names `unit-tests` as flaky and links the failed run, the cloud pass and the passing re-run, with no fix PR. Close the PR and delete the branch.
- [ ] Cut a branch from `develop` and add `src/ci-only.test.ts` with one test that fails only when `process.env.GITHUB_ACTIONS === 'true'`. Push and open a PR into `develop`. See `unit-tests` fail on both attempts and only one session, which says the failure didn't reproduce in the cloud, and either opens a fix PR with the cause or says what it found and what it needs from you. Close any PRs and delete the branches.
- [ ] Cut a branch from `develop` and add `src/ci-slow.test.ts` with one test that fails on attempt 1 and, on later attempts, waits 35 minutes before passing (with its own test timeout above that). Push and open a PR into `develop`. See the session stop after about 30 minutes, saying the re-run is still going, with its link. Cancel the run, close the PR and delete the branch.

# Implementation
