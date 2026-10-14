---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- **Describing what something isn't, from Feature Shape Review on 2026-10-14:** Sarah's feedback on a `/shape` draft: after a change, agents tend to write about what something isn't, or why it's no longer the old thing. A reader coming to it fresh never knew the old thing, so those lines only cost attention. `writing-standard` doesn't cover this yet. The `describe-what-is-not-what-isnt` memory holds the same point, and the agent drafting `/shape` didn't follow it.

# Notes
Part of [[Agent Instructions Audit]].

![[Agent Instructions Audit#How Each Review Works]]

**Step:** Feature's `/shape` step, which turns an idea note into a typed story with a direction and a next step.

**Full review here,** as the first story that uses them: `writing-standard`, `rule-placement`. Feature's `/shape` step doesn't run them. They're the standard its instructions are written and checked against, and where its rules are placed. This review reads them for that use: they have to give the `/shape` review what it needs to write and place its instructions, and meet their own standard. Later reviews re-check them for their own steps.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-15]]

![[Agent Instructions Audit#^decision-17]]

## Issues Found
From the audit's scan on 2026-10-06. Line numbers are as of that day.
- **`writing-standard`:** decision 1's split criterion becomes a new section in `instructions.md` (Sarah decided 2026-10-06 to add it in this audit).
- **`writing-standard`:** the rules for writing skills move into `instructions.md`, under "Make Every Line Earn Its Place": a skill or agent, new or changed, justifies every doc it reads with a reason from its steps, and points to the section it needs or states the one fact, rather than loading a whole shared doc (from the `lean-skill-context` memory and `tooling:68`); fix an agent's judgment rather than adding approvals (from `fix-judgment-not-add-approvals`); and a note section the user edits by hand has no required format (from `free-form-sections-sarah-edits`). `tooling:68`'s middle sentence goes, and the three memories are deleted.
- **`writing-standard` and `rule-placement`:** `rule-placement:20` forbids naming users in a shared-rule skill while `instructions.md:23` asks a description to say when to use it, so one clause says a shared-rule skill's description names its trigger, not its users; `rule-placement`'s homes leave out Note Conventions, the templates and the Roadmap's "How this file works"; `instructions.md:23` doesn't say what "third person" means; `writing-standard/SKILL.md:36-41` puts "The Part for Your File" last, so line 8 names both parts and the closing section goes; :11 and :31 only point ahead.
- **`rule-placement`:** gets decision 15's case: a rule only one branch of a skill's run needs goes in a supporting file the skill reads where that branch starts.

# Questions
