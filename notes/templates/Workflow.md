---
type: workflow
confirmed: {{date:YYYY-MM-DD}}
---
%% A change to how the app is built, not what it does: skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs or tooling config. If the change builds new infrastructure, such as CI or a test setup, it's an infra story instead: use the Infra template. If it's too big for one session, it's a story too: use the Idea template, and `/shape` picks its type. A workflow change skips the story lifecycle and has no `status`. `/tooling` makes the whole change in one session, then deletes this note. A note that collects items over time instead gets a `## What Belongs Here` section with its rule and an `# Items` list. It stays, and `/tooling` removes each item it does. %%

# Where It Stands

%% The line ending in ` ^status` says what the note needs next or what it's waiting on, and nothing else. It's almost always "Next: /tooling". The Roadmap embeds it with `![[<note>#^status]]`, so keep the ` ^status` ID on it. %%

Next: /tooling ^status

# Notes


# Questions

