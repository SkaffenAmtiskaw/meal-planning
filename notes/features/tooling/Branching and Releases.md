---
type: infra
status: idea
blocked-by:
  - "decision needed: how to work on two features at once, how notes work across branches, how work reaches develop, what a release is, and versioning"
confirmed: 2026-10-02
---
# Where It Stands

Next: /decide. Building waits on [[Manual and Agent Test Environment]] ^status

Shaped as one infra story that designs parallel feature branches, protection for `develop` and a release process together. Five open decisions come first, then `/infra-design`.

# Inbox

# Purpose
Let Sarah work on two product features at once with agents, protect `develop`, and give a finished goal a way to ship as a release.

[Sarah] - I have sadly reached the point I probably need feature branches. I'm pretty consistently working two different features at a time. That's not a big deal when one feature is something that can go to `main` half-baked, like `e2e` tests. But it means I can't have two different product features being worked at once. That being said, I haven't got a goddamn clue how to handle feature branches with an agent. I'm vaguely familiar with worktrees, but the one time I tried it it didn't seem to work great. If that's the solution, I need a crash course in using them with agents. If that's not the solution I need to know what is. And regardless of what the solution is it needs documented. Edit: Sep 30 - We would also need to protect `develop` in CI should we make this change. Assuming the CI Checks story is done of course.

# Goals
- [ ] Sarah can work on two product features at once, each with its own agent session, without either one blocking the other.
- [ ] Sarah has a crash course in working this way with agents, and the way of working is documented.
- [ ] The notes vault and the Roadmap stay consistent while work happens on more than one branch.
- [ ] `develop` is protected in CI.
- [ ] A release process exists (a [[Dev Foundations]] Done When item).
- [ ] A goal whose last story closes has a next step: `/close` no longer marks it "waiting on a release process", and Note Conventions' row for it names that step.

# Open Decisions
1. How does Sarah work on two features at once with agents: worktrees (possibly the Claude desktop app's built-in worktree sessions), separate clones or something else? She tried worktrees once, and it didn't seem to work great.
   - **Leaning 2026-10-02:** worktrees, just because that seems like the standard way to do it. Not checked yet.
2. How do `notes/` and the Roadmap work when each branch has its own copy? `/decide` should lay out options and think through how each would work day to day.
3. Once `develop` is protected, does all work reach it through a PR, or can some changes, such as notes-only commits, still be pushed directly?
   - **Leaning 2026-10-02:** probably a PR, though Sarah has wondered whether notes-only changes should be allowed to push directly. Not checked yet.
4. What is a release, and how does it work when `develop` holds stories from more than one goal? Sarah decided 2026-09-28 that a goal wrapping up is a release. But if stories merge into `develop` one at a time, merging `develop` into `main` when one goal wraps up can ship another goal's unfinished stories. Sarah is torn on this, and the answer may change the 2026-09-28 decision. Pieces a release might include, raised while designing goals (none decided):
   - a review across all of the goal's stories: leftovers between stories, duplicated logic, patterns that drifted between stories
   - checking each of the goal's Done When items in the running app
   - checking that `docs/` covers what the goal added
   - merging `develop` into `main`, deploying, and possibly release notes or a version tag
   - closing the goal note, and handling any Roadmap lines still under it
5. Does a release get a version and release notes? Sarah isn't sure what versioning gains an app with one maintainer, but isn't opposed if there's a reason. If yes, are they written by hand or with a tool? Candidates: release-please, Changesets, semantic-release.

# Design
Questions for this section:
- With two worktrees open, both want port 3000 for `pnpm dev`, port 3001 for the seed sign-in server, and the one dev database named `test`, where one worktree's `pnpm seed` reset wipes the other's data. How do two worktrees run side by side?
- What are feature branches named?
  - **Leaning 2026-10-02:** `feature/<name>`. Sarah doesn't feel strongly about it, and would switch if there's a good reason for a different convention. Not checked yet.
- How is a release run: a skill that walks Sarah through it, a checklist in a doc, a GitHub workflow for the mechanical parts with a skill for the rest, or something else?

# Conventions

# Setup Outside the Repo

# Out of Scope
- Running the E2E tests in CI: [[E2E Tests in CI]].

# Implementation
