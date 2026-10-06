---
name: rule-placement
description: Where a rule or convention in this repo lives (a doc, AGENTS.md, a shared-rule skill or the one skill or agent that uses it) and how other files refer to it. Use when deciding where a new or changed rule goes, or when writing a skill or agent that relies on a rule kept elsewhere.
user-invocable: false
---

# Placing Rules
Each rule lives in exactly one place, chosen by who needs it and when that place loads. A rule kept in one place can't drift into two versions, and a rule that loads only where it's needed doesn't take attention from every session that doesn't.

## Where a Rule Goes
A rule is either about the codebase itself or about how agents work, called an agent rule here. The places differ in what they hold and when they load:
- **A rule about the codebase itself,** such as its structure, code conventions, styling or tests: a doc in `docs/`. The docs describe the codebase for anyone working on it, and they're read when a task needs them. An agent rule never goes in a doc, even when it concerns code, such as how a story treats the files it touches or how an agent reports back.
- **An agent rule every session needs:** AGENTS.md, which loads into every session and every subagent.
- **An agent rule several skills or agents use, but not every session:** a shared-rule skill with `user-invocable: false`, like `running-the-app`. It loads only when a session invokes it or an agent preloads it, so sessions that don't need it pay only for its description.
- **An agent rule only one skill or agent uses:** that skill or agent, even when the rule is narrow, such as a threshold that applies at a single step. Putting it anywhere else loads it for sessions that never use it.

## Referring to a Rule Kept Elsewhere
A skill or agent never restates a rule kept in AGENTS.md, a doc or a shared-rule skill, because two copies drift apart. Where a skill needs to say that the rule applies at a certain point, it names where the rule lives: "as AGENTS.md describes under ...", "as `unit_tests.md` describes", "as the `running-the-app` skill describes". An agent that needs a shared-rule skill preloads it with `skills:` in its frontmatter.

The reverse holds too: a shared-rule skill holds only the shared rule. Which skill uses it, at which step, and who does what go in each skill that uses it, never in the shared-rule skill, because each skill knows its own steps and a list kept in the shared rule goes stale as skills change.

## Repeats and Differences
When a skill or agent covers a rule that's kept elsewhere, how to handle it depends on its wording:
- **If it's a plain repeat,** remove it without asking Sarah. This includes procedure lines, such as a step that says to go through approvals "one at a time", which only repeats AGENTS.md's rule on questions.
- **If its wording differs from the rule,** ask Sarah whether the difference is a deliberate exception or drift. Keep an exception in the skill or agent, and remove drift.
