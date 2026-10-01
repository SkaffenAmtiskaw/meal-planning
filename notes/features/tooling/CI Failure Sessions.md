---
type: infra
status: in-progress
blocked-by: []
confirmed: 2026-09-30
---
# Where It Stands
In progress. Next: implement Step 4 ^status

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

Already built by a sibling: `checks.yml`'s four check jobs, the `lint:ci` script, `docs/ci.md` with its first sections, and the ruleset on `main`.

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
![[CI Checks#`develop` as the default branch]]

![[CI Checks#The Claude GitHub App]]

![[CI Checks#The cloud environment]]

![[CI Checks#The `ci-failure` routine]]

# Implementation
Decisions Sarah made 2026-09-30 while planning, cited in the steps below:
- **`develop` is the default branch:** routines clone it and run its skills (Decision 10 in [[CI Checks]]; routines docs: "uses skills committed to the cloned repository", "Each repository is cloned at the start of a run, starting from the default branch").
- **Tools:** the cloud setup script installs only node and pnpm from `mise.toml`, not rtk.

## Step 1: The routine, run by hand
**Idea:** Running the `ci-failure` routine by hand starts a cloud session that checks out the head branch named in its text.

**Source:** Design: `.claude/skills/ci-failure/` (step 1 of its session only); Design: `.claude/skills/routine-sessions/SKILL.md`; Design: `docs/ci.md` ("Setup Outside the Repo" for the app, the cloud environment and the routine list; the cloud side of "Workflows" and "Secrets and Environment Values"); Setup Outside the Repo: `develop` as the default branch, The Claude GitHub App, The cloud environment, The `ci-failure` routine (created, without its token); Goal: the `routine-sessions` skill; Goal: `docs/ci.md` (the cloud environment's values and the setup outside the repo); Design: The flow (step 4); Decisions 1, 2, 3, 6, 7 and 10 (Decision 5, the ruleset on `main`, is already built by PR Checks); Research: a routine clones the default branch unless told otherwise (now `develop`), and a cloud session gets only what's in the repo; Conventions 3, 4, 5, 6, 7, 8, 9, 10, 11 (cloud side), 15 (cloud side). Sarah decided 2026-09-30: `develop` becomes the repo's default branch, so the routine runs the skills on `develop`; only node and pnpm in the cloud; the routine runs on Sonnet, since the failures it handles here (lint, types, unit tests, build) are mostly straightforward.

**Approach:**
- `routine-sessions/SKILL.md` (new, `user-invocable: false`): "Instructions" (Conventions 3, 4, 5, plus the fact behind Sarah's 2026-09-30 decision: a routine clones the default branch, `develop`, and runs its skill as it is there, so a change to it reaches the routine once it's pushed to `develop`), "What the Session Does" (Conventions 7, 8), "Branches" (Convention 9), "What the Session Can Use" (Convention 10). Follow the shape of `running-the-app/SKILL.md`, the existing shared-rule skill.
- `ci-failure/SKILL.md` (new, default invocation frontmatter, Convention 4): points to `routine-sessions`, and to `docs/ci.md` as it is after the checkout, since the head branch's copy matches that branch's `checks.yml`; reads the PR number, head branch, run ID and URL and failed jobs from the `routine-fire-payload` block; fetches the head branch (`git fetch origin <branch>`, in case the routine's clone holds only `develop`) and checks it out (Convention 7), then runs `pnpm install --frozen-lockfile`, since the head branch's lockfile may differ from `develop`'s. **Scaffolding:** it then stops with a placeholder summary listing what it read from the payload and the branch it's on, and says the rest isn't built yet. Step 3 replaces the placeholder. It never loads `running-the-app` or anything that reaches it (Convention 10).
- `ci-failure/routine.md` (new, Convention 5): name `ci-failure`, the prompt word for word ("Run `/ci-failure` on the failed run described in the routine-fire-payload block."), the model (Sonnet), the API trigger (its caller and secrets come in Step 2), the cloud environment and its variables. `SKILL.md` doesn't point to it.
- **The cloud environment's setup script and variables (implementer):** the implementer writes the exact text Sarah pastes into the cloud environment (below), and records both in `docs/ci.md` "Setup Outside the Repo" so the environment can be rebuilt.
  - **Variables:** the eight dummy values from `checks.yml`'s `env:` block, in `.env` format (one `KEY=value` per line). No `GH_TOKEN` or `GITHUB_TOKEN`.
  - **Setup script:**
    1. Installs mise from npm (`npm install -g @jdxcode/mise`). `mise.run` and `mise.jdx.dev` aren't on the Trusted list, and the cloud environments docs say the GitHub proxy lets release-asset requests reach only repos attached to the session.
    2. Runs `mise trust` and `mise install node pnpm`. If pnpm's default `aqua:pnpm/pnpm` backend is blocked, it sets `MISE_DISABLE_BACKENDS=aqua` so mise uses `npm:pnpm`.
    3. Puts mise's shims ahead of `/opt/node22` on `PATH` for the session's shell. The setup script runs before Claude Code launches and only its files carry over, so this has to be written to disk, such as in a profile file the session's shell reads.
    4. Runs `pnpm install --frozen-lockfile` on the cloned `develop`, if the repo is there when the script runs, so the cached snapshot holds a warm pnpm store. The skill's own `pnpm install --frozen-lockfile` after checkout covers correctness either way. If the repo isn't there when the script runs, bring it to Sarah before dropping this part of the design.

    The script can only be tried in a real session. If the first check shows the session failed to start or has the wrong tools, the implementer reads the session's setup output, revises the script, and Sarah pastes the new version (editing the environment, step 3 below, then saving). If node or pnpm can't be installed from the Trusted list at all, stop and bring it to Sarah, since that changes the network choice in the design.
- **Setup Sarah does by hand before the checks.** The step gives her these instructions, with the pasted text filled in:
  1. **Make `develop` the default branch (GitHub).** On github.com, open the `meal-planning` repo → **Settings** → **General**. Under **Default branch**, click the switch-branches button (two arrows), pick `develop`, click **Update**, then confirm. The ruleset named `main` targets `main` by name (Sarah confirmed 2026-09-30), so it stays on `main`. Then:
     - In Vercel, open the project → **Settings** → **Environments** → **Production** → **Branch Tracking**, and check it still says `main`.
     - In the repo on your machine, run `git remote set-head origin --auto`.
  2. **Install the Claude GitHub App (GitHub).** Go to https://github.com/apps/claude and click **Install** (or **Configure** if it's already installed on your account). Pick your account, choose **Only select repositories**, add `meal-planning`, and click **Install** (or **Save**). If `meal-planning` is already in the list, there's nothing to do.
  3. **Create the cloud environment (claude.ai).** Cloud environments live on claude.ai, not GitHub. They're where Claude Code cloud sessions run, and routines use them too.
     - Go to https://claude.ai/code. In the row just above the message box, click the cloud button showing an environment's name (probably **Default**). There's no settings page or direct link for this menu.
     - In the menu that opens, under **Cloud**, click **Add cloud environment**.
     - In the **New cloud environment** dialog: **Name**: `Meal Planning Routines`. **Network access**: leave it on **Trusted**. **Environment variables**: paste the variables block. **Setup script**: paste the setup script.
     - Click **Create environment**.
     - You don't need to start a session in it. The routine will use it.
  4. **Create the `ci-failure` routine (claude.ai).** Go to https://claude.ai/code/routines and click **New routine**. (In the desktop app's Code tab, **Routines** in the sidebar → **New routine** → **Cloud** opens the same form.)
     - **Name:** `ci-failure`.
     - **Prompt:** paste `Run /ci-failure on the failed run described in the routine-fire-payload block.` In the model selector in the prompt box, pick **Sonnet**.
     - **Repositories:** add `meal-planning`.
     - **Environment:** pick `Meal Planning Routines`.
     - **Select a trigger:** choose **API**. The URL and token come after saving, in Step 2.
     - **Connectors:** at the bottom of the form, remove every connector. The routine needs none, and it can use any connector left there without asking.
     - Click **Create**.
- The first check uses **Run now** with text, which the routines docs say "reaches the routine the same way as the API trigger's `text` field", wrapped in the `routine-fire-payload` block. So this step needs no token.
- The skill changes reach the routine once they're pushed to `develop`, so Sarah commits and pushes them before the checks.
- `docs/ci.md`:
  - "Setup Outside the Repo": its opening sentence widens from GitHub's settings to GitHub's and claude.ai's (Boy Scout fix: it names only GitHub, found by the plan checker 2026-09-30); "The Ruleset on `main`" says it targets `main` by name; `develop` as the default branch (routines clone it, and Vercel's production branch stays `main`), the Claude GitHub App, the cloud environment (network level, which variables it sets, what the setup script does), and one line for the `ci-failure` routine with its purpose and a link to its skill (Convention 6).
  - "Tools Come from `mise.toml`": the cloud environment's setup script installs mise, then node and pnpm with `mise install`, and sessions run those rather than the Node and pnpm in the cloud image (Convention 15, cloud side).
  - "Secrets and Environment Values": the cloud environment gets the same dummies, and a new `src/env.ts` variable gets one there too (Convention 11, cloud side). `docs/e2e_tests.md` already points to the lists this section names, so it needs no change.

**Files:**
- `.claude/skills/routine-sessions/SKILL.md` (new) - the rules the session follows
- `.claude/skills/ci-failure/SKILL.md` (new) - the session's first step, with a placeholder ending
- `.claude/skills/ci-failure/routine.md` (new) - the routine's configuration on claude.ai
- `docs/ci.md` - records the default branch, the app, the cloud environment and the routine, and adds the cloud environment's tools and dummy values beside the workflow's

**Acceptance:**
- [x] On the `ci-failure` routine's page on claude.ai, click **Run now** with the text "PR #1, head branch main, run 1 https://example.com, failed jobs: lint". See a new session appear in the Code tab of the desktop app. Its summary lists the PR, the head branch, the run and `lint` from the text, says it's on `main` (the routine starts on `develop`, so this shows the checkout), and says the rest isn't built yet. (`main`'s `mise.toml` matches `develop`'s, checked 2026-09-30, so the next check reads the same tools.)
- [x] In that session, ask it to run `which node pnpm` and `node --version`. See mise's shim paths for both, not `/opt/node22`, and the Node version `mise latest node` prints on your machine. (The cloud environment is cached for about seven days, so a Node release since it was built can make yours newer.)
- [x] In the same session, ask it to run `echo $DB_URL $GH_TOKEN`. See the dummy `DB_URL` and `proxy-injected` (the cloud environments docs' placeholder when the GitHub proxy handles authentication).

**Status:** ✅ Complete

**As built:**
- **Environment name:** the cloud environment is named `Meal Planning Routines`, not `routines`, since Sarah already had a "Meal Planning" environment and wanted the project's name in it. Routine sessions appear under **Routines** in the Code tab's sidebar, which `docs/ci.md` now says.
- **Setup script:** the environment has a ninth variable, `CLAUDE_ENV_FILE=/opt/mise-session-env.sh`, a file the setup script writes and Claude Code runs before each command, which puts mise's shims first on `PATH`. The tools reference only promises that aliases, functions and shell options carry over from `~/.bashrc`. The script turns off mise's `aqua` backend from the start, since the cloud environments docs say the GitHub proxy blocks release downloads from repos not attached to the session, and it fails the session if it can't find the repo, rather than fall back to the image's Node.
- **pnpm 12 and `rtk`:** mise's npm backend skips a package's install scripts unless they're approved, and pnpm 12's install script puts its native binary in place, so pnpm crashed on launch. `mise.toml` (not in this step's Files) approves it with `allow_builds = ['pnpm']` and a comment saying why: Sarah chose that over a temporary cloud-only config, and the default backend on her machine and in CI ignores it. The setup script and the file it writes also set `MISE_DISABLE_TOOLS=rtk`, so mise stops looking up `rtk` on GitHub and getting a 403 (Sarah's call).
- **Creating the routine:** the form adds a "Pull request: Opened" GitHub trigger by default, which is removed with ✕ before adding **API** with **+ Add another trigger**.
- **Check 1:** **Run now** on claude.ai has no text field, though the routines docs say it takes text. The check ran through the API trigger instead, with `curl` from Sarah's terminal and the token she copied when she created the routine, so Step 2's setup regenerates the token.
- **Check 3:** a session's permission classifier blocks printing `$GH_TOKEN`, so the check compared `DB_URL` and `GH_TOKEN` to the dummy and `proxy-injected` instead of echoing them.
- **Push notifications:** a session may send one on its own. Sarah doesn't rely on them and left them alone, since the session in the Code tab is still the delivery (Convention 1).

## Step 2: A failed check starts the routine
**Idea:** A failed check on a PR fires the `ci-failure` routine once.

**Source:** Goals: a failed check starts one session; a passing PR starts none; a `claude/` PR starts none; a re-run Sarah starts starts none. Goal: `docs/ci.md` (the start job, how a routine gets started, the routine's secrets). Design: `.github/workflows/checks.yml` - the job that starts `ci-failure`; Design: `docs/ci.md` ("Checks on PRs" for the start job, "Starting a Routine", "Secrets and Environment Values" for Convention 12); Setup Outside the Repo: The `ci-failure` routine (its token and secrets); Design: The flow (steps 1-3, and "When the plumbing fails"); Research: a failed check can't start a routine directly, so a workflow step calls `/fire` (its limit of 30 calls an hour, and no dedupe of retries); Research: `anthropics/claude-code-action` posts to PR comments or the workflow log, not a session (why Convention 1 rules it out); Conventions 1, 2, 12, 13 (the step that starts a routine); Decisions 7 (the trigger's record in `routine.md`), 8 and 9. Sarah decided 2026-09-30: the start job skips PRs from forks, since GitHub gives fork PRs no Actions secrets and a session couldn't fix a fork's branch.

**Approach:**
- `checks.yml` gets a `start-ci-failure` job that needs the four check jobs and runs only if `failure()`, `!cancelled()`, `github.run_attempt == 1`, the head branch (`github.head_ref`) doesn't start with `claude/`, and the PR comes from this repo, not a fork (`github.event.pull_request.head.repo.full_name == github.repository`). It POSTs to `/fire` with `curl`, reading the URL and token from `ROUTINE_CI_FAILURE_URL` and `ROUTINE_CI_FAILURE_TOKEN`, with the headers the routines docs show (`anthropic-beta`, `anthropic-version`). The `text` names the PR number, head branch, run ID and URL, and the failed jobs (each needed job whose result is `failure`), in the shape Step 1's skill reads. Identifiers only, no logs. The PR number, head branch and run values reach the script through the step's `env:`, never `${{ }}` inside `run:`, and the JSON body is built with `jq`, since the repo is public and a branch name is untrusted input (GitHub's security hardening guide for Actions). `curl --fail`, so a rejected call fails the job, and no `--retry`, since `/fire` doesn't dedupe retries and a retry could start two sessions.
- A run cancelled by a new push starts nothing, even when a check had already failed before the cancel (`!cancelled()`). Confirm it by pushing a second commit to a failing branch after `lint` has failed but while `build` is still running: only the second run's session appears.
- The header comment at the top of `checks.yml` mentions the job that starts `ci-failure`, beside the checks.
- **Setup Sarah does by hand before the checks.** The step gives her these instructions (Convention 12: the token goes straight into the secret):
  1. **Get the routine's URL and token (claude.ai).** Go to https://claude.ai/code/routines and click `ci-failure`. Open the menu next to the routine's name, select **Edit**, and scroll to **Select a trigger**. Open the **API** trigger: its dialog shows the routine's URL and a sample `curl` command. Copy the URL somewhere for a moment. Then click **Regenerate** and keep the dialog open: the token is shown only once and can't be seen again. (The token shown when the routine was created was used for Step 1's check, so a new one goes straight into the secret.)
  2. **Store both as Actions secrets (GitHub).** In another tab, open the `meal-planning` repo on github.com → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
     - **Name** `ROUTINE_CI_FAILURE_URL`, **Secret** the URL. Click **Add secret**.
     - **New repository secret** again: **Name** `ROUTINE_CI_FAILURE_TOKEN`, **Secret** the token from the claude.ai dialog. Click **Add secret**.
     - Then close the claude.ai dialog. If the token is ever lost, **Regenerate** in the same dialog makes a new one, which replaces the secret's value.
- `ci-failure/routine.md`: the trigger's caller (`checks.yml`, `start-ci-failure`) and the two secret names.
- `docs/ci.md`: "Checks on PRs" gets the start job and when it runs, including that fork PRs start nothing; "Starting a Routine" (new: Conventions 1 and 2); "Secrets and Environment Values" gets Convention 12; the plumbing failure (a failed `/fire` fails the start job on the PR, and no session starts). "Every Check Is a `package.json` Script" drops "later" from the step that starts a routine, since it now exists, and the opening bullet about `checks.yml` says it also starts `ci-failure`.

**Files:**
- `.github/workflows/checks.yml` - the job that fires the routine
- `.claude/skills/ci-failure/routine.md` - the API trigger's caller and secrets
- `docs/ci.md` - documents the start job, how routines start and the secrets

**Acceptance:**
- [x] Cut a branch from `develop`, break the formatting of one line in a `src/` file, commit with `git commit --no-verify` (the pre-commit hook would fix the formatting), push, and open a PR into `develop`. See `lint` fail, `start-ci-failure` pass, and one new session in the Code tab whose placeholder summary names this PR, its head branch, this run and `lint`.
- [x] On that PR, click **Re-run failed jobs** on GitHub. See `lint` fail again, `start-ci-failure` skipped, and no new session.
- [x] Fix the formatting and push to the same branch. See all four checks pass, `start-ci-failure` skipped, and no new session. Close the PR and delete the branch.
- [x] Cut a branch named `claude/ci-test` from `develop` with the same formatting break (committed with `--no-verify`), push, and open a PR into `develop`. See `lint` fail, `start-ci-failure` skipped, and no new session. Close the PR and delete the branch.

**Status:** ✅ Complete

**As built:**
- **The job's log:** `curl --fail-with-body` prints `/fire`'s response, so the log shows the new session's link on success and the error on failure (Sarah's choice, since the error type is what she'd need to fix the plumbing).
- **The plumbing failure:** Sarah dropped the check that broke the URL secret. Running the job's script against a local server that returned 401 already showed curl printing the error and exiting 22, which fails the job.
- **`docs/ci.md`:** Boy Scout fixes, since a fifth job made "four jobs" wrong: "Checks on PRs" and the ruleset record say "check jobs", the ruleset record says `start-ci-failure` isn't required, and the new section says a new check job also goes in `start-ci-failure`'s `needs`.

## Step 3: Fix a failure that reproduces
**Idea:** A `ci-failure` session fixes a failure that reproduces in the cloud.

**Source:** Goals: the session runs each failed job's script; a failure that reproduces gets a fix PR. Design: `.claude/skills/ci-failure/` (steps 2 and 3 of its session); Design: The flow (steps 5 and 6, the fix-PR path); Setup Outside the Repo: The cloud environment (the session's own commits need the hooks); Decision 4; Convention 8 (something to act on), Convention 9, Convention 13 (the session reruns the same scripts).

**Approach:**
- `ci-failure/SKILL.md`: after checkout and install, run each failed job's script once (the job-to-script mapping in `docs/ci.md` "Checks on PRs"). If any fails, diagnose the cause, commit a fix to a `claude/` branch cut from the head branch, rerun the script to confirm it passes, open a PR from that branch into the head branch, and stop with a summary: the cause, the fix, the PR link and anything Sarah needs to decide. Replace the Step 1 placeholder for this path. If every script passes, it stops with a placeholder saying the failure didn't reproduce and re-running isn't built yet; Step 4 replaces it.
- Confirm the fix commit in the session runs the lefthook pre-commit hooks (`pnpm install` runs lefthook's postinstall, since `lefthook` is in `pnpm-workspace.yaml`'s `onlyBuiltDependencies`, but lefthook may skip installing when `CI` is set). If the hooks don't install in the cloud, the skill installs them (`pnpm lefthook install`) after `pnpm install`.
- Confirm the session can open a PR from its `claude/` branch through the GitHub proxy (the cloud environments docs say PR operations work, and the proxy serves only a pinned set of GraphQL operations for PR workflows). If it can't, stop and bring it to Sarah.
- Sarah pushes the skill change to `develop` before the checks, as in Step 1.

**Files:**
- `.claude/skills/ci-failure/SKILL.md` - runs the failed scripts and fixes a failure that reproduces

**Acceptance:**
- [x] Cut a branch from `develop`, add an error only types catch to a `src/` file (for example, change an existing variable's type annotation to one its value doesn't match), commit with `git commit --no-verify` (the pre-commit build would block it), push, and open a PR into `develop`. See `type-check` and `build` fail, and `lint` and `unit-tests` pass. See one session in the Code tab that ran `pnpm check:types` and `pnpm build`, both failed, committed a fix to a `claude/` branch, reran them passing, and opened a PR from that branch into your branch. Its summary names the type error as the cause and links the PR.
- [x] In that session's transcript, see the pre-commit hooks run on its fix commit.
- [x] Merge the fix PR on GitHub. See the original PR's checks run again and all four pass. Close the PR and delete both branches.

**Status:** ✅ Complete

**As built:**
- **Hooks:** the skill always runs `pnpm lefthook install` after `pnpm install`, rather than only if the check showed it was needed, since it affects only this routine (Sarah's call). Each session starts from a fresh clone, and lefthook's postinstall skips itself when `CI` is set.
- **The failed commit:** the session checks out the commit the failed run tested (`gh run view <run ID> --json headSha`), not the head branch's latest, and cuts the fix branch from the head branch's latest commit (Sarah's call). If the head has moved on and the failed scripts already pass there, it stops with a verdict and opens no PR. It reproduces on the head commit, not GitHub's merge of it into the base branch, so a failure that comes only from the merge goes to the re-run path (Sarah's call). The fetch names the branch with an explicit refspec, since the clone may hold only `develop`. `gh run view` works through the GitHub proxy.
- **Fix branch and PR:** the branch is `claude/ci-fix-<run ID>`, unique per failed run (Sarah's call). The PR's title is `Fix <failed jobs> on <head branch>`, and its body gives the cause and the fix in a line or two with links to the original PR and the failed run; Claude Code adds the session's link itself (Sarah's call).
- **No fix:** if the session can't make the failed scripts pass, it opens no PR, pushes any partial work, and stops with what it found, what it tried and what it needs from Sarah (Sarah's call).
- **`docs/ci.md`:** Boy Scout fix, "The Job That Starts `ci-failure`" says the session checks out the commit the failed run tested.

## Step 4: Re-run a failure that passes in the cloud
**Idea:** A `ci-failure` session re-runs a failure that passes in the cloud once on GitHub.

**Source:** Goals: a failure that doesn't reproduce is re-run once; a passing re-run leaves only a flake verdict; a failing re-run is diagnosed; a re-run the session starts starts no session. Design: `.claude/skills/ci-failure/` (step 4 of its session, and "It re-runs on GitHub at most once"); Design: The flow (step 5, the re-run path); Setup Outside the Repo: The Claude GitHub App (confirm `gh run rerun` works from a cloud session); Convention 8 (nothing to act on); Decision 8.

**Approach:**
- `ci-failure/SKILL.md`: if every failed script passes in the cloud, run `gh run rerun <run_id> --failed` and wait for it, up to 30 minutes (checking with `gh run view`; the cloud docs give commands a 2-minute default and 10-minute maximum timeout, so the wait polls rather than blocking in one command). Then: a passing re-run ends with only a flake verdict (which check flaked, the failed run, the cloud pass, the passing re-run; no fix, no note). A failing re-run is diagnosed from both runs' logs (`gh run view --log-failed`) and from what differs between the cloud and the Actions runner, such as tool versions; if it finds the cause it fixes it as in Step 3, otherwise it stops with what it found and what it needs from Sarah. A timeout stops with the re-run's link and says it's still going. It re-runs at most once. Replaces the Step 3 placeholder, which removes the last scaffolding.
- First confirm `gh run rerun` and `gh run view --log-failed` work from a cloud session through the GitHub proxy (only a user report says the app's access covers re-runs, and the proxy serves only a pinned set of GraphQL operations). If they don't, stop and bring it to Sarah, since the design depends on it. Record the result in `docs/ci.md` "Setup Outside the Repo" under the Claude GitHub App.
- Sarah pushes the skill change to `develop` before the checks, as in Step 1. [Sarah] - The agent can commit and push; just be sure to check for other changed files and confirm with me whether they should be included.
- [Sarah] - For acceptance checks, go ahead and create the branches, push, and open a PR in GitHub. Be sure to _actually_ open the PR, don't just give me a branch comparison URL. (Or if you can't open a PR tell me clearly so I can do it myself.) I will check the URL output myself.

**Files:**
- `.claude/skills/ci-failure/SKILL.md` - re-runs a failure that passes in the cloud and reports the outcome
- `docs/ci.md` - records that the app's access covers re-running jobs and reading their logs

**Acceptance:**
- [ ] Cut a branch from `develop` and add `src/ci-flake.test.ts` with one test that fails only when `process.env.GITHUB_RUN_ATTEMPT === '1'`. Push and open a PR into `develop`. See `unit-tests` fail, then pass on attempt 2 without you re-running it. See one session in the Code tab whose verdict names `unit-tests` as flaky, links the failed run and the passing re-run, and says `pnpm test:coverage` passed in the cloud, with no fix PR. Close the PR and delete the branch.
- [ ] Cut a branch from `develop` and add `src/ci-only.test.ts` with one test that fails only when `process.env.GITHUB_ACTIONS === 'true'`. Push and open a PR into `develop`. See `unit-tests` fail on both attempts and only one session, which says the failure didn't reproduce in the cloud and names the test's dependence on `GITHUB_ACTIONS` as the cause or its lead. It either opens a fix PR or says what it needs from you. Close any PRs and delete the branches.
- [ ] Cut a branch from `develop` and add `src/ci-slow.test.ts` with one test that passes at once when `GITHUB_RUN_ATTEMPT` isn't set (the cloud and your pre-commit hook), fails when it's `'1'`, and otherwise waits 35 minutes before passing (with its own test timeout above that). Push and open a PR into `develop`. See the session stop after about 30 minutes, saying the re-run is still going, with its link. Cancel the run, close the PR and delete the branch.
