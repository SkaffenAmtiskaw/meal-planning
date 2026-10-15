---
name: keeping-sessions-lean
description: How agent instructions keep each session loading only the instructions it uses. Use when creating or changing a skill or agent, or deciding what a skill reads, what it hands to a subagent or whether to split it.
user-invocable: false
---

# Keeping Sessions Lean
Each session should load only the instructions it uses, because instructions a session doesn't use still take attention from the ones it does. Agent instructions load into a session at different times:
- AGENTS.md loads into every session and every subagent, and the memory index into every session.
- Most skill and agent descriptions load into every session.
- A skill's body loads on each run, and its supporting files and the files it reads load when it reads them.
- A shared-rule skill loads when a session invokes it or an agent preloads it.

The ways to keep a session to the instructions it uses each fit a different shape of problem:
- A rule goes where only the sessions that need it load it. The `rule-placement` skill says where each kind of rule goes, including the next two.
- A procedure several skills follow goes in a shared-rule skill.
- A rule only one branch of a run needs goes in a supporting file.
- A skill points to the section of a long shared file it needs rather than loading the whole file, as "What a Skill Reads" describes.
- A step that reads a lot to reach a short answer goes to a subagent, as "When to Hand Work to a Subagent" describes.
- A skill whose modes share little splits into separate commands, as "When to Split a Skill" describes.

## What a Skill Reads
Each file a skill or agent tells the agent to read loads in every run of it, and since nearly every session runs a skill, a shared file that many skills read loads in nearly every session. So give each file a skill reads a reason from its steps. If it needs only part of a long shared file, such as Note Conventions, point to the section it needs, or state the one fact it uses as `rule-placement` allows, rather than loading the whole file.

## When to Hand Work to a Subagent
A subagent works in its own context, with its instructions in its agent file, and only its report comes back to the session that called it. If a step needs the user's answers along the way, or the session needs what the step reads, such as the files it will edit next, keep the step in the session, since a subagent can't ask the user anything. Otherwise, if the step reads a lot to reach a short answer, such as comparing a note's remaining work against the code, hand it to a subagent, so the session loads only the answer, not the step's instructions or everything it read.

## When to Split a Skill
Split a skill by mode when a run takes one of several paths chosen at its start, such as by the note's type, and the modes truly share little, so each run loads only its own mode. Each mode becomes its own command. A step more than one mode truly needs becomes a step in each of them, with its procedure in a shared-rule skill they all name. To judge how much the modes share, ask of each step that looks shared whether every mode needs it as written, or whether one mode was fitted into steps written for another. A skill full of mode branches makes every run read past the steps it doesn't take, while a new command costs the user little, since the Roadmap says what to run on each story.

A SKILL.md over about 5,000 tokens, or a variant woven through many of a skill's steps, is a sign to check the skill against this section, but isn't a reason to split on its own: a long skill can do one job and a short one several, so what decides a split is how much the modes share.
