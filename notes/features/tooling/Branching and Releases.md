---
type: infra
status: idea
blocked-by: []
confirmed: 2026-10-04
---
# Where It Stands

Decisions made. Next: /infra-design. /plan-steps waits on [[Notes Vault Repo]], and building also on [[Manual and Agent Test Environment]] ^status

Shaped as one infra story that designs parallel story branches in worktrees, protection for `develop` and a release process together. All seven open decisions were made 2026-10-02 to 2026-10-04; [[Notes Vault Repo]] was split out to move the notes vault to its own repo first. Next is the Design.

# Inbox
- [Sarah] - Do we need a hotfix process as well? Is this already covered?

# Purpose
Let Sarah work on two product features at once with agents, protect `develop`, and give a finished goal a way to ship as a release.

[Sarah] - I have sadly reached the point I probably need feature branches. I'm pretty consistently working two different features at a time. That's not a big deal when one feature is something that can go to `main` half-baked, like `e2e` tests. But it means I can't have two different product features being worked at once. That being said, I haven't got a goddamn clue how to handle feature branches with an agent. I'm vaguely familiar with worktrees, but the one time I tried it it didn't seem to work great. If that's the solution, I need a crash course in using them with agents. If that's not the solution I need to know what is. And regardless of what the solution is it needs documented. Edit: Sep 30 - We would also need to protect `develop` in CI should we make this change. Assuming the CI Checks story is done of course.

# Goals
- [ ] Sarah can work on two product features at once, each with its own agent session, without either one blocking the other.
- [ ] Sarah has a crash course in working this way with agents, and the way of working is documented.
- [ ] `develop` is protected in CI.
- [ ] A release process exists (a [[Dev Foundations]] Done When item).
- [ ] A goal whose last story closes has a next step: `/close` no longer marks it "waiting on a release process", and Note Conventions' row for it names that step.

# Open Decisions
1. How does Sarah work on two features at once with agents: worktrees (possibly the Claude desktop app's built-in worktree sessions), separate clones or something else? She tried worktrees once, and it didn't seem to work great.
   - **Decided 2026-10-02:** worktrees, made by the Claude desktop app's worktree sessions. Sarah's call after research: it's Claude Code's documented way to run parallel sessions, it shares memory, approvals and commits with the main checkout, and a later session can open an existing worktree's folder (Sarah checked in the app).
     - Rejected: worktrees made by hand with `git worktree add` - setup and cleanup are manual; kept only as the fallback for checking out an existing branch.
     - Rejected: separate clones - no shared memory, commits move only through a push and fetch, and two `develop` checkouts can drift apart.
     - Rejected: one checkout with feature flags - two agents in one folder share a git index and the pre-commit build, so it doesn't meet the goal.
2. How do `notes/` and the Roadmap work when each branch has its own copy? `/decide` should lay out options and think through how each would work day to day.
   - **Decided 2026-10-04:** the notes vault moves to its own git repo, in a folder beside the code repo (outside its checkouts). Obsidian points at it, every session reaches it through Claude Code's `additionalDirectories` setting, and notes are never branched. Sarah's call after research: one copy of every note keeps Obsidian and the Roadmap current while story branches are open, and it works with worktree isolation, which blocks a worktree session from editing the main checkout.
     - Rejected: notes only on `develop` in the main checkout - `/implement` in a worktree can't write them, so every note update needs a second session or a way around isolation, and notes-only commits pile onto `develop`.
     - Rejected: notes travel with the story branch - Obsidian shows in-progress stories as they were before they started, and `Roadmap.md` conflicts at most merges.
     - Rejected: notes as a git submodule - each worktree checks out its own copy, so notes are branched again.
     - Rejected: notes synced outside git (iCloud, Obsidian Sync) - loses the history `/check-drift`, `vault-lint.sh` and `/final-review` rely on.
3. Once `develop` is protected, does all work reach it through a PR, or can some changes, such as notes-only commits, still be pushed directly?
   - **Decided 2026-10-04:** all work reaches `develop` through a PR. Sarah's call: decision 2 moves the notes out of the code repo, so the notes-only exception she had wondered about no longer comes up.
4. What is a release, and how does it work when `develop` holds stories from more than one goal? Sarah decided 2026-09-28 that a goal wrapping up is a release. But if stories merge into `develop` one at a time, merging `develop` into `main` when one goal wraps up can ship another goal's unfinished stories. Sarah is torn on this, and the answer may change the 2026-09-28 decision. Pieces a release might include, raised while designing goals (none decided):
   - a review across all of the goal's stories: leftovers between stories, duplicated logic, patterns that drifted between stories
   - checking each of the goal's Done When items in the running app
   - checking that `docs/` covers what the goal added
   - merging `develop` into `main`, deploying, and possibly release notes or a version tag
   - closing the goal note, and handling any Roadmap lines still under it
   - **Partly answered 2026-10-02:** Settled: with one goal built at a time (decision 6), `develop` holds only the goal in progress plus work outside any goal, and a release is `develop` merged into `main` once the goal is finished, which keeps the 2026-09-28 decision. An urgent fix reaches `main` on a hotfix branch; a semi-urgent one goes into `develop` and ships with the next release. Still open: which of the pieces listed above a release includes. Waits on: nothing.
   - **Decided 2026-10-04:** a release runs in this order. First, checks of the finished goal: that nothing in it is left undone, a code review across all of its stories (leftovers, duplicated logic, patterns that drifted between stories) and, where it applies, an audit of whether the new features are covered by E2E tests and `docs/`. Once those pass, the goal note is closed and the Roadmap cleaned up. Only then is the PR from `develop` into `main` opened; merging it starts Vercel's deployment, so no agent deploys. Sarah's call.
5. Does a release get a version and release notes? Sarah isn't sure what versioning gains an app with one maintainer, but isn't opposed if there's a reason. If yes, are they written by hand or with a tool? Candidates: release-please, Changesets, semantic-release.
   - **Decided 2026-10-04:** no versions or release notes for now; they're for a future story, if Sarah adds an in-app "what's changed" notification. Sarah's call, checked against the code and notes: until then version numbers add nothing, nothing in the code or planned work needs one, and adding them later is cheap.
6. Is a branch one story or one goal? Sarah wants to finish a goal and release it to `main` all at once, which may mean each goal's stories collect on their own branch, apart from other ongoing goals. The answer sets how long a worktree lives, what a branch is named, and how work reaches `develop` (decisions 3 and 4).
   - **Decided 2026-10-02:** a branch is one story. Only one goal is built at a time: the next goal's stories can be shaped, decided and designed, but not implemented until the goal before it is done. A story's branch merges into `develop` once the whole story is done, so `develop` only gets full pieces of work, and when the goal is finished, `develop` is released to `main`. Sarah's call after two checks: `develop` never holds another goal's unfinished work, so a finished goal releases all at once; which goal goes first and how big it is are her prioritization calls.
     - Rejected: a branch per goal - each branch would live for a whole goal, and tooling, two-goal stories and urgent fixes would have no branch.
7. Does moving the notes vault to its own repo (decision 2) happen inside this story, or as its own story that this one waits on? The move changes about 114 `notes/` references across 29 files (skills, agents, scripts, AGENTS.md, `docs/project_structure.md`) and the routines' repo access.
   - **Decided 2026-10-04:** its own story, which this story waits on. Sarah's call, checked against the code and notes: the move rewrites about 30 files (mostly skills, agents and scripts, plus AGENTS.md and `docs/project_structure.md`) and needs setup outside the repo, too big for this story or one `/tooling` session.

# Design
Questions for this section:
- With two worktrees open, both want port 3000 for `pnpm dev`, port 3001 for the seed sign-in server, and the one dev database named `test`, where one worktree's `pnpm seed` reset wipes the other's data. How do two worktrees run side by side?
- How is a worktree set up, and where does it live? Findings from /decide on decision 1 (2026-10-02):
  - The desktop app puts worktrees in `.claude/worktrees/` inside the repo by default, and that breaks two tools: Next.js takes the outermost lockfile as its root, so a nested worktree builds from the main checkout's root, and Vitest's file search enters dot-folders, so the main checkout's tests pick up every worktree's tests. The app's "Worktree location" setting can put them outside the repo. `.claude/worktrees/` isn't gitignored; `.worktrees/` is, left from an earlier try.
  - A new worktree lacks the gitignored `.env.local`, which the app, `pnpm seed` and the pre-commit `pnpm build` need. A `.worktreeinclude` file at the root makes the app copy listed files into each worktree it creates.
  - When the app creates a worktree, its default base is the remote's default branch (`origin/develop`), so commits not yet pushed are missing unless they're pushed first or the `worktree.baseRef` setting is `"head"`. Decision 6 makes each branch a story started from `develop`, so a story whose blocker just merged needs `develop` pushed before its worktree is made.
  - A worktree lives for one story, and each later session for the story opens its folder. The app's "Auto-archive after PR merge or close" setting fits that lifetime.
  - `BETTER_AUTH_URL` is fixed at `http://localhost:3000`, and browsers share cookies across localhost ports, so the side-by-side question above is more than picking free ports.
- What are feature branches named?
  - **Leaning 2026-10-02:** `feature/<name>`. Sarah doesn't feel strongly about it, and would switch if there's a good reason for a different convention. Not checked yet.
  - Findings from /decide on decision 6 (2026-10-02): a branch is one story, so the name comes from the story note's name, which can hold spaces and parentheses (e.g. "Add Meal Changes (Saved Recipes)") and needs a slug rule. The app's "branch prefix" setting can supply the prefix. It can't be `claude/`, because `checks.yml` skips `ci-failure` for those branches.
- When is `develop` merged into an open story branch, and by whom (Sarah, or a step in a skill such as `/implement`)? A worktree runs its own copy of `.claude/skills/` and AGENTS.md, so a skill fix merged to `develop` doesn't reach a story in progress until `develop` is merged in. Related: which skill opens a story's PR and merges it.
  - **Decided 2026-10-04:** early and often. Sarah's call: story branches stay up to date, and conflicts are caught while they're small. Still open: who does it, and at which points.
- How is a release run: a skill that walks Sarah through it, a checklist in a doc, a GitHub workflow for the mechanical parts with a skill for the rest, or something else?
  - Finding from /decide on decision 5 (2026-10-04): with no versions or tags, the merge commits into `main` are the only record of which goal shipped when, so the release PR's title should name the goal.
- `/tooling` commits straight to `develop` today. With all work reaching `develop` through a PR (decision 3), how do its changes get there?
  - **Decided 2026-10-04:** the same way as a feature story: `/tooling` works on its own branch and reaches `develop` through a PR. Sarah's call.

# Conventions

# Setup Outside the Repo

# Out of Scope
- Running the E2E tests in CI: [[E2E Tests in CI]].

# Implementation
