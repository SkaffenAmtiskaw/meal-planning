---
name: tooling
description: Make one change to the agent workflow or dev tooling (skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs, tooling config) in a single session, then clean up every note that refers to it. Tooling only; product stories use the story lifecycle.
argument-hint: "[note name, an item in a note, or a description of the change]"
disable-model-invocation: true
---

Make this workflow or tooling change: **$ARGUMENTS**

## Why this skill works the way it does
The agent workflow is being overhauled, and tooling changes skip the story lifecycle (`/shape`, `/decide`, `/plan-steps`, `/implement`, `/review`, `/close`). That lifecycle exists so product code is built and reviewed in small pieces. A change to a skill or a convention is small enough to understand whole, and Sarah reviews it directly. Workflow notes (`type: workflow`, usually in `notes/features/tooling/`) are only a place to keep track of ideas until she gets to them. They have no `status`: `/tooling` does the change and deletes the note. A workflow note with a What Belongs Here section is different: it collects items over time, like Docs Updates. `/tooling` does one of its items per session, or a group of logically related items when Sarah agrees, and the note stays.

So one session does it all: find out what Sarah wants, make the change everywhere it reaches, then leave the notes matching what now exists. One change per session. When it's done, stop.

Sarah decides what changes. Your job is to understand it fully and carry it through, not to redesign it. If you think another approach would work better, say so once with the reason, then do what she decides.

## 1. Find out what's changing
This skill is for changes to how the app is built (skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs, tooling config), never to what the app does. Check that first.

The argument is one of:
- **A note name:** find it in `notes/` and check its `type`:
  - `workflow` with a What Belongs Here section: a collecting note. List its items, one line each, and point out any that are logically grouped, such as several rules that all land in the same doc. Ask Sarah which item or group this session does. That item or group is the change.
  - `workflow` without one: read all of it. The whole note is the change unless Sarah says otherwise.
  - blank, in `notes/features/tooling/`: a tooling note from before the workflow type existed. Ask Sarah whether it's a workflow note. If it is, give it `type: workflow`, remove its `status`, set its `^status` line to "Next: /tooling", and go on.
  - anything else: it's story work. Tell Sarah it belongs in the story lifecycle, and stop.
- **An item in a note:** find it and read the note around it. Check the note's `type` the same way.
- **A description:** Sarah's own words. App code changed only as a side effect, such as files reformatted by a new lint rule, is fine. If it would change what the app does for its users, tell her it belongs in the story lifecycle, and stop. Otherwise, search `notes/` for notes and items about the same thing and tell her what you found. They may already hold details or decisions.

Then read the files the change touches: the skills, agents, hooks, docs or config it names, plus Note Conventions or AGENTS.md if it changes how notes or sessions work. Read only what it touches.

## 2. Settle it with Sarah
Ask what you need to make the change without guessing. Skip anything the note or Sarah has already answered. What often needs asking:
- where the change belongs, when it could go in more than one place (a skill, an agent, AGENTS.md, Note Conventions, `docs/`)

The docs in `docs/` describe the codebase itself, never how agents work. If an agent rule is shared by several skills or agents but doesn't belong in every session, it goes in its own skill with `user-invocable: false`, like `running-the-app`. The skills that need it point to it by name, and agents that need it preload it with `skills:` in their frontmatter.
- the note's open questions

Then find everything the change reaches. Search `.claude/`, `AGENTS.md`, `notes/Note Conventions.md`, `notes/templates/`, `docs/` and `scripts/` for the skill, agent, rule or term being changed. A renamed skill, a new note type or a changed rule is usually referenced in several places, and each reference is part of this change.

## 3. Make the change
Size decides whether to draft first:
- **Small, clear edits:** a line or a few, where the wording follows directly from what Sarah said. Write them.
- **Anything larger:** rewriting a section, or a new skill, agent, hook, template or doc. Show Sarah the draft of each file and wait for her approval.

While making it:
- **Claude Code features** (skill frontmatter, hooks, subagents, rules): check the current Claude Code docs, never memory.
- **New skills and agents** follow the shape of the existing ones in `.claude/skills/` and `.claude/agents/`. A skill carries or points to only the parts of shared docs it uses, never a whole long doc.
- **Naming a new or renamed skill:** check the name, and each alias, against the skills in your own skill list and the built-in commands and bundled skills on the current Claude Code [commands page](https://code.claude.com/docs/en/commands). If it matches one, pick another name. Otherwise, ask Sarah to type `/<name>` in the Code tab and say whether anything built in comes up, because the docs can miss an alias: the desktop app's `/workflows` has a `workflow` alias the docs don't list, and it caught the old `/workflow` skill.
- **Writing instructions** in a skill or agent: put the condition first ("If ..., do Y. Otherwise, do X."). Never write an instruction followed by its exception in a later sentence ("Do X." then "Don't do X when ..."), because agents act on the plain instruction and miss the exception.
- **Readable as a whole:** Sarah reads each draft as prose, so reread every passage you changed from start to finish before showing it. If an addition is a separate idea, give it its own paragraph or bullet. If it's a case of an existing rule, rebuild the rule around its cases, such as sub-bullets, rather than wedging a sentence into the middle. Say in full what an agent does: what it asks, about what, and what happens with each answer. Never use shorthand like "asks Sarah them".
- **AGENTS.md, the docs and shared-rule skills:** AGENTS.md is loaded into every session and every subagent, the docs in `docs/` are read when a task needs them, and a shared-rule skill loads when it's relevant or when an agent preloads it. If a rule is already in one of them, a skill or agent never restates it, because two copies drift apart. Where a skill needs to say that a rule applies at a certain point, it points to the AGENTS.md section, the doc or the shared-rule skill by name ("as AGENTS.md describes under ...", "as `unit_tests.md` describes", "as the `running-the-app` skill describes"). If a skill's or agent's wording differs from one of them, ask Sarah whether it's a deliberate exception or drift. Keep an exception in the skill or agent, and remove drift.
- **Project config:** Sarah asking for this change is the explicit instruction AGENTS.md requires, but only for the config it names.
- **OpenCode agents** in `.opencode/agents/` stay until the whole move to Claude Code is finished, even when a Claude skill replaces one.
- **Code, config or scripts:** run `pnpm lint` and `pnpm check:types`. Test a hook or script by running it with sample input.

When everything is written, triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes part of this change: make it the same way. Then show a table with one row per changed file: the file as a markdown link she can click, and a one-line summary of its change. Files with the same change can share a row. Ask Sarah whether she approves.

## 4. Clean up the notes
Once she approves, bring the notes in line with the change. Search all of `notes/`, including `archive/` and the Roadmap, for:
- the note or item this session worked from
- items elsewhere that this change does or settles, such as a sweep item, a Docs Updates item or another note's open question
- text the change made wrong, such as a `^status` line naming a renamed skill, or a note describing the old workflow

Handle each one:
- **Sarah's comments:** if one is now done or out of date, handle it as AGENTS.md describes under "Editing notes". The bullets below are for everything else.
- **Done in full:** remove it, with no line recording that it was removed. How depends on what it is:
  - **An item in a collecting note:** remove only the item. The note stays. If the item ended with a 🎯 goal link, remove that link from the note's Roadmap line unless another item still carries it. If that leaves the note this session worked from with no items, ask Sarah whether it should keep collecting or be deleted. If it's deleted, handle it as a whole note (next bullet).
  - **A whole note:** if it holds something worth keeping for reference, such as a rationale or a convention, ask Sarah whether a doc should cover it. Then delete it with `rm`, as AGENTS.md describes under "Git and files". Then remove its Roadmap line, and reword or remove every link to it.
  - **Anything else,** such as an item in a story note: remove it.
- **Partly done:** remove the done parts and keep the rest.
- **Out of date:** if it's a story note's plan, never rewrite it. Add a Check Drift callout as AGENTS.md describes. Otherwise, if there's one right fix, make it. If there's a real choice, propose the wording and wait.

Don't bring other notes up to a convention this change introduced. They're updated when next worked on.

Last, check every file in `notes/` that isn't a note (images, `.dc.html` prototypes, scripts, SVGs), except `notes/templates/`. Search `notes/` for its filename. If nothing references it, delete it as AGENTS.md describes under "Git and files".

## 5. Report and stop
Route the out-of-scope list as AGENTS.md describes. Then tell Sarah, in the same table format as step 3:
- each file changed, and why
- each note edited or deleted
- each unused file deleted

Leave every change unstaged. Stop there, and don't start another change.
