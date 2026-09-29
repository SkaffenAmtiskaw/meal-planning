---
type: 
status: idea
confirmed: 2026-09-28
---
%% For jotting something down quickly. Leave `type` blank until it's clear what kind of story this is (feature / bug / pattern / cleanup / workflow), then move the content into that template. %%

# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Next: /shape ^status

# Notes
Check every project doc against the code and confirm it matches reality. Fix what's wrong or out of date, and note what's missing. It's a Done When item of [[Dev Foundations]]: "Documentation is confirmed to match reality."

The docs are the five files in `docs/`: `project_conventions.md`, `project_structure.md`, `style_guidelines.md`, `theme.md` and `unit_tests.md`.

`README.md` is still the Mantine template ("Mantine Next Template", "Use this template") and says nothing about the meal-planning app, so it could mislead an agent. The audit covers it too.

Some lines in the codebase docs talk to an agent instead of describing the code: "Before adding 'use client', ask yourself:" and its three questions in `docs/project_conventions.md`, and the Code Coverage line in `docs/unit_tests.md` that says never to exclude code from coverage unless the user says to. The coverage line also repeats AGENTS.md's "Ignore comments" rule under "Git and files" in different words, so the two could drift. Found 2026-09-28 while `/tooling` split the docs into two kinds.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
