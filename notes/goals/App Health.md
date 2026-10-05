---
type: standing-goal
confirmed: 2026-09-30
---

# Purpose
Collects library updates and tech debt. Ranked goals might occasionally need them, but for the most part this work will never be critical to finish a feature, so no goal would take it on its own.

Everything in this goal affects code, which means testing needs to be a priority.

## What Belongs Here
- Library updates.
- Tech debt: code that works but needs changing, such as code that doesn't follow the conventions. Test code counts.

Looks close but doesn't belong:
- Dev tooling and infrastructure. They belong to [[Dev Tooling]].
- Bugs. They'll be their own standing goal, since they generally don't need the regression prevention emphasis this one has.

# Out of Scope
- [[Remove Schedule-X]]: it depends on finishing the calendar code, and it's really a cleanup of what [[Calendar Page]] has planned.

# Roadmap Instructions
- When a goal is drawn from App Health, add a story at the very top of it that audits the existing E2E tests to make sure they still cover everything they should, so a library upgrade that breaks something shows up right away.
