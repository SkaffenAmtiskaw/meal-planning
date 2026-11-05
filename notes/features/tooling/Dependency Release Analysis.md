---
type: infra
status: done
blocked-by: []
confirmed: 2026-10-06
---
# Where It Stands
Reviewed. Next: /close ^status

# Inbox

# Purpose
Each minor update the `dependency-updates` routine finds gets a summary of what its release adds and whether the app should adopt any of it. React, Next, Mantine, better-auth, luxon and Zod are **the assessed libraries**: a minor or major of one goes to the Opus `upgrade-assessor` subagent, which ties new features to the app's code and, for a major, weighs gain and urgency against effort. It extends the session Dependency Update PRs built. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [x] A major of one of the assessed libraries gets an assessment in the session that weighs how much the app would gain and how urgent the upgrade is against how much effort it would take.
- [x] Each minor of a package other than the assessed libraries that goes into the PR gets a summary in the session of what the release adds, and whether anything in it is worth a story to adopt.
- [x] Each minor of one of the assessed libraries that goes into the PR gets an analysis in the session naming the code in the app each new feature would improve, and whether anything in it is worth a story to adopt.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Piece 5 whole; Piece 4's requirement on the assessed libraries, its sub-step 4, the assessed libraries' half of sub-step 5 and their part of sub-step 8's summary; and Piece 7's "The Cloud Environment". Piece 4's skill is already built by Dependency Update PRs. Of the Decisions, it builds the minor summary, which libraries are assessed, where an assessment ends up, a minor of an assessed library going to the Opus subagent, and the Opus subagent half of the model decision.

![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-5]]
![[Local Dependency Update Alerts#^piece-7]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Flow]]

## Build Order
The design's Pieces are in [[Local Dependency Update Alerts]], embedded above.

- **Decided 2026-10-06 (/infra-design):** the checks for minors run as stand-ins on past releases, in a cloud session on the `Meal Planning Routines` environment, rather than waiting for a real minor, and nothing reminds Sarah to look at the first real run. Sarah's call: she won't hold the story open for a release, the cloud session proves what a real run would (reaching GitHub and the five docs sites), and a first real run that can't reach a site names it in its summary.
  - Rejected: waiting for a real minor and running the weekly workflow - it can hold the story open indefinitely
  - Rejected: a local stand-in - it can't show the cloud session reaching GitHub and the docs sites
  - Rejected: firing the routine with `curl` and a regenerated token, Sarah's call while planning on 2026-10-04 - with stand-ins, no check fires the routine

### Step 1: Majors of the assessed libraries get a full assessment
**Builds:** Piece 5 whole, and Piece 4 for majors: its requirement that the skill names the assessed libraries in one place, sub-step 5's bullet for the assessed libraries, and sub-step 8's assessments.
**Setup first:** none
**Implementer checks:**
- The skill names the assessed libraries in one place, and its other steps and `upgrade-assessor.md` refer to them by that name.
- In a local session on a throwaway branch that's never pushed, the skill's step 4, run on made-up payloads, does each of these:
  - a major of an assessed library goes to the subagent, and the summary shows the report unedited, marked "not applied", with the offer to create a note
  - an advisory on an assessed library that only a major fixes goes to the subagent, and the summary flags it as a security fix with its advisory ID. It also gets its Roadmap line, through `sweep-rule.md`
  - a React major and an `@types/react` major in the same run go to the subagent together, and the summary lists the type package's major beside the report

**Status:** ✅ Complete

**As built:**
- A security major of an assessed library gets its report and also a 🚨 Roadmap line through `sweep-rule.md`, which Dependency-Updates Review added after the Design.
- An `@types/*` major with no major of its library in the run is listed on its own in **Majors**.
- The skill makes one subagent call per library, and **Majors** is the summary's last group, so long reports don't bury the short groups.
- Sarah's check is dropped: the implementer's `upgrade-assessor` run on `temporal-polyfill` 0.3.2 → 1.0.5, in the session that built the step, returned every part the check listed.
- Boy Scout fix: the `temporal-polyfill` Roadmap line now names the types break that run found, in place of the `/full` entry, which doesn't apply.

### Step 2: Minors of other packages get a summary
**Builds:** Piece 4 sub-step 4 for any other package, including release notes it can't read, and sub-step 8's minor summaries.
**Setup first:** none
**Implementer checks:**
- **Before building:** a session on the `Meal Planning Routines` cloud environment can read a package's GitHub release page and its raw `CHANGELOG.md` for a repo the session isn't attached to, such as `resend/resend-node`, the way the skill will read them. Use what the cloud read checks in this note's Inbox found. If the implementer can't start such a session, `/infra-build` gives Sarah the prompt in chat to start one at https://claude.ai/code with that environment, and she pastes back the result. If the reads are blocked, stop and bring it to Sarah, since it changes sub-step 4.
- In a local session on a throwaway branch that's never pushed, the skill's step 6, run on made-up payloads, does each of these:
  - a minor of another package in the PR gets a summary of every release since the version on `develop`, with links, and an adoption line naming files where a feature would apply
  - a made-up minor whose release notes don't exist gets a summary that says it couldn't read them and names the site
  - a minor dropped for breaking a check gets no summary
- **Before the check:** with Sarah's OK, commit and push the skill to `develop`, since a cloud session reads the skill from there.

**Sarah checks:**
- [x] At https://claude.ai/code, start a session on the `Meal Planning Routines` environment with the `meal-planning` repo, and paste: `Follow step 6 of the dependency-updates skill for the finding "minor resend@6.32.0", as if 6.31.0 were the version on develop and the update were in the PR. Change nothing, and show me the summary step 7 would give for it.` See what `resend` 6.32.0 adds, with links to its release notes on GitHub, and whether anything in it is worth a story to adopt, naming the files if so. Goal: a minor of a package other than the assessed libraries gets a summary.

**Status:** ✅ Complete

**As built:**
- The minor summaries are a new step 6 of the skill, after the checks, since a minor can still be dropped until they finish. The summary moves to step 7, with **Minors** as a group of its own before **Majors**.
- A package that publishes no release notes, such as one from `DefinitelyTyped`, says it has none.

### Step 3: Minors of the assessed libraries go to the assessor
**Builds:** Piece 4 sub-step 4 for the assessed libraries, and Piece 7's "The Cloud Environment" (the five docs domains).
**Setup first:** Five allowed domains on the `Meal Planning Routines` cloud environment.
**Implementer checks:**
- In a local session on a throwaway branch that's never pushed, the skill's step 6, run on made-up payloads, does each of these:
  - a minor of an assessed library in the PR goes to the subagent, and the summary lists it in the PR and shows the report unedited
  - a minor of an assessed library dropped for breaking a check gets no subagent call
- **Before the check:** with Sarah's OK, commit and push the skill to `develop`.
- **After the check:** if the report names a page on one of the five docs domains it couldn't reach, stop and bring it to Sarah, since `WebFetch` not going through the allowlist changes Piece 5.

**Sarah checks:**
- [x] At https://claude.ai/code, start a session on the `Meal Planning Routines` environment with the `meal-planning` repo, and paste: `Follow step 6 of the dependency-updates skill for the finding "minor @mantine/core@9.7.0", as if 9.6.3 were the version on develop and the update were in the PR. Change nothing, and show me the summary step 7 would give for it.` See an `upgrade-assessor` call, then its report shown unedited: each feature the app could use with files and an example, pages cited on `mantine.dev`, no page it couldn't reach, and whether anything is worth a story to adopt. Goal: a minor of an assessed library gets an analysis naming the code each new feature would improve.

**Status:** ✅ Complete

**As built:**
- The environment allows five docs domains. `moment.github.io` is left out, since WebFetch gets only its pages' titles and luxon's docs are in `docs/` in `moment/luxon` on GitHub. Sarah's call; the hub's Decisions hold it.
- From Sarah's feedback: the environment also allows `tuf-repo-cdn.sigstore.dev`, recorded in `docs/ci.md`. This step's check found `mise install` failing on pnpm's provenance check without it, which stopped the setup script. A fresh session then showed the script finishing, with mise's Node and pnpm on its `PATH`.
- The implementer's checks ran with no throwaway branch, since they changed nothing: a real `upgrade-assessor` run on Mantine 9.6.3 → 9.7.0, and a separate session reading steps 4, 6 and 7 for made-up findings, including a dropped `zod` minor.

# Setup Outside the Repo
![[Local Dependency Update Alerts#^setup-domains]]

# Out of Scope
- The check, the workflow, the routine and the PR for small updates: built, as `docs/ci.md` ("Dependency Updates") describes.
- Majors of other packages: built, as `.claude/skills/dependency-updates/sweep-rule.md` describes.

