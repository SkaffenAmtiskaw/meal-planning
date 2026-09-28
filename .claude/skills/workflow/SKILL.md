---
name: workflow
description: Make one change to the agent workflow or dev tooling (skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs, tooling config) in a single session, then clean up every note that refers to it. Tooling only; product stories use the story lifecycle.
argument-hint: "[note name, an item in a note, or a description of the change]"
disable-model-invocation: true
---

Make this workflow or tooling change: **$ARGUMENTS**

## Why this skill works the way it does
The agent workflow is being overhauled, and tooling changes skip the story lifecycle (`/shape`, `/decide`, `/plan-steps`, `/implement`, `/review`, `/close`). That lifecycle exists so product code is built and reviewed in small pieces. A change to a skill or a convention is small enough to understand whole, and Sarah reviews it directly. Workflow notes (`type: workflow`, usually in `notes/features/tooling/`) are only a place to keep track of ideas until she gets to them. They have no `status`: `/workflow` does the change and deletes the note. A workflow note with a What Belongs Here section is different: it collects items over time, like Docs Updates. `/workflow` does one of its items per session, or a group of logically related items when Sarah agrees, and the note stays.

So one session does it all: find out what Sarah wants, make the change everywhere it reaches, then leave the notes matching what now exists. One change per session. When it's done, stop.

Sarah decides what changes. Your job is to understand it fully and carry it through, not to redesign it. If you think another approach would work better, say so once with the reason, then do what she decides.

## 1. Find out what's changing
This skill is for changes to how the app is built (skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs, tooling config), never to what the app does. Check that first.

The argument is one of:
- **A note name:** find it in `notes/` and check its `type`:
  - `workflow`: read all of it. The whole note is the change unless Sarah says otherwise.
  - `workflow` with a What Belongs Here section: a collecting note. List its items, one line each, and point out any that are logically grouped, such as several rules that all land in the same doc. Ask Sarah which item or group this session does. That item or group is the change.
  - blank, in `notes/features/tooling/`: a tooling note from before the workflow type existed. Ask Sarah whether it's a workflow note. If it is, give it `type: workflow`, remove its `status`, set its `^status` line to "Next: /workflow", and go on.
  - anything else: it's story work. Tell Sarah it belongs in the story lifecycle, and stop.
- **An item in a note:** find it and read the note around it. Check the note's `type` the same way.
- **A description:** Sarah's own words. If it would change what the app does for its users, tell her it belongs in the story lifecycle, and stop. App code changed only as a side effect, such as files reformatted by a new lint rule, is fine. Otherwise, search `notes/` for notes and items about the same thing and tell her what you found. They may already hold details or decisions.

Then read the files the change touches: the skills, agents, hooks, docs or config it names, plus Note Conventions or AGENTS.md if it changes how notes or sessions work. Read only what it touches.

## 2. Settle it with Sarah
Ask what you need to make the change without guessing, one question at a time. Skip anything the note or Sarah has already answered. What often needs asking:
- where the change belongs, when it could go in more than one place (a skill, an agent, AGENTS.md, Note Conventions, `.opencode/docs/`)
- the note's open questions

Then find everything the change reaches. Search `.claude/`, `AGENTS.md`, `notes/Note Conventions.md`, `notes/templates/`, `.opencode/docs/` and `scripts/` for the skill, agent, rule or term being changed. A renamed skill, a new note type or a changed rule is usually referenced in several places, and each reference is part of this change.

## 3. Make the change
Size decides whether to draft first:
- **Small, clear edits:** a line or a few, where the wording follows directly from what Sarah said. Write them.
- **Anything larger:** rewriting a section, or a new skill, agent, hook, template or doc. Show Sarah the draft and wait for her approval, one file at a time.

While making it:
- **Claude Code features** (skill frontmatter, hooks, subagents, rules): check the current Claude Code docs, never memory.
- **New skills and agents** follow the shape of the existing ones in `.claude/skills/` and `.claude/agents/`. A skill carries or points to only the parts of shared docs it uses, never a whole long doc.
- **Project config:** Sarah asking for this change is the explicit instruction AGENTS.md requires, but only for the config it names.
- **OpenCode agents** in `.opencode/agents/` stay until the whole move to Claude Code is finished, even when a Claude skill replaces one.
- **Code, config or scripts:** run `pnpm lint` and `pnpm check:types`. Test a hook or script by running it with sample input.

When everything is written, list each changed file with a one-line summary, and ask Sarah whether she approves.

## 4. Clean up the notes
Once she approves, bring the notes in line with the change. Search all of `notes/`, including `archive/` and the Roadmap, for:
- the note or item this session worked from
- items elsewhere that this change does or settles, such as a sweep item, a Docs Updates item or another note's open question
- text the change made wrong, such as a `^status` line naming a renamed skill, or a note describing the old workflow

Handle each one:
- **Done in full:** remove it, with no line recording that it was removed. A collecting note this session worked from stays: remove only the items it did. If that leaves it with no items, ask Sarah whether it should keep collecting or be deleted. If it's deleted, it goes through the same steps as any whole note below. For any other whole note: if it holds something worth keeping for reference, such as a rationale or a convention, ask Sarah whether a doc should cover it. Then run `git status` on it (if it's untracked or has uncommitted changes, ask before deleting), delete it with `rm`, remove its Roadmap line, and reword or remove every link to it.
- **Partly done:** remove the done parts and keep the rest.
- **Out of date:** if there's one right fix, make it. If there's a real choice, propose the wording and wait. A story note's plan is never rewritten. Add a Check Drift callout as AGENTS.md describes.
- **Sarah's comments:** never edit one. If one is now done or out of date, show it to her and ask whether to remove it.

Don't bring other notes up to a convention this change introduced. They're updated when next worked on.

Last, check every file in `notes/` that isn't a note (images, `.dc.html` prototypes, scripts, SVGs), except `notes/templates/`. Search `notes/` for its filename. If nothing references it, delete it, running `git status` on it first as above.

## 5. Report and stop
Route the out-of-scope list as AGENTS.md describes. Then tell Sarah:
- each file changed, and why
- each note edited or deleted
- each unused file deleted

Leave every change unstaged. Stop there, and don't start another change.
