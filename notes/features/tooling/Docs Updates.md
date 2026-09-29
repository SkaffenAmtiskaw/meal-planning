---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands
Collecting items. Next: /tooling ^status

# Purpose
A rolling list of changes the project docs in `docs/` need, collected as they come up. Sarah, 2026-09-27: project rules found in Claude's memories belong in these docs, not just in memory.

## What Belongs Here
Changes to the docs in `docs/`, which describe the codebase itself: its structure, code conventions, styling and tests. Each says what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. How agents work (AGENTS.md, skills, subagents, agent conventions) goes in [[Agent Workflow Changes]]. Note Conventions is changed where the need comes up. Sarah decided 2026-09-28 that once an item's rule is in a doc, the matching Claude memory is deleted.

# Items
- [ ] Weeks start on Sunday everywhere; Monday-start code is tech debt, not a convention. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]]
- [ ] Do UI work "Mantine's way": read the component's mantine.dev page for its intended usage, since the types alone don't show it. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]]
- [ ] Single concern is a top priority: judge existing code on quality, and never pile new behavior into a component that already has a different job. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]]
- [ ] A centralized mock in `test/mocks/` moves with its module; never replace it with inline mocks. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]]
- [ ] Create a shared mock in `test/mocks/` as soon as the same mock is duplicated across test files. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]]
