---
type: infra
status: in-progress
blocked-by: []
confirmed: 2026-11-03
---
# Where It Stands
In progress. Next: /infra-build Step 2 ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04. `/infra-design` revised it on 2026-11-03, after `/infra-build` stopped at Step 1's read check: a flagged update now leaves a Roadmap line, the session looks for a linked guide's source on GitHub, and both sweeps join every release. Step 1 is built and checked, so majors reach the sweeps and the Roadmap. Step 2 sends dropped updates the same way.

# Inbox

# Purpose
A major update of a package other than the assessed libraries, or a patch or minor that the `dependency-updates` session drops from its PR because it breaks a check, lands where it gets picked up: an item on the new Library Upgrades or Dev Tool Upgrades sweep when the work is small, or its own Roadmap line when it isn't. Without this, a dropped update goes quiet until a newer version comes out. It extends the session Dependency Update PRs built. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [x] A major of a package other than the assessed libraries that's small and needs no decision becomes an item on the Library Upgrades or Dev Tool Upgrades sweep.
- [ ] A patch or minor that the `dependency-updates` session drops from its PR because it breaks a check, and whose fix is small and needs no decision, becomes an item on the Library Upgrades or Dev Tool Upgrades sweep.
- [ ] A major of a package other than the assessed libraries, or a dropped patch or minor, that can't become a sweep item gets its own Roadmap line. Step 1 proved this for majors, and Step 2 proves it for dropped updates. That covers an update whose breaking changes can't be read, that's too big, that needs a decision, or that's a security fix.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Piece 6 whole, and Piece 4's sweep rule in sub-step 5, with the changes to sub-steps 2, 3, 7 and 8 that feed it or carry its result. Piece 4's skill is already built by Dependency Update PRs. Of the Decisions, it builds Mongoose getting no assessment, a smaller library's major going on a sweep, a dev tool's major going on its own sweep, the three decisions Sarah made while planning it on 2026-10-04 (the assessed libraries' `@types` majors going with their library, a major that's the only fix for an advisory always flagged as a story, and a major whose breaking changes can't be read flagged with the site it couldn't reach), what happens to an update the session drops, what a flag leaves behind, a linked guide on a site the session can't reach, and what happens when the collecting sweep can't be found. From Open Decision 2, it relies on the one fixed `claude/` branch.

![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-6]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Flow]]
![[Local Dependency Update Alerts#Open Decisions]]

## Build Order
The design's Pieces are in [[Local Dependency Update Alerts]], embedded above.

- **Decided 2026-10-06 (/infra-design):** each step's check clears the reported list and starts the weekly Dependency Updates run with `gh`, so the real workflow re-reports everything outstanding, the backlog majors and `@biomejs/biome` included. Sarah's call: it leaves her nothing to do but look at the PR and the session's summary, and needs no token.
  - Rejected: firing the routine with `curl` and a regenerated token, Sarah's call while planning on 2026-10-04 - it needs a copy of the token, and skips the workflow

### Step 1: Majors of other packages become sweep items or Roadmap lines
**Builds:** [[Local Dependency Update Alerts#^piece-6|Piece 6]] (both sweeps and their Roadmap lines), and [[Local Dependency Update Alerts#^piece-4|Piece 4]] for majors: sub-step 5's sweep rule, sub-step 2's branch for a run with only majors and its `notes/Roadmap.md` conflict handling, and sub-step 8's summary of items, lines and flags. If the skill doesn't name the assessed libraries in one place yet, this step adds that, since the sweep rule refers to them by that name.
**Setup first:** none
**Implementer checks:**
- `sh scripts/vault-lint.sh` passes once the two sweeps and their Roadmap lines are written.
- In a local session on a throwaway branch that's never pushed, the skill's sweep rule, run on payloads the implementer picks, does each of these:
  - a major whose breaking changes need a decision gets no item and a Roadmap line under its heading, and the summary says why, with file counts
  - a later run with a newer version of that package updates its line, with no second line
  - a major that's the only fix for an advisory gets no item and a security-fix flag with its advisory ID, with its line under Bugs when the app's `dependencies` use the package, and under Dev Tooling when they don't
  - an `@types/react` major gets no item and no line, and is listed beside React
  - a `mongoose` major is handled like any other package
  - two real releases of one swept package, run one after the other (such as an earlier `vitest` 5.x, then the newest), leave one item, updated to the newer version
  - the package's item moved into a scratch dated copy leaves the copy unchanged, and the summary names it
  - the sweep moved to another folder is found by the search, and the summary says where it was
  - with no collecting sweep anywhere in `notes/`, the item becomes a line under its heading in Later, and the summary flags the missing sweep
  - a major whose release links to a guide on a blocked site finds the guide's source on GitHub (such as `preact`'s in `preactjs/preact-www`), and a made-up one with no source gets a line, with the summary naming the site
  - a run with only majors that writes an item or a line commits it on `claude/dependency-updates`, and one that writes neither commits nothing
  - a merge of `develop` that conflicts only in `notes/Roadmap.md` keeps both sides' lines
- If `docs/ci.md` describes what happens to majors, it says what the sweep rule does.
- **Before the check:** with Sarah's OK, commit and push the notes and the skill to `develop`. If a dependency PR is open, ask Sarah to merge or close it. Then delete the `dependency-alerts-reported-*` cache entries with `gh cache delete`, start the weekly run with `gh workflow run`, and give Sarah the run's link and, once the session has opened it, the PR's link.
- **Before Sarah looks at the PR:** if the run left no sweep item or no Roadmap line, tell her, since that leaves Goal 1 or Goal 3 unproved, and let her decide how to cover it.

**Sarah checks:**
- [x] Open the PR link `/infra-build` gives you in chat. For each backlog major (`typescript`, `vitest` with `@vitest/coverage-v8`, `jsdom`, `@types/jsdom`, `@types/node`, `@vitejs/plugin-react`, `preact` and `temporal-polyfill`), see either an item in Library Upgrades or Dev Tool Upgrades, or a line in `notes/Roadmap.md` under App Health, Dev Tooling or Bugs. See no major's version changed in `package.json`. Any other changes are real patches, minors or security fixes still outstanding. See each item name its versions, a release notes link and the breaking changes the app hits with their files, with no 🎯 link, and each line name its versions, why it was flagged and a release notes link. Then open the session in the Code tab under **Routines**, and see its summary name each backlog major with where it went. Merge the PR once it looks right. Goals: a small major of a package other than the assessed libraries becomes a sweep item, and one that can't gets its own Roadmap line.

**Status:** ✅ Complete

**As built:**
- The sweep rule, the Roadmap line and the commit step live in `.claude/skills/dependency-updates/sweep-rule.md`, since most runs never use them. `SKILL.md`'s step 5 reads it for a major of a package other than the assessed libraries. Step 2's dropped updates go through the same file.
- When step 2 of the skill aborts the merge of `develop`, a major is only listed in the summary. Step 2 of this story replaces that with its **Not applied** record.
- A push that changes only notes and then fails a check on GitHub drops nothing, since no update is to blame. `SKILL.md`'s step 3 is skipped when a run has no patch, minor or advisory, so a run with only majors doesn't run the override cleanup.
- The first real run ([PR #29](https://github.com/SkaffenAmtiskaw/meal-planning/pull/29), closed unmerged) showed three problems that the local runs didn't: it called breaking changes unreadable when a major's first release was past page one of a releases page, it named files that don't use the package, and it copied the worked example's reason into a line. The rule now reads past page one or the package's changelog, gives `preact`'s guide as its example of finding a source on GitHub, has a "couldn't read" line say where it looked, names a file only if the session has seen that it uses the package, and shows the line's shape as placeholders. Sarah's check ran on the re-run, [PR #30](https://github.com/SkaffenAmtiskaw/meal-planning/pull/30).
- A line can cover packages that have to move together: `vitest`, `@vitest/coverage-v8` and `@vitejs/plugin-react` share one, as they need a decision on Vite 8 together.

### Step 2: Dropped updates become sweep items or Roadmap lines
**Builds:** [[Local Dependency Update Alerts#^piece-4|Piece 4]] for dropped updates: sub-steps 3 and 7 sending a dropped update through the sweep rule, the rule's reading of what broke, and sub-step 8's **Not applied** record when nothing is pushed.
**Setup first:** none
**Implementer checks:**
- In a local session on a throwaway branch that's never pushed, with payloads the implementer picks:
  - a dropped update whose fix needs a decision gets no item and a Roadmap line, and the summary says why, with each failure and its file count
  - a dropped fix for an advisory gets no item, a security-fix flag with its advisory ID, and a line placed as in Step 1
  - a dropped minor of an assessed library becomes a Library Upgrades item
  - an update dropped in sub-step 7 has its item or line committed with its revert
  - when the merge of `develop` conflicts in a file other than `pnpm-lock.yaml` or `notes/Roadmap.md`, the summary's **Not applied** lists what each item and line would have said
- **Before the check:** the `@biomejs/biome` version `pnpm outdated` lists still fails `pnpm lint:ci` on `develop`. If Biome has been upgraded since, or that version no longer breaks a check, tell Sarah and let her decide how to cover it.
- **Before the check:** with Sarah's OK, commit and push the skill to `develop`. If a dependency PR is open, ask Sarah to merge or close it. Then clear the reported list and start the weekly run as in Step 1, and give Sarah the run's link and the PR's link.
- **Before Sarah looks at the PR:** if Biome became a Roadmap line rather than an item, tell her, since that leaves Goal 2 unproved, and let her decide how to cover it.
- **After the check:** once Sarah's check shows the Biome item in the PR, delete the Biome item from [[Dev Tooling Tidy-Ups]].

**Sarah checks:**
- [ ] Open the PR link `/infra-build` gives you in chat. See a Dev Tool Upgrades item for `@biomejs/biome`, naming the `pnpm lint:ci` findings with their files, with no 🎯 link. See each backlog major's item or Roadmap line updated in place, with no second item or line for any of them. Then open the session in the Code tab under **Routines**, and see its summary list Biome under **Dropped**, with the check it broke and the sweep its item went to. Merge the PR once it looks right. Goal: a patch or minor dropped because it breaks a check, with a small fix, becomes a sweep item.

# Out of Scope
- Assessments of the six libraries' majors: [[Dependency Release Analysis]].
- The check, the workflow, the routine and the PR for small updates: built, as `docs/ci.md` ("Dependency Updates") describes.
