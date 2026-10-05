---
type: standing-goal
confirmed: 2026-10-04
---

# Purpose
Collects dev tooling, infrastructure and agent workflow work: what Sarah uses to build and run the app, not the app itself. Tooling that helps a goal is pulled into that goal when the goal is shaped. What's left never blocks a feature, so no goal would take it on its own. This is the place to put future dev tooling stories.

## What Belongs Here
- Dev tooling and its config: lint, format, type checks, test tooling, scripts and hooks.
- Infrastructure and CI: workflows, routines, services and environments. Bugs in them count.
- Major upgrades of dev tools, meaning packages in `devDependencies`.
- Agent workflow: skills, subagents, AGENTS.md, agent conventions and the docs in `docs/`.

Looks close but doesn't belong:
- Upgrades of the app's own libraries, and tech debt in app or test code. They belong to [[App Health]].
- Bugs in the shipped app. They belong to [[Bugs]].

# Out of Scope

# Roadmap Instructions
- Whenever a goal is drawn from Dev Tooling, kick off [[Dev Tooling Tidy-Ups]], [[Agent Workflow Changes]] and [[Docs Updates]] and draw them into that goal. Everything in those collecting notes is related to Dev Tooling by definition (Sarah, 2026-10-04).
