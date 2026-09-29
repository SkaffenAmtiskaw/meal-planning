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
Finish the move from OpenCode to Claude Code, so no OpenCode files remain. It's a Done When item of [[Dev Foundations]].

What's left in `.opencode/`:
- `.opencode/agents/`: 10 old agents (`apply`, `architect`, `bugfix`, `cleanup`, `design`, `develop`, `implement`, `inspect`, `resolve`, `review`). They stay until the whole move is finished, even where a Claude skill already replaces one.
- `.opencode/lib/delegation-decision.md`: how the OpenCode `implement` agent picks `@develop`, `@resolve` or `@apply` for delegated work.
- `.opencode/package.json`, `package-lock.json` and `node_modules/`.
- `opencode.jsonc` at the repo root.
- `.opencode/secrets/credentials.md`: the test login the `running-the-app` skill uses. [Sarah] - Agents keep wanting to put this in the story so I am now adding a note. This is covered in [[Manual and Agent Test Environment]]. As such I will consider that story a blocker for finishing the opencode migration

Rules that point at `.opencode/` and go with it:
- AGENTS.md's Project section, which has agents leave `.opencode/` out of searches.
- `/review` step 2, which leaves `.opencode/` out of the story's changed files.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
- When is it safe to drop the old OpenCode agents and files?
