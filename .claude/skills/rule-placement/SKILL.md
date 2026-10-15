---
name: rule-placement
description: Where a rule or convention in this repo lives and how other files refer to it. Use when deciding where a new or changed rule goes, or when writing a skill or agent that relies on a rule kept elsewhere.
user-invocable: false
---

# Placing Rules
Each rule lives in exactly one place, because a rule kept in one place can't drift into two versions, and that place is chosen by who needs it and when it loads, so a rule doesn't take attention from sessions that never use it.

## Where a Rule Goes
A rule is about the codebase itself, about how the notes vault is organized, or about how agents work, called an agent rule here. The places differ in what they hold and when they load:
- **A rule about the codebase itself,** such as its structure, code conventions, styling or tests: a doc in `docs/`. The docs describe the codebase for anyone working on it, and they're read when a task needs them. An agent rule never goes in a doc, even when it concerns code, such as how a story treats the files it touches or how an agent reports back.
- **A rule about how the notes vault is organized,** which the user reads as well as agents:
  - **What each note type is, the frontmatter, the lifecycle, which skill comes next in each state and where files go:** Note Conventions. It's only a map, so a session that reads it loads no procedures it won't use. A procedure goes in the skill that carries it out, and Note Conventions gets at most the note type's one-line description and its rows in the next-step table.
  - **The format of a note section the user fills in by hand:** that section's comment in its template, the one home for that format. A rule an agent follows when it writes a section goes in its skill.
  - **How the Roadmap is laid out, how goals order its work and what its markers mean:** the Roadmap's "How this file works", which every session that reads the Roadmap sees.
- **An agent rule every session needs:** AGENTS.md, which loads into every session and every subagent.
- **An agent rule several skills or agents use, but not every session:** a shared-rule skill with `user-invocable: false`, like `running-the-app`. It loads only when a session invokes it or an agent preloads it, so sessions that don't need it pay only for its description.
- **An agent rule only one skill or agent uses:** that skill or agent, because anywhere else loads it for sessions that never use it. Where in the skill depends on which runs need it:
  - **If only runs that take one branch need it,** such as how `/shape` splits an idea into several stories: a supporting file in the skill's folder, like `shape/splitting.md`, which the skill reads where that branch starts, so runs that don't take the branch never load it.
  - **Otherwise:** the skill's own file, even when the rule is narrow, such as a threshold that applies at a single step.

## Referring to a Rule Kept Elsewhere
If a skill or agent needs only one fact from a long shared file it would otherwise read, such as Note Conventions, it states that fact, because loading the whole file for one fact costs more than a one-line copy. Otherwise, it never restates a rule kept elsewhere, because two copies drift apart. How it refers to the rule depends on where the rule is kept:
- **If it's in AGENTS.md,** the skill or agent doesn't point to it, because AGENTS.md loads into every session and its rules already apply. If AGENTS.md leaves it to each skill to say when its rule applies, as it does for triaging out-of-scope work, the skill's step says to do it, such as "triage the out-of-scope list", without naming AGENTS.md.
- **If it's kept anywhere else,** such as a doc or a shared-rule skill, the skill or agent names where the rule lives at the point it applies: "as `unit_tests.md` describes", "as the `running-the-app` skill describes". An agent that needs a shared-rule skill preloads it with `skills:` in its frontmatter.

The reverse holds too: a shared-rule skill holds only the shared rule. Which skill uses it, at which step, and who does what go in each skill that uses it, never in the shared-rule skill, because each skill knows its own steps and a list kept in the shared rule goes stale as skills change.

## Repeats and Differences
When a skill or agent covers a rule that's kept elsewhere, how to handle it depends on its wording:
- **If it's the one fact a skill or agent needs from a long shared file it would otherwise read,** keep it, as "Referring to a Rule Kept Elsewhere" describes.
- **If it's a plain repeat,** remove it without asking the user. This includes procedure lines, such as a step that says to go through approvals "one at a time", which only repeats AGENTS.md's rule on questions.
- **If its wording differs from the rule,** ask the user whether the difference is a deliberate exception or drift. Keep an exception in the skill or agent, and remove drift.
