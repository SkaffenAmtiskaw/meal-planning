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
Each minor update the `dependency-updates` routine finds gets a summary of what its release adds and whether the app should adopt any of it. A minor or major of React, Next, Mantine, better-auth, luxon or Zod goes to the Opus `upgrade-assessor` subagent, which ties new features to the app's code and, for a major, weighs effort and urgency against the gain. It extends the session [[Dependency Update PRs]] builds. Split from [[Local Dependency Update Alerts]] on 2026-10-04.

# Goals
- [ ] A major update to a library the app depends on heavily gets an assessment in the session of how much effort the upgrade would take and how much the app would gain.
- [ ] Besides its PR, a minor update gets a summary in the session of what the release adds and a quick analysis of whether there's anything the app should adopt.

# Design
The design lives in [[Local Dependency Update Alerts]]. The sections embedded below are part of this note.

This story builds Piece 5 whole, Piece 4's sub-step 4 and the six libraries' half of sub-step 5, and Piece 7's "The Cloud Environment". Piece 4's skill is already built by [[Dependency Update PRs]]. Of the Decisions, it builds the minor summary, which six libraries get an assessment, where an assessment ends up, a minor of the six going to the Opus subagent, and the Opus subagent half of the model decision.

![[Local Dependency Update Alerts#^piece-4]]
![[Local Dependency Update Alerts#^piece-5]]
![[Local Dependency Update Alerts#^piece-7]]
![[Local Dependency Update Alerts#Decisions]]
![[Local Dependency Update Alerts#Flow]]

# Setup Outside the Repo
![[Local Dependency Update Alerts#^setup-domains]]

# Out of Scope
- The check, the workflow, the routine and the PR for small updates: [[Dependency Update PRs]].
- Majors of other packages: [[Major Upgrade Sweeps]].

# From the Split
Draft handed over when this story was split from [[Local Dependency Update Alerts]]. Not approved yet. /plan-steps starts from it and deletes this section when it writes Implementation.

Notes for /plan-steps, from the split (Sarah approved them 2026-10-04):
- **Step 8:** drop "keeps its placeholder until Step 9", since [[Dependency Update PRs]] already lists minors.
- **Step 9:** its check uses `@mantine/core@9.6.3`, which the first PR from [[Dependency Update PRs]] has probably merged, so pick a minor of the six libraries that's still outstanding.
- Steps that say Sarah pushes the skill and call the routine with `curl` rely on the routine's token. [[Dependency Update PRs]] puts it in an Actions secret, so a `curl` check needs it regenerated or kept, which this story's plan decides.
- Step numbers are the original draft's. Renumber when writing Implementation.

Fact from the draft, checked 2026-10-04:
- **Real findings to check with.** `pnpm audit` lists about 40 advisories. Some are transitive and a lockfile bump fixes them: `undici` under `jsdom`, which allows `^7.24.5`, and `vite` under `@vitejs/plugin-react`. Others are direct: `postcss`, and `mongoose` (pinned at 9.0.2, fixed in a 9.x minor). No advisory needs a major to fix. `pnpm outdated` lists patches (`@testing-library/react` 16.3.3, `@types/luxon` 3.7.6), minors (`@tabler/icons-react` 3.48.0, `resend` 6.32.0, `@mantine/core` 9.6.3, `react` 19.3.0, `zod` 4.6.5, `better-auth` 1.7.7) and majors (`typescript` 7.0.2, `vitest` 5.0.3, `jsdom` 30.1.2, `preact` 11.0.0, `temporal-polyfill` 0.3.2 → 1.0.5). None of the six assessed libraries has a new major out.

### Step 8: Minor updates get a release summary
**Idea:** Each minor of a package other than the six assessed libraries gets a summary of what the release adds, with what the app might adopt.

**Source:** Piece 4 sub-step 4 (every other minor gets a summary and a quick analysis; release notes from GitHub releases and the changelog); Goal: a minor update gets a summary of what the release adds and a quick analysis of whether there's anything the app should adopt; Design decision: the minor summary.

**Approach:**
- `SKILL.md` step 4: for each minor not of React, Next, Mantine, better-auth, luxon or Zod, read the release notes between the current and new version from the package's GitHub releases or changelog (`github.com`, `raw.githubusercontent.com`), summarize what they add, and say in a line or two whether the app should adopt any of it, searching the code where a feature might apply. A minor of one of the six keeps its placeholder until Step 9.
- Sarah pushes the skill to `develop` before the check.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` - minor release summaries

**Acceptance:**
- [ ] Call the routine with `curl` and a text naming `minor @preact/signals@2.11.3` and `minor @schedule-x/calendar@4.9.1`. See the summary give each one what its releases since the installed version add, with links to them, and a line on whether the app should adopt anything, naming files where it would. Proves: a minor update's release notes reach Sarah with an adoption call, read from GitHub in the cloud.

### Step 9: Minors of the six libraries get the assessor's benefit analysis
**Idea:** A minor of React, Next, Mantine, better-auth, luxon or Zod goes to the new `upgrade-assessor` subagent for its benefit to the app.

**Source:** Piece 5 (`upgrade-assessor`, `model: opus`, read-only tools; benefit to the app; the verdict for a minor; the six docs domains, and checking that the first assessment can read them); Piece 4 sub-step 4 (a minor of the six goes to `upgrade-assessor`); Piece 7 ("The Cloud Environment": the six domains and why); Setup Outside the Repo: six allowed domains; Design decision: a minor of the six goes to the Opus subagent for the benefit part; Design decision: the routine runs on Sonnet and an Opus subagent writes the assessments.

**Approach:**
- `.claude/agents/upgrade-assessor.md` (new, `model: opus`, tools `Read`, `Grep`, `Glob`, `WebFetch`, `WebSearch`): given a package, the current version and the new one, it reads the release notes and docs, and reports for each new feature or change whether the app has code it would improve, with the files and an example of each. A feature with no place to use it gets one line at most. A minor ends with a verdict on whether anything is worth adopting now. It returns its report to the session. The major-only parts come in Step 10.
- `SKILL.md` step 4: a minor of the six goes to `upgrade-assessor`, and the summary shows its report unedited.
- `docs/ci.md` "The Cloud Environment": the six domains join the allowed list, with why (the assessor reads release notes and migration guides there).
- **Setup Sarah does by hand before the check:** on https://claude.ai/code, open the cloud environment menu above the message box → `Meal Planning Routines` → edit → **Network access**: keep Custom and the package-manager list, and add `react.dev`, `nextjs.org`, `mantine.dev`, `better-auth.com`, `zod.dev` and `moment.github.io` to the allowed domains, one per line, below `results-receiver.actions.githubusercontent.com`. Save.
- **Implementer:** if the session's subagent can't reach the docs domains through `WebFetch`, stop and bring it to Sarah, since that changes Piece 5's design.
- Sarah pushes the skill and subagent to `develop` before the check.

**Files:**
- `.claude/agents/upgrade-assessor.md` (new) - assesses a release of the six libraries
- `.claude/skills/dependency-updates/SKILL.md` - sends the six libraries' minors to the subagent
- `docs/ci.md` - the six allowed domains

**Acceptance:**
- [ ] Call the routine with `curl` and a text naming `minor @mantine/core@9.6.3`. See the session's summary hold the subagent's report: Mantine features added since 9.0.0, each one the app could use naming the files and an example, citing pages on `mantine.dev`, and a verdict on what's worth adopting now. Proves: the assessor reads the six libraries' docs from the cloud and ties new features to the app's code.

### Step 10: Majors of the six libraries get a full assessment
**Idea:** A major of React, Next, Mantine, better-auth, luxon or Zod gets the `upgrade-assessor` subagent's full assessment.

**Source:** Piece 5 (effort, urgency and the verdict for a major); Piece 4 sub-step 5 (a major of the six goes to `upgrade-assessor`, shown unedited; an advisory fixed only by a major counts as one); Goal: a major update to a library the app depends on heavily gets an assessment of effort and gain; Design decisions: React, Next, Mantine, better-auth, luxon and Zod get one; the assessment stays in the session until Sarah reviews it, and mainly helps her decide when to draw from App Health.

**Approach:**
- `upgrade-assessor.md`: for a major, it adds the effort (each breaking change from the migration guide and release notes that the app actually hits, with file counts), the urgency (how long the current major keeps getting security fixes, and any advisory only the new major fixes), and a verdict weighing benefit and urgency against effort, not a ranking on security alone.
- `SKILL.md` step 5: a major of the six, or an advisory of one of them that only a major fixes (from Step 5), goes to `upgrade-assessor`, and the summary shows its report unedited, ending with the offer to create a note for the upgrade when Sarah asks.
- None of the six has a new major out, so Sarah's check runs the subagent in a local session on a real major as a stand-in. **Implementer:** confirm the routing with a local run of the skill's step 5 on a payload naming a made-up major of one of the six, and see it hand that major to the subagent.
- Sarah pushes the skill and subagent to `develop`.

**Files:**
- `.claude/agents/upgrade-assessor.md` - effort, urgency and the verdict for a major
- `.claude/skills/dependency-updates/SKILL.md` - sends the six libraries' majors to the subagent

**Acceptance:**
- [ ] In a local Claude Code session, ask Claude to have the `upgrade-assessor` subagent assess `temporal-polyfill` 0.3.2 → 1.0.5 as a stand-in (it's imported in 5 files). See a report with each breaking change the app hits and its file counts, how long 0.3.x keeps getting fixes, the benefit section, and a verdict that weighs them. Proves: a major's assessment gives Sarah effort, urgency and gain to decide on.

# Implementation
