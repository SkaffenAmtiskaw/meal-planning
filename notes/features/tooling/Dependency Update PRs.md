---
type: infra
status: in-review
blocked-by: []
confirmed: 2026-10-04
---
# Where It Stands
All steps implemented. Next: /final-review ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04. Its ten implementation steps were planned and approved on 2026-10-04. Steps 1-8 are built: `pnpm deps:check` lists the advisories that aren't in the reported list, `--weekly` adds new versions marked patch, minor or major and repeats every unfixed advisory as a reminder, and CI lints and type-checks the script. The `dependency-updates` routine exists on claude.ai, and its session puts the patches, minors and security fixes it's sent in a PR from `claude/dependency-updates` into `develop`, and lists the majors and reminders. While that PR is open, a run merges `develop` into it and adds its updates there. Once it's closed, the next run starts fresh. After pushing, the session waits for the PR's checks on GitHub, re-runs a failure there once, and drops an update that breaks a check only on GitHub's runner. Step 9 is built too: the `dependency-updates` workflow on `develop` runs the check hourly and weekly, and starts the routine only for findings it hasn't reported, or for the weekly reminders. Its first run opened PR #25 with the backlog. Step 10 is built too: a failed weekly check starts a session that looks into it, and a failed hourly run starts nothing. What remains is the review of the whole story.

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
- [x] Temporarily add an unused variable to `scripts/dependencyCheck.ts`, run `pnpm lint:ci`, and see Biome report it in that file. Revert. Proves: CI lints the script.

**Status:** ✅ Complete

**As built:**
- Biome found nothing to fix in the script, so `biome.jsonc` is the only file changed.
- The implementer ran the type-check probe from the Approach: `pnpm check:types` reported `TS2322` in `scripts/dependencyCheck.ts`, then the probe was reverted.

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
- [x] Run `pnpm deps:check --weekly`. See `@types/luxon@3.7.6` marked patch, `better-auth@1.7.7` minor, `typescript@7.0.2` major and `temporal-polyfill@1.0.5` major, beside the advisories. Proves: the weekly check finds each kind of update.
- [x] Save its updated list as in Step 1, then run `pnpm deps:check --weekly --reported /tmp/reported.json`. See no new versions. Proves: a reported version stays quiet.
- [x] In that file, change `better-auth@1.7.7` to `better-auth@1.7.6`, then run it again. See `better-auth@1.7.7` listed as new, and `better-auth@1.7.6` gone from the updated list. Proves: a newer version of a reported package counts as new, and the old one drops out.
- [x] Run `pnpm deps:check --reported /tmp/reported.json`, without `--weekly`. See no versions among the new findings, and the updated list still holding every `package@version` from the file. Proves: the hourly run checks only advisories, and leaves the reported versions alone.

**Status:** ✅ Complete

**As built:**
- Version findings are `{ "kind": "patch" | "minor" | "major", "id": "package@version", "package" }`, beside the advisory findings in `new`, with their identifiers in `reported`.
- A package `pnpm outdated` lists with no installed version stops the run with "run pnpm install first", rather than being skipped, so a weekly run that missed its install fails instead of reporting nothing.
- The implementer ran the Approach's checks: `package.json` and `pnpm-lock.yaml` were unchanged after the weekly runs, and a scratch copy with `@t3-oss/env-nextjs` pinned to `0.12.0` listed `@t3-oss/env-nextjs@0.13.11` as major.

## Step 4: The weekly check repeats unfixed advisories
**Idea:** `pnpm deps:check --weekly` lists every advisory that's still unfixed as a reminder, even one already reported.

**Source:** Piece 1 (weekly mode lists every advisory still unfixed as the weekly reminder); Open Decision 2 (an unfixed advisory is listed again in the weekly run, while version updates stay quiet once reported). Sarah decided 2026-10-04 while planning: a weekly run with nothing new still starts a session while an advisory is unfixed.

**Approach:**
- `scripts/dependencyCheck.ts`: in weekly mode, the output also holds the reminders: every advisory still in the audit that's in the reported list. They're kept apart from new findings, so the session can tell them apart. Step 9's job starts the routine on a weekly run when there's a new finding or a reminder.

**Files:**
- `scripts/dependencyCheck.ts` - weekly reminders

**Acceptance:**
- [x] Save a fresh updated list from `pnpm deps:check --weekly` to `/tmp/reported.json`, as in Step 1, then run `pnpm deps:check --weekly --reported /tmp/reported.json`. See no new findings, and every advisory listed as a reminder, `undici` among them. Proves: an unfixed advisory comes back each week.
- [x] Run `pnpm deps:check --reported /tmp/reported.json`. See no new findings and no reminders. Proves: the hourly run never repeats an advisory.

**Status:** ✅ Complete

**As built:**
- The output is `{ "new": [...], "reminders": [...], "reported": [...] }`. Each reminder has the same shape as an advisory finding in `new`. `reminders` is always present, and is `[]` on an hourly run or with no list.

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
- [x] Call the routine with `curl`, as the API trigger's sample command shows, with a text the implementer gives in the payload's shape: `patch @types/luxon@3.7.6`, `minor resend@6.32.0`, `major typescript@7.0.2`, the `undici` advisory 1121187, and the `mongoose` advisory 1118996 as a reminder. See a new session in the Code tab under **Routines** whose summary lists each finding under its kind, `typescript` with a link to its release notes and marked "not applied", and the reminder apart from them. Proves: the routine starts a session that reads the payload's shape, and a major is listed without being applied.

**Status:** ✅ Complete

**As built:**
- The payload is one finding per line: a run line, `<hourly|weekly> run <run ID> <run URL>`, then `new:` and `reminders:`, each followed by its findings or the single line `none`. Sarah chose lines over a single line like `ci-failure`'s, since the weekly reminders can stay long while hard-to-fix advisories wait. Step 9's job builds this shape.
- A payload line the skill can't read stops the session, as a missing part does, naming the line and quoting the block. Sarah's call, so a job and skill that have drifted apart show up rather than half-run.
- A major's link is the repository's GitHub releases page, found with `pnpm view "<package>" repository --json` (a URL, `github:owner/repo` or a bare `owner/repo`). A package with no repository, one not on GitHub, or one in DefinitelyTyped (`@types/*`) links its npm page instead and says it has no GitHub releases page. Both are Sarah's calls.
- The implementer ran the Approach's check with a local Sonnet stand-in: on a block with no run line, it stopped, said the run line was missing, quoted the block and changed nothing.
- In Sarah's check, the session also sent a push notification on its own, which the skill doesn't ask for. Sarah decided 2026-10-05 to leave that as it is.
- The new routine and its session showed under **Routines** in the desktop app's sidebar only after the app was restarted.

## Step 6: Small updates get a PR
**Idea:** The session puts the patches, minors and security fixes it's sent in a PR into `develop` from `claude/dependency-updates`.

**Source:** Piece 4 sub-step 2 (cut the branch fresh from `develop`), sub-step 3 (patches, minors and security fixes, the smallest fix for a transitive advisory, the four check scripts, dropping an update that breaks one), sub-step 5 (an advisory fixed only by a major counts as a major, flagged as a security fix), sub-step 7 (push and open the PR); the split note Sarah approved 2026-10-04 (a minor is listed with what's in the PR; an advisory fixed only by a major is listed with a link to its release notes and marked "not applied"); Goal: small updates, security fixes first among them, get a PR into `develop`; Goal: a major update never gets a PR without Sarah's say-so; Design decisions: patches and minors both get a PR; one PR per run; Open Decision 2 (every run's PR comes from one fixed `claude/` branch).

**Approach:**
- `SKILL.md` steps 2 and 3: checks out `develop`, runs `pnpm install --frozen-lockfile` and `pnpm lefthook install` (as `ci-failure` does), cuts `claude/dependency-updates` from `develop`, applies each patch and minor, and fixes each advisory with the smallest fix that works: a lockfile bump when the parent's range already allows the fixed version, a parent update when it doesn't, or an `overrides` entry in `pnpm-workspace.yaml` like the ones `pnpm audit --fix` adds. Then it runs `pnpm lint:ci`, `pnpm check:types`, `pnpm test:coverage` and `pnpm build`. If one fails, it finds the update that breaks it, takes that update off the branch, runs them again and reports it.
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
- [x] Call the routine with `curl` and a text naming `patch @testing-library/react@16.3.3`, `minor resend@6.32.0`, `major typescript@7.0.2`, the `undici` advisory 1121187 and the `mongoose` advisory 1139503. See a PR from `claude/dependency-updates` into `develop` with `@testing-library/react` and `resend` bumped in `package.json`, `mongoose` updated to a fixed 9.x, `undici` raised in `pnpm-lock.yaml` with no change to `jsdom`'s entry in `package.json`, and `typescript` untouched. See the session's summary link the PR, list what's in it, say the four checks passed, and list `typescript` as "not applied". Proves: small updates and security fixes reach one PR with the smallest fix each, and a major doesn't.

**Status:** ✅ Complete

**As built:**
- Sarah decided 2026-10-05: a security fix that updates a package in `package.json` (the vulnerable package, or a transitive one's parent) moves it to the lowest fixed version; each update is its own commit, in `git log` style, security fixes first; when a check also fails on `develop` with every update taken off, the session drops nothing and opens the PR anyway, saying so; the PR is titled "Dependency updates", and its body links the run and lists what's in it and what was dropped.
- Overrides go under `overrides` in `pnpm-workspace.yaml`, where pnpm 10.14's `pnpm audit --fix` writes them, kept to the installed major with `^<fixed>` rather than `audit --fix`'s open `>=`. The note's "`pnpm.overrides`" was corrected to match, here and in [[Local Dependency Update Alerts]].
- A parent update covers only the parent just before the package in a path, when it's in `package.json`. A deeper path goes to an override.
- To find an update that breaks a check, the session first checks that `develop` passes it, then runs `git bisect` with that check's script, and cuts the branch again from `develop` without the bad update.
- Added at review: on a run that cuts a branch, the session removes each override that no longer does anything, meaning removing it changes nothing in `pnpm-lock.yaml` outside its own `overrides:` section, each removal its own commit. Sarah asked for this 2026-10-05, after a test showed pnpm matches an override's key against the range a parent asks for, so a `^<fixed>` target never pushes a package below what a parent needs, but nothing removed an override once no dependency matched it.
- Added at review: a commit message always names the old and new versions, read from `pnpm-lock.yaml` for a transitive package. Sarah's check had committed undici as `→ lockfile bump`.
- Pulled in at triage: `ci-failure` step 4's `gh pr create` passes the body through a quoted heredoc with `--body-file -`, as this skill does, so backticks in the body aren't run by the shell.
- `pnpm update` can also move unrelated lockfile entries within their ranges, such as postcss 8.5.28 → 8.5.29 alongside undici's bump. Left as it is.
- The implementer ran the Approach's checks with local Sonnet stand-ins in throwaway clones that couldn't push: a payload of only a major and a reminder cut no branch and said there was nothing to apply; a temporary test that failed on resend 6.32.0 had the session bisect, drop resend and keep the rest; xml2js 0.4.23's advisory 1096693, fixed only in 0.5.0, was listed with the majors as a security fix and not applied; and a lint failure already on `develop` was reported with nothing dropped for it.
- Sarah's check opened [PR #22](https://github.com/SkaffenAmtiskaw/meal-planning/pull/22). The session's own commits for mongoose, `@testing-library/react` and `resend` lack the blank line before their `Co-Authored-By` trailers, which comes from the cloud session, not the skill. Left as it is.

## Step 7: One open dependency PR at a time
**Idea:** A run adds its updates to the open `claude/dependency-updates` PR rather than opening another.

**Source:** Piece 4 sub-step 2 (an open PR's branch is checked out and brought up to date with `develop`, otherwise cut fresh), sub-step 7 (update the open PR); Open Decision 2 (only one dependency PR is ever open; a PR Sarah closed without merging is left alone, and the next run starts a fresh one from `develop`).

**Approach:**
- `SKILL.md` step 2: if the PR from `claude/dependency-updates` is open (`gh pr list --head claude/dependency-updates --state open`), it fetches that branch, checks it out and merges `develop` into it, then applies this run's updates on top. If there's no open PR, including when the last one was closed without merging, it cuts the branch fresh from `develop` and force-pushes it, since a closed PR's branch is left behind. The summary says whether it updated the open PR or opened a new one.
- Sarah pushes the skill to `develop` before the checks.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` - reuses the open PR

**Acceptance:**
- [x] With this step's skill pushed to `develop` (so Step 6's PR is now behind it), call the routine with a text naming `patch @types/luxon@3.7.6`. See no new PR. See Step 6's PR gain a merge of `develop` and a commit bumping `@types/luxon`, and the summary say it updated the open PR. Proves: a run joins the open PR and brings it up to date.
- [x] Close that PR without merging, then call the routine with a text naming `minor @tabler/icons-react@3.48.0`. See a new PR from `claude/dependency-updates` that holds only the `@tabler/icons-react` bump on top of `develop`, and the closed PR still closed. Proves: a closed PR is left alone and the next run starts fresh.

**Status:** ✅ Complete

**As built:**
- Sarah decided 2026-10-05:
  - When the merge of `develop` into the open PR's branch conflicts only in `pnpm-lock.yaml`, `pnpm install` resolves it, as pnpm's docs say. Any other conflict aborts the merge, and the run applies and pushes nothing, and lists the conflicted files and its updates under "Not applied".
  - On a run that joined the open PR, the base for a failed check is the branch right after the merge. Bisect covers only this run's updates, and a dropped one is cut from that base, so nothing is force-pushed. If the base fails a check that `develop` passes, an earlier update in the PR now fails against the latest `develop`: it stays in, and the body and summary say so.
  - The open PR's body is rewritten to list everything in it, built from the branch's commits since `develop`, with earlier advisories' severities read from the current body. A package two runs updated is one line.
  - A fresh branch is pushed with `--force-with-lease` set to the commit `git ls-remote` showed when the branch was cut (empty when there was none), so one session never overwrites another's push. A rejected push opens or changes no PR, and the summary lists that run's updates under "Not applied".
- `routine-sessions`' Branches section now lets a session push a merge that brings its own `claude/` branch up to date with its base, as GitHub's **Update branch** does. Any other local merge is still never pushed. It wasn't in this step's Files. Sarah chose rewording the rule over rebasing.
- Boy Scout fix: the `pnpm install` calls that change the lockfile (adding or removing an override, resolving a merge) use `--no-frozen-lockfile`. With `CI` set, as in the routine's session, a plain `pnpm install` failed with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` after an override was added, which Step 6's local stand-in runs didn't show.
- Added at review: Claude Code adds a footer with no session link when a PR body is edited, so check 1's body kept the first session's footer and gained a second. Sarah decided 2026-10-05 that the rewritten body drops everything after its lists and ends with `Session: <link>`, read from the session's latest commit's `Claude-Session` trailer. Step 8's check is the first open-PR run to exercise it.
- The implementer tested the git commands in a throwaway repo with a local remote: the merge pushed as a fast-forward, bisect from the merge found the one bad commit among three, and `--force-with-lease` was rejected on a stale or empty lease when the branch existed and went through otherwise. A lockfile-only conflict with `CI=true` resolved with `pnpm install`, keeping the newer undici.
- Sarah's checks: check 1 added a merge and `deps: bump @types/luxon 3.7.1 → 3.7.6` to [PR #22](https://github.com/SkaffenAmtiskaw/meal-planning/pull/22) and rewrote its body. Check 2 opened [PR #23](https://github.com/SkaffenAmtiskaw/meal-planning/pull/23) with only the `@tabler/icons-react` bump on top of `develop`, force-pushed over #22's branch, and left #22 closed. PR #23 stays open for Step 8's check.

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
- [x] Call the routine with `curl` and a text naming `patch lefthook@2.1.16`. See the session's summary say the PR's four checks passed on GitHub, with the run's link, and that run on the PR show all four green. Proves: the session doesn't end before GitHub has checked its PR.

**Status:** ✅ Complete

**As built:**
- Sarah decided 2026-10-05:
  - A check that failed on the base in step 3 and fails on GitHub too is left as already explained: no re-run and no fix.
  - A check that passed in step 3 goes straight to a re-run on GitHub, since step 3 already ran its script on the pushed commit.
  - A failure the session reproduces from a runner-only difference is handled as step 3 handles a failing check, not fixed in code. If the base fails it too, it's explained. Otherwise the update that breaks it is bisected and dropped with a `git revert`, so nothing is force-pushed, and the body is rewritten with it under **Dropped**.
  - After a revert, the session waits for the new run once more, then reports it with no further re-run or drop.
  - A revert that conflicts in `package.json` or `pnpm-workspace.yaml` is resolved by keeping the branch's side, except the reverted update's own lines.
- These replace the Approach's "fix a failure that reproduces on the same branch", and its implementer check changed to match. A Sonnet stand-in ran the skill against a throwaway PR with a unit test that failed only when `GITHUB_ACTIONS=true`. It saw the run fail, re-ran it on GitHub, reproduced the failure with the variable, bisected and reverted the update, pushed and saw the next run pass. The PR was then closed and its branch deleted.
- A body rewrite reads the session's link from the newest commit with a `Claude-Session` trailer, since a revert keeps git's message and has none.
- Sarah's check: the session joined [PR #23](https://github.com/SkaffenAmtiskaw/meal-planning/pull/23) with a merge of `develop` and `deps: bump lefthook 2.1.4 → 2.1.16`, rewrote its body, and reported that its checks run passed, with all four checks green.
- Added at review: the session reported that `gh pr list` and `gh pr edit` fail because the cloud session can't reach GitHub's GraphQL API, and it fell back to REST. Sarah decided 2026-10-05 to fold the fix in here. Every pull request call in this skill now goes through `gh api` REST, and the base branch for `ci-failure` step 5's diagnosis is `develop`. The first live `POST` and `PATCH` come with Step 9's first run.
- Pulled in at triage: the `ci-failure` skill's `gh pr create` and `gh pr view` became `gh api` REST calls too. It wasn't in this step's Files.
- Boy Scout fix: `docs/ci.md`'s "The Claude GitHub App" says the app's access covers the `dependency-updates` session too.
- `gh` is now installed on Sarah's Mac from Homebrew, and signed in.

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
- [x] On GitHub, open Actions → the dependency-updates workflow → **Run workflow**, pick weekly. See `check` and `start-dependency-updates` pass, the start job's log show the session's link, and one new session whose summary covers the whole backlog: a PR with the small updates and security fixes and its checks' result, every advisory listed as new, and every major listed with a link to its release notes and marked "not applied". Proves: the first run reports everything through this story's whole flow.
- [x] Run it again, hourly. See `check` pass, `start-dependency-updates` skipped and no new session. Proves: the reported list in the cache stops a repeat session.
- [x] With the `schedule` triggers pushed to `develop`, wait for the next :17, then open the workflow's runs. See a scheduled hourly run that passed with the start job skipped. Proves: the check runs on its own schedule without Sarah.

**Status:** ✅ Complete

**As built:**
- The **Run workflow** form starts on hourly. Sarah decided 2026-10-05, so a run started without looking is the quiet one.
- The workflow works out hourly or weekly once, in a workflow-level `MODE`, from the weekly `cron` string or the dispatch input. The reported list is `dependency-alerts-reported.json`, the same path in the restore and the save, and the job outputs are compact one-line JSON. `docs/ci.md` also says GitHub deletes a cache entry no run has read in 7 days, so a workflow that's been off that long reports the whole backlog again.
- The implementer ran the Approach's checks. Against a local server returning 401, the start script exited 22, so the save steps after it don't run. Of two hourly runs dispatched back to back, the second's `check` was queued one second after the first finished. A third dispatch that day was cancelled when GitHub's Actions outage gave it no runner, which changed nothing, since a cancelled `check` skips the start job.
- Sarah merged [PR #23](https://github.com/SkaffenAmtiskaw/meal-planning/pull/23) before check 1. Check 1's run opened [PR #25](https://github.com/SkaffenAmtiskaw/meal-planning/pull/25) with 11 security fixes, 4 patches and 18 minors, its checks green on GitHub. It dropped the `@biomejs/biome` 2.5.15 minor, which breaks `pnpm lint:ci`, and listed the `uuid` advisory 1119441 with the majors, since only a major fixes it.
- Sarah dropped check 3 (a weekly run with nothing new still sends the reminders) on 2026-10-05, after GitHub's outage cancelled its run. Other runs cover it: the implementer's local weekly run with a weekly list gave no new findings, 54 reminders and a start, and a text whose `new:` is `none`; checks 1 and 2 showed the weekly install and the restore on GitHub; and Step 6's stand-in run on only a major and a reminder applied nothing.
- The `schedule` triggers were first pushed at 20:12 UTC on 2026-10-05, during GitHub's Actions incident, and no scheduled run followed. A second push that touched the workflow file, at 00:18 UTC, registered them.
- Check 4: the first scheduled run, at 01:17 UTC on 2026-10-06, passed, but it started a session rather than skipping, since advisories 1241232 (`postcss-selector-parser`) and 1241209 (`source-map-js`) had come out after the first run. Sarah counted check 4 as passed, since the run proves the schedule and check 2 already proves the skip.

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
- [x] Push a branch `claude/deps-check-test` from `develop` with a line at the end of `scripts/dependencyCheck.ts` that throws (at the end, so Biome's pre-commit hook doesn't flag the rest as unreachable), then run `gh workflow run dependency-updates.yml --ref claude/deps-check-test -f mode=weekly`. See `check` fail, `start-dependency-updates` pass, and a session that names the throw as the cause, with a PR or an explanation. Proves: a broken weekly check reaches Sarah as a session.
- [x] Run the same with `-f mode=hourly`. See `check` fail, `start-dependency-updates` skipped and no new session. Delete the branch, and close any PR the session opened. Proves: a failed hourly run waits for the next hour instead of starting a session.

**Status:** ✅ Complete

**As built:**
- Sarah decided 2026-10-05: when the session's rerun of the check passes, it re-runs the failed job on GitHub once, as `ci-failure` does. A re-run that passes sends the week's findings, which start a session of their own. So a failed weekly check starts the routine only on the run's first attempt, and a re-run that fails again, the session's or Sarah's, starts nothing.
- The failure text is the run line, then the single line `check failed`. The session reads the run's branch and commit with `gh run view`, reads the failed step's log, and reruns the install and `pnpm deps:check --weekly` without a reported list. It fixes a failure that reproduces through `ci-failure` step 4, on `claude/ci-fix-<run ID>` with a PR into the branch the run tested, which is `develop` for every scheduled run, rather than always into `develop`. Otherwise it follows `ci-failure` step 5 from "Re-run the failed jobs", and adds the restored reported list to the differences it looks for. It also says that week's findings weren't sent.
- The job's `if` repeats `MODE`'s weekly test, since a job's `if` can't read `env`. `docs/ci.md` gained its own "When the Check Fails" section.
- The implementer ran the start step's script against a local server: the failure path sent `weekly run <ID> <URL>\ncheck failed`, and the findings path was unchanged.
- The implementer ran both checks for Sarah. Check 1's [run](https://github.com/SkaffenAmtiskaw/meal-planning/actions/runs/37407016788) failed `check` on the throw, `start-dependency-updates` passed and skipped both save steps, and the session named the throw, explained why it opened no PR, and said the week's findings weren't sent. It skipped the skill's rerun of the check, since the test commit's message said it was a test. So the reproduce-and-fix path hasn't run live yet, and Sarah counted the check as passed. Check 2's [run](https://github.com/SkaffenAmtiskaw/meal-planning/actions/runs/37407250870) failed `check` with `start-dependency-updates` skipped. The session opened no PR, and the branch was deleted.
