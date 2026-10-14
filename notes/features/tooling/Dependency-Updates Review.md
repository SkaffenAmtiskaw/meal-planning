---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** `dependency-updates`, the routine session that handles new dependency versions and security advisories.

**Full review here,** as the first story that uses them: `dependency-updates`.

**Re-checks for this step:** `routine-sessions`, `ci-failure` (reviewed in [[CI-Failure Review]]).

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-15]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **Decision 15:** the path for a check that fails only on GitHub (`:270-308`) moves, unchanged, to a supporting file the skill reads only when a check passes locally but fails on GitHub.
- The failed-weekly-check mode (:30-37, :43-67, about 560 words) moves to a supporting file, or shrinks once the CI-fix procedure is shared.
- "Base" means the branch as the merge left it (:92) and also the pull request's base branch (:273); :92's term is renamed.
- Steps 4 and 6 (:181, :197) repeat step 8, and :184 repeats :10.
- :188-194, an edge-case list for parsing `repository`, becomes one sentence.
- The pull request body is described in two places (:209-219, :239-240); one section before the two pushes.
- :110 (commit message names the old and new versions) needs its reason: step 7 builds the body from the messages. :197 ("A reminder is never applied") has no reason; ask the user for it.
- :321-322 repeat :328; :237 and :133 put their condition after the command; :44 and :57 both list the job's commands; :113-117's glossary trims to `paths` and `patched_versions`.
- `dependency-updates:261` names the four job-to-script pairs inline (`lint`→`lint:ci`, `type-check`→`check:types`, `unit-tests`→`test:coverage`, `build`→`build`), and its citation of `docs/ci.md` at `:44` goes.
- Split check: no command split, since the routine's prompt is fixed to `/dependency-updates`.

Moved from Agent Workflow Changes on 2026-10-06:
- **`dependency-updates` doesn't say what to do when an override leaves the lockfile unchanged** - `.claude/skills/dependency-updates/SKILL.md` step 3 ("Security fixes") lists a lockfile bump, a parent update and an override. It says to check with `pnpm audit --json` after each try, and to undo them all and list the advisory as not fixed if none clears it. It doesn't cover an override that is added but leaves `pnpm-lock.yaml` unchanged. In the first real run, the `vite` advisories got `'vite@>=7.0.0 <7.3.5': '^7.3.5'` in `pnpm-workspace.yaml`, but `vite` is only a peer dependency there, so the lockfile kept its `vite@7.3.0` entries. The session deleted those entries from `pnpm-lock.yaml` by hand and reinstalled. The result was correct (the PR's checks passed), but a session shouldn't hand-edit a generated file on its own judgment. Decide which the skill says: undo the override and list the advisory as not fixed, or a sanctioned way to get the stale entries out of the lockfile. Found 2026-10-05 in the session summary of the first real run ([PR #25](https://github.com/SkaffenAmtiskaw/meal-planning/pull/25)).
- **`dependency-updates` can skip `git bisect` when it thinks it knows which update broke a check** - `.claude/skills/dependency-updates/SKILL.md` step 3 ("Run the checks") says that when the base passes a check and the branch fails it, the session finds the first failing commit with `git bisect run`. The same step 7 section ("Drop an update that fails only on GitHub") says it too. When `pnpm lint:ci` failed on the first real run, the session dropped the `@biomejs/biome` 2.4.6 → 2.5.15 minor without bisecting, reasoning that Biome was the only linter in the update set. The guess was right, but guessing can drop the wrong update: a library minor can break lint through its types. Make the skill hold the session to the bisect, so a guess never replaces it however obvious the cause looks. Decide how: stronger wording, or a script that runs it. Found 2026-10-05 in the session summary of the first real run ([PR #25](https://github.com/SkaffenAmtiskaw/meal-planning/pull/25)).

# Questions
