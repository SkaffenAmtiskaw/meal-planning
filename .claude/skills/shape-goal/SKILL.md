---
name: shape-goal
description: Shapes a goal or standing goal, or draws a goal from a standing goal. Use when a goal needs shaping, or a release's Done When has gaps.
argument-hint: "[goal or standing goal name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Shape the goal or standing goal **$ARGUMENTS**.

Invoke the `editing-notes` skill first, since this run changes notes.

The user decides what work is in a goal while planning its release, so don't suggest work for its scope. The exceptions are a standing goal's own work when you draw a goal from it, and what step 4 finds for the goal's gaps.

## 1. Find the Goal
Read `Roadmap.md` in the notes repo and invoke the `roadmap-rules` skill. Then look for the name in `goals/` in the notes repo. What you find decides the path:
- **A goal** (`type: goal`): this is a re-shape.
- **A standing goal** (`type: standing-goal`): ask the user whether to re-shape it or draw a goal from it. To re-shape it, read `shaping-a-standing-goal.md` in this skill's folder and follow it. To draw a goal, name the new goal `<standing goal> YYYY-MM-DD` with today's date, and go on to step 2.
- **Nothing:** ask the user whether it's a goal or a standing goal. For a goal, go on to step 2. For a standing goal, read `shaping-a-standing-goal.md` in this skill's folder and follow it.

If this is a re-shape, of a goal or a standing goal, show the user what the note or Roadmap already says at each step, and ask only what's changed.

## 2. Purpose and Done When
Ask the user what the goal is for and what shipping it means, noting any work they name as out of scope and why. Draft Purpose, Done When and Out of Scope from its template, keeping what they meant. Each Done When item is something the user can check in the running app, or a named piece of work being finished. Once they approve the draft, write the note.

## 3. A New Goal's Place
If the goal is new, add its line under Goals as the last ranked goal, and give it a heading in Later after the last ranked goal's heading. Ranking it higher is `/roadmap`'s job, because moving a goal into the top two moves the building or planning marker, which refills the queues.

If you're drawing the goal from a standing goal, now offer the standing goal's work, as `drawing-a-goal.md` in this skill's folder describes. It comes before step 4, so the work that moves isn't counted as gaps.

## 4. Gaps
Find the Done When items that nothing covers, and get each one covered. How depends on the goal's line under Goals:
- **If it says ` · releasing`:** `/ship-goal` sent the user here with the gaps it found, and the release waits for them.
  1. Ask the user which items `/ship-goal` named. The goal's stories have closed and their lines are gone, so comparing would show almost every item as a gap.
  2. For each gap, draft an idea note and show it to the user. It's an idea note rather than a hub, because only a story the `# Release` section links can be built, and a hub's later child stories wouldn't be linked. Once they approve it, write the note.
  3. Add `[[<note>]] ![[<note>#^status]] 🎯 [[<goal>]]` to Next. Put it below the 🔥 lines and below the lines for notes the goal note's `# Release` section already links, and above every other line.
  4. In the goal note's `# Release` section, add a bullet that links the note, so the release freeze lets it be built.
  5. Remove ` · Next: /ship-goal` from the goal's line, since the goal has work left again.
- **Otherwise:**
  1. Compare Done When with the work that serves the goal: the lines in its queue or under its heading, and the lines that carry its 🎯 link. Each item that nothing covers is a gap.
  2. For each gap, look for existing work that would cover it, so no note is drafted for work that already has one. Search the Roadmap, including Ideas, and `features/` in the notes repo for a story or hub. A hub counts only if it has a next step of its own, because otherwise its child stories hold its work. Leave out bugs, sweeps and collecting workflow notes, because they join every release anyway. Leave out anything under the goal's Out of Scope too.
  3. If you find one, show its line or note and ask whether it serves this goal. If they say no, the gap is still open. What a yes does depends on the goal:
     - **The building or planning goal:** add the goal's 🎯 link. If the line is in Now or Next, leave it there. Otherwise, move it into the goal's queue and ask the user where it goes. If it leaves another goal's heading, give it that goal's 🎯 link too.
     - **Any other goal:** if the line is in Unaffiliated or Ideas, move it under the goal's heading in Later. Otherwise, leave it where it is, and add the goal's 🎯 link.
  4. For each gap still open, draft a note and show it to the user. If the item covers a whole area and what to build there isn't known yet, make it an exploration hub, with `Next: /brainstorm` as its `^status` line. Otherwise, make it an idea note. Once they approve it, write the note.
  5. Place the note's line. If the goal is marked `- building` or `- planning`, add `[[<note>]] ![[<note>#^status]] 🎯 [[<goal>]]` to the goal's queue, and ask the user where it goes. Otherwise, add its line under the goal's heading.

## 5. Report and Stop
Triage the out-of-scope list. Then tell the user what changed, along with:
- for a new goal, `/roadmap` as the way to rank it higher
- the designs the goal is waiting on, which are the stories and hubs serving it whose next step is `/design-feature`
- if the goal's lines and notes overlap or look scattered, `/gather-goal <goal>` as the next step

Stop there, and don't start work on any story.
