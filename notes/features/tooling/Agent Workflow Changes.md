---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands
Collecting items. Next: /tooling ^status

# Purpose
Changes to how agents work in this repo: skills (`.claude/skills/`), subagents (`.claude/agents/`), AGENTS.md, agent conventions and the move from OpenCode to Claude Code. This includes Sarah's feedback on how they behave. The planning skills block edits outside `notes/`, so an agent that spots a fix mid-run adds an item here instead.

Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25).

## What Belongs Here
Changes to skills, subagents, AGENTS.md, agent conventions or the OpenCode move, each saying what to change, where, why, and how and when it was found. An item may still need a decision: /tooling settles it with Sarah. Changes to the docs in `.opencode/docs/`, which describe the codebase, go in [[Docs Updates]]. Tooling config goes in [[Dev Tooling Tidy-Ups]].

# Items
- [ ] **Boy Scout Rule (incidental cleanup)** - No existing convention says a story should leave a touched file a little cleaner than it found it (e.g. bringing a test file's ad-hoc mocks onto the centralized-mock convention while making an unrelated fix in the same file), though the `getUserInvites` server-only fix applied an informal version of it. Sarah: "if there isn't [a rule], there should be." Open questions: how far "a bit better" extends (any convention violation in a touched file, or only within the hunks already being edited); production code too, or tests only (the "Tests and shared mocks" section several notes already carry is a scoped version of the same idea for tests); whether it needs its own Enforcement or is just agent judgment; whether "Tests and shared mocks" should eventually just point at this rule instead of repeating it. It's an agent convention, so it belongs in AGENTS.md or the skills that build stories, not `.opencode/docs/` (Sarah, 2026-09-27). Found 2026-09-26 while planning that fix.
- [ ] **Open questions are Sarah's, not the agent's** - an Open Decisions question, an "Open questions:" list in an item, or a `decision needed` entry should only hold something Sarah hasn't decided yet and wants to think about or research. When an agent isn't sure what she meant, it asks her right then, one question at a time. When it can find the answer by reading code or docs, it looks it up. It never writes its own question into a note. Where it reaches:
	- AGENTS.md "Working with Sarah" (next to "Open choices are hers") or "Editing notes".
	- The skills that write Open Decisions: `/shape` (its blocking-decisions step and Open Decisions bullets write questions from the agent's own research without asking Sarah first), `/decide` "New questions", and `scope-router`, which may write items that still need decisions. `/investigate` and `/check-drift` already write one only when Sarah wants to think it over.

	Found 2026-09-27: an agent had added "decide whether this covers only `test/mocks/**` or inline mocks in `*.test.tsx` too" to a Roadmap line, and Sarah said it was never an open question for her. Sarah: "Open questions should be things I genuinely haven't decided yet and want to think about (or research). They shouldn't be questions the AGENT has lol."
- [ ] **Archived notes that lose their last `kept-for` story are easy to forget** - when `/close` removes the last entry from an archived note's `kept-for`, that note needs its own `/close`, but the only reminder is a follow-up line in `/close`'s report, and archived notes have no Roadmap line. Hubs had the same gap until `/close` started setting a finished hub's `^status` to "Next: /close" and giving it a Roadmap line. Change `.claude/skills/close/SKILL.md` step 5 ("Kept-for") to do the same for the archived note. Found 2026-09-28 while fixing how finished hubs resurface on the Roadmap.
- [ ] [Sarah] - I need to create a better local environment so the `first-pass` agent can be more useful. First I need to create a planner with some test data, and users with different access levels on it. Then I need to find a more permanent place for the credentials (is there an existing convention for agent only environment variables?). I assume this is mostly work I have to do myself, but I should work with the agent to figure out what the useful things to add are (and help me figure out some of the parts I get stuck on). The agent can also help me document some of this for eventual use in [[E2E Testing]] (where I imagine I'll need to add users with different access levels again).
- [ ] [Sarah] - `/shape` should move ideas to later - it commits them.
