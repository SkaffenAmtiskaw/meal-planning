---
type: infra
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` says what the story needs next and nothing else: the next skill as a command, or a link to what blocks it and the skill after, as AGENTS.md describes under "Editing notes", e.g. "Next: design session in Claude Design, then /assess", "Next: /plan-steps. Building waits on [[Stale Data Issues]]" or "Blocked by [[Stale Data Issues]]; then /plan-steps". It may start with a state word or two, such as "Design approved.". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Below it goes a short summary of what work has been done and what remains, and nothing else. Anything for a later step goes at the top of the section that step writes, or in the Inbox, as AGENTS.md describes under "Editing notes". %%

No direction yet. ^status

# Inbox

%% What reaches the note from outside its usual flow: Sarah's items, items from another note's work, and why the note was sent back to an earlier step. A finding or question for a later step in the usual flow goes at the top of the section that step writes. Each skill that works on the note acts on the items that are its step's, then deletes them, as AGENTS.md describes under "Editing notes". %%

# Purpose
%% What this infrastructure is for and whom it serves, in a sentence or two. Use this template when the story builds something new that the app is built, tested or run with, such as CI, a test setup or a hosted service, whether or not it sets conventions for later work. For a convention that existing code moves over to, use Pattern instead. %%

# Goals
%% What Sarah wants to get out of this story, as checkboxes: each one something that must be true when it's done, and that she can see for herself. A requirement that only serves a Goal goes in the Design, under the piece it belongs to, and the implementer checks it. The Goals are the story's acceptance criteria: every one is reached by a step in the Build Order. Rough bullets are fine while status is `idea`. `/infra-design` confirms them with Sarah before designing. %%
- [ ] 

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%

# Design
%% What gets built and how the pieces connect: each piece (a workflow, a script, a config file, a skill, a service) with its job and the requirements it meets, and how a run flows through them. It ends with a `## Build Order`: the session-sized steps `/implement` builds the story in. Written with Sarah by `/infra-design`, along with Conventions and Setup Outside the Repo, once Open Decisions are settled. It sets status to `ready` once she approves the Build Order. %%

# Conventions
%% What later work must follow once this exists, each in plain words, with the doc or skill it lands in. Delete the section if the story sets none. %%

# Setup Outside the Repo
%% Everything set up by hand outside the repo, such as an app install, a GitHub setting or a hosted service's configuration: what it is, where it's set up and which doc records it. Delete the section if there is none. %%

# Out of Scope
%% Anything deliberately left out. Each item should also be on the Roadmap so it isn't lost. %%
