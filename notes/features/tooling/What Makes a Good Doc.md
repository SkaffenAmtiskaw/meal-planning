---
type: infra
status: idea
confirmed: 2026-10-06
---
# Where It Stands
Decisions made. Next: /infra-design ^status

Shaped 2026-10-06 as infra: a standard for good docs and agent instructions, drawn from research, built as tooling that an agent loads only while it edits those files. Its decisions were settled the same day: a shared core plus a part for docs and a part for agent instructions, kept in a shared-rule skill, with no automated checking tool for now. Next, `/infra-design` writes the Goals, Design, Conventions and Build Order. Spun off from [[Agent Workflow Changes 2026-10-02]] during `/tooling` on 2026-10-06, because it needs research and several decisions.

# Inbox

# Purpose
Define what good docs and good agent instructions look like in this repo, which might not be the same, and make sure every agent that edits them can read that while it's editing them, and only then. Docs are the files in `docs/` and `README.md`. Agent instructions are AGENTS.md, skills and agents. Sarah, 2026-10-06, during `/tooling` on [[Agent Workflow Changes 2026-10-02]]: "I'd like it to not just make sure agents read them as a whole, I want them to actually make them good. Sometimes agents read it as a whole but still propose a jumbled mess of bullet points. This means we need to define what 'good' looks like." And: "I don't want a massive dump into context of what good doc looks like for every agent. I want to make sure it only reads what good doc looks like when it is actually editing docs."

The standard applies to edits from the time it exists. The slimming pass in [[Agent Workflow Changes 2026-10-02]] waits on this story, and [[Docs Audit]] then checks the existing docs against the standard it sets.

# Goals
- [ ] An agent that edits a doc or agent instruction produces a good one, not a jumbled mess of bullet points.
- [ ] An agent reads what good looks like only while it's editing docs or agent instructions.

# Open Decisions
1. Do project docs and agent instructions share one standard, or does each get its own?
   - **Decided 2026-10-06:** a shared core plus a part for each. The core holds the writing and editing qualities both share (reading as one piece, conditions before instructions, plain and consistent wording, explaining why, key points first, lists only for truly separate items, title-cased headers), and an agent reads the core plus the part for the kind of file it's editing; where the two differ, the core states the principle and each part says how it applies, so nothing overrides the core. Google's style guide and Anthropic's guidance on instructions agree on how text is worded and organized and differ on audience, voice and form, and keeping each shared quality in one place stops copies drifting.
     - Rejected: two fully separate standards - about half the content would exist twice and drift apart.
     - Rejected: sharing only the editing process - the shared writing qualities would still be written twice, and reading as a whole alone doesn't make a doc good.
2. What form does the standard take, so that an agent loads it only when it's editing docs or agent instructions?
   - **Decided 2026-10-06:** a shared-rule skill (`user-invocable: false`) whose SKILL.md holds the core and says which part to read, with the docs part and the agent-instructions part as supporting files that load only when read. Skills that edit docs or agent instructions point to it by name at the step where they draft, one line in AGENTS.md points any other session to it, and a reviewing agent preloads it with `skills:`. It's the only form that reaches an agent before it drafts and never loads on reads, it follows Anthropic's guidance to put style guides in a skill and split domains into files read only when relevant, and it's this repo's pattern for a shared rule only some sessions need.
     - Rejected: path-scoped rule files in `.claude/rules/` - they load whenever a matching file is read, which is most sessions, and miss AGENTS.md, which loads at launch.
     - Rejected: an edit-gate hook - it fires at the edit, after the draft is written and approved, and needs a settings file routines may not read.
     - Rejected: a reviewer subagent on its own - the writer would still draft without the standard; it could be added later on top of the skill.
3. Is the standard built on a published framework, such as Diátaxis or Google's developer documentation style guide, or is it our own list drawn from research?
   - **Decided 2026-10-06:** our own list drawn from research. Sarah's call.
4. Does the standard get any automated checking from an existing tool, and if so, which one? Candidates:
   - Vale
   - markdownlint (markdownlint-cli2)
   - textlint
   - no tool
   - **Decided 2026-10-06:** no tool for now; the skill carries the standard and review catches the rest. Almost all of the standard is judgment (reading as one piece, explaining why, key points first, lists only for separate items, how prescriptive a doc is, assumed knowledge) that no candidate can check, and the one strong mechanical match, title-cased headings, is a preference Sarah would never reject work over. If [[Docs Audit]] or the slimming pass turns up a recurring mechanical problem such as terms drifting, Vale is the tool to revisit; a reviewer agent on top of the skill is the fit for the judgment-heavy qualities.
     - Rejected: Vale with our own rules - it checks only title case and a word list, adds a Go binary that routine cloud sessions can't install, and would flag most existing skill headings.
     - Rejected: markdownlint-cli2 - it checks Markdown formatting, not anything in the standard, and its defaults clash with how the repo's docs and skills are written.
     - Rejected: textlint - its English rules date from 2020-21 and it checks less than Vale for more assembly work.

# Design
Questions for this section:
- Which sources does the research behind the standard draw on?
- Which skills and agents point to the standard? Research for Open Decision 2 found these edit docs or agent instructions today: `/tooling`, `/implement` (`SKILL.md` and `cleanup.md`), `/final-review`, `/check-drift` and `/close`, plus the AGENTS.md "Doc gaps" drafting bullet. No agent in `.claude/agents/` can edit files, so only a reviewing agent would preload it.

From the idea:
- **Skill and doc edits read as a whole** - When an agent changes a skill, an agent, AGENTS.md or a doc, it finds the exact spot that needs the change and edits only there, without checking how the change fits the whole document, so rules get wedged in and documents read as patches. `/tooling` has guidance against this ("Writing instructions" and "Readable as a whole" in step 3), but only `/tooling` sessions see it, while `/implement`, `/final-review` and `/check-drift` edit skills and docs too. Move the guidance into the shared-rule skill Open Decision 2 picked, where every session that edits those files reads it, and take it out of `/tooling`. The slimming pass then rebuilds the passages already written that way as it goes.
- `/tooling` says only that docs describe the codebase, not how they're worded, so the outcome may need a line there so new docs don't drift back.
- Claude's memories for this repo already hold rules on good docs and instructions: `docs-are-guides-not-rule-lists`, `restructure-for-readability` and `condition-before-instruction` move into the standard, and their memory files are deleted once it exists. `describe-what-is-not-what-isnt` stays in memory: Sarah said 2026-10-06 that it belongs there, not in the codebase.

# Conventions
What the standard should cover, from the idea:
- Docs are worded as descriptions of the codebase, not instructions to an agent, and are less prescriptive than they are today. Sarah noted 2026-09-28, while `/tooling` worked through [[Docs Updates]], that she'd never have given people a rule like the 3-test-file threshold in "Creating Centralized Mocks" in `docs/unit_tests.md`; she'd have called out messy mocks in a PR.
- Agent instructions that write docs should describe what a good doc looks like, rather than carry narrow rules about particular doc sections. A pattern note's Rules, with their Checks and Enforcement, are planning material. The doc that grows from them is a guide for whoever does the work: what to do, where things go and why, with enforcement at most a closing paragraph for anyone who needs to change it. Found 2026-09-29 while implementing Step 3 of E2E Test Setup, whose Approach said "Each Rule keeps its Check"; Sarah said the bulk of a doc shouldn't focus on rules or enforcement.
- A good doc also reads as one piece after every change. Sarah noted 2026-09-29, in the same session, that agents tend to insert paragraphs into docs wherever they happen to fit. Whatever describes good docs should cover this: an addition means rereading the section it lands in and restructuring it, not appending text.
- [Sarah] - Also in this audit we should do a check for human-readability. If the `docs/` directory is supposed to be read by both humans and agents, we need to make sure that the organization and prose is human-friendly. We also should make sure knowledge isn't assumed. An agent might have a consistent knowledge baseline but humans don't.
- [Sarah] - Apparently there's published best practices for docs (the decision agent for Vercel Deploy errors referenced Google and Diátaxis). We should research best practices and come up with a list our docs should follow.
- [Sarah] - We should add somewhere in this that I have a very slight preference for title-cased headers. It's not so strong a preference I'd ever reject work based on not having it, but I like it better.

# Out of Scope
- Bringing the existing docs, including `README.md`, up to the standard: [[Docs Audit]].
- Slimming the existing agent instructions: the slimming pass in [[Agent Workflow Changes 2026-10-02]].
- Notes in `notes/`, their templates and Note Conventions.
