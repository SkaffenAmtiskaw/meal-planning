---
type: infra
status: in-progress
blocked-by: []
confirmed: 2026-10-04
---
# Where It Stands
In progress. Next: /implement Step 2 ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04. Its ten implementation steps were planned and approved on 2026-10-04. Step 1 is built: `pnpm deps:check` lists the advisories that aren't in the reported list. Steps 2-10 remain.

# Inbox

# Purpose
A scheduled GitHub workflow checks the dependencies for new versions and security advisories, and when it finds something new it starts the `dependency-updates` routine. The routine's session puts patches, minors and security fixes in the one `claude/dependency-updates` PR into `develop`, sees the PR's checks through, and lists majors and unfixed advisories for Sarah. It's the core of [[Local Dependency Update Alerts]], built first so security fixes reach PRs before the release analysis and the sweeps for majors. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [ ] A scheduled workflow on `develop` checks the dependencies in `package.json` for new versions, without Sarah doing anything.
- [ ] The same workflow checks every installed package, including the dependencies of dependencies, against known security advisories.
- [ ] When a run finds something, a session starts that Sarah sees in the Code tab of the Claude desktop app, under **Routines**.
- [ ] A run that finds nothing new starts no session. That covers a run that finds nothing, and a run that finds only updates and advisories it has already reported. The one exception is the weekly reminder: a weekly run starts a session while any advisory is still unfixed.
- [ ] Small updates, security fixes first among them, get a PR into `develop` without Sarah asking.
- [ ] A major update never gets a PR without Sarah's say-so.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Pieces 1, 2 and 3 whole; Piece 4's sub-steps 1, 2, 3, 6, 7 and 8, plus sub-step 5's rule that an advisory fixed only by a major counts as a major, flagged as a security fix; and Piece 7's "Dependency Updates" section, the change to "Every Check Is a `package.json` Script", the "Routines" entry and the 60-day note (not "The Cloud Environment"). Of the Decisions, it builds how often the check runs, which updates get a PR (patches and minors, a pre-1.0 minor counting as a major, one PR per run), the routine running on Sonnet, a failed PR check and a failed check.

![[Local Dependency Update Alerts#^piece-1]]
![[Local Dependency Update Alerts#^piece-2]]
![[Local Dependency Update Alerts#^piece-3]]
![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-7]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Flow]]
![[Local Dependency Update Alerts#Open Decisions]]

# Conventions
![[Local Dependency Update Alerts#Conventions]]

# Setup Outside the Repo
![[Local Dependency Update Alerts#^setup-routine]]
![[Local Dependency Update Alerts#^setup-secrets]]

# Out of Scope
- Release summaries for minors and the `upgrade-assessor` subagent: [[Dependency Release Analysis]].
- Sweep items and story flags for majors of other packages: [[Major Upgrade Sweeps]].

# Implementation
Facts the steps rely on, checked 2026-10-04:
- **Real findings to check with.** `pnpm audit` lists about 40 advisories. Some are transitive and a lockfile bump fixes them: `undici` under `jsdom` (1121187, high, fixed in `>=7.28.0`, which `jsdom`'s `^7.24.5` allows), and `vite` under `@vitejs/plugin-react`. Others are direct: `postcss`, and `mongoose` (pinned at 9.0.2; 1118996 fixed in `>=9.1.6`, 1139503 in `>=9.7.2`). No advisory needs a major to fix. `pnpm outdated` lists patches (`@testing-library/react` 16.3.3, `@types/luxon` 3.7.6, `lefthook` 2.1.16), minors (`@tabler/icons-react` 3.48.0, `resend` 6.32.0, `@mantine/core` 9.6.3, `react` 19.3.0, `zod` 4.6.5, `better-auth` 1.7.7) and majors (`typescript` 7.0.2, `vitest` 5.0.3, `jsdom` 30.1.2, `preact` 11.0.0, `temporal-polyfill` 0.3.2 → 1.0.5).
- **Why the workflow comes late.** Sarah decided the first run reports the whole backlog and tests this story's whole flow. The reported list is saved after each call, so a workflow that ran before the skill was finished would use up the backlog on a half-built session. So Steps 5-8 build the session by calling the routine with `curl` and hand-picked findings, as CI Failure Sessions' first check did. Step 9 adds the workflow, and its first run is the real first run.
- **The routine's token.** Sarah keeps the token from creating the routine (Step 5) somewhere safe for the `curl` checks through Step 8. Step 9 regenerates it, so the new token goes straight into the Actions secret, as `docs/ci.md` ("A Routine's URL and Token") says.
- **Pushing before checks.** A routine runs the skill as it is on `develop` (`routine-sessions`), so each step's skill changes are pushed to `develop` before its checks. The same goes for the workflow, since `workflow_dispatch` only shows up once the workflow is on the default branch.

## Step 1: `pnpm deps:check` lists new security advisories
**Idea:** `pnpm deps:check` lists the security advisories that aren't in the reported list it's given.

**Source:** Piece 1 (hourly mode, identifiers, `--reported`, the updated list, no list reports everything, report only); Goal: the workflow checks every installed package against known security advisories; Goal: a run that finds nothing new starts no session (the reported list's half); Open Decision 2 (a finding is identified by its advisory ID; the updated list keeps only what's still current). Sarah decided 2026-10-04 while planning: `scripts/` is the right home, and `docs/project_structure.md` is updated in this step.

**Approach:**
- `scripts/dependencyCheck.ts` (new, TypeScript that Node runs directly, using only syntax Node can strip; no new dependency, no `pnpm install` needed): runs `pnpm audit --json` and turns each advisory into a finding with its ID, severity and package. It reads the reported list from `--reported <path>` if given, and prints JSON with two parts: the new findings (those not in the list) and the updated list (every current advisory, so a fixed one drops out). With no `--reported`, everything is new. The JSON's exact shape is the implementer's choice. Step 9's job reads it, so the implementer keeps it simple for `jq`. It never writes to `package.json` or the lockfile.
- `package.json`: `"deps:check": "node scripts/dependencyCheck.ts"`.
- `pnpm audit` exits non-zero when it finds advisories. The script tells that apart from a real failure, such as no network, and exits non-zero only for the second.
- **Implementer:** on a copy of the repo without `node_modules`, run `pnpm deps:check` and confirm it works without an install. After running it, confirm `package.json` and `pnpm-lock.yaml` are unchanged.
- `docs/project_structure.md`: the `scripts/` line becomes "lefthook scripts, scripts that check the notes vault, and the dependency check CI runs".

**Files:**
- `scripts/dependencyCheck.ts` (new) - the check, hourly mode
- `package.json` - the `deps:check` script
- `docs/project_structure.md` - `scripts/` now holds a CI script too

**Acceptance:**
- [x] In the repo, run `pnpm deps:check`. See JSON listing advisories as new, among them `undici` 1121187 (high) and `mongoose` 1139503, each with its ID, severity and package, and the same IDs in the updated list. Proves: the check finds every advisory, transitive ones included, when it has no list.
- [x] Save the updated list to a file with `pnpm -s deps:check | jq .reported > /tmp/reported.json` (`-s` hides pnpm's script banner, which would break `jq`). Remove one advisory's ID from the file and add a made-up one, then run `pnpm deps:check --reported /tmp/reported.json`. See only the removed advisory as new, and an updated list with the made-up ID gone. Proves: only unreported advisories count as new, and the list drops what's no longer current.

**Status:** ✅ Complete

**As built:**
- The script is `scripts/dependencyCheck.ts`, following the camelCase rule in `docs/project_conventions.md`, and this note's paths were corrected to match.
- Its output is `{ "new": [...], "reported": [...] }`. Each finding is `{ "kind": "advisory", "id", "severity", "package" }`, with the ID as a string so Step 3's `package@version` identifiers share the list. The file `--reported` reads is the `reported` array.
- A `--reported` path that doesn't exist is an error, and so is a list that isn't a JSON array of strings. Sarah decided 2026-10-04 that a missing file fails rather than counting as an empty list, so Step 9's job passes `--reported` only when the cache restored a list.
- Every caller that reads the JSON runs `pnpm -s deps:check`, since `pnpm run` prints its script banner to stdout before the JSON. Sarah decided this 2026-10-04 at review, over an `--output` argument. Check 2 and Step 9's Approach were updated to match.
- Check 2: Sarah saved the list with the command above. The implementer's run covered the rest of the check: with 1121187 removed and a made-up ID added, only `undici` 1121187 came back as new and the made-up ID dropped out.

## Step 2: The dependency check gets CI's code checks
**Idea:** Biome lints `scripts/dependencyCheck.ts` like the rest of the code.

**Source:** Pulled in by Sarah 2026-10-04: the new script would get no lint, type check or unit tests, since Biome, lefthook's glob and Vitest cover only `src/`, `test/`, `e2e/` and `seed/`. Sarah decided: the script is TypeScript, so the existing `pnpm check:types` covers it; `biome.jsonc` gains `"scripts/**/*.ts"` in `files.includes` (her explicit go-ahead for that config change); no unit tests.

**Approach:**
- `biome.jsonc`: add `"scripts/**/*.ts"` to `files.includes`. Lefthook's Biome glob already matches `.ts`, so the pre-commit hook picks it up with no change.
- Fix whatever Biome reports in the script.
- Type check needs no change: `tsconfig.json` includes `**/*.ts`. **Implementer:** temporarily assign a number to a string-typed variable in the script, run `pnpm check:types`, see the error in that file, and revert.

**Files:**
- `biome.jsonc` - lint `scripts/**/*.ts`
- `scripts/dependencyCheck.ts` - whatever Biome reports

**Acceptance:**
- [ ] Temporarily add an unused variable to `scripts/dependencyCheck.ts`, run `pnpm lint:ci`, and see Biome report it in that file. Revert. Proves: CI lints the script.

## Step 3: The weekly check lists new versions
**Idea:** `pnpm deps:check --weekly` also lists new versions of the packages in `package.json`, each marked patch, minor or major.

**Source:** Piece 1 (weekly mode, `pnpm outdated --format json`, `package@version` identifiers, the kinds, a pre-1.0 minor marked major); Goal: the workflow checks the dependencies in `package.json` for new versions; Design decision: a minor of a `0.y.z` package is treated as a major; Open Decision 2 (a reported version stays quiet until a newer one comes out).

**Approach:**
- `scripts/dependencyCheck.ts`: with `--weekly`, it also runs `pnpm outdated --format json` and adds a finding for each package's latest version, identified as `package@version` and marked patch, minor or major against the installed version. A minor bump of a package below 1.0 is marked major. The version identifiers go through the same reported list as advisories, so a reported version stays quiet until a newer one replaces it, and one that's been merged or superseded drops out of the updated list. `pnpm outdated` needs an install, and it exits non-zero when it finds something, which the script tells apart from a failure, as in Step 1.
- In hourly mode, which can't tell whether a version is still current, the version identifiers in the reported list pass through to the updated list unchanged. Otherwise an hourly run that saves would drop them, and the next weekly run would report every version again.
- **Implementer:** after a weekly run, confirm `package.json` and `pnpm-lock.yaml` are unchanged.
- **Implementer:** check the pre-1.0 rule on a case that exists. No package has one today, so pin a `0.y` package to an older minor in a scratch copy, such as `@t3-oss/env-nextjs`, run the check, see it marked major, and throw the copy away.

**Files:**
- `scripts/dependencyCheck.ts` - weekly mode lists new versions

**Acceptance:**
- [ ] Run `pnpm deps:check --weekly`. See `@types/luxon@3.7.6` marked patch, `better-auth@1.7.7` minor, `typescript@7.0.2` major and `temporal-polyfill@1.0.5` major, beside the advisories. Proves: the weekly check finds each kind of update.
- [ ] Save its updated list as in Step 1, then run `pnpm deps:check --weekly --reported /tmp/reported.json`. See no new versions. Proves: a reported version stays quiet.
- [ ] In that file, change `better-auth@1.7.7` to `better-auth@1.7.6`, then run it again. See `better-auth@1.7.7` listed as new, and `better-auth@1.7.6` gone from the updated list. Proves: a newer version of a reported package counts as new, and the old one drops out.
- [ ] Run `pnpm deps:check --reported /tmp/reported.json`, without `--weekly`. See no versions among the new findings, and the updated list still holding every `package@version` from the file. Proves: the hourly run checks only advisories, and leaves the reported versions alone.

## Step 4: The weekly check repeats unfixed advisories
**Idea:** `pnpm deps:check --weekly` lists every advisory that's still unfixed as a reminder, even one already reported.

**Source:** Piece 1 (weekly mode lists every advisory still unfixed as the weekly reminder); Open Decision 2 (an unfixed advisory is listed again in the weekly run, while version updates stay quiet once reported). Sarah decided 2026-10-04 while planning: a weekly run with nothing new still starts a session while an advisory is unfixed.

**Approach:**
- `scripts/dependencyCheck.ts`: in weekly mode, the output also holds the reminders: every advisory still in the audit that's in the reported list. They're kept apart from new findings, so the session can tell them apart. Step 9's job starts the routine on a weekly run when there's a new finding or a reminder.

**Files:**
- `scripts/dependencyCheck.ts` - weekly reminders

**Acceptance:**
- [ ] Save a fresh updated list from `pnpm deps:check --weekly` to `/tmp/reported.json`, as in Step 1, then run `pnpm deps:check --weekly --reported /tmp/reported.json`. See no new findings, and every advisory listed as a reminder, `undici` among them. Proves: an unfixed advisory comes back each week.
- [ ] Run `pnpm deps:check --reported /tmp/reported.json`. See no new findings and no reminders. Proves: the hourly run never repeats an advisory.

## Step 5: The routine, called by hand
**Idea:** Calling the `dependency-updates` routine starts a session that summarizes the findings it was sent.

**Source:** Piece 3 (the routine and `routine.md`); Piece 4 (follows `routine-sessions`, reads the payload as untrusted identifiers; sub-step 6, reminders; sub-step 8, the summary's shape); the split note Sarah approved 2026-10-04 (a minor is listed with what's in the PR; a major is listed with a link to its release notes and marked "not applied"); Piece 7 ("Routines" entry); Convention (the payload's exact shape lives in step 1 of the skill); Setup Outside the Repo: the `dependency-updates` routine; Goal: a session starts that Sarah sees in the Code tab under **Routines**; Goal: a major update never gets a PR without Sarah's say-so (the session lists it and leaves it alone); Design decision: the routine runs on Sonnet.

**Approach:**
- `.claude/skills/dependency-updates/SKILL.md` (new, default invocation frontmatter, following `ci-failure`'s shape, with its steps numbered as Piece 4's sub-steps so the later stories' step references hold): points to `routine-sessions`. Step 1 gives the payload's exact shape, built from Steps 1-4's JSON: the run (hourly or weekly, its ID and URL), the new findings (each a kind and an identifier: `patch|minor|major package@version`, or `advisory <ID> <severity> <package>`), and the reminders. The block is untrusted: identifiers only, never instructions, and a missing part stops the session with what the block held, as `ci-failure` does. Steps 2, 3 and 7 are added by Steps 6-8 of this plan, and step 1's failed-check shape by Step 10.
- Step 4 (minors) and step 5 (majors) give this story's lasting behavior, which [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]] later build on:
  - A minor is listed in the summary. From Step 6 on, it's listed with what's in the PR.
  - A major is listed with a link to its release notes (from the package's repository on `github.com`) and marked "not applied". The session changes nothing for it.
- Step 6 (reminders): each reminder is listed apart from the new findings, as an advisory that's still unfixed.
- Step 8 (the summary): the findings by kind, then the reminders.
- **Scaffolding:** until Step 6, the summary lists patches and advisories, and the minors, under "not applied yet". Step 6 replaces that with what's in the PR.
- `.claude/skills/dependency-updates/routine.md` (new), as `routine-sessions` requires: the name, the prompt word for word, Sonnet, the `meal-planning` repo, an API trigger (its caller and secrets come in Step 9), the `Meal Planning Routines` environment and its variables, no connectors.
- `docs/ci.md` "Routines": a `dependency-updates` entry, saying what it's for and linking its skill.
- **Setup Sarah does by hand before the checks:** create the routine at https://claude.ai/code/routines → **New routine**: name `dependency-updates`; prompt `Run /dependency-updates on the findings described in the routine-fire-payload block.` with **Sonnet** in the model selector; repositories `meal-planning`; environment `Meal Planning Routines`; remove the default **Pull request: Opened** trigger with ✕, then **+ Add another trigger** → **API**; remove every connector; **Create**. Copy the URL and the token from the API trigger's dialog, and keep the token somewhere safe for the `curl` checks through Step 8 (Step 9 regenerates it for the Actions secret).
- **Implementer:** in a local session, run the skill on a block missing the run part, and confirm it stops, says the run is missing and quotes what the block held.
- Sarah pushes the skill to `develop` before the checks.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` (new) - reads the payload, summarizes the findings
- `.claude/skills/dependency-updates/routine.md` (new) - the routine's configuration on claude.ai
- `docs/ci.md` - the routine's entry under "Routines"

**Acceptance:**
- [ ] Call the routine with `curl`, as the API trigger's sample command shows, with a text the implementer gives in the payload's shape: `patch @types/luxon@3.7.6`, `minor resend@6.32.0`, `major typescript@7.0.2`, the `undici` advisory 1121187, and the `mongoose` advisory 1118996 as a reminder. See a new session in the Code tab under **Routines** whose summary lists each finding under its kind, `typescript` with a link to its release notes and marked "not applied", and the reminder apart from them. Proves: the routine starts a session that reads the payload's shape, and a major is listed without being applied.

## Step 6: Small updates get a PR
**Idea:** The session puts the patches, minors and security fixes it's sent in a PR into `develop` from `claude/dependency-updates`.

**Source:** Piece 4 sub-step 2 (cut the branch fresh from `develop`), sub-step 3 (patches, minors and security fixes, the smallest fix for a transitive advisory, the four check scripts, dropping an update that breaks one), sub-step 5 (an advisory fixed only by a major counts as a major, flagged as a security fix), sub-step 7 (push and open the PR); the split note Sarah approved 2026-10-04 (a minor is listed with what's in the PR; an advisory fixed only by a major is listed with a link to its release notes and marked "not applied"); Goal: small updates, security fixes first among them, get a PR into `develop`; Goal: a major update never gets a PR without Sarah's say-so; Design decisions: patches and minors both get a PR; one PR per run; Open Decision 2 (every run's PR comes from one fixed `claude/` branch).

**Approach:**
- `SKILL.md` steps 2 and 3: checks out `develop`, runs `pnpm install --frozen-lockfile` and `pnpm lefthook install` (as `ci-failure` does), cuts `claude/dependency-updates` from `develop`, applies each patch and minor, and fixes each advisory with the smallest fix that works: a lockfile bump when the parent's range already allows the fixed version, a parent update when it doesn't, or a `pnpm.overrides` entry like the ones `pnpm audit --fix` adds. Then it runs `pnpm lint:ci`, `pnpm check:types`, `pnpm test:coverage` and `pnpm build`. If one fails, it finds the update that breaks it, takes that update off the branch, runs them again and reports it.
- `SKILL.md` step 7: it commits with the hooks, never `--no-verify`, pushes and opens a PR into `develop`.
- `SKILL.md` step 8: the summary gives the PR's link, what's in it (each patch, minor and advisory fix) and any update it dropped, replacing Step 5's "not applied yet" scaffolding.
- `SKILL.md` step 5: an advisory whose only fix is a major isn't applied. It's listed with the majors, flagged as a security fix, with a link to the major's release notes and marked "not applied".
- With no patch, minor or applicable security fix, such as a run with only majors or reminders, the session cuts no branch, pushes nothing and leaves any open PR alone. The summary lists the majors and reminders, and says there was nothing to apply. **Implementer:** in a local session, run the skill on a payload holding only `major typescript@7.0.2` and a reminder, and confirm it cuts no branch, pushes nothing, opens no PR and says there was nothing to apply.
- Step 7 handles an open PR on the branch. Until then, the skill assumes there isn't one. Sarah leaves this step's PR open for Step 7's checks.
- **Implementer:** verify the drop path in a local session on a throwaway branch that's never pushed: add a temporary test that fails once one of the updates is applied, run the skill's apply-and-check part, and confirm it drops that update, keeps the rest and reports it. Verify the major-only advisory path the same way, with a payload naming an advisory the implementer picks whose fix needs a major, since none in the audit does today, and confirm it's listed as a major flagged as a security fix and left unapplied.
- Sarah pushes the skill to `develop` before the checks.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` - applies small updates and security fixes, opens the PR

**Acceptance:**
- [ ] Call the routine with `curl` and a text naming `patch @testing-library/react@16.3.3`, `minor resend@6.32.0`, `major typescript@7.0.2`, the `undici` advisory 1121187 and the `mongoose` advisory 1139503. See a PR from `claude/dependency-updates` into `develop` with `@testing-library/react` and `resend` bumped in `package.json`, `mongoose` updated to a fixed 9.x, `undici` raised in `pnpm-lock.yaml` with no change to `jsdom`'s entry in `package.json`, and `typescript` untouched. See the session's summary link the PR, list what's in it, say the four checks passed, and list `typescript` as "not applied". Proves: small updates and security fixes reach one PR with the smallest fix each, and a major doesn't.

## Step 7: One open dependency PR at a time
**Idea:** A run adds its updates to the open `claude/dependency-updates` PR rather than opening another.

**Source:** Piece 4 sub-step 2 (an open PR's branch is checked out and brought up to date with `develop`, otherwise cut fresh), sub-step 7 (update the open PR); Open Decision 2 (only one dependency PR is ever open; a PR Sarah closed without merging is left alone, and the next run starts a fresh one from `develop`).

**Approach:**
- `SKILL.md` step 2: if the PR from `claude/dependency-updates` is open (`gh pr list --head claude/dependency-updates --state open`), it fetches that branch, checks it out and merges `develop` into it, then applies this run's updates on top. If there's no open PR, including when the last one was closed without merging, it cuts the branch fresh from `develop` and force-pushes it, since a closed PR's branch is left behind. The summary says whether it updated the open PR or opened a new one.
- Sarah pushes the skill to `develop` before the checks.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` - reuses the open PR

**Acceptance:**
- [ ] With this step's skill pushed to `develop` (so Step 6's PR is now behind it), call the routine with a text naming `patch @types/luxon@3.7.6`. See no new PR. See Step 6's PR gain a merge of `develop` and a commit bumping `@types/luxon`, and the summary say it updated the open PR. Proves: a run joins the open PR and brings it up to date.
- [ ] Close that PR without merging, then call the routine with a text naming `minor @tabler/icons-react@3.48.0`. See a new PR from `claude/dependency-updates` that holds only the `@tabler/icons-react` bump on top of `develop`, and the closed PR still closed. Proves: a closed PR is left alone and the next run starts fresh.

## Step 8: The session sees its PR's checks through
**Idea:** After pushing, the session sees its PR's checks on GitHub through to a pass or a diagnosed failure.

**Source:** Piece 4 sub-step 7 (wait for the PR's checks; rerun the failed script, fix it, or re-run a check that passes in the session once on GitHub to tell a flake from a real failure; explain what it can't fix); Design decision: the session handles a failed check itself, since `start-ci-failure` skips `claude/` branches; Flow step 5.

**Approach:**
- `SKILL.md` step 7: after pushing, it waits for the PR's run of `checks.yml` to finish, polling in commands under 10 minutes for up to about 30 minutes, as `ci-failure` step 5 does. On a failure it follows `ci-failure`'s approach on its own branch: rerun the failed job's script, fix a failure that reproduces on the same branch, or re-run the failed jobs once on GitHub to tell a flake from a runner-only failure, and explain what it can't fix. It reuses `ci-failure`'s instructions by pointing to its sections where they apply as written, and spells out only what differs: the fix goes on `claude/dependency-updates`, not a new branch. The summary gives the checks' result.
- **Implementer:** verify the failure path in a local session against a throwaway `claude/` PR whose `lint` fails (a formatting break committed with `--no-verify`, as CI Failure Sessions checked `start-ci-failure`): the skill's step 7 reruns `pnpm lint:ci`, fixes it on that branch and the checks pass. Close the PR and delete the branch afterward.
- Sarah pushes the skill to `develop` before the check.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` - waits for the PR's checks and handles a failure

**Acceptance:**
- [ ] Call the routine with `curl` and a text naming `patch lefthook@2.1.16`. See the session's summary say the PR's four checks passed on GitHub, with the run's link, and that run on the PR show all four green. Proves: the session doesn't end before GitHub has checked its PR.

## Step 9: The workflow starts the routine
**Idea:** A scheduled workflow on `develop` starts the `dependency-updates` routine when `pnpm deps:check` finds something new.

**Source:** Piece 2 (triggers, permissions, concurrency, the `check` and `start-dependency-updates` jobs, the cache restore and save, the `/fire` call built with `jq` from `env:`); Piece 3 (the API trigger, its two secrets); Piece 7 (the "Dependency Updates" section, "Every Check Is a `package.json` Script", the 60-day note); Convention: the payload's shape changes in the job and the skill together; Setup Outside the Repo: the two Actions secrets; Flow steps 1-6 (step 4 without the assessor and the sweeps); Goals: the scheduled workflow checks `package.json` for new versions; the same workflow checks every installed package against advisories; a run that finds nothing new starts no session; Open Decision 1 (the scheduled workflow on `develop`); Open Decision 2 (the Actions cache, the reported list, concurrency, the first run reports the whole backlog, the weekly reminder); Design decision: audit hourly, versions weekly. Sarah decided 2026-10-04 while planning: a weekly run starts a session while any advisory is unfixed. Sarah decided 2026-10-04 while planning: the workflow's first push leaves out the `schedule` triggers, so an hourly run can't beat the first weekly dispatch.

**Approach:**
- `.github/workflows/dependency-updates.yml` (new), as Piece 2 says: `schedule` `17 * * * *` and `47 13 * * 1`, `workflow_dispatch` with an hourly/weekly choice, `permissions: contents: read`, a `concurrency` group without cancel-in-progress. `check` restores the newest `dependency-alerts-reported-*` entry (`actions/cache/restore@v6`), installs only on the weekly run, runs `pnpm -s deps:check` (`-s` so stdout holds only the JSON; `--weekly` on the weekly run, telling it apart by the schedule or the dispatch input) and passes the new findings, the reminders and the updated list on as job outputs. `start-dependency-updates` runs no install, runs when there's a new finding or a reminder, builds the `text` in the skill's step-1 shape with `jq` from `env:` values, calls `/fire` once with `curl --fail-with-body` and no retry, then writes the updated list and saves it as `dependency-alerts-reported-<run ID>` (`actions/cache/save@v6`). A header comment says what the workflow does and points to `docs/ci.md`.
- `routine.md`: the trigger's caller and the two secret names.
- `docs/ci.md`: a new "Dependency Updates" section (the two schedules, the two jobs, when `start-dependency-updates` fires, the shape of its `text` pointing to step 1 of the skill, the Convention, the reported list in the Actions cache and how to clear it, what happens when the call fails, and that GitHub turns off a public repo's scheduled workflows after 60 days with no activity); "Every Check Is a `package.json` Script" names the cache restore and save beside setup and the routine call; the opening bullets at the top name the new workflow.
- **Setup Sarah does by hand before the checks:** on the routine's API trigger, **Regenerate** the token and keep the dialog open; in the repo's Settings → Secrets and variables → Actions, add `ROUTINE_DEPENDENCY_UPDATES_URL` (the URL) and `ROUTINE_DEPENDENCY_UPDATES_TOKEN` (the new token). The token from Step 5 stops working.
- **Implementer:** run the start job's script against a local server returning 401 and confirm it exits non-zero, so the save step after it doesn't run, as CI Failure Sessions did. After Sarah's check 2, dispatch two hourly runs back to back and confirm the second waits for the first. Hourly runs start nothing once the list is cached, so this can't use up the first run.
- **The schedule comes last.** The workflow first goes to `develop` with only `workflow_dispatch`, so no hourly run can start before Sarah's first weekly dispatch and use up the backlog. Once checks 1-3 pass, the implementer adds the two `schedule` triggers, and Sarah pushes them to `develop` before check 4.
- Close or merge any open dependency PR before the first check, so the first run starts from `develop`. Sarah pushes the workflow to `develop` before the checks.

**Files:**
- `.github/workflows/dependency-updates.yml` (new) - runs the check on a schedule, starts the routine
- `.claude/skills/dependency-updates/routine.md` - the trigger's caller and secrets
- `docs/ci.md` - the "Dependency Updates" section and the cache steps

**Acceptance:**
- [ ] On GitHub, open Actions → the dependency-updates workflow → **Run workflow**, pick weekly. See `check` and `start-dependency-updates` pass, the start job's log show the session's link, and one new session whose summary covers the whole backlog: a PR with the small updates and security fixes and its checks' result, every advisory listed as new, and every major listed with a link to its release notes and marked "not applied". Proves: the first run reports everything through this story's whole flow.
- [ ] Run it again, hourly. See `check` pass, `start-dependency-updates` skipped and no new session. Proves: the reported list in the cache stops a repeat session.
- [ ] Before merging the PR from the first run, run it again, weekly. See a session whose summary lists the still-unfixed advisories as reminders, no new versions and nothing to apply, and the first run's PR unchanged. Proves: the weekly reminder reaches Sarah even with nothing new.
- [ ] With the `schedule` triggers pushed to `develop`, wait for the next :17, then open the workflow's runs. See a scheduled hourly run that passed with the start job skipped. Proves: the check runs on its own schedule without Sarah.

## Step 10: A failed weekly check starts a session
**Idea:** When the weekly run's check fails, the routine starts a session that looks into it.

**Source:** Piece 2 (`start-dependency-updates` also runs when the weekly run's `check` failed, sends "the weekly check failed" with the run's link and saves nothing); Piece 4 sub-step 1 (rerun `pnpm deps:check --weekly` to find the cause, fix it on a `claude/` branch with a PR or explain); Piece 7 (the failure in "Dependency Updates"); Flow step 2 (a failed hourly run starts nothing); Design decision: what happens when the check itself fails.

**Approach:**
- The workflow: `start-dependency-updates` also runs when `check` failed on a weekly run, and sends the failure text in the skill's shape, with the run's link. It saves nothing. A failed hourly run starts nothing.
- `SKILL.md` step 1: the failure text has its own shape there. The session checks out the commit the failed run tested (`gh run view <run ID> --json headSha`), as `ci-failure` does, since a newer `develop` may differ, reruns `pnpm deps:check --weekly`, and fixes the cause on a `claude/` branch with a PR into `develop` or explains what it found.
- `docs/ci.md` "Dependency Updates": the failure path.
- Sarah pushes the workflow and skill to `develop` before the checks.

**Files:**
- `.github/workflows/dependency-updates.yml` - starts the routine when the weekly check fails
- `.claude/skills/dependency-updates/SKILL.md` - looks into a failed weekly check
- `docs/ci.md` - the failure path

**Acceptance:**
- [ ] Push a branch `claude/deps-check-test` from `develop` with a line at the end of `scripts/dependencyCheck.ts` that throws (at the end, so Biome's pre-commit hook doesn't flag the rest as unreachable), then run `gh workflow run dependency-updates.yml --ref claude/deps-check-test -f mode=weekly`. See `check` fail, `start-dependency-updates` pass, and a session that names the throw as the cause, with a PR or an explanation. Proves: a broken weekly check reaches Sarah as a session.
- [ ] Run the same with `-f mode=hourly`. See `check` fail, `start-dependency-updates` skipped and no new session. Delete the branch, and close any PR the session opened. Proves: a failed hourly run waits for the next hour instead of starting a session.
