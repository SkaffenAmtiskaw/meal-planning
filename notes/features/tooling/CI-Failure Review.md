---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** `ci-failure`, the routine session that looks into a failed check on a pull request.

**Full review here,** as the first story that uses them: `ci-failure`, `routine-sessions`.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- Step 4 (:44-63) is a git sequence out of order (the recipe checks out a branch before it's created); it becomes numbered steps: cut the branch, check the latest commit, diagnose and fix, commit, re-run.
- :30 and :132 both explain the merge GitHub tests; "in the cloud" and "here" both mean this session ("in this session" throughout); :117's "no note" is unclear; "PR" and "pull request" are mixed; the description is imperative.
- `ci-failure:8,37` read all 3,399 words of `docs/ci.md` to find each failed job's script. It reads the failed job's last `run:` line in that commit's `.github/workflows/checks.yml` instead.
- **Fixing a CI failure:** `ci-failure` steps 4–5 (about 900 words) are followed by `dependency-updates:58-65,245,271-279`, each time with a list of differences, which loads all of `ci-failure`. It becomes a shared-rule skill.
- **Session rules both routine skills restate:** the untrusted payload block (`dependency-updates:39` = `ci-failure:17`), stopping when a command fails (`:55`, `:32`), the pre-commit hooks and `--no-verify` (`:110`, `:63`), and the quoted heredoc and the pull request link (`:235,240`, `:75`). They move into `routine-sessions`.
- **`routine-sessions`:** it serves two readers. The rules a running session needs (Branches, What the Session Can Use, the `gh api` rule, about 400 words) stay in SKILL.md, and the rules for writing a routine's skill (:7-12, :15-23) move to a supporting file read when writing or changing one. :41 and :12 repeat `docs/ci.md`; they point there. :28 and :37 name the skills that use other skills; :23 ("never assumes she has seen it") doesn't say what to do.
- The `routine.md` files are records that no session reads, so the docs part of the standard applies; small repeats only.

Moved from Agent Workflow Changes on 2026-10-06:
- **The config hook doesn't guard routine sessions** - AGENTS.md ("Git and files") forbids editing project config or adding ignore comments without Sarah's explicit ask, and `.claude/hooks/protect-config.sh` enforces it, but only in sessions running `/implement`, `/infra-build` or `/final-review`, which register it in their frontmatter (`.claude/skills/implement/SKILL.md:11`, `.claude/skills/final-review/SKILL.md:11`). The `ci-failure` routine skill (`.claude/skills/ci-failure/SKILL.md`) fixes lint and type failures in a cloud session with nobody watching, so only the AGENTS.md text stops it. Registering the hook there isn't enough on its own: the hook answers "ask", a routine has no one to answer, and how "ask" behaves in a routine is undocumented, so a routine may need the hook to deny instead. The hook also needs `jq`, which the cloud environment may not have, and its header comment still says only `/implement` registers it. Found 2026-09-29 by the `rule-auditor` during `/architect` on CI Checks.

# Questions
