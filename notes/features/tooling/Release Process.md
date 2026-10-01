---
type: workflow
confirmed: 2026-09-28
---
%% A change to how the app is built, not what it does: skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs or tooling config. It skips the story lifecycle and has no `status`. `/tooling` makes the whole change in one session, then deletes this note. A note that collects items over time instead gets a `## What Belongs Here` section with its rule and an `# Items` list. It stays, and `/tooling` removes each item it does. %%

# Where It Stands

%% The line ending in ` ^status` says what the note needs next or what it's waiting on, and nothing else. It's almost always "Next: /tooling". The Roadmap embeds it with `![[<note>#^status]]`, so keep the ` ^status` ID on it. %%

Next: /tooling ^status

# Notes
There's no release process yet. Sarah decided 2026-09-28 that a goal (a ranked epic on the Roadmap) wrapping up is a release, and that releasing needs to be created. Until it exists, `/close` marks a goal whose last story has closed with "waiting on a release process" on its line under Goals, and `/close` run on a goal stops.

Pieces a release might include, raised while designing goals (none decided):
- a review across all of the goal's stories: leftovers between stories, duplicated logic, patterns that drifted between stories
- checking each of the goal's Done When items in the running app
- checking that `docs/` covers what the goal added
- merging `develop` into `main`, deploying, and possibly release notes or a version tag
- closing the goal note, and handling any Roadmap lines still under it

Found 2026-09-28 while running `/tooling` on the goals and Roadmap priority items from [[Agent Workflow Changes]].

[Sarah] - I added a note to [[Agent Workflow Changes]] about feature branches. If I decide to go that direction this will probably impact this story, so that might need to be decided first (or pulled into this story and all the decisions made first).

# Questions

