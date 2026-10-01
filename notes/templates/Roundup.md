---
type: roundup
status: idea
blocked-by: []
confirmed: {{date:YYYY-MM-DD}}
---
# Where It Stands

%% The line ending in ` ^status` is the roundup's status and nothing else, e.g. "Collecting issues until you kick it off" or, once /kickoff has run, "Kicked off. Next: /decide". The Roadmap embeds it with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Below it goes a short summary of what work has been done and what remains, and nothing else. Items for a later step go in the Inbox. %%

Collecting issues until you kick it off. ^status

# Inbox

%% Items for a later step to act on that have no section of their own, added by Sarah or by a session or agent. Each skill that works on the note acts on the items that are its step's, then deletes them, as AGENTS.md describes under "Editing notes". %%

# Purpose
%% The topic this roundup collects and why its issues are settled together, in a sentence or two. %%

## What Belongs Here
Issues on this roundup's topic that still need a decision. An issue on the topic that's already decided can go here too, with its **Decided** line, so the fix is built with the rest. An issue is too big for a roundup, and becomes its own story, if its fix would take more than one implementation step once decided, or if settling it needs a design session in Claude Design, a root-cause investigation or a new convention that code must migrate to.

%% This roundup's topic: a broad area where lots of small, loosely related issues turn up, e.g. "form UX" or "loading states". Name anything close to it that doesn't belong. %%

# Open Decisions
%% Add each issue as a numbered question. Say what it's about (files with line numbers, screens or notes), what the question is, and how and when it was found, e.g. "found while planning [[Note]], 2026-09-27". Write questions, not proposals. /decide records each answer under its question. If an issue can't be settled until another story lands, start it with `**Blocked by [[Story]]:**`. Block the issue, never the whole roundup. Blocked issues stay behind when /kickoff freezes a copy, and roll over to the next one. %%
1. 

# Out of Scope
%% Related work that belongs to another story, sweep or roundup, with a link. %%

# Acceptance Criteria
- [ ] Each decision above is built or explicitly dropped.
- [ ] %% The existing flows that must behave as before. Name them. %%

# Implementation
%% Empty until every decision is made. Then /plan-steps writes the steps here. %%
