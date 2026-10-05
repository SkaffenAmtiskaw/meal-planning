---
type: 
status: idea
confirmed: 2026-10-05
---

# Where It Stands

Next: /shape ^status

# Notes
Decide what makes a good unit test in this project, and write it as one cohesive guide in `docs/unit_tests.md` rather than a set of scattered rules. Then bring the tests in line with it.

The tests are inconsistent today. For example, 90 of the 201 test files that use mocks don't call `vi.resetAllMocks()` in `beforeEach`, and 55 of those use `clearAllMocks` or something like it instead (counted 2026-10-05).

The old OpenCode `develop` agent, deleted 2026-10-05 when the move to Claude Code finished, had four test style rules: `describe` blocks named after the module, one `it` block per behavior, mocks reset in `beforeEach` with `vi.resetAllMocks()`, and `toEqual` preferred over `toBe` for objects. Sarah decided 2026-10-05 not to carry them into the docs, because they were specifics that weren't part of a cohesive whole and hadn't been given much thought. The guide may cover the same ground, but decided on its merits.

Overlaps [[Docs Audit]], which judges each rule in `unit_tests.md` against the code and how prescriptive the docs are. This story goes further: it sets a convention the tests then migrate to.

Found 2026-10-05 while `/tooling` removed the old OpenCode agents.

# Questions
