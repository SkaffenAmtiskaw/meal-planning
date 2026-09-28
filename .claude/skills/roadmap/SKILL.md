---
name: roadmap
description: Shape a goal (an epic Sarah ranks and ships as one release) - its purpose, scope, gaps, supporting tooling and rank - or re-rank the goals, then keep Next and Later in line with the two active goals.
argument-hint: "[goal name, or nothing to re-rank]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Shape the goal **$ARGUMENTS**, or re-rank the goals if no goal was named.

## Why this skill works the way it does
Goals are how Sarah decides what matters. Each one is an epic she ships as one release, and the top two on the Roadmap are the active ones that Next is filled from. They often start out only in her head. This skill gets a goal into a note and onto the Roadmap, and keeps Next honest when the ranking changes.

It gathers facts and writes what Sarah decides. It makes almost no decisions: what the goal is for, what's in it, which gaps get filled, which tooling goes under it, its rank and the order of Next are all hers. Your own judgment covers only dependencies you can point to in the notes or code, and recommendations as AGENTS.md describes under "Recommendations".

The Roadmap is the single place that says which work serves which goal. The goal note never lists its stories.

This is notes work only. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Find the goal
Read `notes/Roadmap.md`, including "How this file works", and `notes/templates/Goal.md`.

- **A goal name:** look for it in `notes/goals/`. If it exists, this is a re-shape: in each step below, show Sarah what the note or Roadmap already says and ask only what's changed. Otherwise it's a new goal.
- **No argument:** go to step 6.

## 2. Purpose and Done When
Ask Sarah what the goal is for and what shipping it means, in her words. If she names work that's out of scope for it, note that too. Draft Purpose, Done When and Out of Scope from the template, keeping her wording. Show her the draft and wait for her approval, then write the note to `notes/goals/<name>.md`, with `confirmed` set to today.

## 3. Scope
Search the Roadmap, including Ideas, and `notes/features/` for work that looks related to the goal's Purpose and Done When: story lines, hubs with open decisions, and items in collecting notes. Skip anything already under the goal's Out of Scope, whether it was added in step 2 or by an earlier run. Skip anything already under the goal's heading or carrying its 🎯 link, unless this is a re-shape and Sarah asks to review it.

Leave tooling out of this step, and offer it in step 5. The exception is a goal about how the app is built, where tooling is the scope: offer it here and skip step 5.

Go through the candidates one at a time. For each, show the line or item, why it looks related, and any goals it already serves. Sarah says:
- **In:**
  - **A line in Unaffiliated or Ideas:** move it under the goal's heading in Later. Add the heading, `## [[<goal>]]`, if it's missing, placed by the goal's rank.
  - **A line under another goal's heading, or in Now or Next:** leave it there, and add `🎯 [[<goal>]]` at its end.
  - **An item in a collecting note:** it stays in its note. Add `🎯 [[<goal>]]` at the item's end, then give the note's Roadmap line the goal the same way as a line above, unless it already has it.
- **Out:** add it to Out of Scope with her reason.
- **Not related:** nothing is recorded.

## 4. Gaps
Compare Done When with the in-scope work, and list each Done When item that nothing covers. Go through them one at a time. Sarah says whether each one gets a Roadmap line under the goal's heading, gets an idea note from `notes/templates/Idea.md` in `notes/features/<area>/` with "Next: /shape ^status" and a line under the heading, or comes out of Done When.

Then list the in-scope stories whose next step is a design session in Claude Design. These are the designs the goal is waiting on. Report them; nothing is written.

## 5. Tooling
Find the tooling that would make this goal's stories easier: tooling lines anywhere in Later (in Unaffiliated or under another goal) or in Ideas, the items in collecting workflow notes (`type: workflow` with a What Belongs Here section), and other workflow and tooling notes. Read what the in-scope stories will touch (their areas, their next steps, what their checks need) and match them up.

Give Sarah a shortlist, most helpful first, each with what it would make easier and for which stories, and any goal it already serves. A tooling line or item stays where it is unless she says to put it under this goal. If she does, handle it the same way as "In" in step 3.

## 6. Rank
Show the Goals list with the two active goals marked. Name any dependencies you can point to, such as an in-scope story whose `blocked-by` names a story under another goal. Ask Sarah where this goal goes. With no argument, ask what moves. Recommend a spot only from those dependencies.

Write the order she gives. Each Goals line is `1. [[<goal>]]`, with ` - active` on the top two. Put the goal headings in Later in the same order.

## 7. Next and Later
**If the active two changed:**
- **A goal that became active:** go through every Later line that serves it, one at a time, whether it sits under the goal's heading or carries its 🎯 link. Judge each one by where the newly active goal stands, not by the goal it's filed under. Sarah says which move into Next. Then ask her the order for the lines she picked, recommending one from their `blocked-by` dependencies. A moved line keeps its 🎯 links, and gets one for the goal whose heading it leaves.
- **A goal that's no longer active:** move each Next line that serves no other active goal back to Later, under the heading of a goal it serves, and remove that goal's 🎯 link. Its other 🎯 links stay. Lines marked 🚨 or 📌 stay. Later isn't ordered, so there's nothing to ask. List the lines you moved.

**Always:** check every Now and Next line for its markers, as "How this file works" describes. Raise each line that's out of place, one at a time. Sarah says whether it gets a 🎯 link to an active goal, 🚨 or 📌 with a reason, or goes back to Later, under a goal's heading or in Unaffiliated. Never add 🚨 or 📌 yourself. If you think a line is urgent, say so and ask.

## 8. Report and stop
Triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". There's no story to pull into, so offer route or drop only.

Then tell Sarah:
- the goal note, created or updated
- each line moved or linked, grouped by where it went
- each note created for a gap
- the designs the goal is waiting on
- the tooling shortlist, and what she put under the goal
- the Goals order, and which lines moved into or out of Next

Leave every change unstaged. Stop there, and don't start work on any story.
