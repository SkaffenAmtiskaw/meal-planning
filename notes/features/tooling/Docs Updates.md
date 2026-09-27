---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands

Next: /workflow ^status

# Notes
A rolling list of changes the project docs in `.opencode/docs/` need, collected as they come up. Like a sweep, except items may still need decisions. Only for those docs: AGENTS.md and Note Conventions are changed where the need comes up, not collected here. Sarah, 2026-09-27: project rules found in Claude's memories belong in these docs, not just in memory.

## Items
- [ ] Move the docs out of `.opencode/docs/` into a directory that isn't tied to OpenCode, and update every reference to the old path.
- [ ] Weeks start on Sunday everywhere; Monday-start code is tech debt, not a convention. From Claude's memory, 2026-09-27.
- [ ] Do UI work "Mantine's way": read the component's mantine.dev page for its intended usage, since the types alone don't show it. From Claude's memory, 2026-09-27.
- [ ] Single concern is a top priority: judge existing code on quality, and never pile new behavior into a component that already has a different job. From Claude's memory, 2026-09-27.
- [ ] Unit tests cover branches and logic, never that JSX renders to spec (a class is applied, a prop is passed). From Claude's memory, 2026-09-27.
- [ ] Tests use the testing library's own convention when one exists (e.g. `renderHook` for hooks). From Claude's memory, 2026-09-27.
- [ ] A centralized mock in `test/mocks/` moves with its module; never replace it with inline mocks. From Claude's memory, 2026-09-27.
- [ ] Create a shared mock in `test/mocks/` as soon as the same mock is duplicated across test files. From Claude's memory, 2026-09-27.

# Questions
- Is this a sweep with a relaxed rule, or a new note type?
- Once a rule is in a doc, is the matching Claude memory deleted?
- Where do the docs move to?
