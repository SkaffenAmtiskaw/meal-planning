---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
Specific changes to skills (`.claude/skills/`) and subagents (`.claude/agents/`), found while using them. The planning skills block edits outside `notes/`, so an agent that spots a fix mid-run adds an item here instead.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Changes to one skill or subagent file, each saying what to change, where, and why. Changes to `AGENTS.md` or the move from OpenCode belong in [[Agent Workflow Changes]].

# Items
%% Add each item as an unchecked box. Say which file (with line numbers), exactly what changes, and how and when it was found, e.g. "found by reading code while planning [[Note]], 2026-09-26". Items go stale, so /check-drift re-checks every one when a sweep is scheduled. If an item can't be done until another story lands, start it with `**Blocked by [[Story]]:**`. Block the item, never the whole sweep. Blocked items stay here when a sweep is frozen and roll over to the next one. %%
- [ ] `.claude/skills/plan-steps/SKILL.md`, step 4 ("Review with Sarah"), the outline bullet: don't ask Sarah whether the order/split is right when that's already settled by the skill's own checks (e.g. the split-checker returned a clear "no split" verdict and the note's template already allows the resulting step count, such as a bug note's single-step plan). State the settled outcome instead of asking her to confirm it; still ask when a checker flagged real uncertainty or the split/order is a genuine judgment call. Found while planning the `getUserInvites` server-only fix, 2026-09-26 - Sarah: "That's something that doesn't need my feedback every time. When it's OBVIOUS it does not need to be asked."
- [ ] Ask Sarah to approve a change instead of telling her to stage it. After she approves, the agent stages the files that change touched, by path (never `git add -A` or `git add .`). She doesn't commit until then. Two places say she stages it herself:
	- `.claude/skills/review/SKILL.md` step 6, item 6 (L103): "She reviews the diff and stages it when she's happy." Change it to: ask her whether she approves the fix, and once she does, stage the files the fix changed. Item 4 (L101, leave it unstaged so `git diff` shows just this fix) stays.
	- `.claude/skills/implement/SKILL.md` "Handle her feedback" (L136): "She stages them when she's happy." Make the same change. Step 7 (L109-120) already has the agent stage the step's files itself, so it stays.

	Found during the /review of the `getUserInvites` server-only fix, 2026-09-27. Sarah: "I'd prefer you simply ask me if I approve. I often run multiple agents at once I don't want to be picking what files to stage."

# Out of Scope
- The `AGENTS.md` rewrite for Claude Code and other OpenCode-move changes: [[Agent Workflow Changes]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] %% The existing flows that must behave as before. Name them. %%

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
