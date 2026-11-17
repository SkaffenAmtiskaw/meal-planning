---
name: roadmap
description: Ranks the goals, or starts the next goal once a release has shipped, then keeps Next, Planning and Later in line with the ranking. Use when the goals' order changes or the next goal is due to start building.
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Rank the goals, or start the next one building, and bring the Roadmap in line.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Rank or Start the Next Goal
Read `Roadmap.md` in the notes repo and invoke the `roadmap-rules` skill. What the run does depends on the Goals list and what the user asked for:
- **If a goal is marked `- building`, or the user asked to re-rank when they ran the command:** show the Goals list, and name any dependencies you can point to in the notes or code, such as a story whose `blocked-by` names a story under another goal. Ask which goals move. If those dependencies point to a spot, recommend it. Then put the Goals list and the Later headings in the order the user gives.
- **Otherwise:** no goal is building, so the last release has shipped and this run starts the next goal. Don't ask about the order, because the user ranked the goals while planning the release.

The top goal is the building goal and the second the planning goal. If either marker has to move, first run `sh scripts/release-freeze.sh`. What to do depends on how it exits:
- **1, a release is under way:** building the next goal now would add its work to that release. Tell the user the markers move once the release PR merges, with another `/roadmap` run. Leave both markers where they are.
- **2, it can't tell:** tell the user what it printed, and leave both markers where they are.
- **0:** mark the top goal `- building` and the second `- planning`, and remove ` · Next: /roadmap once the release PR merges` from the line that has it.

## 2. Next and Planning
If a goal just became the building or planning goal, read its Roadmap Instructions, then read `filling-the-queues.md` in this skill's folder and follow it.

## 3. Report and Stop
Triage the out-of-scope list. Then tell the user what changed, along with the command for each dated copy's next step.

Stop there, and don't start work on any story.
