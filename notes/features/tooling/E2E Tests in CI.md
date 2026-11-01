---
type: infra
status: ready
blocked-by: []
confirmed: 2026-10-06
---
# Where It Stands
Ready. Next: /infra-build ^status

Split from E2E Testing on 2026-09-28. `/infra-design` wrote the Goals, Design, Conventions, Setup Outside the Repo and a four-step Build Order on 2026-10-06. Nothing is built yet.

# Inbox
- Piece 4 says `root-cause-analyst`'s report is "in the shape of `/investigate`'s Root Cause". Since 2026-10-31 that Root Cause follows `.claude/skills/building-code/reproducing-a-bug.md`: where the fault starts, what the code does and should do, the evidence labeled "seen in the running app" or "reproduced in a unit test", whether it's in one module or several, and whether a test covers it. Evidence read from the code alone is no longer one of the labels, so the report Piece 4 describes no longer matches that shape.

# Purpose
Run the E2E tests automatically in CI instead of locally on every commit, and when one fails, have an agent run a preliminary root cause analysis that's ready for Sarah to review.

Sarah's notes from E2E Testing:
- I want e2e tests to run automatically, but I don't want them to run locally every time I commit because they take goddamn forever. So this probably means it's time for GHA. The most obvious (to me) place to run them is when develop opens a PR into main.
- If e2e tests are running in CI, we might need a new environment. We need to figure out moving pieces for that. (note: it'd be super nice if this work created a document about creating a new environment I could refer back to later!)
- I'd love if a failed e2e test automatically kicked off a Claude agent that did a preliminary root cause analysis for me to review

# Goals
- [ ] The E2E tests run in GitHub Actions on every PR into a protected branch: `main` today, and `develop` too once [[Branching and Releases]] protects it.
- [ ] A PR into a protected branch can't be merged while its `e2e` check is failing.
- [ ] A failed `e2e` job starts a `ci-failure` session, which waits for Sarah in the Code tab under **Routines**.
- [ ] When a spec fails because it wasn't updated for a change the PR meant to make, the `ci-failure` session updates the spec and opens a fix PR, as it does for a lint failure.
- [ ] When a spec fails because the app is broken, the `ci-failure` session ends with a preliminary root cause analysis for Sarah to review, makes no fix, and offers to create a bug note from the analysis.
- [ ] The root cause analysis in the goal above is written by a stronger model than `ci-failure`'s Sonnet.

# Open Decisions
1. How does a hard E2E failure's diagnosis get a stronger model? A routine has one model for every run, and `ci-failure` runs on Sonnet (`.claude/skills/ci-failure/routine.md`). The two ways found while planning CI Failure Sessions 2026-09-30:
   - the skill hands a hard failure's diagnosis to a subagent set to a stronger model, such as Opus
   - a second routine with its own model, which the workflow fires instead of `ci-failure` when the E2E job fails
   - **Decided 2026-10-06:** the skill hands a hard failure's diagnosis to a subagent set to a stronger model, following the pattern [[Dependency Release Analysis]] uses: the routine stays on Sonnet, and a subagent whose `model` frontmatter is `opus` does the work that needs more reasoning (its `upgrade-assessor`, decided in [[Local Dependency Update Alerts]]). Sarah's call: follow the pattern already established.
     - Rejected: a second routine with its own model, fired instead of `ci-failure` when the E2E job fails - the established pattern keeps one Sonnet routine and moves the hard work to an Opus subagent
2. Is the `e2e` job a required check in the ruleset on `main`?
   - **Decided 2026-10-02:** yes. Sarah's call.
3. When the `e2e` job fails, does the `ci-failure` session fix the failure or only analyze it?
   - **Decided 2026-10-06:** a spec that wasn't updated for a change the PR meant to make gets fixed, with a PR, just like a linting issue. Sarah's call (her leaning of 2026-10-02), checked against the code and notes. When the app itself is broken, the session only analyzes it and offers a bug note, since the bug workflow reproduces, plans and reviews every fix.
     - Rejected: the session also fixes an app break when the analysis finds it small - the fix would skip the bug workflow

# Design
## Pieces
1. **The `e2e` job** in `.github/workflows/checks.yml` runs the E2E tests on a PR into a protected branch.
   - It runs only when the PR's base branch is in a list of protected branches in the job's `if`: `contains(fromJSON('["main"]'), github.base_ref)` ([GitHub expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)). On any other PR it shows as skipped, which GitHub counts as a success, so it never blocks a merge.
   - Its steps are the other check jobs' setup (checkout, Node and pnpm from `mise.toml`, `pnpm install --frozen-lockfile`), then a setup step, `pnpm exec playwright install --with-deps chromium`, which installs Chromium and its system libraries as [Playwright's CI guide](https://playwright.dev/docs/ci-intro) does, then `pnpm test:e2e`. It installs only Chromium, since both projects (Desktop Chrome and Pixel 7) run in it.
   - Requirement: it's a job of its own, so its `next build` never shares a `.next` folder with the `build` job. The E2E build uses the default `.next` folder (Sarah decided 2026-09-29).
   - Requirement: `start-ci-failure` lists it in its `needs`, so an `e2e` failure starts a session. A skipped `e2e` starts nothing.
   - `playwright.config.ts` doesn't change: it sets its own env values, and port 3100 is free on the runner.
2. **The ruleset on `main`** requires `e2e` as a fifth status check, next to `lint`, `type-check`, `unit-tests` and `build`. When [[Branching and Releases]] gives `develop` its own ruleset, that ruleset requires `e2e` too, and `develop` joins the list in Piece 1's `if` in the same change. A protected branch missing from the list would skip `e2e`, and the skip would count as a pass.
3. **The `ci-failure` skill** (`.claude/skills/ci-failure/SKILL.md`) handles a failed `e2e` job.
   - Requirement: step 3 runs the failed jobs' scripts one after another, never at once, since `pnpm build` and `pnpm test:e2e` write to the same `.next` folder.
   - If `pnpm test:e2e` fails because Chromium or `mongod` couldn't download, the failure isn't reproduced: the session stops and names the host it couldn't reach.
   - An E2E failure that reproduces, in step 3 or in step 5 after recreating a difference from the runner, is sorted before step 4 fixes anything:
     - **The spec is out of date:** the PR changed the behavior the failing assertion checks, and meant to, as its commits or story show. Step 4 updates the spec and opens the fix PR, as for any other failure.
     - **Anything else, or the session isn't sure:** the session gives the failure to the `root-cause-analyst` subagent (Piece 4). If it finds the spec is out of date after all, step 4 updates it. Otherwise the session makes no fix and opens no PR, stops with the subagent's report unedited, says the subagent wrote it, and offers to create a bug note from it. A note Sarah asks for follows `routine-sessions`, like any other change the session makes.
   - Other failed jobs in the same run are handled as they are today.
4. **The `root-cause-analyst` subagent** (`.claude/agents/root-cause-analyst.md`, `model: opus`) finds where a reproduced failure starts and reports it for Sarah to review. It's where the root cause analysis lives, so the Sentry routine's skill can reuse it.
   - It's given the command that reproduces the failure, its output, and the range of commits under suspicion (for `ci-failure`, the PR's commits).
   - Tools: `Read`, `Grep`, `Glob` and `Bash`, to rerun the command (with a trace for a spec) and read the git history. It never changes a file or commits. Any fix is the session's.
   - Its report, in the shape of `/investigate`'s Root Cause: its verdict (the test is out of date with an intended change, or the code is wrong), where the fault starts (file and function), what the code does and what it should do, the commit that introduced it if found, its evidence (confirmed by a run, or read from the code), which tests cover it, and the fix in a line or two, as a direction rather than a patch.
   - Requirement: nothing in its instructions or report is specific to CI or E2E, so the Sentry routine's skill can hand it a failure the same way. If that turns out not to be possible, neither story waits on it.
   - Requirement: it follows `routine-sessions`' "What the Session Can Use", so it never uses `running-the-app` or `bug-reproducer`.
   - Requirement: [Claude Code's subagent docs](https://code.claude.com/docs/en/sub-agents) define `model: opus`, but don't say whether a subagent with its own model runs in a cloud session, so the Build Order checks it in one.
5. **The `Meal Planning Routines` cloud environment** lets a session run `pnpm test:e2e`.
   - Two allowed domains: `cdn.playwright.dev`, where Playwright 1.63 gets Chromium, its headless shell and ffmpeg, and `fastdl.mongodb.org`, where `mongodb-memory-server` gets `mongod`. Neither is on the Trusted list ([cloud environments](https://code.claude.com/docs/en/cloud-environments)).
   - The setup script runs `pnpm exec playwright install --with-deps chromium` after `pnpm install`, non-fatal like the line before it. The script runs as root, so the system libraries install through apt, and the snapshot keeps Chromium, its libraries and `mongod`, which `pnpm install`'s postinstall downloads once its host is allowed.
   - Requirements, checked in a real session: neither host redirects to one that isn't allowed; the setup still finishes in about five minutes, so the snapshot is cached (if not, the Chromium install runs in the background with `&` and `wait`); sessions find `~/.cache/ms-playwright` and `~/.cache/mongodb-binaries` (if not, `PLAYWRIGHT_BROWSERS_PATH` and `MONGOMS_DOWNLOAD_DIR` point under `/opt`, in both the setup script and `/opt/mise-session-env.sh`).
   - The `dependency-updates` routine shares the environment, so its snapshot grows too. Nothing else about it changes.
6. **`docs/ci.md`** records the E2E job and how its failures are handled.
   - "Checks on PRs": an `e2e` row running `pnpm test:e2e` only on PRs into a protected branch, where that list lives, and five check jobs instead of four.
   - "Every Check Is a `package.json` Script": the Chromium install counts as setup.
   - "The Job That Starts `ci-failure`": its `needs` includes `e2e`, and a paragraph on E2E failures: a spec that's out of date gets a fix PR, a broken app gets the Opus analysis, no fix and the offer of a bug note.
   - "The Ruleset on `main`": `e2e` is required, and the list in the `e2e` job's `if` changes with a branch's ruleset, in the same change.
   - "The Cloud Environment": the two allowed domains and why, and the new setup-script line.
7. **`docs/e2e_tests.md`**, "Running E2E Tests": one line saying CI runs them on every PR into a protected branch, linking `docs/ci.md`, "Checks on PRs".

## Flow
1. A PR is opened or pushed, and `checks.yml` runs. A new push cancels the PR's run in progress. If the PR's base branch is in the protected list, `e2e` runs alongside the four other checks. Otherwise it shows as skipped.
2. `e2e` installs, installs Chromium with its system libraries, and runs `pnpm test:e2e`: the memory server, `next build && next start`, then every spec in `desktop` and `phone`.
   - **It passes:** the required check is green.
   - **It fails:** the merge is blocked, and `start-ci-failure` fires once under its existing conditions (first attempt, not a `claude/` branch, not a fork), with `e2e` among the failed jobs. If the `/fire` call fails, `start-ci-failure` fails next to `e2e`, as today.
3. The `ci-failure` session (Sonnet) checks out the failed commit, runs `pnpm install`, and runs the failed jobs' scripts one after another, with Chromium and `mongod` already in the snapshot.
   - **The tests can't start** because a download was blocked: it stops and names the host.
   - **Every script passes:** step 5 re-runs the run on GitHub once. A pass gets a flake verdict. A failure only GitHub's runner has is diagnosed, and if it reproduces, it's sorted as below.
   - **`pnpm test:e2e` fails:** the session sorts it. A spec out of date with a change the PR meant to make gets updated, with a fix PR into the head branch. Anything else, or if it's unsure, goes to the `root-cause-analyst` subagent (Opus). If it finds the spec is out of date after all, the session fixes it as above. Otherwise there's no fix and no PR: the session stops with the report unedited and offers a bug note.
4. The session waits for Sarah in the Code tab under **Routines**.

## Build Order

### Step 1: The E2E tests run on PRs into `main`
**Builds:** Pieces 1, 2 and 7, and Piece 6's "Checks on PRs", "Every Check Is a `package.json` Script" and "The Ruleset on `main`" (with the first Convention).
**Setup first:** The ruleset on `main`: add `e2e` to the required checks.
**Implementer checks:**
- `e2e` is a job of its own, and `start-ci-failure` lists it in its `needs`.

**Sarah checks:**
- [ ] Once `/infra-build` has pushed this step to `develop` with your OK, open https://github.com/SkaffenAmtiskaw/meal-planning/compare/main...develop and create the PR (or open the PR from `develop` into `main` if one is already open). In its checks, see `e2e` run and pass beside `lint`, `type-check`, `unit-tests` and `build`, marked **Required**. If you created the PR only for this check, close it without merging. Goal: the E2E tests run in GitHub Actions on every PR into a protected branch.

### Step 2: A cloud session can run the E2E tests
**Builds:** Piece 5, and Piece 6's "The Cloud Environment".
**Setup first:** The two allowed domains and the setup script line on the `Meal Planning Routines` cloud environment.
**Implementer checks:**
- The setup script in `docs/ci.md` matches what Sarah pasted, and its comments say why the Chromium line is there.
- From the result Sarah pastes back: neither host redirected to one that isn't allowed, and the session found Chromium and `mongod` without downloading them. If either fails, apply the fallback the Design names (`&` and `wait`, or `PLAYWRIGHT_BROWSERS_PATH` and `MONGOMS_DOWNLOAD_DIR` under `/opt`), update `docs/ci.md` and give Sarah the script to paste again.

**Sarah checks:**
- [ ] At https://claude.ai/code, start a session on the `Meal Planning Routines` environment with the `meal-planning` repo, and paste: `Run whoami, echo $HOME and ls ~/.cache/ms-playwright ~/.cache/mongodb-binaries, then pnpm install --frozen-lockfile and pnpm test:e2e. Change nothing. Tell me whether anything was downloaded, and whether every test passed.` See every test pass with nothing downloaded, then paste the reply back to `/infra-build`. Goal: groundwork for the fix and the analysis goals, since the `ci-failure` session reruns the E2E tests here.

### Step 3: The root cause analyst
**Builds:** Piece 4, and the second Convention in `routine-sessions`.
**Setup first:** none
**Implementer checks:**
- In a local session on a throwaway branch that's never pushed, with a commit that breaks the home redirect for a reason its message doesn't give, the subagent, given `pnpm test:e2e e2e/auth/homeRedirect.spec.ts`, its output and the commit range, returns a report with each part the Design lists, its verdict "the code is wrong", and the breaking commit.
- On the same branch with a commit that changes the redirect on purpose (its message says so), its verdict is "the test is out of date".
- Given a failing unit test (`pnpm test:agent <file>`) instead of a spec, it returns the same shape of report, with nothing in its instructions naming CI or E2E.
- It has no tool that edits files, and leaves the working tree as it found it.

**Sarah checks:** none

### Step 4: `ci-failure` fixes an out-of-date spec and analyzes a broken app
**Builds:** Piece 3, and Piece 6's "The Job That Starts `ci-failure`".
**Setup first:** none
**Implementer checks:**
- The skill runs the failed jobs' scripts one after another.
- In a local session on a throwaway branch that's never pushed, following the skill on a made-up payload naming `e2e` and `build`: it runs `pnpm build`, then `pnpm test:e2e`, and sorts the E2E failure as the Design says.
- **Before the checks:** with Sarah's OK, commit and push the skill to `develop`, since the routine runs the skill from there. Then push two throwaway branches cut from `develop`, neither starting with `claude/`: `e2e-check-outdated-spec`, with a commit that changes what `homeRedirect.spec.ts` checks and says in its message that it's meant to, and `e2e-check-broken-app`, with a commit that breaks the home redirect and says nothing about it. Give Sarah both compare links in chat.
- **After the checks:** with Sarah's OK, delete both throwaway branches and any `claude/ci-fix-` branches the sessions pushed.

**Sarah checks:**
- [ ] Open the compare link for `e2e-check-outdated-spec` that `/infra-build` gives you in chat, and create the PR into `main`. See `e2e` fail and the merge box say the PR can't be merged while a required check is failing. Goal: a PR into a protected branch can't be merged while its `e2e` check is failing.
- [ ] Within a few minutes, see a new `ci-failure` session in the Code tab under **Routines**. Goal: a failed `e2e` job starts a `ci-failure` session.
- [ ] When that session ends, see a summary naming the spec that was out of date and a link to its fix PR into `e2e-check-outdated-spec`, whose diff updates only the spec. Close both PRs without merging. Goal: an out-of-date spec gets updated, with a fix PR.
- [ ] Open the compare link for `e2e-check-broken-app` that `/infra-build` gives you in chat, and create the PR into `main`. When its `ci-failure` session ends, see the session's call to `root-cause-analyst`, the report shown unedited (its verdict, where the fault starts, the breaking commit and the fix as a direction), no fix PR, and an offer to create a bug note. Decline the note, and close the PR without merging. Goals: a broken app gets a root cause analysis with no fix and a bug note offer, and the analysis is written by a stronger model than Sonnet.

# Conventions
- **The protected-branch list moves with the rulesets.** When a branch gets or loses a ruleset, the list of protected branches in the `e2e` job's `if` in `checks.yml` changes in the same change, along with that ruleset's required checks. A protected branch missing from the list would skip `e2e`, and GitHub counts the skip as a pass. Lands in `docs/ci.md`, "The Ruleset on `main`", beside the rule for renamed or added check jobs.
- **A routine that needs a root cause analysis uses `root-cause-analyst`.** A routine's skill that diagnoses a failure it has reproduced hands it to the `root-cause-analyst` subagent, with the command, its output and the commits under suspicion, rather than writing its own diagnosis steps or adding another analysis subagent. If the subagent doesn't fit the failure, that skill's story extends it. Lands in the `routine-sessions` skill, under "What the Session Does".

# Setup Outside the Repo
- **The ruleset on `main`** (repo Settings → Rules → Rulesets → `main`): add `e2e` to "Require status checks to pass". Recorded in `docs/ci.md`, "The Ruleset on `main`".
- **Two allowed domains** on the `Meal Planning Routines` cloud environment (https://claude.ai/code, the cloud button above the message box → the environment's settings → Network access, Custom): `cdn.playwright.dev` and `fastdl.mongodb.org`. Recorded in `docs/ci.md`, "The Cloud Environment".
- **The setup script** of the same environment: the new `pnpm exec playwright install --with-deps chromium` line after `pnpm install`. Recorded in `docs/ci.md`, "The Cloud Environment", whose copy of the script is the one pasted in.

# Out of Scope
- Writing more E2E tests: [[Auth E2E Tests]], [[Current Calendar E2E Tests]], [[Recipes E2E Tests]], [[Settings E2E Tests]], [[Sharing E2E Tests]] and [[Calendar E2E Tests]].
- Stopping the four existing check jobs from downloading MongoDB: an item in [[Dev Tooling Tidy-Ups]].
- Feature branches, protecting `develop` and the release process, which may later change where the E2E tests run: [[Branching and Releases]].
- A doc on creating a new environment: [[Services and Environments Audit]]. CI needs no new environment, since the E2E tests run against a throwaway database with dummy values (Sarah confirmed 2026-10-02).
- Root cause analysis for Sentry errors: [[Sentry Root Cause Analysis]].
