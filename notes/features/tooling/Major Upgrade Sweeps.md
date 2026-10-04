---
type: infra
status: spec
blocked-by: ["[[Dependency Update PRs]]"]
confirmed: 2026-10-04
---
# Where It Stands
Next: /plan-steps. Building waits on [[Dependency Update PRs]] ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04 during `/plan-steps`, with its draft steps handed over in From the Split. Nothing is built yet.

# Inbox

# Purpose
A major update of a package other than the six assessed libraries lands where a goal can pick it up: an item on the new Library Upgrades or Dev Tool Upgrades sweep when it's small, or a flag in the session that it looks like a story of its own. It extends the session [[Dependency Update PRs]] builds. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [ ] A major update of a package other than React, Next, Mantine, better-auth, luxon and Zod becomes an item on the Library Upgrades or Dev Tool Upgrades sweep when it's small and needs no decision, or is flagged in the session as a story of its own.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Piece 6 whole, and the "any other package" half of Piece 4's sub-step 5, with its sweep lines committed on the PR's branch. Piece 4's skill is already built by [[Dependency Update PRs]]. Of the Decisions, it builds Mongoose getting no assessment, a smaller library's major going on a sweep linked to App Health, and a dev tool's major going on its own sweep. From Open Decision 2, it relies on the one fixed `claude/` branch.

![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-6]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Open Decisions]]

# Out of Scope
- Assessments of the six libraries' majors: [[Dependency Release Analysis]].
- The check, the workflow, the routine and the PR for small updates: [[Dependency Update PRs]].

# From the Split
Draft handed over when this story was split from [[Local Dependency Update Alerts]]. Not approved yet. /plan-steps starts from it and deletes this section when it writes Implementation.

Notes for /plan-steps, from the split (Sarah approved them 2026-10-04):
- **Step 11:** "This removes the skill's last placeholder" becomes "replaces [[Dependency Update PRs]]'s listing for other packages' majors".
- **New:** whether to delete the reported-list cache entries at the end, so the backlog majors [[Dependency Update PRs]] already reported get swept.
- Steps that call the routine with `curl` rely on the routine's token. [[Dependency Update PRs]] puts it in an Actions secret, so a `curl` check needs it regenerated or kept, which this story's plan decides.
- Step numbers are the original draft's. Renumber when writing Implementation.

Fact from the draft, checked 2026-10-04:
- **Real findings to check with.** `pnpm audit` lists about 40 advisories. Some are transitive and a lockfile bump fixes them: `undici` under `jsdom`, which allows `^7.24.5`, and `vite` under `@vitejs/plugin-react`. Others are direct: `postcss`, and `mongoose` (pinned at 9.0.2, fixed in a 9.x minor). No advisory needs a major to fix. `pnpm outdated` lists patches (`@testing-library/react` 16.3.3, `@types/luxon` 3.7.6), minors (`@tabler/icons-react` 3.48.0, `resend` 6.32.0, `@mantine/core` 9.6.3, `react` 19.3.0, `zod` 4.6.5, `better-auth` 1.7.7) and majors (`typescript` 7.0.2, `vitest` 5.0.3, `jsdom` 30.1.2, `preact` 11.0.0, `temporal-polyfill` 0.3.2 → 1.0.5). None of the six assessed libraries has a new major out.

### Step 11: Majors of other packages go to a sweep or are flagged as stories
**Idea:** A major of any package other than the six assessed libraries becomes a line on the Library Upgrades or Dev Tool Upgrades sweep, or is flagged as a story of its own.

**Source:** Piece 4 sub-step 5 (any other package: read the breaking changes, search the code; a small upgrade needing no decision gets a sweep line, `dependencies` to Library Upgrades, `devDependencies` to Dev Tool Upgrades, `@types/*` follows its library; otherwise no line and a summary of why it looks like its own story; sweep lines committed on the same branch, so a week with only majors still gets a PR); Piece 6 (the two sweep notes); Goal: a major update never gets a PR without Sarah's say-so; Design decisions: a smaller library's major goes on a sweep linked to App Health; a dev tool's major goes on a sweep linked to Dev Foundations; Mongoose gets no assessment.

**Approach:**
- `notes/features/tech debt/Library Upgrades.md` and `notes/features/tooling/Dev Tool Upgrades.md` (new, from the Sweep template, no template comments): Purpose and What Belongs Here as Piece 6 says. Their Roadmap lines go in Unaffiliated with the other collecting notes, with no goal links. Ask Sarah where in Unaffiliated each goes.
- `SKILL.md` step 5: for each major of a package other than the six (Mongoose included), read the breaking changes and search the code for each one the app hits. Small and decision-free: add an item to the right sweep, naming the package, the current and new versions, a link to its release notes or migration guide, ending "found by the dependency-updates routine" and the date, linked 🎯 [[App Health]] (Library Upgrades) or 🎯 [[Dev Foundations]] (Dev Tool Upgrades). Otherwise, no item, and the summary says why it looks like its own story, with the breaking changes and file counts. The items are committed on the PR's branch, so a run with only majors still opens or updates the PR. This removes the skill's last placeholder.
- **Implementer:** run `sh scripts/vault-lint.sh` on the session's branch, to check its sweep items pass.
- Sarah pushes the notes and skill to `develop` before the check.

**Files:**
- `notes/features/tech debt/Library Upgrades.md` (new) - collects small majors of libraries
- `notes/features/tooling/Dev Tool Upgrades.md` (new) - collects small majors of dev tools
- `notes/Roadmap.md` - the two sweeps' lines in Unaffiliated
- `.claude/skills/dependency-updates/SKILL.md` - routes other packages' majors

**Acceptance:**
- [ ] Close or merge any open dependency PR, then call the routine with `curl` and a text naming only `major preact@11.0.0`, `major @types/jsdom@30.0.0` and `major typescript@7.0.2`. See a PR whose only changes are new items on the Library Upgrades or Dev Tool Upgrades sweep, with no version bump in `package.json`. See a summary that names, for each major, the sweep it went to or why it looks like its own story, with breaking changes and file counts. Proves: majors reach Sarah as sweep items or story candidates, never as a version bump, even in a run with only majors.
- [ ] Open the Roadmap in Obsidian. See both sweeps in Unaffiliated with their status, and any new item in the sweep notes linking its goal. Proves: the items land where a goal will pick them up.

# Implementation
