---
type: 
status: idea
confirmed: 2026-10-01
---
# Where It Stands

Next: /shape ^status

# Notes
Sarah decided 2026-10-01 to merge Release Process and Feature Branches into this one story, because many decisions in one will affect the other.

## Feature branches
[Sarah] - I have sadly reached the point I probably need feature branches. I'm pretty consistently working two different features at a time. That's not a big deal when one feature is something that can go to `main` half-baked, like `e2e` tests. But it means I can't have two different product features being worked at once. That being said, I haven't got a goddamn clue how to handle feature branches with an agent. I'm vaguely familiar with worktrees, but the one time I tried it it didn't seem to work great. If that's the solution, I need a crash course in using them with agents. If that's not the solution I need to know what is. And regardless of what the solution is it needs documented. Edit: Sep 30 - We would also need to protect `develop` in CI should we make this change. Assuming the CI Checks story is done of course.

Moved out of [[Agent Workflow Changes]] on 2026-10-01, when `/tooling` found it was a story rather than a tooling change, on two counts:
- **Too big for one session:** it needs research first (worktrees compared with other ways to work on two features at once, how they work with agents, and what happens to the notes vault, which lives in the repo, so each branch has its own copy of `notes/` and the Roadmap), then several decisions and a doc.
- **New infrastructure:** protecting `develop` in CI is a branch-protection and CI change.

## Releases
There's no release process yet. Sarah decided 2026-09-28 that a goal (a ranked epic on the Roadmap) wrapping up is a release, and that releasing needs to be created. Until it exists, `/close` marks a goal whose last story has closed with "waiting on a release process" on its line under Goals, and `/close` run on a goal stops.

Pieces a release might include, raised while designing goals (none decided):
- a review across all of the goal's stories: leftovers between stories, duplicated logic, patterns that drifted between stories
- checking each of the goal's Done When items in the running app
- checking that `docs/` covers what the goal added
- merging `develop` into `main`, deploying, and possibly release notes or a version tag
- closing the goal note, and handling any Roadmap lines still under it

Found 2026-09-28 while running `/tooling` on the goals and Roadmap priority items from [[Agent Workflow Changes]].

# Questions
