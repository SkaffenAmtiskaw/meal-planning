---
type: infra
status: spec
blocked-by: ["[[Infra Stories Without Steps]]"]
confirmed: 2026-10-04
---
# Where It Stands
Blocked by [[Infra Stories Without Steps]]; then /infra-design. Building waits on [[Dependency Update PRs]] ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04. Its one implementation step was planned and approved on 2026-10-04. Nothing is built yet. Sarah decided 2026-10-05 that it waits for [[Infra Stories Without Steps]] and then goes back to `/infra-design` to replace its steps with a Build Order.

# Inbox
- For `/infra-design`, from [[Dependency Update PRs]] Step 9 (2026-10-05): Sarah decided that the Library Upgrades and Dev Tool Upgrades sweeps also take a patch or minor that the `dependency-updates` session drops from its PR because it breaks a check, not only majors. Today a dropped update goes quiet: its `package@version` is in the reported list, so no later run mentions it until a newer version comes out, and nothing records the work that would let it in. The first real run dropped `@biomejs/biome` 2.4.6 → 2.5.15, which fails `pnpm lint:ci` ([PR #25](https://github.com/SkaffenAmtiskaw/meal-planning/pull/25), **Dropped**). That upgrade sits in [[Dev Tooling Tidy-Ups]] for now. This widens the Purpose and Goals beyond majors, and reaches the places in the `dependency-updates` skill where an update is dropped (step 3, and step 7's "Drop an update that fails only on GitHub"), as well as step 5.

# Purpose
A major update of a package other than the six assessed libraries lands where a goal can pick it up: an item on the new Library Upgrades or Dev Tool Upgrades sweep when it's small, or a flag in the session that it looks like a story of its own. It extends the session [[Dependency Update PRs]] builds. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [ ] A major update of a package other than React, Next, Mantine, better-auth, luxon and Zod becomes an item on the Library Upgrades or Dev Tool Upgrades sweep when it's small and needs no decision, or is flagged in the session as a story of its own.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Piece 6 whole, and the "any other package" half of Piece 4's sub-step 5, with its sweep lines committed on the PR's branch. Piece 4's skill is already built by [[Dependency Update PRs]]. Of the Decisions, it builds Mongoose getting no assessment, a smaller library's major going on a sweep linked to App Health, and a dev tool's major going on its own sweep. It also builds the four decisions Sarah made while planning it on 2026-10-04: Dev Tool Upgrades items carry no goal link for now, the three assessed libraries' `@types` majors go with their library, a major that's the only fix for an advisory is always flagged as a story, and a major whose breaking changes can't be read is flagged with the site it couldn't reach. From Open Decision 2, it relies on the one fixed `claude/` branch.

![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-6]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Open Decisions]]

# Out of Scope
- Assessments of the six libraries' majors: [[Dependency Release Analysis]].
- The check, the workflow, the routine and the PR for small updates: [[Dependency Update PRs]].

# Implementation
Facts the steps rely on, checked 2026-10-04:
- **The backlog majors.** `pnpm outdated` lists majors of `typescript` (7.0.2), `vitest` (5.0.3), `jsdom` (30.1.2), `preact` (11.0.0) and `temporal-polyfill` (0.3.2 → 1.0.5). [[Dependency Update PRs]]'s first run reports them, and a reported version stays quiet until a newer one comes out. Sarah decided 2026-10-04 while planning that Step 1's check calls the routine with exactly these majors (as `pnpm outdated` lists them when it's built), so one run tests the new branch of the skill and sweeps the backlog, with nothing else reported again.
- **The routine's token.** [[Dependency Update PRs]] Step 9 puts the token in the Actions secret `ROUTINE_DEPENDENCY_UPDATES_TOKEN`, where it can't be read back. Sarah decided 2026-10-04 while planning: for Step 1's check she regenerates it, pastes the new one into the secret and keeps a copy until the check is done.
- **Where the session reads release notes.** For packages other than the six assessed libraries, Piece 4 sub-step 4 has the session read release notes on `github.com` and `raw.githubusercontent.com`, as hosts the cloud environment allows. Some migration guides live elsewhere, such as TypeScript 7's on `devblogs.microsoft.com` and Vitest's on `vitest.dev`. Not yet confirmed: `docs/ci.md` says GitHub goes through its own proxy, and its setup script's comments say that proxy blocks downloads from repos not attached to the session, so a cloud session may not reach other projects' release pages or raw changelogs at all. The Approach checks this before step 5 is built. Sarah decided 2026-10-04 while planning: no new domains. A major the session can't read is flagged as a possible story, and the summary names the site it couldn't reach.

## Step 1: Majors of other packages become sweep items or story flags
**Idea:** The session turns each major of a package outside the six assessed libraries into an item on a new sweep note, or flags it as a story of its own.

**Source:**
- Piece 4 sub-step 5: for any other package, read the breaking changes and search the code; small and decision-free gets a sweep line (`dependencies` to Library Upgrades, `devDependencies` to Dev Tool Upgrades, `@types/*` follows its library); otherwise no line and a summary of why it looks like its own story, with the breaking changes and file counts; sweep lines committed on the same branch, so a week with only majors still gets a PR; an advisory fixed only by a major counts as a major, flagged as a security fix.
- Piece 4 sub-step 8: the summary's sweep lines and possible stories.
- Piece 6: the two sweeps, their homes, what each collects, each item's contents and goal link, their Roadmap lines in Unaffiliated with no goal links, Sarah picks where.
- Goal: a major of another package becomes a sweep item or a flagged story.
- Design decisions: Mongoose gets no assessment; a smaller library's major goes on a sweep linked to [[App Health]], its lines reaching the note through a PR; a dev tool's major goes on its own sweep.
- Sarah decided 2026-10-04 while planning: Dev Tool Upgrades items carry no 🎯 link until the Dev Tooling standing goal exists; an `@types/react`, `@types/react-dom` or `@types/luxon` major goes with its library; a major that's the only fix for an advisory is always flagged as a story; no new docs domains, and the summary names a site the session couldn't reach; the check sweeps the backlog majors by `curl`, with a regenerated token.
- Open Decision 2: one fixed `claude/` branch; a newer version of a reported package is reported again, which the "already there" rule below needs.
- Work the story needs: each item names the breaking changes the app hits with their files, as the Sweep template's Items rule asks; packages that have to move together share one item, since neither can be upgraded alone; an `@types/*` package with no library in `package.json` goes by its own section.

**Approach:**
- **The two sweeps** (Piece 6), `notes/features/tech debt/Library Upgrades.md` and `notes/features/tooling/Dev Tool Upgrades.md` (new, from the Sweep template, no template comments, the Items heading bare):
  - **Purpose:** Library Upgrades collects majors of packages in `dependencies` other than React, Next, Mantine, better-auth, luxon and Zod (Mongoose included). Dev Tool Upgrades collects majors of packages in `devDependencies`. Each says its items are added by the `dependency-updates` routine's session, as small upgrades that wait for a goal to pick them up.
  - **What Belongs Here:** the template's paragraph, then the grouping rule. One item per upgrade: packages that have to move together, such as `vitest` and `@vitest/coverage-v8`, share one. Each item names the package, the current and new versions, a link to its release notes or migration guide, and the breaking changes the app hits with their files, ending "found by the dependency-updates routine" and the date. An `@types/*` package goes where its library goes, or by its own section when its library isn't in `package.json` (`@types/node` → Dev Tool Upgrades). `@types/react`, `@types/react-dom` and `@types/luxon` never go here, since they go with their assessed libraries. A major that's the only fix for a security advisory never goes here. Library Upgrades: each item ends 🎯 [[App Health]]. Dev Tool Upgrades: items carry no 🎯 link until the Dev Tooling standing goal exists, then link that.
  - **Out of Scope:** majors of the six assessed libraries ([[Dependency Release Analysis]]); a major too big for a sweep, or one that fixes a security advisory, which the session flags as a story of its own.
  - **Acceptance Criteria:** the template's first box, and "The flows each upgraded package is used in behave as before."
- `notes/Roadmap.md`: both lines in Unaffiliated with their status embeds and no 🎯 links. Ask Sarah where in Unaffiliated each one goes.
- **Implementer, before building step 5:** confirm that a session on the `Meal Planning Routines` environment can read a backlog major's GitHub release page and its raw `CHANGELOG.md` (for example `vitest-dev/vitest`), the way the skill will read them. If the implementer can't start such a session, Sarah starts one at https://claude.ai/code with that environment and pastes the result. If the reads are blocked, stop and bring it to Sarah, since it changes the trade-off behind her "no new domains" decision.
- **`.claude/skills/dependency-updates/SKILL.md` step 5:** a major of any package other than the six (Mongoose included) replaces [[Dependency Update PRs]]'s listing (release notes link, "not applied") with this:
  - The session reads the major's breaking changes from its GitHub releases, changelog or migration guide on `github.com` or `raw.githubusercontent.com`, and searches the code for each one the app hits. If the release only points to a guide on another site, it follows the link.
  - **Small and needs no decision:** it adds an item to Library Upgrades or Dev Tool Upgrades, written as that sweep's What Belongs Here says. Packages that have to move together share one item. The goal link is fixed by What Belongs Here, so the session doesn't run `roadmap-placement`'s goal check (AGENTS.md "A new item in a collecting note"), asks nothing and kicks nothing off.
  - **Otherwise:** no item. The summary says why it looks like a story of its own, with each breaking change the app hits and its file count.
  - **Can't read the breaking changes:** no item. The summary flags it as a possible story and names the site it couldn't reach.
  - **The sweep isn't collecting:** if the sweep note's `status` isn't `idea` (it was kicked off itself) or the note is gone, no item. The summary flags the major and says the sweep isn't collecting.
  - **The only fix for a security advisory:** never an item. The summary flags it as a security fix with the advisory ID, as an upgrade to plan on its own.
  - **Already there:** if the sweep note has an unchecked item for the same package, the session works on that item instead of adding a second one. If the newer version is still small, it updates the item's version, link, breaking changes and date. If it isn't, or the session can't read it, the item stays as it is, since its version can still be installed, and the summary flags the newer version as a possible story, naming the item. If the package's item has moved into a kicked-off copy (`<sweep> YYYY-MM-DD`), the session leaves the copy alone, adds no item to the original, and the summary names the copy and the newer version.
  - `@types/react`, `@types/react-dom` and `@types/luxon` get no item. The summary lists each beside its library, as part of that upgrade.
- **`SKILL.md` steps 2 and 7:** a new or changed sweep item counts as a change, so a run with only majors cuts or updates the `claude/dependency-updates` branch, commits the items there and opens or updates the PR, as for patches and minors. Before committing, the session runs `sh scripts/vault-lint.sh`, as AGENTS.md asks of any session that changes notes, and fixes what it reports in the sweep notes.
- **`SKILL.md` step 8:** the summary lists each sweep item the session added or updated, with its sweep, and each major it flagged as a possible story or a security fix, with the reason.
- `docs/ci.md`: if the `dependency-updates` entry under "Routines" describes what happens to majors, update it.
- **Implementer:** run `sh scripts/vault-lint.sh` after creating the notes.
- **Implementer:** in a local session on a throwaway branch that's never pushed, run the skill's step 5 on payloads the implementer picks, and confirm each case:
  - a major whose breaking changes need a decision gets no item and a summary saying why
  - a major flagged as a security fix gets no item and a security-fix flag with its advisory ID
  - an `@types/react` major gets no item and is listed beside React
  - two real releases of one swept package, run one after the other (such as an earlier `vitest` 5.x, then 5.0.3), leave one item, updated to the newer version
  - the same package's item moved into a scratch kicked-off copy leaves the copy unchanged, and the summary names it
  - a `mongoose` major is handled like any other package
- **Implementer:** for each backlog major, note where its breaking changes can be read on `github.com` or `raw.githubusercontent.com`, or that they can't. Take this from the cloud session above, not a local one. Then, on a throwaway branch, run step 5 on the backlog payload and tell Sarah which majors it expects to become items. If none would, tell her before the check, since the backlog alone can't then show a run with only majors opening a PR, and let her decide how to cover it.
- The implementer gives Sarah the check's `curl` text in the payload's shape, with each major `pnpm outdated` lists at the time as its own `major` line. The session groups packages that move together into one item.
- **Setup Sarah does by hand before the check:** on the `dependency-updates` routine's API trigger (https://claude.ai/code/routines → the routine → Edit → **Select a trigger** → **API**), **Regenerate** the token. Paste it into the Actions secret `ROUTINE_DEPENDENCY_UPDATES_TOKEN` (repo Settings → Secrets and variables → Actions → the secret → Update), and keep a copy until the check is done.
- Sarah merges or closes any open dependency PR, then pushes the notes and the skill to `develop`, before the check.

**Files:**
- `notes/features/tech debt/Library Upgrades.md` (new) - collects small majors of libraries
- `notes/features/tooling/Dev Tool Upgrades.md` (new) - collects small majors of dev tools
- `notes/Roadmap.md` - the two sweeps' lines in Unaffiliated
- `.claude/skills/dependency-updates/SKILL.md` - routes other packages' majors to a sweep or a story flag
- `docs/ci.md` - only if its `dependency-updates` entry describes what happens to majors

**Acceptance:**
- [ ] With no dependency PR open, call the routine with `curl` and the implementer's text naming the backlog majors (`typescript`, `vitest`, `jsdom`, `preact` and `temporal-polyfill`, at the versions `pnpm outdated` lists). See a new PR from `claude/dependency-updates` whose only changes are new items in Library Upgrades and Dev Tool Upgrades, with nothing in `package.json` or `pnpm-lock.yaml`. See any `preact` or `temporal-polyfill` item in Library Upgrades ending 🎯 [[App Health]], and any `typescript`, `vitest` or `jsdom` item in Dev Tool Upgrades with no 🎯 link, each naming its versions, release notes and the breaking changes the app hits with files. See the summary name, for each major, the sweep it went to, or why it looks like a story of its own (with breaking changes and file counts, or the site it couldn't reach). Proves: majors reach Sarah as sweep items or story candidates, never as a version bump, a run with only majors still opens a PR, and the backlog is swept.
