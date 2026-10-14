---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **A memory to move, from Feature Shape Review on 2026-10-14:** [[Memory Folder Review]] moves the `general-mechanism-over-one-case` memory into `scope-router`'s workflow-note case, saying it applies to workflow features, unlike pattern Rules, then deletes the memory. It named Feature Shape Review for this, but `scope-router`'s full review moved to this note when the reviews were split.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses it: the `scope-router` agent. This review reads it as Feature's `/shape` step uses it, both when `/shape` follows its rules to fold an idea into a note, sweep or roundup and when it routes the out-of-scope list. It has to give that step what it needs and meet the writing standard. Later reviews re-check it for their own steps.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-6]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **`scope-router`:** its "Where things go" (`scope-router:14-41`, about 1,050 words) is used as a rulebook by AGENTS.md:108 and `shape:119,133,135`, which open the agent file. It becomes a shared-rule skill that `scope-router` preloads.
- **`scope-router`:** :27, :31 and :39 each say not to create a sweep or roundup, repeating the Roadmap; :24 and :32 repeat Note Conventions' template definitions; :41 (move the full text, never a summary) is also in the Hub template and the `preserve-design-refs-when-moving-work` memory; :12's grep mechanics; :15's kicked-off rule comes before the cases it governs; :24 and :30 repeat the case condition; the description doesn't say when, and runs 44–52 words.
- **`scope-router`:** its opener (:9) says it only suggests, which its tools (Read, Grep, Glob) already show; keep only what shapes the report.
- **`scope-router`:** the `general-mechanism-over-one-case` memory moves into its workflow-note case, saying it applies to workflow features, unlike pattern Rules; then the memory is deleted.
- Wording difference at `scope-router:21`: update the story's Roadmap line to say what needs re-review, and add an unnamed `blocked-by` entry. Where the rule is kept: AGENTS.md says a Roadmap line only embeds `^status`. Exception or drift?
- Wording difference at `scope-router:35`: a new Roadmap line goes in Ideas. Where the rule is kept: AGENTS.md "Roadmap order" says ask where a new line goes. Exception or drift?

Moved from Agent Workflow Changes on 2026-10-06:
- **`scope-router` assumes every item comes from a story being planned or built** - its description (`.claude/agents/scope-router.md:3`) says it routes "out-of-scope work found while planning or building a story", and its prompt's first line (`:9`) says "outside the story being planned or built". But every skill routes its out-of-scope list through it, as AGENTS.md describes under "Out-of-scope work": `/tooling` has no story, and `/shape`, `/decide` and `/investigate` don't plan or build. A headless `/tooling` session drafted a fix: the description reads "found while working on a story or making a tooling change", and the prompt's first line reads "outside the story or tooling change being worked on". It found nothing else in the prompt that assumes a story. Found 2026-10-06 during `/implement` Step 3 of What Makes a Good Doc, in a headless run that checked the writing standard.
- **A story never waits on an item in a collecting note** - work a story waits on becomes its own story, never a line in a sweep, roundup or collecting workflow note. Today Note Conventions' `blocked-by` row allows another story as a blocker, and `scope-router` can route work a story needs into a collecting note, but nothing rules out a story depending on one of those items. Apply the rule in Note Conventions and `.claude/agents/scope-router.md`. Sarah's call, 2026-10-04, during `/decide` on [[Branching and Releases]], when the one-goal-at-a-time change became its own story rather than an item here.
- **Notes carry history they don't need** - items, Roadmap lines and notes record how and when something was found, such as the story or session it came from, even when it changes nothing about the work. Sarah: "I find the amount of history being added to the Roadmap to be unnecessary" and "Why would it matter what story I happened to finally get annoyed enough with how a skill worked to ask for it to be changed?" Keep only history that changes the understanding of the work. The rules that ask for it include this note's What Belongs Here ("how and when it was found") and the workflow-note and Roadmap-line rules in `.claude/agents/scope-router.md`.

# Questions
