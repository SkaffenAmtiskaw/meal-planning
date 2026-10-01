---
type: infra
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Below it goes a short summary of what work has been done and what remains, and nothing else. Items for a later step go in the Inbox. %%

No direction yet. ^status

# Inbox

%% Items for a later step to act on that have no section of their own, added by Sarah or by a session or agent. Each skill that works on the note acts on the items that are its step's, then deletes them, as AGENTS.md describes under "Editing notes". %%

# Purpose
%% What this infrastructure is for and whom it serves, in a sentence or two. Use this template when the story builds something new that the app is built, tested or run with, such as CI, a test setup or a hosted service, whether or not it sets conventions for later work. For a convention that existing code moves over to, use Pattern instead. %%

# Goals
%% What must be true when this is done, as checkboxes. They are the story's acceptance criteria: every one lands in a step. Rough bullets are fine while status is `idea`. `/infra-design` confirms them with Sarah before designing. %%
- [ ] 

# Open Decisions
%% Decisions that must be made before the next step can start, written as questions, not proposals. While any are open, `blocked-by` has one `"decision needed: ..."` entry for all of them. Record each answer here once it's made, and remove that entry once none are open. Delete the section if there are none. %%

# Design
%% What gets built and how the pieces connect: each piece (a workflow, a script, a config file, a skill, a service) with its job, and how a run flows through them. Written with Sarah by `/infra-design`, along with Conventions and Setup Outside the Repo, once Open Decisions are settled. It sets status to `spec` when all three are approved. %%

# Conventions
%% What later work must follow once this exists, each in plain words, with the doc or skill it lands in. Delete the section if the story sets none. %%

# Setup Outside the Repo
%% Everything set up by hand outside the repo, such as an app install, a GitHub setting or a hosted service's configuration: what it is, where it's set up and which doc records it. Delete the section if there is none. %%

# Out of Scope
%% Anything deliberately left out. Each item should also be on the Roadmap so it isn't lost. %%

# Implementation
%% Leave empty until the design is approved. The step plan goes here - then set status to `ready`. Each step ends in checks Sarah can run and see, such as a command, a PR or a workflow run, and setup outside the repo goes in the first step that needs it. %%
