---
type: 
status: idea
confirmed: 2026-09-25
---
# Notes
Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25). `AGENTS.md` still assumes OpenCode and needs rewriting as the move goes on.

Known changes:
- **`.opencode/` path rules and Project Knowledge docs** - the "File & Path Resolution" section and the docs in `.opencode/docs/` need a new home once OpenCode is gone.
- **Rules meant for the main session** - Claude Code subagents load `AGENTS.md` too, so rules like "summarize your instructions at session start" also reach `code-critic` and `scope-router`. Word them so they only apply to the main session, or have those subagents skip `CLAUDE.md`.
- **Tool Constraints and handoff rules** - written for OpenCode agents and permissions; check them against Claude Code.
- [Sarah] - The `AGENTS.md` instruction where agents have to recite their instructions is unnecessary. Also it's resulting in annoying behavior like the agent waiting for me to confirm it's instructions before it actually starts on the work.
- [Sarah] - How exactly is a story scope decided? The agent gets to decide what work it wants to do? Or am I signing off on scope somewhere?
- **Boy Scout Rule (incidental cleanup)** - No existing convention says a story should leave a touched file a little cleaner than it found it (e.g. bringing a test file's ad-hoc mocks onto the centralized-mock convention while making an unrelated fix in the same file), though the `getUserInvites` server-only fix applied an informal version of it. Sarah: "if there isn't [a rule], there should be." Open questions: how far "a bit better" extends (any convention violation in a touched file, or only within the hunks already being edited); production code too, or tests only (the "Tests and shared mocks" section several notes already carry is a scoped version of the same idea for tests); whether it needs its own Enforcement or is just agent judgment; whether "Tests and shared mocks" should eventually just point at this rule instead of repeating it. Likely lands in `.opencode/docs/project_conventions.md` once decided. Found 2026-09-26 while planning that fix.
- **Dev server script** - `/implement`'s `first-pass.md` starts the app with `scripts/playwright-server.sh`, a leftover from the OpenCode setup. Nothing uses Playwright any more: it only runs `next dev` in the background, and the built-in browser pane does the rest. It writes `dev.log` and `dev.pid` to `.opencode/tmp/` inside the repo, to avoid OpenCode's prompts for writing outside the project. That folder isn't gitignored or removed on `stop`, so it shows up in `git status` after every first pass. Open questions: the script's name; where the log and pid should live now that OpenCode's prompts don't apply; whether `stop` should clean up after itself. Found 2026-09-27 after implementing the `getUserInvites` server-only fix.
- [Sarah] - Agents are asking me for permission to do work that has zero ambiguity, like setting the status of a note to done. I don't mind something like "my checklist is complete - am I good to change the status to [status]?" but the proposed line change setting the status is silly when it's something like this:
		Next, I'll set `status` to `done` in Unchecked Invite Lookup and change its `^status` line to:

		Reviewed. Next: /close ^status

		Is that status line for Unchecked Invite Lookup OK to write?

# Skill and Agent Changes
Specific skill and subagent fixes are collected in [[Skill and Agent Tidy-Ups]].

# Questions
- Once OpenCode is gone, keep `AGENTS.md` (loaded through `CLAUDE.md`), or move its contents into `CLAUDE.md`?
