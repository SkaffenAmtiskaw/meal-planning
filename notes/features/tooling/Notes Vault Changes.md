---
type: workflow
confirmed: 2026-10-05
---
# Where It Stands
Collecting items. Next: /tooling ^status

# Purpose
Changes to how the notes vault is organized: the Roadmap's layout and sections, Note Conventions, note types, templates and how notes are written. Agent behavior goes in [[Agent Workflow Changes]], even when the agent works on notes.

## What Belongs Here
Changes to how the vault is organized, each saying what's wrong, where it reaches and why. An item may still need a decision: /tooling settles it with Sarah. A change that reaches skills or agents still goes here when it's about how the vault is organized, and /tooling carries it into them.

# Items
- [ ] **Rename the Roadmap's "Ideas" section** - `notes/Roadmap.md` has an `# Ideas` section for uncommitted stories (the "How this file works" bullet says "Ideas - not committed"). Sarah wants a name that makes it clearer that it holds stories she isn't sure about yet. The new name isn't decided: /tooling settles it with Sarah. The rename has to reach every place that names the section: `AGENTS.md`, `.claude/skills/roadmap/SKILL.md`, `.claude/skills/roadmap-placement/SKILL.md`, `.claude/skills/decide/SKILL.md`, `.claude/skills/tooling/SKILL.md`, the Roadmap's own "How this file works" and the two Later lines that say the app-wide audit "stays in Ideas", and `notes/goals/Calendar Page.md`. Found 2026-10-05 when a session wrongly proposed putting a committed story's line in Ideas.
- [ ] [Sarah] - Some ideas should probably become goals in their own right, like the grocery list integration
- [ ] **No note type describes a story that only adds tests** - `notes/Note Conventions.md` defines Feature as "new user-facing behavior, often with a design handoff", and no other type covers a story whose work is writing tests for what's already built. Sarah chose `type: feature` for [[Auth E2E Tests]] on 2026-11-04, so its definition doesn't match its work, and [[Current Calendar E2E Tests]], [[Recipes E2E Tests]], [[Settings E2E Tests]] and [[Sharing E2E Tests]] are likely to hit the same mismatch when they're shaped. Later agents may question the type on these stories.
