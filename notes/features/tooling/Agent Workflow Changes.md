---
type: workflow
confirmed: 2026-09-27
---
# Where It Stands
Collecting items. Next: /workflow ^status

# Purpose
Changes to how agents work in this repo: skills (`.claude/skills/`), subagents (`.claude/agents/`), AGENTS.md, agent conventions and the move from OpenCode to Claude Code. This includes Sarah's feedback on how they behave. The planning skills block edits outside `notes/`, so an agent that spots a fix mid-run adds an item here instead.

Agents are moving from OpenCode to Claude Code, slowly. The first was `architect`, which became the `/assess` skill with the `code-critic` and `scope-router` subagents (2026-09-25).

## What Belongs Here
Changes to skills, subagents, AGENTS.md, agent conventions or the OpenCode move, each saying what to change, where, why, and how and when it was found. An item may still need a decision: /workflow settles it with Sarah. Changes to the docs in `.opencode/docs/`, which describe the codebase, go in [[Docs Updates]]. Tooling config goes in [[Dev Tooling Tidy-Ups]].

# Items
- [ ] `.claude/skills/plan-steps/SKILL.md`, step 4 ("Review with Sarah"), the outline item (L121): don't ask Sarah whether the order/split is right when that's already settled by the skill's own checks (e.g. the split-checker returned a clear "no split" verdict and the note's template already allows the resulting step count, such as a bug note's single-step plan). State the settled outcome instead of asking her to confirm it; still ask when a checker flagged real uncertainty or the split/order is a genuine judgment call. Found while planning the `getUserInvites` server-only fix, 2026-09-26 - Sarah: "That's something that doesn't need my feedback every time. When it's OBVIOUS it does not need to be asked."
- [ ] Ask Sarah to approve a change instead of telling her to stage it. After she approves, the agent stages the files that change touched, by path (never `git add -A` or `git add .`). She doesn't commit until then. Two places say she stages it herself:
	- `.claude/skills/review/SKILL.md` step 6, item 6 (L96): "She reviews the diff and stages it when she's happy." Change it to: ask her whether she approves the fix, and once she does, stage the files the fix changed. Item 4 (L94, leave it unstaged so `git diff` shows just this fix) stays.
	- `.claude/skills/implement/SKILL.md` "Handle her feedback" (L122): "She stages them when she's happy." Make the same change. Step 7 (L95-106) already has the agent stage the step's files itself, so it stays.

	Found during the /review of the `getUserInvites` server-only fix, 2026-09-27. Sarah: "I'd prefer you simply ask me if I approve. I often run multiple agents at once I don't want to be picking what files to stage."
- [ ] **Subagents repeat AGENTS.md** - Claude Code subagents load `AGENTS.md` (per the Claude Code sub-agents docs, checked 2026-09-27), so agent text that restates it is duplicated. Examples: `.claude/agents/bug-reproducer.md` Procedure steps 1 and 3 repeat `.opencode/docs/running_the_app.md`. `decision-researcher.md` defines Sarah's comments and embedded sections, now in AGENTS.md "Editing notes". `decision-researcher.md` and `target-designer.md` list library doc sources, now in AGENTS.md "Library APIs". `plan-checker.md` explains embedded sections. The agents were deliberately left self-contained during the 2026-09-27 AGENTS.md cleanup. Open questions:
  - Should subagents rely on AGENTS.md or stay self-contained?
  - Where a subagent's wording deliberately differs, keep it? For example, bug-reproducer reports what `preview_logs` prints instead of showing it to Sarah.
  - Does `!`command`` shell injection work in agent definition files, as it does in skills? If it does, `scope-router.md` could use `scripts/note-section.sh` instead of Grep-then-Read on Note Conventions.

  Found 2026-09-27 while cleaning up AGENTS.md.
- [ ] **Boy Scout Rule (incidental cleanup)** - No existing convention says a story should leave a touched file a little cleaner than it found it (e.g. bringing a test file's ad-hoc mocks onto the centralized-mock convention while making an unrelated fix in the same file), though the `getUserInvites` server-only fix applied an informal version of it. Sarah: "if there isn't [a rule], there should be." Open questions: how far "a bit better" extends (any convention violation in a touched file, or only within the hunks already being edited); production code too, or tests only (the "Tests and shared mocks" section several notes already carry is a scoped version of the same idea for tests); whether it needs its own Enforcement or is just agent judgment; whether "Tests and shared mocks" should eventually just point at this rule instead of repeating it. It's an agent convention, so it belongs in AGENTS.md or the skills that build stories, not `.opencode/docs/` (Sarah, 2026-09-27). Found 2026-09-26 while planning that fix.
- [ ] **Check drift before an old `spec` note is picked up** - nothing tells an agent to run `/check-drift` on a `spec` note before `/assess` or `/plan-steps` works on it. The Note Conventions next-step table lists `/check-drift` for `spec` notes but never says when to run it, and neither skill checks the note's `confirmed` date in its step 1 (`.claude/skills/assess/SKILL.md`, `.claude/skills/plan-steps/SKILL.md`). Moved from the Roadmap's Notes & Agent Workflow section 2026-09-27.
- [ ] **Open questions are Sarah's, not the agent's** - an Open Decisions question, an "Open questions:" list in an item, or a `decision needed` entry should only hold something Sarah hasn't decided yet and wants to think about or research. When an agent isn't sure what she meant, it asks her right then, one question at a time. When it can find the answer by reading code or docs, it looks it up. It never writes its own question into a note. Where it reaches:
	- AGENTS.md "Working with Sarah" (next to "Open choices are hers") or "Editing notes".
	- The skills that write Open Decisions: `/shape` (its blocking-decisions step and Open Decisions bullets write questions from the agent's own research without asking Sarah first), `/decide` "New questions", and `scope-router`, which may write items that still need decisions. `/investigate` and `/check-drift` already write one only when Sarah wants to think it over.

	Found 2026-09-27: an agent had added "decide whether this covers only `test/mocks/**` or inline mocks in `*.test.tsx` too" to a Roadmap line, and Sarah said it was never an open question for her. Sarah: "Open questions should be things I genuinely haven't decided yet and want to think about (or research). They shouldn't be questions the AGENT has lol."
- [Sarah] - How exactly is a story scope decided? The agent gets to decide what work it wants to do? Or am I signing off on scope somewhere?
