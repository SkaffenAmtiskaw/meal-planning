---
type: infra
status: spec
blocked-by: ["[[Infra Stories Without Steps]]"]
confirmed: 2026-10-04
---
# Where It Stands
Blocked by [[Infra Stories Without Steps]]; then /infra-design. Building waits on [[Dependency Update PRs]] ^status

Split from [[Local Dependency Update Alerts]] on 2026-10-04 during `/plan-steps`. Its three implementation steps were planned and approved on 2026-10-04. Nothing is built yet. Sarah decided 2026-10-05 that it waits for [[Infra Stories Without Steps]] and then goes back to `/infra-design` to replace its steps with a Build Order.

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

# Implementation
Facts the steps rely on, checked 2026-10-04:
- **No backlog to check with.** [[Dependency Update PRs]]'s first run puts every backlog minor in its first PR without a summary or an assessment, so the minors outstanding today (`@mantine/core` 9.6.3, `react` 19.3.0, `zod` 4.6.5, `better-auth` 1.7.7, `@tabler/icons-react` 3.48.0, `resend` 6.32.0) are probably merged by the time this story is built. Each check uses an update that `pnpm outdated` lists on `develop` when the step is built, which the implementer picks once no dependency PR is open. None of the six assessed libraries has a new major out.
- **The routine's token.** [[Dependency Update PRs]] Step 9 puts the token in the Actions secret `ROUTINE_DEPENDENCY_UPDATES_TOKEN`, where it can't be read back. Sarah decided 2026-10-04 while planning: before Step 1's check she regenerates it, pastes the new one into the secret and keeps a copy until Step 2's check is done, as for [[Major Upgrade Sweeps]].
- **Where the session reads release notes.** Piece 4 sub-step 4 has the session read release notes on `github.com` and `raw.githubusercontent.com`. Not yet confirmed: `docs/ci.md` says GitHub goes through its own proxy, and its setup script's comments say that proxy blocks downloads from repos not attached to the session, so a cloud session may not reach other projects' release pages or raw changelogs. [[Major Upgrade Sweeps]] checks the same thing before its step 5 is built. Whichever story is built first finds out.
- **Pushing before checks.** A routine runs the skill as it is on `develop` (`routine-sessions`), so each step's skill and subagent changes are pushed to `develop` before its checks.

## Step 1: Minor updates get a release summary
**Idea:** Each minor of a package outside the six assessed libraries gets a release summary that ends in an adoption call.

**Source:** Piece 4 sub-step 4 (every other minor gets a summary and a quick analysis; release notes from GitHub releases and the changelog on `github.com` and `raw.githubusercontent.com`); Piece 4 sub-step 8 (the summary's minor summaries); Goal: a minor update gets a summary of what the release adds and a quick analysis of whether there's anything the app should adopt; Design decision: besides its PR, a minor gets a summary and a quick analysis. Sarah decided 2026-10-04 while planning: the checks call the routine with `curl` and a regenerated token. Work the story needs: release notes the session can't read are named in the summary, since the GitHub reads may be blocked in the cloud, as [[Major Upgrade Sweeps]] does for majors.

**Approach:**
- **Implementer, before building:** confirm that a session on the `Meal Planning Routines` environment can read a package's GitHub release page and its raw `CHANGELOG.md` for a repo the session isn't attached to (for example `resend/resend-node`), the way the skill will read them. If [[Major Upgrade Sweeps]] has already been built, use what its implementer found. If the implementer can't start such a session, Sarah starts one at https://claude.ai/code with that environment and pastes the result. If the reads are blocked, stop and bring it to Sarah, since it changes Piece 4 sub-step 4's design.
- `.claude/skills/dependency-updates/SKILL.md` step 4: for each minor of a package other than React, Next, Mantine, better-auth, luxon or Zod (Step 2 sends those six to the `upgrade-assessor` subagent instead, for a fuller analysis), the session reads the release notes between the version on `develop` and the new one, from the package's GitHub releases or changelog. It summarizes what they add, with links to them, and says in a line or two whether the app should adopt any of it, searching the code where a feature might apply and naming the files. If it can't read the release notes, the summary says so and names the site it couldn't reach. A minor that sub-step 3 dropped from the PR, because it broke a check, still gets its summary, since it tells Sarah what the fix would bring.
- `SKILL.md` step 8: the summary holds each minor's summary, after what's in the PR.
- `docs/ci.md`: if the `dependency-updates` entry under "Routines" describes what happens to minors, update it.
- **Implementer:** in a local session, run step 4 on a payload naming a made-up minor of a real package, whose release notes don't exist, and confirm the summary says it couldn't read them and names the site.
- Once Sarah has merged or closed any open dependency PR, the implementer picks two minors of packages outside the six that `pnpm outdated` lists on `develop`: one whose release adds something the app could use, and one whose release doesn't. It gives Sarah the full `curl` command in chat, ready to paste, with the URL, the token and the payload filled in. If there aren't two such minors, tell Sarah before the check and let her decide how to cover it.
- **Setup Sarah does by hand before the check:** on the `dependency-updates` routine's API trigger (https://claude.ai/code/routines → the routine → Edit → **Select a trigger** → **API**), **Regenerate** the token. Paste it into the Actions secret `ROUTINE_DEPENDENCY_UPDATES_TOKEN` (repo Settings → Secrets and variables → Actions → the secret → Update), and keep a copy until Step 2's check is done.
- Sarah pushes the skill to `develop` before the check. The check's PR is a real dependency PR, which she merges or closes as usual.

**Files:**
- `.claude/skills/dependency-updates/SKILL.md` - minor release summaries
- `docs/ci.md` - only if its `dependency-updates` entry describes what happens to minors

**Acceptance:**
- [ ] With no dependency PR open, run the `curl` command the implementer gives you in chat. See the session's summary give each of the two minors what its releases since the version on `develop` add, with links to them. See the first minor's adoption line name the files where the app would use it, and the second's say there's nothing to adopt. Proves: a minor update's release notes reach Sarah with an adoption call, read from GitHub in the cloud.

## Step 2: Minors of the six libraries get the assessor's benefit analysis
**Idea:** A minor of React, Next, Mantine, better-auth, luxon or Zod goes to the new `upgrade-assessor` subagent for its benefit to the app.

**Source:** Piece 5 (`upgrade-assessor`, `model: opus`, read-only tools; benefit to the app; the verdict for a minor; returns its report to the session; the six docs domains, and checking that the first assessment can read them); Piece 4 sub-step 4 (a minor of the six goes to `upgrade-assessor`); Piece 4 sub-step 8 (the summary's assessments); Piece 7 ("The Cloud Environment": the six domains and why); Flow step 4 (the assessor handles the six libraries' releases); Setup Outside the Repo: six allowed domains; Goal: a minor update gets a summary of what the release adds and a quick analysis (for the six libraries); Design decision: a minor of the six goes to the Opus subagent for the benefit part; Design decision: the routine runs on Sonnet and an Opus subagent writes the assessments. Work the story needs: the assessor cites the pages it read and names any it couldn't reach, so Piece 5's check that the first assessment can read the six domains shows a real result.

**Approach:**
- `.claude/agents/upgrade-assessor.md` (new, `model: opus`, tools `Read`, `Grep`, `Glob`, `WebFetch`, `WebSearch`), following the shape of the other agents in `.claude/agents/`: given a package, the current version and the new one, it reads the release notes and docs. For each new feature or change, it reports whether the app has code it would improve (workarounds it would replace, bugs it would fix, code it would make simpler), with the files and an example of each. `useEffectEvent` replacing dependency-array workarounds is the kind of thing it looks for. A feature with no place to use it gets one line at most. A minor ends with a verdict on whether anything is worth adopting now. It cites the pages it read, and names any page it couldn't reach rather than falling back on what it already knows. It returns its report to the session. The major-only parts come in Step 3.
- `SKILL.md` step 4: a minor of the six goes to `upgrade-assessor`. The summary keeps the minor in what's in the PR, and shows the assessor's report unedited after it, where Step 1 puts the other minors' summaries.
- `docs/ci.md` "The Cloud Environment": the six domains join the allowed list, with why (the assessor reads release notes and migration guides there).
- **Implementer:** before pushing, run the subagent in a local session on the check's minor, and confirm its report has the parts above.
- Once Sarah has merged or closed any open dependency PR, the implementer picks a minor of one of the six that `pnpm outdated` lists on `develop`, and gives Sarah the full `curl` command in chat, ready to paste, with the URL, the token and the payload filled in. If none of the six has one, tell Sarah before the check and let her decide how to cover it.
- **Setup Sarah does by hand before the check:** on https://claude.ai/code, open the cloud environment menu above the message box → `Meal Planning Routines` → edit → **Network access**: keep Custom and the package-manager list, and add `react.dev`, `nextjs.org`, `mantine.dev`, `better-auth.com`, `zod.dev` and `moment.github.io` to the allowed domains, one per line, below `results-receiver.actions.githubusercontent.com`. Save.
- If Sarah's check shows the subagent couldn't reach the docs domains through `WebFetch`, stop and bring it to Sarah, since that changes Piece 5's design.
- Sarah pushes the skill and subagent to `develop` before the check. Once the check is done, she deletes her copy of the token.

**Files:**
- `.claude/agents/upgrade-assessor.md` (new) - assesses a release of the six libraries
- `.claude/skills/dependency-updates/SKILL.md` - sends the six libraries' minors to the subagent
- `docs/ci.md` - the six allowed domains

**Acceptance:**
- [ ] With no dependency PR open, run the `curl` command the implementer gives you in chat, which names a minor of one of the six. In the session, see an `upgrade-assessor` subagent call. See the summary list the minor in what's in the PR, then show the subagent's report unedited: the features added since the version on `develop`, each one the app could use with the files and an example, pages cited on that library's docs site, and a verdict on what's worth adopting now. Proves: a minor of the six goes to the assessor, which reads the library's docs from the cloud and ties new features to the app's code.

## Step 3: Majors of the six libraries get a full assessment
**Idea:** A major of React, Next, Mantine, better-auth, luxon or Zod gets the `upgrade-assessor` subagent's full assessment.

**Source:** Piece 5 (effort, urgency and the verdict for a major); Piece 4 sub-step 5 (a major of the six goes to `upgrade-assessor`, shown unedited; an advisory fixed only by a major counts as one, flagged as a security fix); Piece 4 sub-step 8 (the summary's assessments); Flow step 6 (Sarah asks the session to create notes); Goal: a major update to a library the app depends on heavily gets an assessment of effort and gain; Design decisions: React, Next, Mantine, better-auth, luxon and Zod get one; the assessment stays in the session until Sarah reviews it, and she may ask the session to create a note; it mainly helps her decide when to next draw a goal from [[App Health]], and how much to prioritize the upgrade; a major of `@types/react`, `@types/react-dom` or `@types/luxon` goes with its library.

**Approach:**
- `upgrade-assessor.md`: for a major, it adds three parts. The effort: each breaking change from the migration guide and release notes that the app actually hits, with file counts. The urgency: how long the current major keeps getting security fixes, and any advisory only the new major fixes. The verdict: benefit and urgency weighed against effort, not a ranking on security alone. The verdict says how soon the upgrade is worth planning, for deciding when to next draw a goal from [[App Health]], and how high to rank it among other work.
- `SKILL.md` step 5: a major of the six, or an advisory of one of them that only a major fixes, goes to `upgrade-assessor`, replacing [[Dependency Update PRs]]'s listing (release notes link, "not applied"). A major of `@types/react`, `@types/react-dom` or `@types/luxon` in the same run goes to the assessor with its library, so the effort counts its changes, and the summary lists it beside the report. One that comes without its library's major isn't sent to the assessor on its own: the summary lists it as part of that library's upgrade. If [[Major Upgrade Sweeps]] is already built, its step 5 already has a line for these three packages, so the implementer extends that line rather than adding a second one. The summary shows the report unedited, still marked "not applied" (and flagged as a security fix for an advisory), and ends with the offer to create a note for the upgrade. A note Sarah asks for follows `routine-sessions`, like any other change the session makes.
- None of the six has a new major out, so Sarah's check runs the subagent in a local session on a real major of another package as a stand-in. **Implementer:** confirm the routing with local runs of the skill's step 5, on a throwaway branch that's never pushed:
  - A made-up major of one of the six: see it handed to the subagent.
  - A made-up advisory of one of the six that only a major fixes: see it flagged as a security fix.
  - A made-up React major plus an `@types/react` major: see both go to the assessor together, with the types major listed beside the report.
  - The `@types/react` major alone: see it listed as part of React's upgrade, with no assessor call.
- The stand-in is `temporal-polyfill` 0.3.2 → 1.0.5. If it's been upgraded by the time the step is built, the implementer picks another major that `pnpm outdated` lists on `develop`.
- Sarah pushes the skill and subagent to `develop`.

**Files:**
- `.claude/agents/upgrade-assessor.md` - effort, urgency and the verdict for a major
- `.claude/skills/dependency-updates/SKILL.md` - sends the six libraries' majors to the subagent

**Acceptance:**
- [ ] In a local Claude Code session, ask Claude to have the `upgrade-assessor` subagent assess `temporal-polyfill` 0.3.2 → 1.0.5, or the stand-in the implementer names in chat. See a report with:
  - each breaking change the app hits, with its file counts
  - how long the current major keeps getting fixes, or that no support policy is stated, with where it looked
  - the benefit section
  - a verdict that weighs them and says how soon the upgrade is worth planning

  Proves: a major's assessment gives Sarah effort, urgency and gain to decide on.
