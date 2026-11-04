---
type: workflow
confirmed: 2026-10-06
---
# Where It Stands
Next: /tooling ^status

# Inbox
- [[Services and Environments Audit]] is a second case of this gap. It's typed `cleanup` but changes no code: it reads settings from dashboards and produces a doc and Roadmap lines, so `/plan-steps`' running-app checks may not fit it either.
- From Workflow Tooling Review (`/tooling`, 2026-11-03): `/tooling`'s story check and `/shape`'s step 2 no longer count needing research, several decisions or a design as too big for one session. `/tooling` asks about size only when a change might really not fit one session. Its spin-off steps are now in `.claude/skills/tooling/spinning-off-a-story.md`, and they ask nothing about the Roadmap.
- [Sarah] Honestly I think the thing that was really missing in Agent Instructions Audit was the agent consistently tried to do a narrow fix when I was complaining about a large, persistent problem. I had to insist on a large-scale change to try to address the issues I was seeing.

# Notes
Part of [[Agent Instructions Audit]].

**The gap:** some workflow changes don't build new infrastructure but are still too big for one `/tooling` session, because they need research, several decisions or a design first. No path fits them. `/tooling` spins such a change off into an idea note for `/shape`, and `/shape` can only type it feature, bug, pattern, infra or cleanup. None of those types is made for changing skills, agents, templates or docs. [[Agent Instructions Audit]] went this way and was typed a cleanup. This note settles how such a change is planned and worked.

Sarah, 2026-10-06: "So we need to make a new story as part of this hub to handle the case of a workflow task which isn't infra but is still too big for a single story. Because obviously shoehorning it into an existing workflow went poorly."

**What it reaches:** at least `/tooling`'s "Is it a story?" check, `/shape`'s workflow check (the "too big for one session" case in its step 2), Note Conventions' Workflow type and the Workflow template.

**Decisions that apply:**

![[Agent Instructions Audit#^decision-1]]

![[Agent Instructions Audit#^decision-13]]

![[Agent Instructions Audit#^decision-17]]

# Questions
