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

What's left once [[Docs Updates]] moves the docs out of `.opencode/docs/`:
- `.opencode/agents/`: 10 old agents (`apply`, `architect`, `bugfix`, `cleanup`, `design`, `develop`, `implement`, `inspect`, `resolve`, `review`). They stay until the whole move is finished, even where a Claude skill already replaces one.
- `.opencode/lib/delegation-decision.md`: how the OpenCode `implement` agent picks `@develop`, `@resolve` or `@apply` for delegated work.
- `.opencode/package.json`, `package-lock.json` and `node_modules/`.
- `opencode.jsonc` at the repo root.

Found 2026-09-28 while shaping [[Dev Foundations]] with `/roadmap`.

# Questions
- When is it safe to drop the old OpenCode agents and files?
