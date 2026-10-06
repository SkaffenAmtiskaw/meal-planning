---
type: 
status: idea
confirmed: 2026-10-06
---
# Where It Stands
Next: /shape ^status

# Notes
Define what good docs and good agent instructions look like in this repo, which might not be the same, and make sure every agent that edits them can read that while it's editing them, and only then. Sarah, 2026-10-06, during `/tooling` on [[Agent Workflow Changes 2026-10-02]]: "I'd like it to not just make sure agents read them as a whole, I want them to actually make them good. Sometimes agents read it as a whole but still propose a jumbled mess of bullet points. This means we need to define what 'good' looks like." And: "I don't want a massive dump into context of what good doc looks like for every agent. I want to make sure it only reads what good doc looks like when it is actually editing docs." The slimming pass in [[Agent Workflow Changes 2026-10-02]] waits on this story, and [[Docs Audit]] then checks the existing docs against the standard it sets.

It became a story during that `/tooling` session because it's too big for one: it needs research into published doc best practices and several decisions from Sarah, such as whether docs and agent instructions share one standard, what form the standard takes so it loads only when an agent edits these files, and which skills and agents point to it.

**Skill and doc edits read as a whole** - When an agent changes a skill, an agent, AGENTS.md or a doc, it finds the exact spot that needs the change and edits only there, without checking how the change fits the whole document, so rules get wedged in and documents read as patches. `/tooling` has guidance against this ("Writing instructions" and "Readable as a whole" in step 3), but only `/tooling` sessions see it, while `/implement`, `/final-review` and `/check-drift` edit skills and docs too. Move the guidance where every session that edits those files reads it, such as a rule file in `.claude/rules/` scoped to `.claude/skills/**`, `.claude/agents/**`, `AGENTS.md` and `docs/**`, the way `note-conventions.md` loads Note Conventions, and take it out of `/tooling`. The slimming pass then rebuilds the passages already written that way as it goes. [Sarah] - I wonder if it should even be expanded into a "what good doc looks like" document, talking about things like organization and clarity of language. Or maybe we should make a `doc-linter` skill/subagent of some sort.

Docs are worded as descriptions of the codebase, not instructions to an agent, and are less prescriptive than they are today. Sarah noted 2026-09-28, while `/tooling` worked through [[Docs Updates]], that she'd never have given people a rule like the 3-test-file threshold in "Creating Centralized Mocks" in `docs/unit_tests.md`; she'd have called out messy mocks in a PR. `/tooling` says only that docs describe the codebase, not how they're worded, so the outcome may need a line there so new docs don't drift back.

Agent instructions that write docs should describe what a good doc looks like, rather than carry narrow rules about particular doc sections. ([Sarah] - Maybe a shared skill rather than a meta document about what good doc looks like.) A pattern note's Rules, with their Checks and Enforcement, are planning material. The doc that grows from them is a guide for whoever does the work: what to do, where things go and why, with enforcement at most a closing paragraph for anyone who needs to change it. Found 2026-09-29 while implementing Step 3 of E2E Test Setup, whose Approach said "Each Rule keeps its Check"; Sarah said the bulk of a doc shouldn't focus on rules or enforcement.

A good doc also reads as one piece after every change. Sarah noted 2026-09-29, in the same session, that agents tend to insert paragraphs into docs wherever they happen to fit. Whatever describes good docs should cover this: an addition means rereading the section it lands in and restructuring it, not appending text.

Claude's memories for this repo already hold rules on good docs and instructions: `docs-are-guides-not-rule-lists`, `restructure-for-readability`, `condition-before-instruction` and `describe-what-is-not-what-isnt`. Sarah said 2026-10-06 that the last belongs in memory, not the codebase.

[Sarah] - Also in this audit we should do a check for human-readability. If the `docs/` directory is supposed to be read by both humans and agents, we need to make sure that the organization and prose is human-friendly. We also should make sure knowledge isn't assumed. An agent might have a consistent knowledge baseline but humans don't.

[Sarah] - Apparently there's published best practices for docs (the decision agent for Vercel Deploy errors referenced Google and Diátaxis). We should research best practices and come up with a list our docs should follow.

[Sarah] - We should add somewhere in this that I have a very slight preference for title-cased headers. It's not so strong a preference I'd ever reject work based on not having it, but I like it better.

# Questions
