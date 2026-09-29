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
- [ ] Single concern is a top priority: judge existing code on quality, and never pile new behavior into a component that already has a different job. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]]
- [ ] A centralized mock in `test/mocks/` moves with its module; never replace it with inline mocks. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]] [Sarah] - Does this _really_ need to be documented? Isn't it just... sort of common sense? Maybe we need a broader rule?
- [ ] Create a shared mock in `test/mocks/` as soon as the same mock is duplicated across test files. From Claude's memory, 2026-09-27. 🎯 [[Dev Foundations]] [Sarah] - Ok the line between "agent instructions" and "docs" is getting kind of blurry. Where is the line exactly?
