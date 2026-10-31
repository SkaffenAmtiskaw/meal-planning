---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands
Collecting items, then /tooling ^status

# Purpose
A rolling list of changes the project docs in `docs/` need, collected as they come up. Sarah, 2026-09-27: project rules found in Claude's memories belong in these docs, not just in memory.

## What Belongs Here
Changes to the docs in `docs/`, which describe the codebase itself: its structure, code conventions, styling and tests. Each says what to change, where and why. An item may still need a decision: /tooling settles it with Sarah. How agents work (`AGENTS.md`, skills, subagents, agent conventions) goes in [[Agent Workflow Changes]]. Note Conventions is changed where the need comes up. Sarah decided 2026-09-28 that once an item's rule is in a doc, the matching Claude memory is deleted.

# Items
- [ ] [Sarah]The unit test doc should explain what fixtures are (agents know, but humans might not know the term) and where they are located (and when to add them)? 🎯 [[Dev Tooling]]
- [ ] `docs/project_conventions.md` "Barrel Files": add the interim rule for server-only code, decided in [[Server-Only Code Behind Barrels]] Decision 1 on 2026-10-31, as a second bullet after "Barrel files should NEVER have logic." Sarah approved this exact wording: "A file that imports `server-only` stays out of any barrel that client code imports. Client code pulls in everything a barrel re-exports, and `server-only` fails `pnpm build` in client code. Server code imports the file itself instead. Its types go in a `*.types.ts` file, which the barrel can re-export. This interim rule holds until server-only code moves to the planned data access layer." [[Server-Only Creation and Pure Reads]] and [[Unchecked Planner Reads]] follow this rule. 🎯 [[Dev Tooling]]