---
type: infra
status: spec
blocked-by: []
confirmed: 2026-09-30
---
# Where It Stands
Next: /plan-steps ^status

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

# From the Split
%% Draft handed over when this story was split from [[CI Checks]]. Not approved yet. /plan-steps starts from it and deletes this section when it writes Implementation. %%

Decisions Sarah made 2026-09-30 while planning, cited in the steps below:
- **Typegen:** `check:types` becomes `next typegen && tsc --noEmit`. `next typegen` takes under half a second, and commits don't run `check:types` (lefthook's typecheck runs `tsc` through `scripts/typecheck-staged.sh`).
- **Tools:** CI installs only node and pnpm from `mise.toml`, not rtk.
- **E2E doc line:** `docs/e2e_tests.md:188` points to `docs/ci.md` for the other dummy-value lists.

## Step 1: The four check jobs
**Idea:** Every PR runs the four check jobs, each showing its own result.

**Source:** Goal 1; Design: `.github/workflows/checks.yml` - the four check jobs (including its "Found by /architect's audit" items); Design: `package.json` - the `lint:ci` script; Design: `docs/ci.md` ("Workflows", "Checks on PRs" for the four jobs, "Secrets and Environment Values" for Convention 11); Design: Other changes; Conventions 11 (workflow side), 13, 15 (workflow side). Sarah decided 2026-09-30: typegen inside `check:types`; only node and pnpm in CI; `docs/e2e_tests.md:188` points to `docs/ci.md`. Pulled in by Sarah 2026-09-29: the `vitest.config.ts:28` typo. Boy Scout fix: a `# .claude/` entry in `docs/project_structure.md`, found by the rule-auditor 2026-09-29.

**Approach:**
- `checks.yml` runs on `pull_request` with no branch filter. Four jobs, `lint`, `type-check`, `unit-tests` and `build`, each: check out, `jdx/mise-action` installing only `node pnpm` (its install-args input; read its README for the input name), `pnpm install --frozen-lockfile`, then one script: `pnpm lint:ci`, `pnpm check:types`, `pnpm test:coverage`, `pnpm build`. No `actions/setup-node`, no Node or pnpm version in the workflow (Convention 15).
- The eight `src/env.ts` variables get dummy values in a workflow-level `env:` block (Convention 11), so every job sees the same values, which [[CI Failure Sessions]] later gives the cloud environment. Use the same kind of values as `playwright.config.ts:10-18`.
- `package.json`: add `lint:ci` running `biome ci`; `check:types` becomes `next typegen && tsc --noEmit` (the Next docs describe `next typegen` for CI, `node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md:177-208`).
- Confirm on the first CI run that `pnpm build` passes with the dummy `DB_URL` and no MongoDB (`src/instrumentation.ts:6` calls `mongoose.connect` in `register`). If it doesn't, stop and bring it to Sarah, since the fix isn't in the design.
- `docs/ci.md` (new): "Workflows" (Conventions 13 and 15, and that CI installs only node and pnpm from `mise.toml`, so a tool CI needs goes in that list), "Checks on PRs" (the four jobs and why each is its own job), "Secrets and Environment Values" (Convention 11; the dummies live in `checks.yml`). Setup Outside the Repo comes in Step 2; Starting a Routine comes with [[CI Failure Sessions]].
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
- `vitest.config.ts` - typo in the coverage comment (pulled in by Sarah)

**Acceptance:**
- [ ] Open a PR from `develop` into `main` (no need to merge it), see four checks, `lint`, `type-check`, `unit-tests` and `build`, each listed separately and each passing.
- [ ] On that PR, open the `lint` job's log, see mise install node and pnpm and nothing else, with the same Node version `mise latest node` prints on your machine.
- [ ] Cut a branch from `develop`, break the formatting of one line in a `src/` file (for example, add extra spaces inside a function call) and change one expected value in a unit test so it fails, push, and open a PR into `develop`. See `lint` and `unit-tests` fail and `type-check` and `build` pass. Close the PR and delete the branch.
- [ ] On that branch before deleting it, run `pnpm lint:ci`, see it report the formatting error, and see the file is unchanged afterwards.
- [ ] Run `pnpm check:types` locally, see "Types generated successfully" and then no type errors.

## Step 2: The ruleset on `main`
**Idea:** A PR into `main` can't be merged while any of the four check jobs is failing.

**Source:** Goal 2; Setup Outside the Repo: The ruleset on `main`; Design: `docs/ci.md` ("Setup Outside the Repo" for the ruleset); Convention 14; Decision 5.

**Approach:**
- Sarah creates the ruleset on GitHub before running the checks. The Approach gives her the steps: Settings → Rules → Rulesets → New branch ruleset, target `main`, enforcement active, no bypass list, "Require status checks to pass" with `lint`, `type-check`, `unit-tests` and `build`. Check GitHub's current docs for the exact path and option names.
- `docs/ci.md` "Setup Outside the Repo" (new section): the ruleset's name and the four checks it requires, and Convention 14 (a renamed, added or removed check job changes the ruleset and this record in the same change).

**Files:**
- `docs/ci.md` - records the ruleset and Convention 14

**Acceptance:**
- [ ] Cut a branch from `develop`, change one expected value in a unit test so it fails, push, and open a PR into `main`. See `unit-tests` fail and the merge button blocked, naming the required check. Close the PR and delete the branch.
- [ ] Open (or reopen) the PR from `develop` into `main`, see all four checks pass and the merge button enabled. You don't have to merge it.
- [ ] Push a commit straight to `develop`, see the push accepted (the ruleset covers only `main`).

# Implementation
