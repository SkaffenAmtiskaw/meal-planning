---
type: infra
status: spec
blocked-by: []
confirmed: 2026-10-05
---
# Where It Stands
Design approved. Next: /infra-design (revision) ^status

Shaped as an infra story: a workflow, a script, a routine and a skill that diagnose a failed Vercel deployment and fix it where they can. /infra-design wrote the Goals, Design, Conventions and Setup Outside the Repo on 2026-10-05, settling decisions 1-5 along the way. Nothing is planned or built yet. Sarah decided 2026-10-05 that it goes back to `/infra-design` for a Build Order, rather than getting steps from `/plan-steps`, now that [[Infra Stories Without Steps]] has built that path. Sarah decided building doesn't wait on [[Branching and Releases]]: until its back-merge exists, she merges `main` into `develop` herself after a production fix.

# Inbox

# Purpose
"We also need a routine to handle Vercel deploy failures, just like the planned ones for CI failures and Sentry errors." When a Vercel deployment fails, a routine starts a cloud session that works out why, so the result is waiting for Sarah in the Code tab under **Routines**, following `docs/ci.md` "Starting a Routine".

# Goals
- [ ] A failed production deployment on Vercel starts a routine session, which waits for Sarah in the Code tab under **Routines**.
- [ ] A failed preview deployment of `develop`, or of a branch with an open PR, starts a routine session the same way, unless it's a routine's own `claude/` branch or the commit's `build` check failed too, since `ci-failure` covers that.
- [ ] Each session ends with a summary for Sarah that names the failure's cause and the evidence for it, such as the failing lines of the build log.
- [ ] When a failed deployment's cause is in the repo, the session fixes it on a `claude/` branch and opens a PR into that deployment's branch, `main` for production, the way `ci-failure` does.
- [ ] When the cause is a Vercel variable or setting, the session opens no PR and never works around it by loosening `src/env.ts`. Its summary names the variable or setting and its environment, then says to press **Redeploy**.
- [ ] When a failure is on Vercel's side, the session opens no PR. Its summary gives Vercel's status at the time of the failure and says when to press **Redeploy**: right away for a flaky build, or once https://www.vercel-status.com shows the incident resolved.
- [ ] `docs/ci.md` describes the new workflow and routine, as it does for `ci-failure`: what starts a session, when the workflow stays quiet, and what happens when the call to the routine fails.

# Open Decisions
1. When a PR branch's code breaks `pnpm build`, both the PR's `build` check (which starts `ci-failure`) and Vercel's preview fail on the same commit. How does the trigger avoid starting two sessions for one cause? Found by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** for a PR branch's failed preview, the workflow first checks that commit's `build` check run, waiting while it's queued or running: if it failed or was cancelled, nothing fires, since `ci-failure` has it; if it passed, or there's none (as on `develop`), the routine fires. Sarah's call after research: one cause gets one alert, from the source that sees it (Google SRE book, "Monitoring Distributed Systems"), and preview coverage stays.
     - Rejected: fire for production only - loses the preview coverage Sarah wants for `develop` and PR branches.
     - Rejected: the session starts and stops when `ci-failure` has the commit - leaves an empty session, against `docs/ci.md` "Starting a Routine".
     - Rejected: hand Vercel failures to `ci-failure` - widens a built skill and still needs the same check.

2. When a production deploy from `main` fails, which branch does the fix PR go into? Vercel keeps serving the last successful deploy, so the app stays up. [[Branching and Releases]] decided that an urgent fix reaches `main` on a hotfix branch, and a semi-urgent one goes into `develop` and ships with the next release. A failed preview deploy's fix would go into that preview's own branch, as `ci-failure` targets the PR's head branch. Moved from the Design questions by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** a code cause gets a fix PR into `main`: the session fixes it on a `claude/` branch cut from `main` and opens a PR into `main`, which Sarah merges; back-merge carries the fix into `develop`. The session never fixes a failure by loosening `src/env.ts` validation or working around a missing variable, such as making it optional or giving it a default; a Vercel variable or setting ends with findings (which one, in which environment, then Redeploy), and a failure on Vercel's side with what decision 5 settles. Sarah's call: if `main` fails, `main` gets fixed. A production-only cause is a rare edge case, the goal that shipped was already reviewed, and `/final-review`'s checks find little in a one-commit fix, which still runs the pre-commit hooks and `main`'s required checks; the guard covers the likeliest wrong fix, and her merge is the second look. This changes [[Branching and Releases]] decision 29 ("a hotfix is an ordinary bug story") for this one case.
     - Rejected: no fix PR, with a code cause run as a hotfix story from `main` - a full story process for a fix of a few lines, and its PR's preview can't prove the fix with production's variables any better.
     - Rejected: a fix PR into `develop`, then a release PR into `main` - a longer road to the same fix of `main`.
     - Rejected: findings plus a draft fix on a pushed `claude/` branch with no PR - a hotfix story would redo the fix.

3. How does a failed deployment start the routine? Vercel can't call `/fire` itself. Candidates found while shaping: a GitHub workflow on the `deployment_status` events Vercel sends (state `failure` or `error`), a workflow on Vercel's `repository_dispatch` events, or a Vercel webhook pointed at something that can call `/fire`. Moved from the Design questions by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** a GitHub workflow on Vercel's `repository_dispatch` events, filtered by `types:` to the failure events, with a `workflow_dispatch` trigger so it can be run by hand. Which failure types a failed build sends, and whether the payload carries the deployment's ID and URL, are settled by a deliberately failing test deployment during setup. Sarah's call after research: it's Vercel's recommended integration with GitHub Actions, its payload carries the branch, SHA and environment, and GitHub always runs `develop`'s copy of the workflow, so no branch can change what runs with the routine's secrets (GitHub's secure-use guidance).
     - Rejected: a workflow on `deployment_status` - a run for every deployment state, no branch in the payload, the workflow file comes from the deployed commit, and Vercel keeps it only for backwards compatibility.
     - Rejected: a Vercel webhook to a relay that calls `/fire` - needs a Pro or Enterprise plan and a hosted relay holding the routine's token outside GitHub, against `docs/ci.md`'s rule that a workflow job calls `/fire`.

4. Which Vercel token does the session use to read the failed build's logs, and with what scope? Sarah assumed one is needed, and wants that confirmed as part of this story. Vercel's Build Logs and Source Protection setting is on by default, which keeps build logs private. The credential rule in [[Sentry Logging and Root Cause Analysis]] ("If the routine needs Sentry access") applies. Moved from the Design questions by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** a token is needed, and the workflow holds it, not the session: a project-scoped Vercel access token in an Actions secret, which the workflow uses to fetch the failed build's log from Vercel's REST API, sending the failing lines and the log's tail in the `/fire` text within its 65,536-character limit. The session has no Vercel access, so the Sentry note's credential rule doesn't apply. Sarah's call after research: Vercel has no read-only access token, and even a project-scoped one can deploy to production and read and change env vars, so least privilege for LLM agents (OWASP Top 10 for LLM Applications, "Excessive Agency") keeps it out of an unattended session that reads untrusted build output; the workflow runs from `develop`'s copy (decision 3), so no branch can change the code that uses it.
     - Rejected: a project-scoped token as an API credential on the cloud environment - the session could use it to deploy or change env vars, only the skill keeps it to reads, and the other routines in the shared environment would get it too.
     - Rejected: Vercel's MCP server as a claude.ai connector - it gets the whole Vercel account's access, every tool runs without asking, and nothing narrows it.
     - Rejected: no Vercel access, rerunning `pnpm build` - CI already passed that build, so the Vercel-only failures left can't be seen.

5. If the failure looks like it's on Vercel's side, such as an outage or a flaky build, does the session redeploy? Moved from the Design questions by /infra-design (2026-10-05).
   - **Decided 2026-10-05:** no, Sarah redeploys by hand. The workflow reads Vercel's status page and sends the result to the session with the log. If Vercel had an incident, the session's summary says to press **Redeploy** once Vercel's status page (https://www.vercel-status.com) shows it resolved, which Sarah checks herself; if it looks like flakiness, it says to press **Redeploy** right away. Sarah's call: a failed deploy leaves the last good one serving, so waiting for her does no harm. It came from her leaning (check for an outage first, then redeploy), changed after the check found that only the workflow holds a Vercel token, that an automatic production redeploy is a deploy nobody chose, and that a failed redeploy sends the failure event again.
     - Rejected: the session or workflow redeploys automatically - it needs Vercel write access where the failure is diagnosed, and a failed redeploy would start another session.
     - Rejected: Sarah subscribes to Vercel's status updates - most of Vercel's incidents won't affect her.
     - Rejected for now: the session watches the status page until the incident ends - Sarah will explore it, such as with a cron job, if checking by hand becomes a problem.

# Design
## Pieces
**Outside the repo**
1. **The Vercel access token** - Vercel → Account Tokens (https://vercel.com/account/tokens), scoped to the meal-planning project only, expiring after a year. Lets the workflow read the project's deployments and build logs (decision 4); a project-scoped token needs no team ID on API calls. Kept as the Actions secret `VERCEL_TOKEN`, used by one workflow job only, never in the cloud environment or the routine, since it can also deploy and change env vars.
2. **The `vercel-deploy-errors` routine on claude.ai** (new) - starts a session with the skill each time the workflow calls it. Set up at https://claude.ai/code/routines → **New routine** as Piece 6 records it: the default GitHub trigger removed and an API trigger added, its URL and token going straight into the two Actions secrets.

**In the repo**
3. **`.github/workflows/vercel-deploy-errors.yml`** (new) - starts the routine for a failed deployment Sarah should hear about (decision 3).
    - **Triggers:** `repository_dispatch` with `types: [vercel.deployment.error]`, which GitHub always runs from `develop`'s copy, and `workflow_dispatch` with branch, SHA and environment inputs, to run it by hand from Actions → **Run workflow**.
    - **Permissions:** `contents: read`, `checks: read` (the commit's `build` check) and `pull-requests: read` (finding an open PR).
    - **Two jobs,** split as `dependency-updates.yml`'s are, so each secret sits in one job:
      - **`check`** installs Node and pnpm from `mise.toml`, with no `pnpm install`, so no package's install scripts run beside the Vercel token. It runs `pnpm -s vercel:check` (Piece 4) with the payload's values through `env:`, and passes `fire` and `text` on. When it stays quiet, its log says why.
      - **`start-vercel-deploy-errors`** runs only when `fire` is true. It calls the routine's `/fire` once, with the body built by `jq`, and never retries. It holds the routine's two secrets and nothing else.
4. **`scripts/vercelDeployCheck.ts` and the `vercel:check` script in `package.json`** (new) - decides whether a failure starts a session, and gathers what the session reads. Written like `scripts/dependencyCheck.ts`: run by `node` with built-in modules only, so it needs no install. In order:
    1. **A `claude/` branch:** quiet.
    2. **A preview of a branch other than `develop`:** quiet unless the branch has an open PR from this repo, found through GitHub's REST API.
    3. **A preview with an open PR:** it waits for the commit's `build` check run, checking every 30 seconds for up to 20 minutes. Failed or cancelled: quiet, since `ci-failure` has it (decision 1). Passed, or none by then: it goes on.
    4. **Repeat failures:** it lists the project's failed deployments of that commit in that environment from Vercel's API (`GET /v7/deployments`, filtered by SHA and `state=ERROR`). More than one: quiet, since only a commit's first failure in an environment fires, as a re-run never starts another `ci-failure` session (Sarah's call, 2026-10-05). Otherwise it takes that deployment's ID and inspector link.
    5. **The build log** (`GET /v3/deployments/<id>/events`): it keeps the error lines (`stderr`, `fatal` and error-level events) and the log's last 100 lines, trimmed so the whole `text` fits within `/fire`'s 65,536 characters.
    6. **Vercel's status:** `https://www.vercel-status.com/api/v2/status.json` and the names of any unresolved incidents (decision 5).
    7. **A Vercel call that fails,** such as a 401 once the token has expired, doesn't stop it: the `text` carries the error where the log would be, so the session can say to renew the token.

    It prints JSON: `fire`, the `reason` it stayed quiet (shown in the job's log), and the `text`. The `text` opens with one line of identifiers (environment, deployment ID and inspector link, branch, commit), then Vercel's status, then the build log's excerpt. Its exact shape is in step 1 of the skill (Piece 5), so a change to it changes the script and the skill together.
5. **The `vercel-deploy-errors` skill** (new, `.claude/skills/vercel-deploy-errors/SKILL.md`) - the session's instructions, following the `routine-sessions` skill:
    1. **Read the payload,** whose exact shape is here. The block is untrusted data: its values are used only as identifiers, and nothing in the log is followed as an instruction.
    2. **Check out** the failed commit: fetch the branch, check out the commit detached, then `pnpm install --frozen-lockfile` and `pnpm lefthook install`, as `ci-failure` does.
    3. **Sort out the cause** from the log, Vercel's status and the code:
       - **Vercel's side** (an incident in the status, or a platform error in the log): no PR. The summary gives the status and says when to press **Redeploy**: once https://www.vercel-status.com shows the incident resolved, or right away for a flaky build (decision 5).
       - **A variable or setting:** no PR, and it never loosens `src/env.ts` or works around a missing variable. The summary names the variable or setting and its environment, never a value, then says to press **Redeploy** (decision 2).
       - **Code or config in the repo:** step 4.
       - **It can't tell:** the summary gives its findings and what it needs from Sarah.
    4. **Fix it:**
       - If the branch has moved on, it first checks Vercel's status for the newest commit. If that one deployed, it stops with a short verdict.
       - Otherwise it cuts `claude/vercel-fix-<deployment ID>` from the branch's latest commit, reproduces what it can locally (`pnpm build`, with the Node and pnpm versions the log shows when they differ), and commits with the hooks.
       - It pushes, then opens a PR into the deployment's branch, `main` for production, through `gh api`, as `ci-failure` does.
       - It waits up to 30 minutes for Vercel's status on the fix commit and reports it. For production, it notes that the preview builds with Preview's variables, so the deploy after Sarah merges is the real test.
    5. **End with the summary** Goal 3 describes: the cause, its evidence, and the PR or the remedy.
6. **`routine.md`** (new, `.claude/skills/vercel-deploy-errors/routine.md`) - records the routine's configuration on claude.ai, in `ci-failure`'s shape:
    - **Name:** `vercel-deploy-errors`
    - **Prompt:** `Run /vercel-deploy-errors on the failed deployment described in the routine-fire-payload block.`
    - **Model:** Sonnet, like the other two routines
    - **Repositories:** `meal-planning`
    - **Trigger:** API, called by the `start-vercel-deploy-errors` job in `.github/workflows/vercel-deploy-errors.yml`. Its URL is in the Actions secret `ROUTINE_VERCEL_DEPLOY_ERRORS_URL` and its token in `ROUTINE_VERCEL_DEPLOY_ERRORS_TOKEN`.
    - **Cloud environment:** `Meal Planning Routines`, with its existing variables only; no Vercel credential and nothing else new.
    - **Connectors:** none

**Docs**
7. **`docs/ci.md`** - describes the workflow, the routine and their setup, as it does for `ci-failure` (Goal 7):
    - **The opening list** of workflows gains `vercel-deploy-errors.yml`.
    - **A new "Vercel Deploy Errors" section,** after Dependency Updates:
      - what starts a session, and each case where the workflow stays quiet, with why
      - the two jobs
      - the `text`, and why it carries a log excerpt when the other routines send identifiers only: the session has no Vercel access
      - **The Vercel Token:** its scope, its one-year expiry, and why the workflow holds it, not the session
      - **Renewing the Vercel Token:** how Sarah will know it has expired (a session's summary says Vercel refused the log fetch, or the Account Tokens page shows its expiry date), and the steps: make a new project-scoped token with a one-year expiry, replace `VERCEL_TOKEN`'s value, then delete the old token. Sarah asked 2026-10-05 that this be documented where she can find it.
      - **When the Call Fails:** as for the other two routines
    - **"Every Check Is a `package.json` Script"** names `vercel:check` among the scripts a workflow runs.
    - **"The App's Variables"** gains, after the sentence about dummies, Sarah's approved text: "It also needs a value in Vercel (Settings → Environment Variables), for Production and for Preview. A variable missing from either can fail that environment's deploy, since `src/env.ts` checks every variable." A doc gap found by the decision 2 research (2026-10-05): nothing in `docs/` said to set a new variable's value in Vercel.
    - **"Routines"** gains `vercel-deploy-errors`.
    - **"Setup Outside the Repo"** records the Vercel token and its secret, and the routine's two secrets, by name only.
8. **`docs/project_structure.md`** - the `scripts/` line becomes "lefthook scripts, scripts that check the notes vault, and the dependency check and the Vercel deployment check CI runs".

## Flow
**A failed deployment:**
1. A Vercel build fails. Vercel sends `vercel.deployment.error` to GitHub, which runs `develop`'s copy of the workflow.
2. `check` runs `pnpm -s vercel:check`. It stays quiet, with the reason in its log, for a `claude/` branch, a preview of a branch with no open PR, a commit whose `build` check failed or was cancelled, or a repeat failure of the same commit. Otherwise it gathers the log excerpt and Vercel's status.
3. `start-vercel-deploy-errors` calls `/fire` once. The session starts and waits for Sarah in the Code tab under **Routines**.
4. The session checks out the failed commit, sorts out the cause and ends one of four ways: a fix PR, a variable or setting to change, a Vercel-side failure with when to redeploy, or findings with what it needs.
5. Sarah acts on it:
   - **A fix PR:** she merges it. A production fix merged into `main` deploys, and back-merge carries it into `develop`. Until [[Branching and Releases]] builds back-merge, Sarah merges `main` into `develop` herself (her call, 2026-10-05: building doesn't wait on that story).
   - **A variable or setting:** she changes it in Vercel, then presses **Redeploy**.
   - **Vercel's side:** she presses **Redeploy**, right away for a flaky build or once the status page shows the incident resolved.

**When something fails:**
- **The `/fire` call fails** (a wrong secret, the API down or the hourly limit): `start-vercel-deploy-errors` fails, no session starts, and nothing retries. The failed run shows in Actions, and Vercel's red status stays on the commit.
- **Vercel's API refuses the workflow,** such as once the token has expired: the session still starts, and its summary says to renew the token, following "Renewing the Vercel Token" in `docs/ci.md`.
- **The `build` check never shows up within 20 minutes:** the workflow fires anyway. In the rare case `ci-failure` also runs, there are two sessions.
- **The fix PR's own preview fails:** it's a `claude/` branch, so nothing new fires. The session sees it while waiting on the fix commit's status and reports it.
- **A merged production fix still fails:** that's a new commit, so a new session starts.
- **A PR from a fork:** Vercel holds its deploy until Sarah authorizes it, and its branch isn't one of this repo's, so the workflow stays quiet.

# Conventions
- **By default, a credential that can't be made read-only stays with the workflow.** When a routine's session needs data from a service whose narrowest credential can still write, such as deploy or change settings, the default is for the workflow that starts the routine to hold it as an Actions secret, fetch the data and send it in the `/fire` text, so the session gets no credential. It's a default, not a rule: a story that finds a good reason to do otherwise, such as a session that has to dig through far more than the workflow could send, lays out the trade-off for Sarah, and she decides. Lands in `docs/ci.md`, "Starting a Routine", linking the practice it comes from: least privilege for LLM agents, [OWASP Top 10 for LLM Applications, LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) ("Limit the permissions that LLM extensions are granted to other systems to the minimum necessary").
- **A new app variable gets a value in Vercel.** When a variable is added to `src/env.ts`, it also gets a value in Vercel (Settings → Environment Variables) for Production and for Preview, along with the dummies CI, the cloud environment, unit tests and E2E get. Lands in `docs/ci.md`, "The App's Variables" (Piece 7).

# Setup Outside the Repo
1. **The Vercel access token:** Vercel → Account Tokens (https://vercel.com/account/tokens), scoped to the meal-planning project, with a one-year expiry. Recorded in `docs/ci.md`, "Setup Outside the Repo" and "Renewing the Vercel Token".
2. **The Actions secret `VERCEL_TOKEN`:** GitHub → Settings → Secrets and variables → Actions, holding the token. `docs/ci.md` records its name, never its value.
3. **The `vercel-deploy-errors` routine:** https://claude.ai/code/routines → **New routine**, with the default GitHub trigger removed and an API trigger added. Recorded in its `routine.md` and in `docs/ci.md`, "Routines".
4. **Two Actions secrets, `ROUTINE_VERCEL_DEPLOY_ERRORS_URL` and `ROUTINE_VERCEL_DEPLOY_ERRORS_TOKEN`:** set from the routine's API trigger, in the same place. Recorded by name in `routine.md` and `docs/ci.md`.

Nothing changes in Vercel's project settings: the Vercel GitHub App already has the access dispatch events need, and they have no setting to turn on.

# Out of Scope
- Errors in the running deployed app: [[Sentry Logging and Root Cause Analysis]].
- Auditing Vercel's setup and how production differs from local: [[Services and Environments Audit]].
- Vercel's plugin for coding agents: [[Vercel Plugin]].

# Implementation
