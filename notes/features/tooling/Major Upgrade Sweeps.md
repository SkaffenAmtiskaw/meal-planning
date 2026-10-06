---
type: infra
status: ready
blocked-by: []
confirmed: 2026-10-06
---
# Where It Stands
Ready. Next: /implement ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04. `/infra-design` revised it on 2026-10-06: it now also takes updates the session drops for breaking a check, and a two-step Build Order replaces its old steps. Nothing is built yet.

# Inbox

# Purpose
A major update of a package other than the six assessed libraries, or a patch or minor that the `dependency-updates` session drops from its PR because it breaks a check, lands where a goal can pick it up: an item on the new Library Upgrades or Dev Tool Upgrades sweep when the work is small, or a flag in the session that it looks like a story of its own. Without this, a dropped update goes quiet until a newer version comes out. It extends the session Dependency Update PRs built. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [ ] A major update of a package other than React, Next, Mantine, better-auth, luxon and Zod becomes an item on the Library Upgrades or Dev Tool Upgrades sweep when it's small and needs no decision, or is flagged in the session as a story of its own.
- [ ] A patch or minor that the `dependency-updates` session drops from its PR because it breaks a check becomes an item on the Library Upgrades or Dev Tool Upgrades sweep when the fix is small and needs no decision, or is flagged in the session as a story of its own.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Piece 6 whole, and Piece 4's sweep rule in sub-step 5, with the changes to sub-steps 2, 3, 7 and 8 that feed it or carry its result. Piece 4's skill is already built by Dependency Update PRs. Of the Decisions, it builds Mongoose getting no assessment, a smaller library's major going on a sweep linked to App Health, a dev tool's major going on its own sweep, the four decisions Sarah made while planning it on 2026-10-04 (Dev Tool Upgrades items' goal link, the three assessed libraries' `@types` majors going with their library, a major that's the only fix for an advisory always flagged as a story, and a major whose breaking changes can't be read flagged with the site it couldn't reach), what happens to an update the session drops, and what happens when the collecting sweep can't be found. From Open Decision 2, it relies on the one fixed `claude/` branch.

![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-6]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Flow]]
![[Local Dependency Update Alerts#Open Decisions]]

## Build Order
The design's Pieces are in [[Local Dependency Update Alerts]], embedded above.

- **Decided 2026-10-06 (/infra-design):** each step's check clears the reported list and starts the weekly Dependency Updates run with `gh`, so the real workflow re-reports everything outstanding, the backlog majors and `@biomejs/biome` 2.5.15 included. Sarah's call: it leaves her nothing to do but look at the PR and the session's summary, and needs no token.
  - Rejected: firing the routine with `curl` and a regenerated token, Sarah's call while planning on 2026-10-04 - it needs a copy of the token, and skips the workflow

### Step 1: Majors of other packages become sweep items or story flags
**Builds:** Piece 6 (Library Upgrades, Dev Tool Upgrades and their Roadmap lines), and Piece 4 for majors: sub-step 5's sweep rule, sub-step 2's branch for a run with only majors, and sub-step 8's summary of sweep items and flags.
**Setup first:** none
**Implementer checks:**
- **Before building the sweep rule's reading:** a session on the `Meal Planning Routines` cloud environment can read a backlog major's GitHub release page and its raw `CHANGELOG.md`, such as `vitest-dev/vitest`'s, the way the skill will read them. If the implementer can't start such a session, `/implement` gives Sarah the prompt in chat to start one at https://claude.ai/code with that environment, and she pastes back the result. If the reads are blocked, stop and bring it to Sarah, since it changes the trade-off behind her "no new domains" decision.
- `sh scripts/vault-lint.sh` passes once the two sweeps and their Roadmap lines are written. Ask Sarah where in Unaffiliated each line goes.
- In a local session on a throwaway branch that's never pushed, the skill's sweep rule, run on payloads the implementer picks, does each of these:
  - a major whose breaking changes need a decision gets no item, and the summary says why, with file counts
  - a major that's the only fix for an advisory gets no item and a security-fix flag with its advisory ID
  - an `@types/react` major gets no item and is listed beside React
  - a `mongoose` major is handled like any other package
  - two real releases of one swept package, run one after the other (such as an earlier `vitest` 5.x, then 5.0.3), leave one item, updated to the newer version
  - the package's item moved into a scratch kicked-off copy leaves the copy unchanged, and the summary names it
  - the sweep moved to another folder is found by the search, and the summary says where it was
  - with no collecting sweep anywhere in `notes/`, the item becomes a line under the sweep's goal heading in Later, and the summary flags the missing sweep
  - a run with only majors that writes an item commits it on `claude/dependency-updates`, and one that writes none commits nothing
- If `docs/ci.md` describes what happens to majors, it says what the sweep rule does.
- **Before the check:** with Sarah's OK, commit and push the notes and the skill to `develop`. If a dependency PR is open, ask Sarah to merge or close it. Then delete the `dependency-alerts-reported-*` cache entries with `gh cache delete`, start the weekly run with `gh workflow run`, and give Sarah the run's link and, once the session has opened it, the PR's link.

**Sarah checks:**
- [ ] Open the PR link `/implement` gives you in chat. See new items in Library Upgrades and Dev Tool Upgrades for the backlog majors that are small (`typescript`, `vitest`, `jsdom`, `preact` and `temporal-polyfill`), and no major's version changed in `package.json`. Any other changes are real patches, minors or security fixes still outstanding. See each Library Upgrades item end 🎯 [[App Health]] and each Dev Tool Upgrades item end 🎯 [[Dev Tooling]], each naming its versions, a release notes link, and the breaking changes the app hits with their files. Then open the session in the Code tab under **Routines**, and see its summary name each backlog major with the sweep it went to, or why it looks like a story of its own. Merge the PR once it looks right. Goal: a major of a package other than the six becomes a sweep item or a flagged story.

### Step 2: Dropped updates become sweep items or story flags
**Builds:** Piece 4 for dropped updates: sub-steps 3 and 7 sending a dropped update through the sweep rule, the rule's reading of what broke, and sub-step 8's **Not applied** record when nothing is pushed.
**Setup first:** none
**Implementer checks:**
- In a local session on a throwaway branch that's never pushed, with payloads the implementer picks:
  - a dropped update whose fix needs a decision gets no item, and the summary says why, with each failure and its file count
  - a dropped fix for an advisory gets no item and a security-fix flag with its advisory ID
  - a dropped minor of one of the six libraries becomes a Library Upgrades item
  - an update dropped in sub-step 7 has its item committed with its revert
  - when the merge of `develop` conflicts, the summary's **Not applied** lists what each item would have said
- **Before the check:** the `@biomejs/biome` version `pnpm outdated` lists still fails `pnpm lint:ci` on `develop`. If Biome has been upgraded since, or that version no longer breaks a check, tell Sarah and let her decide how to cover it.
- **Before the check:** with Sarah's OK, commit and push the skill to `develop`. If a dependency PR is open, ask Sarah to merge or close it. Then clear the reported list and start the weekly run as in Step 1, and give Sarah the run's link and the PR's link.
- **After the check:** once Sarah's check shows the Biome item in the PR, delete the Biome item from [[Dev Tooling Tidy-Ups]].

**Sarah checks:**
- [ ] Open the PR link `/implement` gives you in chat. See a Dev Tool Upgrades item for `@biomejs/biome`, ending 🎯 [[Dev Tooling]] and naming the `pnpm lint:ci` findings with their files. See the backlog majors' items (`typescript`, `vitest`, `jsdom`, `preact`, `temporal-polyfill`) updated in place, with no second item for any of them. Then open the session in the Code tab under **Routines**, and see its summary list Biome under **Dropped**, with the check it broke and the sweep its item went to. Merge the PR once it looks right. Goal: a patch or minor dropped because it breaks a check becomes a sweep item or a flagged story.

# Out of Scope
- Assessments of the six libraries' majors: [[Dependency Release Analysis]].
- The check, the workflow, the routine and the PR for small updates: built, as `docs/ci.md` ("Dependency Updates") describes.
