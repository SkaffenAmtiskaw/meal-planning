---
type: infra
status: ready
blocked-by: []
confirmed: 2026-09-30
---
# Where It Stands
Ready. Next: build Step 1 ^status

# Purpose
Run lint, type check, unit tests and build automatically on every PR, each as its own job with its own result, and block the merge into `main` while any of them fails. This covers the Done When item of [[Dev Foundations]] for PRs into `main`. It also creates the `checks.yml` workflow and `docs/ci.md`, which [[CI Failure Sessions]] and [[E2E Tests in CI]] build on. Split from [[CI Checks]] on 2026-09-30.

# Goals
- [ ] Every PR runs four check jobs (lint, type check, unit tests with coverage, build) and shows each job's result on the PR.
- [ ] A PR into `main` can't be merged while any of the four check jobs is failing.
- [ ] `docs/ci.md` covers the checks, the workflow's environment values and the ruleset on `main`.

# Design
The design lives in [[CI Checks]]. The sections embedded below are part of this note.

![[CI Checks#Decisions]]

![[CI Checks#`.github/workflows/checks.yml` - the four check jobs]]

![[CI Checks#`package.json` - the `lint:ci` script]]

![[CI Checks#`docs/ci.md` - the CI doc]]

![[CI Checks#Other changes]]

![[CI Checks#The flow]]

# Conventions
![[CI Checks#Convention 11 - The app's variables get dummy values in CI and cloud environments]]

![[CI Checks#Convention 13 - CI runs only `package.json` scripts, and none of them writes fixes]]

![[CI Checks#Convention 14 - The ruleset on `main` changes with the check jobs]]

![[CI Checks#Convention 15 - Every environment installs its tools from `mise.toml`]]

# Setup Outside the Repo
![[CI Checks#The ruleset on `main`]]

# Out of Scope
Starting a session when a check fails belongs to [[CI Failure Sessions]].

# Implementation
## Step 1: The four check jobs
**Idea:** Every PR runs the four check jobs, each showing its own result.

**Source:** Goal 1; Goal 3 (the "Workflows", "Checks on PRs" and "Secrets and Environment Values" parts of `docs/ci.md`); Decision 6 (`docs/ci.md` holds the CI side); Decision 9 (every PR, whatever its base branch); Design: `.github/workflows/checks.yml` - the four check jobs (including its "Found by /architect's audit" items); Design: `package.json` - the `lint:ci` script; Design: `docs/ci.md` - the CI doc ("Workflows", "Checks on PRs" for the four jobs, "Secrets and Environment Values" for Convention 11); Design: Other changes; Design: The flow (steps 1-3, the checks' results on the PR); Conventions 11 (workflow side), 13, 15 (workflow side). Sarah decided 2026-09-30: typegen inside `check:types`; only node and pnpm in CI; `docs/e2e_tests.md:188` points to `docs/ci.md`. Pulled in by Sarah 2026-09-29: the `vitest.config.ts:28` typo (Sarah decided 2026-09-30 that it rides along in this step as Boy Scout work, since a comment fix has nothing to check on its own). Boy Scout fix: a `# .claude/` entry in `docs/project_structure.md`, found by the rule-auditor 2026-09-29.

**Approach:**
- `checks.yml` runs on `pull_request` with no branch filter (Decision 9). Four jobs, `lint`, `type-check`, `unit-tests` and `build`, each: check out, `jdx/mise-action` installing only `node pnpm` (its install-args input; read its README for the input name), `pnpm install --frozen-lockfile`, then one script: `pnpm lint:ci`, `pnpm check:types`, `pnpm test:coverage`, `pnpm build`. No `actions/setup-node`, no Node or pnpm version in the workflow (Convention 15).
- The eight `src/env.ts` variables get dummy values in a workflow-level `env:` block (Convention 11), so every job sees the same values, which [[CI Failure Sessions]] later gives the cloud environment. `DB_URL` is `mongodb://localhost:27017/ci`; the rest follow the kind of values in `playwright.config.ts:10-18`.
- `package.json`: add `lint:ci` running `biome ci`; `check:types` becomes `next typegen && tsc --noEmit` (the Next docs describe `next typegen` for CI, `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md:177-208`).
- Before handing the step to Sarah, confirm `pnpm build` passes with the workflow's dummy values set in the shell and nothing listening on the dummy `DB_URL`'s port (`src/instrumentation.ts:6` calls `mongoose.connect` in `register`, and it's unverified whether `next build` runs it). If it fails, here or on the first CI run, stop and bring it to Sarah, since the fix isn't in the design.
- Also before handing over, since the pre-commit hook only ever checked staged files: run `pnpm lint:ci` and `pnpm test:coverage` on the whole repo. If either fails on existing code, stop and bring it to Sarah. Then move `.next/` and `next-env.d.ts` aside (both gitignored and rebuilt), confirm `pnpm exec tsc --noEmit` fails and `pnpm check:types` passes, and put them back. That proves typegen is what makes a fresh checkout pass.
- If Sarah's push of `checks.yml` is rejected for a missing `workflow` scope on her git credential, stop and give her the fix from GitHub's docs.
- `docs/ci.md` (new): "Workflows" (Conventions 13 and 15, and that CI installs only node and pnpm from `mise.toml`, so a tool CI needs goes in that list), "Checks on PRs" (the four jobs, that they run on every PR, and why each is its own job), "Secrets and Environment Values" (Convention 11; the dummies live in `checks.yml`). Setup Outside the Repo comes in Step 2; Starting a Routine comes with [[CI Failure Sessions]].
- `docs/e2e_tests.md:188`: add that a new variable also needs a dummy in the lists `docs/ci.md` "Secrets and Environment Values" names.
- `AGENTS.md` "Docs": a line on when to read `docs/ci.md` (before changing a workflow or a routine). "Commands": add `pnpm lint:ci` and `pnpm test:coverage`, and say `pnpm check:types` generates Next's route types first.
- `docs/project_structure.md`: a `# .github/` entry (GitHub Actions workflows) and a `# .claude/` entry (Claude Code skills, subagents, hooks and rules).
- `vitest.config.ts:28`: "Excluded files should are" → "Excluded files are".

**Files:**
- `.github/workflows/checks.yml` (new) - the four check jobs
- `package.json` - `lint:ci` for the lint job, typegen in `check:types` for the type-check job
- `docs/ci.md` (new) - documents the workflow, its jobs and its dummy values
- `docs/e2e_tests.md` - the env-variable line points to the CI dummy lists
- `AGENTS.md` - when to read `docs/ci.md`, and the scripts the jobs run
- `docs/project_structure.md` - the new `.github/` folder (plus the Boy Scout `.claude/` entry)
- `vitest.config.ts` - Boy Scout work pulled in by Sarah: typo in the coverage comment

**Acceptance:**
- [ ] With this step pushed to `develop`, open a PR from `develop` into `main` (no need to merge it), see four checks, `lint`, `type-check`, `unit-tests` and `build`, each listed separately and each passing.
- [ ] On that PR, open the `type-check` job's log, see `✓ Types generated successfully` before `tsc` runs and passes.
- [ ] On that PR, open the `lint` job's log, see mise install node and pnpm and nothing else, with the same Node version `mise latest node` prints on your machine.
- [ ] Cut a branch from `develop`, break the formatting of one line in a `src/` file (for example, add extra spaces inside a function call) and change one expected value in a unit test to another value of the same type so it fails (for example `toEqual(3)` → `toEqual(4)`). Commit with `git commit --no-verify` (the pre-commit hook would fix the formatting and block the failing test), push, and open a PR into `develop`. See `lint` and `unit-tests` fail and `type-check` and `build` pass.
- [ ] On that branch, run `pnpm lint:ci`, see it report the formatting error, then see your IDE (or `git status`) show no changes. Then close the PR and delete the branch.

## Step 2: The ruleset on `main`
**Idea:** A PR into `main` can't be merged while any of the four check jobs is failing.

**Source:** Goal 2; Goal 3 (the ruleset part of `docs/ci.md`); Setup Outside the Repo: The ruleset on `main`; Design: `docs/ci.md` - the CI doc ("Setup Outside the Repo" for the ruleset); Design: The flow (steps 2-3, the ruleset allowing or blocking the merge); Convention 14; Decision 5; Decision 7 (the ruleset's record in `docs/ci.md`).

**Approach:**
- Sarah creates the ruleset on GitHub before running the checks. The Approach gives her the steps: Settings → Rules → Rulesets → New branch ruleset, named `main - required checks`, target `main`, enforcement active, no bypass list, "Require status checks to pass" with `lint`, `type-check`, `unit-tests` and `build`, and "Require branches to be up to date before merging" left off (the design requires only the checks, and the merge commits a `develop` → `main` merge leaves on `main` would show `develop` as out of date). Check GitHub's current docs for the exact path and option names. The repo is public, so GitHub enforces the ruleset on any plan.
- After Sarah sets up the ruleset and before she runs her checks, read it back through GitHub's REST API (`gh` isn't installed; check the docs for which rulesets endpoints a public repo answers without auth) and confirm: the name, target `main`, enforcement active, an empty bypass list, exactly the four required checks, and "up to date" off. If a value can't be read without auth, such as the bypass list, ask Sarah to confirm it on the ruleset page. If anything differs, tell her what to change.
- `docs/ci.md` "Setup Outside the Repo" (new section): the ruleset's name (`main - required checks`) and the four checks it requires, and Convention 14 (a renamed, added or removed check job changes the ruleset and this record in the same change).

**Files:**
- `docs/ci.md` - records the ruleset and Convention 14

**Acceptance:**
- [ ] With the ruleset set up, push this step's commit straight to `develop`, see the push accepted (the ruleset covers only `main`).
- [ ] Cut a branch from `develop`, change one expected value in a unit test to another value of the same type so it fails, commit with `git commit --no-verify` (the pre-commit hook would block the failing test), push, and open a PR into `main`. See `unit-tests` fail and the merge button blocked, naming the required check. Close the PR and delete the branch.
- [ ] Open (or reopen) the PR from `develop` into `main`, see all four checks pass and the merge button enabled. You don't have to merge it.
