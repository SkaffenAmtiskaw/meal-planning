---
type: 
status: idea
confirmed: 2026-09-28
---
# Where It Stands
Next: /shape. Building waits on [[What Makes a Good Doc]] ^status

# Notes
Check every project doc against the code and against the standard for good docs that [[What Makes a Good Doc]] sets. Fix what's wrong, out of date or short of the standard, and note what's missing. It's a Done When item of [[Dev Foundations]]: "Documentation is confirmed to match reality."

The docs are every file in `docs/`.

`README.md` is still the Mantine template ("Mantine Next Template", "Use this template") and says nothing about the meal-planning app, so it could mislead an agent. The audit covers it too.

Some lines in the codebase docs talk to an agent instead of describing the code: "Before adding 'use client', ask yourself:" and its three questions in `docs/project_conventions.md`, and the Code Coverage line in `docs/unit_tests.md` that says never to exclude code from coverage unless the user says to. The coverage line also repeats AGENTS.md's "Ignore comments" rule under "Git and files" in different words, so the two could drift. Found 2026-09-28 while `/tooling` split the docs into two kinds.

The docs are also more prescriptive than docs written for human engineers would be, such as the 3-test-file threshold in "Creating Centralized Mocks" in `docs/unit_tests.md`. The audit judges each rule against the standard.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

[Sarah] - We might need to make this the last (or one of the last) items in the [[Dev Foundations]] goal. That way most of the plumbing is decided and wired up, and this story becomes a matter of making sure it's documented, and making sure that documentation is discoverable and readable.

# Questions
