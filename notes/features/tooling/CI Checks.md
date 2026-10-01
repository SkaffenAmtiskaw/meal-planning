---
type: hub
confirmed: 2026-09-30
---
# Where It Stands
Next: its child stories ^status

# Purpose
The four check jobs in `.github/workflows/checks.yml` run lint, type check, unit tests and build automatically on every PR, which covers the Done When item of [[Dev Foundations]] for PRs into `main`.

Besides running the checks, [[CI Failure Sessions]] makes a failed check start a Claude Code cloud session for Sarah, and does the one-time setup every later source of results shares. Sarah is the sole maintainer. She opens GitHub only to merge into `main` and doesn't check email often enough to rely on it, so results that happen away from her machine have to reach her another way.

One-time setup [[CI Failure Sessions]] does, for [[E2E Tests in CI]], [[Sentry Logging and Root Cause Analysis]], [[Local Dependency Update Alerts]] and the watch-tools line under [[Dev Foundations]]:
- Install the Claude GitHub App on the repo, and create the cloud environment the routines run in.
- Write the convention for later sources: a shared-rule skill for routine sessions, and a doc for the CI side.

Set the convention for how a source of results that happen away from Sarah's machine reaches her as a Claude Code cloud session. Prove it with the first source: the checks on PRs, where a failed check starts a session.

There's no `.github/` yet, so nothing is checked outside Sarah's machine. The lefthook pre-commit hook runs Biome, tests and type checks on staged files, and a full `pnpm build` on every commit that touches `src/`. Dependabot, if [[Local Dependency Update Alerts]] uses it, and [[E2E Tests in CI]] (which wants E2E tests to run when `develop` opens a PR into `main`) both assume CI exists.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Design Handoff
## Decisions
1. How do results that happen away from Sarah's machine reach her?
	- **Decided 2026-09-29:** a Claude Code session working on the issue, waiting for her input in the Code tab of the Claude desktop app. Each source decides what its session has done before Sarah opens it (some only write notes, some start digging into a bug), what starts its routine, and which branch it works from. A run that finds nothing leaves no session in Sarah's Code tab. Sarah's call: she opens the desktop app whenever she works on the app, so sessions can wait until then; checked against the Claude Code docs, which show cloud routine runs as sessions there.
		- Rejected: a desktop notification (ntfy, Pushover, terminal-notifier) - not needed, since sessions can wait until she opens the app; something more urgent would be a new story.
2. Where does the work run?
	- **Decided 2026-09-29:** the cloud. Sarah's call: work there reacts to events as they happen and keeps running while her laptop is closed; Claude Code cloud routines are the cloud option that starts a session in her Code tab.
		- Rejected: her machine on a schedule (Claude Code desktop scheduled tasks) - runs only while her machine is on.
3. Where do a routine's instructions live?
	- **Decided 2026-09-29:** in a checked-in skill that the routine's prompt runs. Sarah's call: it's handled like everything else in the repo.
4. What does the session a failed check starts do before Sarah opens it?
	- **Decided 2026-09-29:** a failed check on the PR into `main` starts a session working from the PR's branch (usually `develop`). It diagnoses the cause and drafts a fix on a `claude/` branch. Sarah's call.
	- **Revised 2026-09-30:** any PR, not only one into `main` (Decision 9).
5. Does a failed check block the merge into `main`?
	- **Decided 2026-09-29:** yes. The PR into `main` can't be merged until the checks pass. Sarah's call.
		- Rejected 2026-09-30: requiring the checks on `develop` too - a required check rejects Sarah's direct pushes to `develop`, and adding it later is a ruleset change, not a new workflow. It becomes worth doing if she moves to feature branches.
6. Where does the convention land: a file in `docs/`, AGENTS.md or a shared-rule skill (`user-invocable: false`) that later sources' skills point to?
	- **Decided 2026-09-29:** split it. The rules for how a routine's session behaves go in a shared-rule skill, and the rules for the workflows, Actions secrets, checks and merge block go in a new `docs/` file that the skill points to. Sarah's call, checked against the `tooling` skill's rule that `docs/` describes the codebase and shared-rule skills hold agent rules.
		- Rejected: all of it in a shared-rule skill - the CI parts are codebase facts, which belong in `docs/`.
		- Rejected: all of it in `docs/` - the session rules are about how agents work, which `docs/` never covers.
		- Rejected: AGENTS.md - it loads in every session, and these rules matter only to routine work.
7. Where does the record of setup outside the repo go (the Claude GitHub App, the cloud environment, each routine's configuration, the Actions secret names and the merge block on `main`)?
	- **Decided 2026-09-29:** a section of the new CI doc, written as each piece is set up, holds the shared setup (the Claude GitHub App, the cloud environment and the merge block on `main`) and an overview of the routines with their purposes. Each routine's own configuration (its prompt, triggers, Actions secret names and cloud environment) goes in a `routine.md` in its skill's folder. Sarah's call: she doesn't want to keep it in her head until [[Services and Environments Audit]] runs, and the routine details sit next to the skill they belong to, so the doc stays general guidance.
		- Rejected: waiting for the home [[Services and Environments Audit]] sets up - the setup would go unrecorded until then.
		- Rejected: each routine's configuration in the CI doc - implementation details that would drift from the skill they belong to.
8. When a failed check on the PR into `main` doesn't reproduce in the cloud, how does the `ci-failure` session tell a fluke from a real failure, and does a repeat failure start another session?
	- **Decided 2026-09-29:** the session re-runs the failed jobs on GitHub once and waits for the result itself. The workflow fires the routine only on a run's first attempt, so a re-run's failure never starts a second session. If the re-run passes, it's a confirmed flake and the session leaves only a verdict; if it fails, the same session diagnoses it as a real failure that doesn't reproduce in the cloud. Sarah's call, following the practice of re-running a failed test in the same CI environment before calling it flaky, since a pass in the cloud session is a different environment.
	- **Revised 2026-09-30:** any PR, not only one into `main` (Decision 9).
		- Rejected: a new session for each failed attempt, with Sarah re-running CI herself - she'd have to notice and re-run it, and the second failure would start another session.
		- Rejected: Auto-fix watching the PR into `main` - a failure would reach both the watching session and a new `/fire` session with no reliable guard, the watching session stays open after a fluke, how long it watches is undocumented, and users have reported bugs including runaway check-ins.
		- Rejected: the workflow sending later failures into the first session with `claude -p --cloud` - it needs an access token Sarah would renew by hand every 30 days.
		- Rejected: firing on every attempt except the session's own re-runs - it's undocumented whether a routine's re-run shows as Sarah or as the Claude app.
		- Rejected: recording a confirmed flake, or offering to - Sarah: "if I'm curious I can dig further."
9. Which PRs run the checks, and which failed checks start a `ci-failure` session?
	- **Decided 2026-09-30:** the checks run on every PR, whatever its base branch. A failed check on any PR starts a `ci-failure` session, unless the PR's head branch starts with `claude/`. Sarah's call: she may switch to feature branches later and doesn't want to redo the workflow. A `claude/` PR is a routine's own fix, so skipping it keeps a failing fix from starting session after session, and Sarah sees its checks when she opens it on GitHub to merge.
		- Rejected: only PRs into `main` - switching to feature branches would mean redoing the workflow.
		- Rejected: only PRs into `main` and `develop` - nothing about the checks depends on the base branch.
		- Rejected: starting a session for `claude/` PRs too - a failing fix would start another session, up to `/fire`'s limit of 30 an hour.
	- **Revised 2026-09-30:** a failed check on a PR from a fork starts no session either. GitHub gives fork PRs no Actions secrets, so the `/fire` call would fail every time, and a session couldn't fix a branch in someone else's fork. Sarah's call: the repo is public for convenience, not for contributors.
10. Which branch do routines clone, and so which copy of their skills do they run?
	- **Decided 2026-09-30:** `develop`, made the repo's default branch on GitHub. A routine clones the default branch and runs the skills committed there, so a skill change reaches the routines as soon as it's pushed to `develop`. The ruleset on `main` targets `main` by name, so it stays on `main`, and Vercel's production branch is its own setting, which stays `main`. Sarah's call, when planning showed that a `main` default would need every routine skill change sent to `main` on its own.
		- Rejected: keeping `main` as the default and sending each skill change to `main` through a PR holding only the skill files - three extra PRs in CI Failure Sessions alone, the first also carrying `checks.yml`, and merge conflicts with `develop` later.

## Research
Research from 2026-09-29:
- Routines start from a schedule, the API (`/fire`) or a GitHub pull request or release event. A failed check can't start one directly: an `if: failure()` workflow step calls `/fire`, with the routine's URL and token kept as Actions secrets, as Anthropic's `/fire` docs show. `/fire` allows 30 calls an hour per routine, doesn't dedupe retries and is still experimental. (code.claude.com/docs/en/routines, platform.claude.com/docs/en/api/claude-code/routines-fire)
- A routine clones the default branch (`develop`, Decision 10) unless its prompt checks out another. It pushes to `claude/` branches, and its PRs can target `develop`. It sees only what Sarah has pushed.
- A cloud session gets only what's in the repo: not Sarah's `~/.claude` memory or user settings, and not gitignored files such as `.env*` or the test login in `.opencode/secrets`.
- `anthropics/claude-code-action` posts to PR comments or the workflow log, not a session.

## Design
### `.github/workflows/checks.yml` - the four check jobs
`.github/workflows/checks.yml` runs on `pull_request` with no branch filter, so every PR runs it whatever its base branch (Decision 9). It has one job for each check:
- lint (`pnpm lint:ci`)
- type check (`pnpm check:types`)
- unit tests with coverage (`pnpm test:coverage`, so the 100% thresholds in `vitest.config.ts` hold across the whole codebase; the pre-commit hook checks only staged files, since a full run would make commits too slow)
- build (`pnpm build`)

Each is its own job, so the PR shows which check failed, `main` can require each one by name, and the `ci-failure` session knows which script to look at. Separate jobs also run in separate checkouts, which keeps `pnpm build` clear of the E2E tests' `next build` once [[E2E Tests in CI]] adds them.

Each job installs Node and pnpm with `jdx/mise-action`, which runs `mise install` against `mise.toml` (its README), so CI follows the same `latest` versions as Sarah's machine. Sarah decided 2026-09-30 to keep `latest` rather than pin exact versions, so she never has to remember to update Node. When versions differ between environments, the failure reproduces on GitHub but not in the cloud, and the `ci-failure` session diagnoses it as a real failure.

Found by /architect's audit of the code on 2026-09-29:
- Type check on a fresh checkout: `next-env.d.ts` is gitignored (`.gitignore:39`) and `tsconfig.json:54-55` includes `.next/types`, which only exist after `next dev`, `next build` or `next typegen`. Four files use the generated route types (`src/app/[planner]/layout.tsx:20`, `calendar/page.tsx:13`, `recipes/page.tsx:23`, `recipes/[recipeId]/page.tsx:31`). The Next docs describe `next typegen` for CI (`node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md:177-208`). The generating step goes through a `package.json` script (Convention 13).
- Build: the workflow sets dummy values for the eight `src/env.ts` variables (`src/env.ts:5-28`, no `skipValidation`) (Convention 11).
- Build: confirm `pnpm build` passes with a dummy `DB_URL` and no MongoDB. `src/instrumentation.ts:6` calls `mongoose.connect(env.DB_URL)` in `register`, and it's unverified whether `next build` runs it.
- `mise.toml:4` also installs `rtk`, which CI doesn't need.

- **Comes from:** Purpose, Decisions 5 and 9, and Sarah's answer 2026-09-29 that CI runs `pnpm test:coverage`.
- **Lands in:** `docs/ci.md`, "Checks on PRs".

### `package.json` - the `lint:ci` script
`pnpm lint` runs `biome check --write` (`package.json:10`), so CI gets a script that only reports: `lint:ci`, running `biome ci`, Biome's command for CI (Convention 13).
- **Comes from:** Purpose, and the `pnpm lint` entry in AGENTS.md "Commands", which says it writes fixes.
- **Lands in:** `docs/ci.md`, "Workflows".

### `.github/workflows/checks.yml` - the job that starts `ci-failure`
`checks.yml` has one more job, which runs only when all four hold: at least one check job failed, the run is on its first attempt (`github.run_attempt == 1`), the PR's head branch doesn't start with `claude/`, and the PR comes from this repo, not a fork (Decision 9). It calls the `ci-failure` routine's `/fire` once, with the `text` naming the PR number, its head branch, the workflow run's ID and URL, and which jobs failed. It sends only identifiers, no logs, so the session reads the failure itself from the branch and the run. A run where every check passes, a cancelled run, any re-run, any `claude/` PR and any PR from a fork start nothing. The `ci-failure` session watches its own re-run (the `ci-failure` skill, below). A re-run Sarah starts by hand on GitHub, and a failed check on a routine's own `claude/` fix PR, are both things she's already looking at on GitHub.
- **Comes from:** Decisions 4, 8 and 9, Convention 2, and the research that a failed check can't start a routine directly, so a workflow step calls `/fire`.
- **Lands in:** `docs/ci.md`, "Checks on PRs".

### `.claude/skills/ci-failure/` - the `ci-failure` routine's skill
`SKILL.md` keeps the default invocation frontmatter (Convention 4) and follows Conventions 7 to 10. The folder also holds the routine's `routine.md` (Convention 5). The skill doesn't load or follow `running-the-app` or anything that reaches it (`.claude/agents/bug-reproducer.md:8`, `.claude/skills/implement/bugs.md:7`, `.claude/skills/implement/first-pass.md:7,11`, `.claude/skills/investigate/SKILL.md:53`), since `running-the-app/SKILL.md:8-9` starts the dev server (which loads `.env.local`) and reads `.opencode/secrets/credentials.md` (Convention 10).

The skill has its session:
1. Check out the PR's head branch, read from the payload (Convention 7).
2. Run each failed job's script once on that branch (Convention 13).
3. **If it fails in the cloud:** diagnose the cause, commit a fix to a `claude/` branch cut from the head branch, and run the script again to confirm it passes. Then open a PR from that branch into the head branch (usually `develop`) and stop with a summary for Sarah: the cause, the fix, the PR link and anything it needs her to decide.
4. **If it passes in the cloud:** re-run the failed jobs on GitHub (`gh run rerun <run_id> --failed`) and wait for them to finish.
   - **The re-run passes:** it's a confirmed flake, and the PR's checks pass again. The session leaves only a verdict: which check flaked, the failed run, the cloud pass and the passing re-run. No fix and no note.
   - **The re-run fails:** the failure is real but doesn't reproduce in the cloud. The session diagnoses it from both GitHub runs' logs and from what differs between the cloud and the Actions runner, such as tool versions. If it finds the cause, it fixes it as in step 3. If not, it stops with what it found and what it needs from Sarah.
   - **The wait times out:** it stops and tells Sarah the re-run is still going, with its link.

It re-runs on GitHub at most once.
- **Comes from:** Decisions 4, 8 and 9. Sarah decided 2026-09-29 that the fix goes through a PR into the head branch, so it doesn't pick up local work on her `develop` that isn't ready for `main`.
- **Lands in:** the `ci-failure` skill.

### `docs/ci.md` - the CI doc
A new doc with these sections:
- "Workflows": Conventions 13 and 15.
- "Checks on PRs": the four check jobs and the job that starts `ci-failure`.
- "Starting a Routine": Conventions 1 and 2.
- "Secrets and Environment Values": Conventions 11 and 12.
- "Setup Outside the Repo": Conventions 6 and 14, and the setup under Setup Outside the Repo below.

### `.claude/skills/routine-sessions/SKILL.md` - the shared rules for routine sessions
A new shared-rule skill (`user-invocable: false`) with these sections:
- "Instructions": Conventions 3, 4 and 5.
- "What the Session Does": Conventions 7 and 8.
- "Branches": Convention 9.
- "What the Session Can Use": Convention 10.

### Other changes
- `AGENTS.md` "Docs": a line saying when to read `docs/ci.md`. `AGENTS.md` "Commands" (`AGENTS.md:97-102`): add `pnpm lint:ci` and `pnpm test:coverage`.
- `docs/project_structure.md`: a `# .github/` entry. Boy Scout fix: a `# .claude/` entry (Claude Code skills, subagents, hooks and rules), found by the rule-auditor 2026-09-29 and approved by Sarah.
- `vitest.config.ts:28`: the comment reads "Excluded files should are". Fix the typo. Sarah pulled this in 2026-09-29 during `/architect`, which is her explicit ask for this one config edit.

### The flow
1. **A PR opens, or gets a new push.** `checks.yml` runs the four check jobs, each in its own checkout with tools installed from `mise.toml`.
2. **Every check passes:** the PR shows four passing checks. For a PR into `main`, the ruleset allows the merge. Nothing else runs, and no session starts.
3. **A check fails:** the PR shows which job failed, and for a PR into `main` the ruleset blocks the merge. The start job fires `ci-failure` only on the first attempt of a PR from this repo whose head branch doesn't start with `claude/`, and sends identifiers only. Otherwise the flow stops here, and Sarah sees the failed check when she opens the PR on GitHub.
4. **The routine starts a cloud session** in the cloud environment: tools come from `mise.toml`, and the app's variables get dummy values. Its saved prompt runs `/ci-failure` on the payload.
5. **The session checks out the head branch and runs each failed job's script:**
   - **It fails in the cloud:** the session commits a fix to a `claude/` branch and opens a PR into the head branch. That PR runs the checks too, but its failures start no session. The session then stops with its summary.
   - **It passes in the cloud:** the session re-runs the failed jobs on GitHub once. The re-run is attempt 2, so it starts no session. A passing re-run ends with a flake verdict. A failing one ends with a fix PR, or with what the session found and what it needs from Sarah. If the wait times out, the session stops with the re-run's link.
6. **Sarah finds the session in the Code tab** the next time she opens the desktop app. She reviews it there, then merges any fix PR on GitHub. Merging the fix into the head branch pushes to the original PR, so its checks run again from step 1.

**When the plumbing fails:** if the `/fire` call fails (a wrong secret, the API down, or its limit of 30 calls an hour), the start job fails on the PR and no session starts. Sarah sees it next to the failed check when she opens the PR.

## Conventions
Each convention lands in one of two files, named under it: `docs/ci.md` for the workflows, secrets, checks and setup outside the repo, and the `routine-sessions` skill (`user-invocable: false`) for how a routine's session behaves (Decision 6).

### Convention 1 - Results reach Sarah only as a routine session
Any source of results Sarah needs to act on, such as a failed check, a Sentry error or a dependency update, reaches her by starting a Claude Code cloud routine. Nothing in the repo delivers a result any other way: no `anthropics/claude-code-action`, no email, chat or push-notification step, and no bot comment on a PR or issue. GitHub's own check status on a PR doesn't count, since it isn't a delivery. Neither does a step that only passes the result along to start a routine, such as a Sentry alert opening an issue that a workflow then picks up.
- **Comes from:** Decision 1, and the research that `claude-code-action` posts to PR comments or the workflow log, not a session.
- **Lands in:** `docs/ci.md`, "Starting a Routine".

### Convention 2 - A routine starts only when there's something for Sarah
A routine is started only by an event that is itself a result for Sarah: a failed check, a new Sentry issue, an update found. No routine has a schedule trigger, because a scheduled run leaves a session even when it finds nothing. A scheduled check that runs somewhere else, such as a workflow on a `schedule`, is fine, as long as it starts the routine only when it finds something.
- **Comes from:** Decision 1 ("a run that finds nothing leaves no session"), and the research in [[Local Dependency Update Alerts]] that a scheduled routine leaves a session on every run.
- **Lands in:** `docs/ci.md`, "Starting a Routine".

### Convention 3 - A routine's prompt only runs its skill
The prompt saved on claude.ai for each routine is one instruction: run that routine's checked-in skill (`.claude/skills/<name>/SKILL.md`) on the event that started it. For an API trigger, the prompt names the `routine-fire-payload` block, for example "Run `/<name>` on the failed run described in the routine-fire-payload block." Every other instruction lives in the skill. The routine's `routine.md` holds its prompt word for word (Convention 5), so it can be checked against the repo.
- **Comes from:** Decision 3. The routines docs say `/fire` text arrives wrapped as untrusted data, and a routine acts on it only if its saved prompt says to, which is why the prompt names the block.
- **Lands in:** the `routine-sessions` skill, "Instructions".

### Convention 4 - A routine's skill keeps the default invocation settings
A skill that a routine's prompt runs has neither `user-invocable: false` nor `disable-model-invocation: true` in its frontmatter. The Claude Code skills docs say a `user-invocable: false` skill doesn't run when `/name` is typed. They also say `disable-model-invocation: true` stops a skill from running when a scheduled task fires with the skill as its prompt, and they don't say whether routines count as scheduled tasks. Only the shared `routine-sessions` skill is `user-invocable: false`, because no prompt ever runs it by name. Routine skills showing up in Sarah's `/` menu is the accepted cost.
- **Comes from:** the skills docs (frontmatter table, "Control who invokes a skill").
- **Lands in:** the `routine-sessions` skill, "Instructions".

### Convention 5 - Each routine's configuration is in its skill's `routine.md`
Every routine's skill folder holds a `routine.md` with that routine's configuration on claude.ai:
- its name on claude.ai
- its prompt, word for word (Convention 3)
- each trigger. For an API trigger, that's the workflow that calls its `/fire` and the names of the two Actions secrets holding its URL and token (Convention 12). For a GitHub trigger, the event and its filters.
- its model
- its cloud environment, and the environment variables and credentials its session uses (Convention 10)

`SKILL.md` doesn't point to it, so the routine's session never loads it. It's for whoever sets up or changes the routine, and a change to the routine on claude.ai updates `routine.md` in the same change.
- **Comes from:** Decision 7.
- **Lands in:** the `routine-sessions` skill, "Instructions".

### Convention 6 - `docs/ci.md` lists every routine with its purpose
The "Setup Outside the Repo" section of `docs/ci.md` has one line per routine: its name, what it's for, and a link to its skill. The routine's configuration isn't repeated there. Beside that list, the section holds the one-time shared setup: `develop` as the default branch, the Claude GitHub App, the cloud environment and the ruleset on `main` (see Setup Outside the Repo below).
- **Comes from:** Decision 7.
- **Lands in:** `docs/ci.md`, "Setup Outside the Repo".

### Convention 7 - A routine's skill names the branch it works from
Before the session reads or changes any file in the repo, its `SKILL.md` has it check out the branch or branches it works from, each named in the skill: a fixed branch such as `develop`, or one read from the event, such as the PR's head branch. A routine clones the default branch (`develop`, Decision 10) unless told otherwise, so a skill that says nothing works from `develop` by accident, even when the event is about another branch.
- **Comes from:** Decision 1 ("each source decides … which branch it works from"), and the routines docs, which say each run starts from the default branch unless the prompt says otherwise.
- **Lands in:** the `routine-sessions` skill, "What the Session Does".

### Convention 8 - A routine's skill says how the session ends, for each outcome
A routine's `SKILL.md` says what the session has done and what it leaves for Sarah when it stops, for two outcomes:
- **Something to act on:** what it has done (written notes, diagnosed a cause, drafted a fix on a `claude/` branch), whether it opens a pull request from that branch, and what it asks her to decide.
- **Nothing to act on after all,** such as "this isn't really an error", "a future story already fixes this" or a flaky failure: a short verdict with its evidence, so she can check it and archive the session.

Either way, the session ends by waiting for Sarah's input in the Code tab and never assumes she has seen it.
- **Comes from:** Decision 1 ("each source decides what its session has done before Sarah opens it"). The routines docs describe no way for a session to remove itself, so a session that finds nothing still waits in her Code tab. Sarah decided 2026-09-29 that whether a session opens a PR is each source's call.
- **Lands in:** the `routine-sessions` skill, "What the Session Does".

### Convention 9 - A routine's session pushes only to `claude/` branches
A routine's session commits and pushes only to branches whose names start with `claude/`. It never pushes to `develop`, `main` or any other branch, and never merges one branch into another. Its skill never tells it to.
- **Comes from:** Decision 4. The routines docs say pushes to `claude/` branches are always accepted, while a push to any other branch is checked first and can be rejected, for example when the branch is protected.
- **Lands in:** the `routine-sessions` skill, "Branches".

### Convention 10 - A routine's skill uses only what's in the repo and its cloud environment
A routine's session sees the repo as Sarah last pushed it, plus its cloud environment's variables and setup script. Its `SKILL.md`, and every skill or subagent it loads or follows (directly or through another), relies on nothing that exists only on Sarah's machine: no `~/.claude` memory or user settings, no gitignored files she keeps locally such as `.env*` or `.opencode/secrets/`, and no work she hasn't pushed. That includes anything they start that reads such files on its own, such as the dev server loading `.env.local`. A value the session needs that isn't in the repo comes from a cloud environment variable, named in the routine's `routine.md`.

GitHub is the exception that needs nothing set up. A session reaches it through the Claude GitHub App and the cloud GitHub proxy, which authenticates `git` and `gh` on the session's behalf, so the session needs no GitHub credential of its own. The cloud environment never sets `GH_TOKEN` or `GITHUB_TOKEN`: the cloud environments docs say a token set there passes into the session unchanged, where Claude and its commands can read it.
- **Example of breaking it:** `.claude/skills/running-the-app/SKILL.md:9` reads the test login from `.opencode/secrets/credentials.md`, which is gitignored, so a routine skill that runs `running-the-app` would break this convention.
- **Comes from:** the research that a cloud session gets only what's in the repo and sees only what Sarah has pushed, and the cloud environments docs ("GitHub proxy", "Work with GitHub issues and pull requests").
- **Lands in:** the `routine-sessions` skill, "What the Session Can Use".

### Convention 11 - The app's variables get dummy values in CI and cloud environments
Wherever a workflow or a routine's cloud environment sets a variable from `src/env.ts`, the value is a dummy that passes the schema, such as `mongodb://localhost:27017/ci` for `DB_URL` or a made-up address for `RESEND_FROM_EMAIL`. It is never a real value, such as the production database URL, a Resend API key or a Google client secret, and never read from an Actions secret. A new `src/env.ts` variable gets a dummy in the workflow and the cloud environment, a third list beside `test/mocks/env.ts` and `playwright.config.ts:10-18`.
- **Examples:** `test/mocks/env.ts` follows the same idea for unit tests, and `playwright.config.ts:10-18` does for the E2E tests (`docs/e2e_tests.md`, "Environment Variables").
- **Comes from:** least privilege: the checks need only values that pass validation, and a routine's session runs without permission prompts while reading untrusted text (the `/fire` payload, CI logs, later Sentry errors).
- **Lands in:** `docs/ci.md`, "Secrets and Environment Values".

### Convention 12 - A routine's `/fire` URL and token are Actions secrets
A workflow that starts a routine reads its `/fire` URL and bearer token from two GitHub Actions secrets, named `ROUTINE_<NAME>_URL` and `ROUTINE_<NAME>_TOKEN` after the routine (for example `ROUTINE_CI_FAILURE_URL`). Neither value is written anywhere in the repo. The routines docs say the token is shown once when it's generated, so it goes straight into the secret.
- **Comes from:** the research that the routine's URL and token are kept as Actions secrets, as Anthropic's `/fire` docs show.
- **Lands in:** `docs/ci.md`, "Secrets and Environment Values".

### Convention 13 - CI runs only `package.json` scripts, and none of them writes fixes
Every check a workflow runs is a `package.json` script, called as `pnpm <script>`. The only other steps are setup (checking out the code, installing pnpm, Node and dependencies) and the step that starts a routine. That way Sarah, or a routine's session, can rerun exactly what CI ran with the same command. No script CI runs writes fixes, since CI would pass on code it silently fixed and then threw away.
- **Comes from:** Purpose, and the `pnpm lint` entry in AGENTS.md "Commands", which says it writes fixes.
- **Lands in:** `docs/ci.md`, "Workflows".

### Convention 14 - The ruleset on `main` changes with the check jobs
When a check job in `checks.yml` is renamed, added or removed, the ruleset on `main` and its record in `docs/ci.md` change in the same change, so every job is required and every required check has a job.
- **Comes from:** Decision 5.
- **Lands in:** `docs/ci.md`, "Setup Outside the Repo".

### Convention 15 - Every environment installs its tools from `mise.toml`
A workflow installs Node, pnpm and any other tool it needs with `jdx/mise-action`. A routine's cloud environment installs them with `mise install` in its setup script. That way CI, cloud sessions and Sarah's machine all run the versions `mise.toml` names. No workflow or setup script names a Node or pnpm version of its own, or uses `actions/setup-node` or the Node that comes installed in the cloud image.
- **Comes from:** Sarah's decision 2026-09-30 to keep `latest` in `mise.toml` rather than pin versions, so she never has to remember to update Node. A `ci-failure` session's check of whether a failure reproduces in the cloud is only fair when the cloud and CI run the same versions.
- **Lands in:** `docs/ci.md`, "Workflows".

## Setup Outside the Repo
### `develop` as the default branch
The repo's default branch on GitHub is `develop`, so routines clone it and run its skills (Decision 10). The ruleset on `main` targets `main` by name, and Vercel's production branch stays `main`.
- **Comes from:** Decision 10.
- **Lands in:** `docs/ci.md`, "Setup Outside the Repo".

### The Claude GitHub App
Installed on the repo. The cloud environments docs confirm `gh` comes installed in a cloud session and authenticates through the GitHub proxy. Only a user report says the app's access covers re-running Actions jobs, so confirm that `gh run rerun <run_id> --failed` works from a cloud session, which the `ci-failure` skill needs.
- **Comes from:** Purpose, and Decision 7.
- **Lands in:** `docs/ci.md`, "Setup Outside the Repo".

### The cloud environment
The claude.ai cloud environment the routines run in:
- **Variables:** dummy values for the eight `src/env.ts` variables (Convention 11), and no `GH_TOKEN` or `GITHUB_TOKEN` (Convention 10).
- **Setup script:** installs mise and runs `mise install`, then the dependencies (Convention 15). How it gets mise is for `/plan-steps`; check the download host against the network allowlist. The docs say the setup script's result is cached for about seven days. If the script installs the lefthook hooks, a commit that touches `src/` runs `pnpm build` (`lefthook.yml:13-15`), so the session's own commits need the hooks too.
- **Network access:** Trusted, the default. `pnpm build` downloads Google Fonts (`src/app/layout.tsx:1`), and `fonts.googleapis.com` and `fonts.gstatic.com` are on the default Trusted list, as is `registry.npmjs.org`.

- **Comes from:** Purpose, Decision 7, and Sarah's decision 2026-09-30 on tool versions.
- **Lands in:** `docs/ci.md`, "Setup Outside the Repo".

### The `ci-failure` routine
Created on claude.ai with an API trigger. Its URL and token are stored as the Actions secrets `ROUTINE_CI_FAILURE_URL` and `ROUTINE_CI_FAILURE_TOKEN` (Convention 12).
- **Comes from:** Decisions 3 and 7.
- **Lands in:** `.claude/skills/ci-failure/routine.md` (Convention 5), with a line in `docs/ci.md`, "Setup Outside the Repo" (Convention 6).

### The ruleset on `main`
A GitHub ruleset on `main` requires the four check jobs from `checks.yml` to pass, each by its job name, before a PR can be merged. The ruleset is a GitHub setting, not a repo file, so the "Setup Outside the Repo" section of `docs/ci.md` records it: its name and the checks it requires.
- **Comes from:** Decision 5.
- **Lands in:** `docs/ci.md`, "Setup Outside the Repo".

# Coverage

# Child Stories
| Story | Status | Scope in this area | Blocked by |
|---|---|---|---|
| PR Checks | done | The four check jobs on every PR, the ruleset on `main`, and the checks' parts of `docs/ci.md` | - |
| [[CI Failure Sessions]] | in-progress | The job that starts `ci-failure`, the `ci-failure` and `routine-sessions` skills, the Claude GitHub App, the cloud environment, and the routine parts of `docs/ci.md` | - |

Related notes that follow the convention or the setup record kept here: [[E2E Tests in CI]], [[Local Dependency Update Alerts]], [[Sentry Logging and Root Cause Analysis]] and [[Services and Environments Audit]].

# Build Order
1. PR Checks (done)
2. [[CI Failure Sessions]]

Stated in the Design: the job that starts `ci-failure` is one more job in `checks.yml`.

# Open Decisions

# Deferred Work
