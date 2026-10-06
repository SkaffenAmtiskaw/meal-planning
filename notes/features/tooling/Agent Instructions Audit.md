---
type: cleanup
status: idea
blocked-by: []
confirmed: 2026-10-06
---
# Where It Stands
Decisions made. Next: /investigate ^status

Shaped 2026-10-06 as a cleanup: `/investigate` scans every agent instruction file against the `writing-standard` skill and records where each falls short, then the fixes are planned in steps. `/decide` settled both decisions the same day: when a skill is split, and that Note Conventions loads on demand rather than whenever a skill or agent file is read. The split criterion also joins the story as a new section in `writing-standard`.

# Inbox
- From `/decide` on this note, 2026-10-06: AGENTS.md says implementation details that don't change what Sarah sees are the agent's call ("Her decisions can change" and "What to ask about"). Even so, the session reminded Sarah three times that loading Note Conventions on demand reverses [[Notes Vault Repo]] decision 3, which is only about how a file loads but is marked "Sarah's call". The mark and the "Her call, or what the app does: stop and ask" bullet outweighed the line about implementation details. Find out why that line didn't land, and fix the wording.
- From `/final-review` on What Makes a Good Doc, 2026-10-06: the `lean-skill-context` memory carries the rule in `.claude/skills/tooling/SKILL.md:68` that a skill carries or points to only the parts of shared docs it uses, never a whole long doc. The memory also says more: it uses Note Conventions as the example and says to justify every doc a skill reads with a reason from its steps. Move whatever the skill doesn't already hold to where `rule-placement` says it belongs, then delete the memory and its `MEMORY.md` line.
- From `/final-review` on What Makes a Good Doc, 2026-10-06: `.claude/skills/architect/SKILL.md:51` makes its own call on where a pattern's Rules land ("usually a section of `docs/project_conventions.md`") instead of pointing to `rule-placement`. It agrees with `rule-placement` today, since pattern Rules are about the codebase, and it's a rule only `/architect` uses. Check whether it should point to `rule-placement`.

# Purpose
Check every agent instruction against the standard the `writing-standard` skill sets, and slim it down to what the agent needs. Sarah, 2026-10-06: "I mostly expect this to be just like Docs Audit but for agent files. It audits them all and makes sure they conform to the standard set forth in What Makes a Good Doc."

[Sarah] Agents are starting to disregard their instructions, doing things like saving notes in `.scratch`. This is almost certainly a context problem - they have too many instructions. We need to go through the agent instructions and look for sections which can be slimmed down and still retain the information the agent needs. I also wonder if we need to evaluate whether certain skills are trying to do too much, and should be separated into separate skills that share rules between them.

The agent instructions are AGENTS.md, every skill in `.claude/skills/` with its supporting files, every agent in `.claude/agents/`, the note templates in `notes/templates/`, Note Conventions, the Roadmap's "How this file works" section, and Claude's memory folder (`MEMORY.md` and the memory files). The standard itself stays as it is, so `writing-standard` and `rule-placement` are checked but not reworked, apart from the split section below. Apart from the `/infra-design` pass below and any skill splits, what each skill and agent does stays the same, and only its wording changes.

**A pass over `/infra-design` for repetitive or unnecessary work** - Sarah decided 2026-10-05 that infra stories skip `/plan-steps` and that `/infra-design` writes a Build Order into the Design instead. That makes `/infra-design` sessions longer, so go through `.claude/skills/infra-design/SKILL.md` and the agents it calls, including its Build Order step, and cut any work that repeats itself or isn't needed.

**A section in `writing-standard`'s `instructions.md` on when to split a skill** - decision 1's criterion goes into `.claude/skills/writing-standard/instructions.md`, so later skill changes follow it and skills don't grow back into several jobs. Sarah decided 2026-10-06 to add it to this story.

**Note Conventions loads on demand** - decision 2: Note Conventions stops loading through `paths` and loads only when a session reads it. The `.claude/rules/note-conventions.md` symlink and Note Conventions' `paths` frontmatter go, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to Note Conventions. Sarah decided 2026-10-06 to make it in this story.

It's a story rather than a `/tooling` change because it's too big for one session: it reads every skill, every agent and AGENTS.md against the standard.

[Sarah] - `final-review` flags implementation details that differ from the written plan - this goes against my understanding of what it would do which was to judge if the story accomplished it's purpose, but then judged the implementation details against best practices and project conventions - otherwise this just tests that implementation followed the spec and that's not what I want from the skill - ALSO it is not making any differentiation between aspects of the spec I wanted and parts of the spec I merely approved

# Current State

# Open Decisions
1. When should a skill be split into separate skills that share rules?
   - **Decided 2026-10-06:** A skill is split by mode when a run takes one of several paths chosen at its start, such as by the note's type, and the modes truly share little. Each mode becomes its own command, and steps both modes truly need are written into each. How much they truly share is judged skill by skill: for each step that looks shared, the scan asks whether every mode needs it as written, or whether one mode was fitted into steps written for another. A procedure more than one skill follows becomes a shared-rule skill, as `rule-placement` describes, and a branch that sits in one place in a run goes to a supporting file. A SKILL.md over about 5,000 tokens, or a variant woven through many of a skill's steps, is a smell: it gets a closer look, not a split on its own. Sarah's call: new commands cost her little, since the Roadmap says what to run on each story. Checked against the code and notes.
     - Rejected: never split, only move branches into supporting files - it leaves skills full of mode branches.
     - Rejected: split by length - a short skill doing several jobs would pass, so length is only a smell.
     - Rejected: keep one command per lifecycle step, with `/implement` handing an infra note to a variant skill - the variant could run without `/implement`'s checks and config hook, and Sarah doesn't need few commands.
2. Should Note Conventions stop loading whenever a session reads a file in `.claude/skills/` or `.claude/agents/`?
   - **Decided 2026-10-06:** Yes. Note Conventions moves out of `.claude/rules/` and loads on demand: a session that needs the map reads it, as `/tooling` and `/shape` already do, and AGENTS.md's "Anything bigger, outside a skill" line points a session that changes a skill or agent to it. Reading a skill or agent file doesn't mean a session needs the map, so a read trigger loads it mostly where it isn't used, such as every `/implement` run.
     - Rejected: keep the `paths` trigger on `.claude/skills/**` and `.claude/agents/**` - it loads about 1,900 words into every `/implement` run, and makes decision 1's supporting files cost more context than they save.
     - Rejected: narrow `paths` to `.claude/skills/*/SKILL.md` and `.claude/agents/*.md` - reading another skill's SKILL.md still loads it into sessions that don't need it.

# Out of Scope
- The docs in `docs/` and `README.md`: [[Docs Audit]].
- Story notes in `notes/`, apart from updating their references to a skill this story splits.

# Acceptance Criteria

# Implementation
