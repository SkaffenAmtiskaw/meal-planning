---
type: hub
confirmed: 2026-10-04
---
# Where It Stands
Next: its child stories ^status

Split 2026-10-04 during /plan-steps into [[Dependency Update PRs]], [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]]. The design is approved and nothing is built yet.

# Inbox

# Purpose
Sarah finds out about dependency updates on her own machine, from Claude, without checking GitHub or digging through her email. It's a Done When item of [[Dev Foundations]], found 2026-09-28 while shaping that goal with `/roadmap`.

Sarah is the sole maintainer, so she doesn't check GitHub for new PRs every day, and an email from GitHub about an update is easy to miss among the rest. This story finds the updates and hands them to Sarah as a Claude Code session.

The work is spread across three stories so the PRs for security fixes and small updates go live before the release analysis and the sweeps for majors.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Open Decisions
1. Where does the check that finds updates run? Sarah sees pros and cons for both a local and a cloud check, and wants them laid out.
   - Candidates: Dependabot (moved here from [[Dev Tooling Tidy-Ups]] 2026-09-29; there's no `.github/dependabot.yml` yet) or Renovate on GitHub; a scheduled GitHub workflow running something like `pnpm outdated` and `pnpm audit`; a scheduled check on Sarah's machine.
   - Where the check runs decides what kind of session it starts. A cloud check starts a routine, following `docs/ci.md` ("Starting a Routine"). A local check could start a local session instead, which would also see dependencies Sarah hasn't pushed yet.
   - Dependabot opens a PR for each update, and it pauses its updates when nobody interacts with its PRs, which fits badly with Sarah opening GitHub only to merge into `main`.
   - Research from 2026-09-29:
     - Dependabot: a routine's GitHub pull request trigger, filtered by author, can start a session when Dependabot opens a PR, with no workflow in between. The docs don't say whether bot-authored PRs trigger it, so one real PR should confirm it. Workflows that Dependabot triggers get no Actions secrets, but they do get Dependabot secrets, so a copy of the routine's URL and token stored there would let them start one. Security-update PRs target the default branch, which is `develop`. (code.claude.com/docs/en/routines, docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)
     - A scheduled check: a scheduled routine leaves a session on every run, and a run that finds nothing must leave no session in Sarah's Code tab (see `docs/ci.md`, "Starting a Routine"). So the check has to run somewhere else and start the routine only when it finds an update.
     - Either way, a cloud session sees only what Sarah has pushed, so it can miss dependencies she's added on `develop` but not pushed yet.
   - **Decided 2026-10-02:** a scheduled GitHub workflow on `develop` runs a `pnpm` script that checks for outdated packages and security advisories, and fires a routine through `/fire` only when it finds something. Turning on GitHub's Dependabot alerts (security only, no PRs) as a safety net that starts nothing is optional; Sarah may not need it if `pnpm audit` runs hourly. It's the only option that meets all four Goals with one mechanism, and it follows `docs/ci.md` ("Starting a Routine").
     - Rejected: Dependabot version updates with a routine PR trigger - it opens bare version-bump PRs for majors, against Goal 4, and ignoring majors means a second check has to find them anyway
     - Rejected: Renovate - a third-party app with write access to a public repo, and a major held on its dashboard can't start an assessment session
     - Rejected: a check on Sarah's machine - it doesn't run while the Mac is off, the handoff into the Desktop app is untested, and the unattended session would use her own `gh` login, which can reach production
     - Rejected: Dependabot security-update PRs, to start a session as soon as an alert lands - a fix that needs a major arrives as a PR without Sarah's say-so, and GitHub has no workflow or routine trigger for the alert itself
   - **Decided 2026-10-04:** Dependabot alerts stay off. Sarah's call: with the audit hourly, unfixed advisories reported weekly and a broken check reported within a week, they'd only duplicate the audit through GitHub email she doesn't watch.

2. How does a run avoid starting a new session for updates it has already reported that Sarah hasn't handled yet? (Moved here from Design 2026-10-04, after research.)
   - **Decided 2026-10-04:** the workflow keeps the list of what it has reported in the Actions cache. A finding is identified as `package@version`, or by its advisory ID. A run starts the routine only when it finds an identifier the list doesn't have, and sends only the new ones. A reported version stays quiet until a newer version comes out, as Renovate treats a declined update. Each run restores the newest entry by key prefix and, only after the routine starts, saves the updated list under a key unique to the run, since a cache entry can't be changed. A `concurrency` group keeps the hourly and weekly runs from overlapping. Sarah's call from the options: it needs no token permissions, and losing the cache costs one repeat session.
     - Rejected: a workflow artifact - it needs `actions: read` and an extra step to find the previous run's artifact, which can pick the wrong run
     - Rejected: a JSON file on its own branch - the workflow would need `contents: write`, which could also push to `develop`, and each run that reports something adds a commit
     - Rejected: looking the update up in the repo's PRs - assessments and advisories with no fix never get a PR, so they'd be reported again every run
   - **Decided 2026-10-04:** an advisory that's still unfixed is listed again in the weekly run, as a reminder in that week's session. Version updates stay quiet once reported. Sarah's call: GitHub keeps an alert open until it's fixed, and without a reminder an unfixed advisory would be reported once and then forgotten.
     - **Decided 2026-10-04 (/plan-steps):** a weekly run with nothing new still starts a session while any advisory is unfixed, so the reminder reaches Sarah in a quiet week too. Sarah's call, on the recommendation that a reminder that only rides along with new findings fails in exactly the week it's needed.
   - **Decided 2026-10-04:** the first run reports the whole backlog, with no baseline run. Sarah's call: the critical advisories in `next` and `better-auth` ship in the app's build and shouldn't wait for an [[App Health]] goal, and the first run tests the whole flow.
     - **Decided 2026-10-04 (/plan-steps):** when the story was split, the first run became [[Dependency Update PRs]]'s, so it tests only that story's flow, and the six libraries' backlog minors go into its first PR without an assessment. Sarah's call: security fixes reach a PR sooner.
   - **Decided 2026-10-04:** every run's PR comes from one fixed `claude/` branch. While its PR is open, a run adds its updates to that PR and brings the branch up to date with `develop`, so only one dependency PR is ever open and none conflicts with another in `pnpm-lock.yaml`. A PR Sarah closed without merging is left alone, and the next run starts a fresh one from `develop`. Sarah's call, as Renovate updates its existing PR rather than opening another.
     - Rejected: a new PR each run - the second conflicts in the lockfile once the first is merged, and a security fix would queue behind an unmerged weekly PR

# Design
## Decisions
- How often does the check run?
  - Research 2026-10-02 (/decide, Open Decision 1): `pnpm audit` could run hourly on its own schedule, apart from a slower `pnpm outdated` run, so a new advisory reaches a session within about an hour (scheduled runs can start late). Actions minutes are free for a public repo. Whether Dependabot alerts are worth turning on depends on this.
  - **Decided 2026-10-02:** the security audit runs hourly and the check for new versions runs weekly. Sarah's call.
- Which non-major updates get a PR (patches only, or minor versions too), and do the updates from one run go in one PR or one PR each?
  - **Decided 2026-10-02:** patches and minor versions both get a PR without asking. A minor version of a package below 1.0 is treated as a major, since semver lets anything change in a `0.y.z` version. Sarah's call.
  - **Decided 2026-10-02:** one PR per run. Sarah's call.
  - **Decided 2026-10-02:** besides its PR, a minor version gets a summary in the session of what the release adds and a quick analysis of whether there's anything the app should adopt. Sarah's call. Watching other tools (Vercel, Sentry) and new libraries stays with its own Roadmap line under [[Dev Foundations]], since that's a fundamentally different task from watching the dependencies the app already uses.
- Which libraries get a major-update assessment, and what happens to major updates of the rest?
  - **Decided 2026-10-02:** React, Next and Mantine get one. Sarah's call.
  - **Decided 2026-10-02:** better-auth, luxon and Zod get one too. Sarah's call, checked against the code: better-auth runs sign-in, luxon is imported in 42 files and Zod in 30, and Zod's last major changed its API across schemas.
  - **Decided 2026-10-02:** Mongoose doesn't get one, though it's imported in 66 files, since Sarah is strongly leaning toward [[Drop Mongoose]]. Sarah's call, checked: Mongoose keeps fixing security problems on its older major for a while, so the hourly audit still covers it.
  - **Decided 2026-10-04:** a major update of a smaller library that does one specific thing gets no assessment. It goes on a new sweep note, linked to [[App Health]], whose items are rolled in whenever a goal is drawn from App Health. Sarah's call. The routine's session can't push to `develop`, so its lines reach the note through a PR.
  - **Decided 2026-10-04 (/plan-steps):** a major of `@types/react`, `@types/react-dom` or `@types/luxon` goes with its library: no sweep item, and the summary lists it beside the library's major as part of that upgrade. Sarah's call, since a type package's major versions match its library's.
  - **Decided 2026-10-04 (/plan-steps):** a major that's the only fix for a security advisory never goes on a sweep, however small. The summary flags it as a security fix, with the advisory ID, as an upgrade to plan on its own. Sarah's call: a sweep holds work that can wait for a goal, and a security fix shouldn't.
  - **Decided 2026-10-04:** a major update of a dev tool (TypeScript, Vitest, Biome, Playwright, jsdom, `@vitejs/plugin-react` and the like) goes on a sweep of its own, linked to [[Dev Foundations]] until the Dev Tooling standing goal Sarah plans to create once Dev Foundations is done, then to that goal. Sarah's call: a dev-tool major that changes project config, such as `vitest.config.ts`, is fine in a sweep, since the agent building it asks Sarah before editing config, as in any other workflow.
    - **Decided 2026-10-04 (/plan-steps):** until the Dev Tooling standing goal exists, the sweep's items carry no 🎯 link, then they link that goal. Sarah's call: [[Dev Foundations]] is active, and the Roadmap rules would kick each linked item off into the current goal right away, though no Done When item needs a dev-tool major.
- Where does a major-update assessment end up?
  - **Decided 2026-10-02:** it stays in the session until Sarah reviews it. She may ask the session to create a note after she's looked at it, and she makes the final call on prioritizing it. Sarah's call.
  - **Decided 2026-10-04:** the assessment of a React, Next, Mantine, better-auth, luxon or Zod major mainly helps Sarah decide when to next draw a goal from [[App Health]], and how much to prioritize the upgrade. It almost always ends with Sarah asking the session to create a note for the upgrade. Sarah's call.
- Does a minor release of one of the assessed libraries get more than the quick analysis?
  - **Decided 2026-10-04:** yes. A minor of React, Next, Mantine, better-auth, luxon or Zod goes to the Opus subagent for the benefit part of an assessment: the code in the app each new feature would improve, such as the dependency-array workarounds `useEffectEvent` (a React minor) replaced. Minors of other packages keep the quick analysis. Sarah's call: a picked-up minor should still call a feature worth adopting to her attention.
- Which model does the routine run on?
  - **Decided 2026-10-04:** the routine runs on Sonnet, since most of its work is mechanical, and a subagent set to Opus writes each major assessment. Sarah's call. A cloud session picks up the repo's `.claude/agents/`, and a subagent's `model` frontmatter sets its model whatever the session runs on.
- What happens when the PR's checks fail on GitHub? `start-ci-failure` skips `claude/` branches.
  - **Decided 2026-10-04:** after pushing, the session waits for the PR's checks and handles a failure itself, the way `ci-failure` does. Sarah's call: a check that passes in the session but fails on GitHub, from a runner-only difference or a flake, shouldn't sit unnoticed until she opens the PR.
- What happens when the check itself fails?
  - **Decided 2026-10-04:** when the weekly run's check fails, it starts the routine with a short payload saying so, and the session looks into it. A failed hourly run starts nothing, since an outage usually clears by the next run. Sarah's call: a check that stays broken reaches her within a week, as one session.

## Pieces
1. **`pnpm deps:check`** (`scripts/dependency-check.ts`, TypeScript that Node runs directly by stripping its types, no new dependency) lists what's new since the last report. Sarah decided 2026-10-04 during `/plan-steps` that it's TypeScript rather than plain `.mjs`, so `pnpm check:types` covers it (`tsconfig.json` includes `**/*.ts`) while the hourly run still needs no install, and that Biome lints it, with no unit tests. ^piece-1
   - Hourly mode (`pnpm deps:check`) runs `pnpm audit --json`, which reads only the lockfile, so it needs no `pnpm install` (checked 2026-10-04 on a copy of the repo without `node_modules`).
   - Weekly mode (`pnpm deps:check --weekly`) also runs `pnpm outdated --format json`, which needs an install to know the current versions. It lists every advisory that's still unfixed, reported or not, as the weekly reminder.
   - Each finding gets an identifier and a kind: `package@version` marked patch, minor or major (a pre-1.0 minor is marked major), or an advisory's ID with its severity and package.
   - It takes the reported list from a file (`--reported <path>`) and prints JSON with the new findings and the updated list, which keeps only what's still current, so a merged or superseded version drops out. With no list it reports everything, so Sarah or a session can rerun exactly what CI ran.
   - It only reports. It never changes `package.json` or the lockfile (`docs/ci.md`: no script CI runs writes fixes).
2. **`.github/workflows/dependency-updates.yml`** runs the check on a schedule and starts the routine when there's something new. ^piece-2
   - Triggers: `schedule` hourly at minute 17 (`17 * * * *`), off the top of the hour, when GitHub drops runs most often; `schedule` weekly, Mondays at 13:47 UTC (`47 13 * * 1`); and `workflow_dispatch` with an hourly or weekly choice, for trying it by hand.
   - `permissions: contents: read`. A `concurrency` group without cancel-in-progress makes runs wait their turn, so the hourly and weekly runs never read the same list.
   - Two jobs, split like `checks.yml`, so the routine's token never shares a job with third-party install scripts:
     - `check` checks out the code, installs Node and pnpm from `mise.toml`, and runs `pnpm install --frozen-lockfile` on the weekly run only. It restores the newest `dependency-alerts-reported-*` cache entry (`actions/cache/restore@v6`), runs `pnpm deps:check` (with `--weekly` on the weekly run), and passes the new findings and the updated list on as job outputs (up to 1 MB per job).
     - `start-dependency-updates` runs no install. It runs when `check` found something new, or when the weekly run's `check` failed. It calls the routine's `/fire` once, with the text built by `jq` from `env:` values as `start-ci-failure` builds its own. Only after that call succeeds does it write the updated list and save it as `dependency-alerts-reported-<run ID>` (`actions/cache/save@v6`). For a failed weekly check it sends "the weekly check failed" with the run's link, and saves nothing.
3. **The `dependency-updates` routine** on claude.ai starts a cloud session when the workflow calls it. Its configuration is recorded in `.claude/skills/dependency-updates/routine.md`, as `routine-sessions` requires. ^piece-3
   - Prompt: `Run /dependency-updates on the findings described in the routine-fire-payload block.`
   - Model: Sonnet. Repositories: `meal-planning`. Connectors: none.
   - Trigger: API, called by `start-dependency-updates`. Its URL and token are in the Actions secrets `ROUTINE_DEPENDENCY_UPDATES_URL` and `ROUTINE_DEPENDENCY_UPDATES_TOKEN`.
   - Cloud environment: `Meal Planning Routines`.
4. **The `dependency-updates` skill** (`.claude/skills/dependency-updates/SKILL.md`) handles one run's findings in the session. It follows `routine-sessions`, and reads the payload as untrusted identifiers, as `ci-failure` does. ^piece-4
   1. A failed weekly check: it reruns `pnpm deps:check --weekly` to find the cause, and fixes it on a `claude/` branch with a PR, or explains what it found.
   2. Its branch: if the PR from `claude/dependency-updates` is open, it checks out that branch and brings it up to date with `develop`. Otherwise it cuts the branch fresh from `develop`.
   3. Patches, minors and security fixes go on that branch. A transitive advisory gets the smallest fix that works: a lockfile bump when the parent's range already allows the fixed version, a parent update when it doesn't, or a `pnpm.overrides` entry like the ones `pnpm audit --fix` adds. It runs the four check scripts. If one fails, it finds the update that breaks it, drops it from the branch and reports it.
   4. Minors: a minor of React, Next, Mantine, better-auth, luxon or Zod goes to the `upgrade-assessor` subagent (Piece 5) for its benefit to the app. Every other minor gets a summary of what the release adds and a quick analysis of anything worth adopting. Release notes come from the package's GitHub releases and changelog (`github.com` and `raw.githubusercontent.com`, both on the environment's Trusted list).
   5. Majors (an advisory fixed only by a major counts as one, flagged as a security fix):
      - React, Next, Mantine, better-auth, luxon or Zod: the `upgrade-assessor` subagent writes the assessment, shown unedited.
      - Any other package: the session reads the major's breaking changes and searches the code for each one the app hits. If the upgrade is small and needs no decision, it adds a line to the Library Upgrades sweep (a package in `dependencies`) or the Dev Tool Upgrades sweep (a package in `devDependencies`; an `@types/*` package follows its library). Otherwise it adds no line, and its summary says why the upgrade looks like a story of its own, with the breaking changes and file counts.
      - Sweep lines are committed on the same branch, so a week with only majors still gets a PR, one that adds just those lines.
   6. Reminders: it lists each advisory that's still unfixed.
   7. It pushes and opens the PR into `develop`, or updates the open one, then waits for the PR's checks to finish. `start-ci-failure` skips `claude/` branches, so the session handles a failure itself, the way `ci-failure` does: it reruns the failed script, fixes the failure, or re-runs a check that passes in the session once on GitHub to tell a flake from a real failure, and explains what it can't fix.
   8. It ends with a summary: the PR and its checks' result, the dropped updates, the minor summaries, the assessments, the sweep lines, any upgrade that looks like its own story, and the reminders.
5. **The `upgrade-assessor` subagent** (`.claude/agents/upgrade-assessor.md`, `model: opus`) assesses a new release of React, Next, Mantine, better-auth, luxon or Zod, so Sarah can decide what to pick up and how much to prioritize it. ^piece-5
   - Benefit to the app (majors and minors): for each new feature or change, whether the app has code it would improve (workarounds it would replace, bugs it would fix, code it would make simpler), with the files and an example of each. `useEffectEvent` replacing dependency-array workarounds is the kind of thing it looks for. A feature with no place to use it gets one line at most.
   - Effort (majors only): from the migration guide and release notes, each breaking change the app actually hits, with file counts.
   - Urgency (majors only): how long the current major keeps getting security fixes, and any advisory only the new major fixes.
   - Verdict: for a major, the benefit and urgency weighed against the effort, not a ranking on security alone. For a minor, whether anything is worth adopting now.
   - Read-only tools: `Read`, `Grep`, `Glob`, `WebFetch`, `WebSearch`. It returns its report to the session.
   - The release notes and guides live on `react.dev`, `nextjs.org`, `mantine.dev`, `better-auth.com`, `zod.dev` and `moment.github.io` (luxon), none of them on the Trusted list, so they're added to the environment's allowed domains (see Setup Outside the Repo). The docs don't say whether `WebFetch` goes through that allowlist, so the plan checks that the first assessment can read them.
6. **Two new sweep notes,** from the Sweep template, collect the small majors that get no assessment until a goal picks them up. ^piece-6
   - **Library Upgrades** (`notes/features/tech debt/Library Upgrades.md`): majors of packages in `dependencies` other than the six assessed libraries. Its items link 🎯 [[App Health]].
   - **Dev Tool Upgrades** (`notes/features/tooling/Dev Tool Upgrades.md`): majors of packages in `devDependencies`. Its items carry no 🎯 link until the Dev Tooling standing goal exists, then they link that goal.
   - Each item names the package, the current and new versions, links its release notes or migration guide, and ends with "found by the dependency-updates routine" and the date.
   - Both Roadmap lines go in Unaffiliated with the other collecting notes, with no goal links. Sarah picks where in Unaffiliated when they're created.
7. **`docs/ci.md`** records how the dependency check works. ^piece-7
   - A new section, "Dependency Updates": the two schedules, the two jobs, when `start-dependency-updates` fires, the shape of its `text`, the reported list in the Actions cache and how to clear it (deleting the cache entries re-reports everything), and what happens when a call fails.
   - "Every Check Is a `package.json` Script": the cache restore and save steps join setup and the routine call as the only steps that aren't a script.
   - "Routines": a `dependency-updates` entry pointing to its skill.
   - "The Cloud Environment": the six docs domains in the allowed list, and why.
   - GitHub turns off a public repo's scheduled workflows after 60 days with no activity in the repo.

## Flow
1. A scheduled run starts: hourly at :17, or weekly Mondays at 13:47 UTC. Runs wait their turn if one is still going.
2. `check` restores the newest reported list from the cache and runs `pnpm deps:check`. The weekly run installs first and adds `--weekly`.
   - Nothing new: the run ends green. No session starts, and the cache is unchanged.
   - The check fails: on an hourly run, nothing else happens, and the next hour tries again. On the weekly run, `start-dependency-updates` sends "the weekly check failed" with the run's link.
3. `start-dependency-updates` calls `/fire` once with the new identifiers.
   - The call fails (a wrong secret, the API down, the limit of 30 calls an hour): the job fails and nothing is saved, so the next run finds the same findings and tries again. There's no retry within the run, since `/fire` doesn't dedupe.
   - The call succeeds: the job saves the updated list to the cache, and its log shows the session's link.
4. The session (Sonnet) runs the `dependency-updates` skill. It brings the open `claude/dependency-updates` PR up to date or cuts a fresh branch, applies patches, minors and security fixes, runs the four checks and drops any update that breaks one. The `upgrade-assessor` subagent (Opus) handles the six libraries' releases. Small majors get sweep lines, and big ones are flagged as possible stories.
5. It pushes and opens or updates the PR into `develop`, then waits for the PR's checks. `start-ci-failure` skips `claude/` branches, so the session handles a failure itself, the way `ci-failure` does.
6. The session waits in the Code tab under **Routines** with its summary. Sarah merges the PR on GitHub, and asks the session to create notes for anything she wants to pick up.

# Conventions
- **The payload's shape changes in two places together.** The `text` that `start-dependency-updates` sends has its exact shape in step 1 of the `dependency-updates` skill, which reads it. A change to the shape changes the job and the skill in the same change, as `docs/ci.md` already requires for `start-ci-failure` and the `ci-failure` skill. Lands in `docs/ci.md`, in the new "Dependency Updates" section.

# Setup Outside the Repo
- **The `dependency-updates` routine** on claude.ai (https://claude.ai/code/routines → New routine): its prompt, Sonnet, the `meal-planning` repo, an API trigger (remove the default "Pull request: Opened" trigger), the `Meal Planning Routines` environment and no connectors. Recorded in `.claude/skills/dependency-updates/routine.md`. ^setup-routine
- **Two Actions secrets** (repo Settings → Secrets and variables → Actions): `ROUTINE_DEPENDENCY_UPDATES_URL` and `ROUTINE_DEPENDENCY_UPDATES_TOKEN`, from the routine's API trigger. Only their names are recorded, in `routine.md` and `docs/ci.md`. ^setup-secrets
- **Six allowed domains** on the `Meal Planning Routines` cloud environment (Network access, Custom): `react.dev`, `nextjs.org`, `mantine.dev`, `better-auth.com`, `zod.dev` and `moment.github.io` (luxon's docs). Recorded in `docs/ci.md`, "The Cloud Environment". ^setup-domains

# Out of Scope
- The tools in `mise.toml`: they ask for `latest`, so they update themselves.
- Watching tools and libraries for new features worth adopting: that's its own line under [[Dev Foundations]] on the Roadmap.

# Coverage
| Goal | Story |
|---|---|
| A scheduled workflow on `develop` checks `package.json` for new versions | [[Dependency Update PRs]] |
| The same workflow checks every installed package against security advisories | [[Dependency Update PRs]] |
| A run that finds something starts a session under **Routines** | [[Dependency Update PRs]] |
| A run that finds nothing new starts no session (except the weekly reminder) | [[Dependency Update PRs]] |
| Small updates, security fixes first, get a PR into `develop` | [[Dependency Update PRs]] |
| A major update to a heavily used library gets an effort and gain assessment | [[Dependency Release Analysis]] |
| A major update never gets a PR without Sarah's say-so | [[Dependency Update PRs]] |
| A minor update gets a release summary and adoption analysis | [[Dependency Release Analysis]] |
| A major of any other package becomes a sweep item or a flagged story | [[Major Upgrade Sweeps]] |

# Child Stories
| Story | Status | Scope in this area | Blocked by |
|---|---|---|---|
| [[Dependency Update PRs]] | ready | The check, the workflow, the routine, and the one PR for patches, minors and security fixes | |
| [[Dependency Release Analysis]] | spec | Minor release summaries, and the `upgrade-assessor` for the six libraries | [[Dependency Update PRs]] |
| [[Major Upgrade Sweeps]] | spec | The Library Upgrades and Dev Tool Upgrades sweeps for other packages' majors | [[Dependency Update PRs]] |

# Build Order
- **Stated:** [[Dependency Update PRs]] first, from the other two stories' `blocked-by`.
- **Inferred from the draft plan:** [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]] don't depend on each other and can come in either order. Both edit steps 5 and 8 of the `dependency-updates` skill, but different branches of each.

# Deferred Work
