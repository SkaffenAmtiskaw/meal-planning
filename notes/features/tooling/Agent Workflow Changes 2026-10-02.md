---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands
Kicked off. Next: /tooling ^status

Kicked off 2026-10-02 from [[Agent Workflow Changes]] with the items that serve [[Dev Foundations]]. Sarah pulled nine more items in on 2026-10-05. The three rules that contradicted other rules were fixed on 2026-10-06, and two groups of items became their own stories the same day: "Skill and doc edits read as a whole" became What Makes a Good Doc, and the slimming pass became [[Agent Instructions Audit]]. "Notes copy a story's status instead of embedding it" moved into Agent Instructions Audit later that day, and the other items about specific skills and files moved into its review notes. One item remains.

# Purpose
Changes to how agents work in this repo: skills (`.claude/skills/`), subagents (`.claude/agents/`), AGENTS.md and agent conventions. This includes Sarah's feedback on how they behave. The planning skills block edits outside `notes/`, so an agent that spots a fix mid-run adds an item here instead.

## What Belongs Here
Changes to skills, subagents, AGENTS.md or agent conventions, each saying what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. Changes to the docs in `docs/`, which describe the codebase, go in [[Docs Updates]]. Tooling config goes in [[Dev Tooling Tidy-Ups]].

# Items
- [ ] **A light path for small note-less work, such as a one-off dependency upgrade** - Sarah asked whether a skill suits dependency updates, since "putting it through a full design -> architect -> implement process is silly." A session with no skill loads AGENTS.md, but nothing in AGENTS.md, Note Conventions or the Roadmap's "How this file works" says that a Roadmap line with no note comes off the Roadmap once its work is done, or which checks to run before committing (the pre-commit hook covers lint, types and tests on staged files, not the build). The fix can be a very light skill or a rule in AGENTS.md, such as "when a session finishes the work of a Roadmap line with no note, it runs the four CI checks, then removes the line" (Sarah's call which). Found 2026-10-04 during `/infra-design` on [[Local Dependency Update Alerts]], when the `next` security bump became a note-less 🚨 line. Sarah handles the Roadmap updates for the `next` and Better-Auth lines herself until this lands. 🎯 [[Dev Foundations]]