---
name: roadmap
description: Shapes a goal or standing goal, draws a goal from a standing goal, or re-ranks the goals, then keeps Next, Planning and Later in line with the ranking. Use when a goal needs shaping or the goals' order changes.
argument-hint: "[goal or standing goal name, or nothing to re-rank]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

If no goal was named, re-rank the goals. Otherwise, shape the goal or standing goal **$ARGUMENTS**.

Invoke the `editing-notes` skill first, since this run changes notes.

## A Goal's Own Instructions
A goal or standing goal can hold instructions for this skill under its Roadmap Instructions heading, in any wording. Whenever you work with a goal or standing goal, read its instructions and follow each where it applies. An instruction is the user's decision, so ask only if you can't tell what it wants or when it applies.

If the user asks for a new instruction during a run, write what they meant under the goal note's Roadmap Instructions.

## 1. Find the Goal
Read `Roadmap.md` in the notes repo and invoke the `roadmap-rules` skill. In a re-shape, show the user what the note or Roadmap already says at each step, and ask only what's changed. What happens next depends on the argument:
- **A name:** look for it in `goals/` in the notes repo. What you find decides the path:
  - **A goal** (`type: goal`): this is a re-shape.
  - **A standing goal** (`type: standing-goal`): ask the user whether to re-shape it or draw a goal from it. To re-shape it, read `shaping-a-standing-goal.md` in this skill's folder and follow it. To draw a goal, read `drawing-a-goal.md` in this skill's folder and follow it.
  - **Nothing:** ask the user whether it's a goal or a standing goal. For a goal, go on to step 2. For a standing goal, read `shaping-a-standing-goal.md` in this skill's folder and follow it.
- **No argument:** go to step 6.

## 2. Purpose and Done When
Ask the user what the goal is for and what shipping it means, noting any work they name as out of scope and why. Draft Purpose, Done When and Out of Scope from its template, keeping what they meant. Each Done When item is something the user can check in the running app, or a named piece of work being finished. Once they approve the draft, write the note.

## 3. Scope
If the goal's line under Goals says ` · releasing`, skip this step and step 5. Work added to the goal now would be held back by the release freeze and stop `/ship-goal`, and step 4 files what the release still needs.

Search the Roadmap, including Ideas, and `features/` in the notes repo for stories and hubs that look related to the goal's Purpose and Done When. A hub counts only if it has a next step of its own. These stay out:
- lines under the Bugs heading, sweeps and collecting workflow notes, because they join every release
- anything already under the goal's Out of Scope
- tooling, unless the goal is about how the app is built, because step 5 handles it

For each candidate, show its line or note, why it looks related, and any goals it already serves. The user's answer decides what happens to it:
- **In:**
  - **A line in Unaffiliated or Ideas:** move it under the goal's heading in Later.
  - **Any other line:** leave it where it is, and add the goal's 🎯 link.
- **Out:** add it to Out of Scope with their reason.
- **Not related:** record nothing.

## 4. Gaps
Find the Done When items that are gaps. How depends on the goal's line under Goals:
- **If it says ` · releasing`:** `/ship-goal` sent the user here with the gaps it found. The goal's stories have closed and their lines are gone, so comparing would show almost every item as a gap. Ask the user which items `/ship-goal` named.
- **Otherwise:** compare Done When with the in-scope work. Each item that nothing covers is a gap.

For each gap, draft a note and show it to the user. The kind of note depends on the case:
- **If the goal is releasing:** an idea note, because only a story the `# Release` section links can be built, and a hub's later child stories wouldn't be linked.
- **If the item covers a whole area and what to build there isn't known yet:** an exploration hub, with `Next: /brainstorm` as its `^status` line.
- **Otherwise:** an idea note.

Once they approve it, write the note. Where its line goes, and what else changes, depends on the goal's line under Goals:
- **If it says ` · releasing`:** the release waits for the gap.
  1. Add `[[<note>]] ![[<note>#^status]] 🎯 [[<goal>]]` to Next, above every line except 🔥 lines and those for notes the goal note's `# Release` section already links, and renumber the lines below it.
  2. In the goal note's `# Release` section, add a bullet that links the note, so the release freeze lets it be built.
  3. Remove ` · Next: /ship-goal` from the goal's line, since the goal has work left again.
- **Otherwise:** add its line under the goal's heading.

## 5. Tooling
If the goal is about how the app is built, skip this step, because step 3 covered its tooling. Otherwise, find the tooling that would make this goal's stories easier. Look at tooling lines in Later and Ideas, and at workflow and tooling notes other than collecting ones.

Give the user a shortlist, most helpful first. For each entry, say what it would make easier, for which stories, and any goal it already serves. If they put one under this goal, handle it as "In" in step 3.

## 6. Rank
Show the Goals list, and name any dependencies you can point to in the notes or code, such as an in-scope story whose `blocked-by` names a story under another goal. If you're shaping a goal, ask the user where it goes. Otherwise, ask which goals move. If those dependencies point to a spot, recommend it.

Put the Goals list and the Later headings in the order they give. The top goal is the building goal and the second the planning goal. If the order means either marker moves, first run `sh scripts/release-freeze.sh`. What to do depends on how it exits:
- **1, a release is under way:** building the next goal now would add its work to that release. Tell the user the markers move once the release PR merges, with another `/roadmap` run. Leave both markers where they are.
- **2, it can't tell:** tell the user what it printed, and leave both markers where they are.
- **0:** mark the top goal `- building` and the second `- planning`.

## 7. Next and Planning
If a goal just became the building or planning goal, read its Roadmap Instructions, then read `filling-the-queues.md` in this skill's folder and follow it.

## 8. Report and Stop
Triage the out-of-scope list. Then tell the user what changed, along with:
- the command for each dated copy's next step
- the designs the goal is waiting on, which are the in-scope stories and hubs whose next step is `/design-feature`
- if the goal's lines and notes overlap or look scattered, `/gather-goal <goal>` as the next step

Stop there, and don't start work on any story.
