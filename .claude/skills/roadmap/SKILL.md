---
name: roadmap
description: Shape a goal (an epic Sarah ranks and ships as one release) or a standing goal (one that collects work no goal would take, and never ships), draw a goal from a standing goal, or re-rank the goals, then keep Next and Later in line with the two active goals.
argument-hint: "[goal or standing goal name, or nothing to re-rank]"
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

Some work never serves a goal, because it never blocks a feature: a library upgrade, or a piece of tech debt. A standing goal collects it. It's never ranked or active, and it never ships. When Sarah wants to take on some of that work, this skill draws a goal from it: an ordinary goal, named `<standing goal> YYYY-MM-DD`, that takes the work she picks and ships as one release, while the standing goal keeps collecting.

It gathers facts and writes what Sarah decides. It makes almost no decisions: what the goal is for, what's in it, which gaps get filled, which tooling goes under it, its rank and the order of Next are all hers. Your own judgment covers only dependencies you can point to in the notes or code, and recommendations as AGENTS.md describes under "Recommendations".

The Roadmap is the single place that says which work serves which goal. The goal note never lists its stories.

This is notes work only. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Find the goal
Read `notes/Roadmap.md`, including "How this file works", `notes/templates/Goal.md` and `notes/templates/Standing Goal.md`.

- **A name:** look for it in `notes/goals/`. What happens next depends on what's there:
  - **A goal** (`type: goal`): this is a re-shape. In each step below, show Sarah what the note or Roadmap already says and ask only what's changed.
  - **A standing goal** (`type: standing-goal`): ask Sarah whether she wants to re-shape it or draw a goal from it. To re-shape it, follow "Shaping a standing goal", showing what the note or Roadmap already says and asking only what's changed. To draw a goal, follow "Drawing a goal from a standing goal".
  - **Nothing:** ask Sarah whether it's a goal, which ships as one release, or a standing goal, which collects work and never ships. For a goal, go on to step 2. For a standing goal, follow "Shaping a standing goal".
- **No argument:** go to step 6.

## 2. Purpose and Done When
Ask Sarah what the goal is for and what shipping it means, in her words. If she names work that's out of scope for it, note that too. Draft Purpose, Done When and Out of Scope from the template, keeping her wording. Show her the draft and wait for her approval, then write the note to `notes/goals/<name>.md`, with `confirmed` set to today.

## 3. Scope
Search the Roadmap, including Ideas, and `notes/features/` for work that looks related to the goal's Purpose and Done When: story lines, hubs with open decisions, and collecting notes and their items. Skip anything already under the goal's Out of Scope, whether it was added in step 2 or by an earlier run. Skip anything already under the goal's heading or carrying its 🎯 link, unless this is a re-shape and Sarah asks to review it. For a collecting note, skip only the items that carry the link, not the whole note.

Leave tooling out of this step, and offer it in step 5. The exception is a goal about how the app is built, where tooling is the scope: offer it here and skip step 5.

A goal takes a collecting note's items, never the note itself, as the Roadmap's "How this file works" describes under "Collecting notes". How a collecting note is offered depends on its Purpose:
- **Its Purpose matches the goal:** offer the note as a whole, meaning the items it has now.
- **It mixes work for different goals:** offer each related item on its own.

Go through the candidates one at a time. For each, show the line, note or item, why it looks related, and any goals it already serves. Sarah says:
- **In:**
  - **A line in Unaffiliated or Ideas:** move it under the goal's heading in Later. Add the heading, `## [[<goal>]]`, if it's missing, placed as "How this file works" describes under Later.
  - **A line under another goal's heading, or in Now or Next:** leave it there, and add `🎯 [[<goal>]]` at its end.
  - **A collecting note as a whole:** add `🎯 [[<goal>]]` at the end of each of its items that doesn't have it yet, and at the end of the note's Roadmap line. The line stays where it is.
  - **An item in a collecting note:** add `🎯 [[<goal>]]` at the item's end, and at the end of the note's Roadmap line unless it already has it. The line stays where it is.
- **Out:** add it to Out of Scope with her reason. For a whole collecting note, the entry names the note and each of its current items, so items added later are still checked against the goal when they come in.
- **Not related:** nothing is recorded.

## 4. Gaps
Compare Done When with the in-scope work, and list each Done When item that nothing covers. Go through them one at a time. For each, draft an idea note from `notes/templates/Idea.md` for `notes/features/<area>/`, with "Next: /shape ^status", and show it to Sarah:
- **She approves it,** with any changes she asks for: write the note, and add its line under the goal's heading.
- **She says the gap doesn't fit an idea note:** ask whether it gets a Roadmap line under the goal's heading instead or comes out of Done When, and do what she says.

Then list the in-scope stories whose next step is a design session in Claude Design. These are the designs the goal is waiting on. Report them; nothing is written.

## 5. Tooling
Find the tooling that would make this goal's stories easier: tooling lines anywhere in Later (in Unaffiliated or under another goal) or in Ideas, the items in collecting workflow notes (`type: workflow` with a What Belongs Here section), and other workflow and tooling notes. Read what the in-scope stories will touch (their areas, their next steps, what their checks need) and match them up.

Give Sarah a shortlist, most helpful first, each with what it would make easier and for which stories, and any goal it already serves. Collecting notes go on it as a whole or item by item, the same way as in step 3. A tooling line, note or item stays where it is unless she says to put it under this goal. If she does, handle it the same way as "In" in step 3.

## 6. Rank
Show the Goals list with the two active goals marked. Name any dependencies you can point to, such as an in-scope story whose `blocked-by` names a story under another goal. Ask Sarah where this goal goes. With no argument, ask what moves. Recommend a spot only from those dependencies. Standing goals are never ranked. They stay under the Standing Goals subheading, unnumbered, and never take an active spot.

Write the order she gives. Each Goals line is `1. [[<goal>]]`, with ` - active` on the top two. Put the goal headings in Later in the same order, followed by the standing goals' headings.

## 7. Next and Later
**If the active two changed:**
- **A goal that became active:** go through every Later line that serves it, one at a time, whether it sits under the goal's heading or carries its 🎯 link. Judge each one by where the newly active goal stands, not by the goal it's filed under. Sarah says which move into Next. Then ask her the order for the lines she picked, recommending one from their `blocked-by` dependencies. A moved line keeps its 🎯 links, and gets one for the goal whose heading it leaves.
- **A goal that's no longer active:** move each Next line that serves no other active goal back to Later, under the heading of a goal it serves, and remove that goal's 🎯 link. Its other 🎯 links stay. Lines marked 🚨 or 📌 stay. Later isn't ordered, so there's nothing to ask. List the lines you moved.

**Always:** check every Now and Next line for its markers, as "How this file works" describes. Raise each line that's out of place, one at a time. Sarah says whether it gets a 🎯 link to an active goal, 🚨 or 📌 with a reason, or goes back to Later, under a goal's heading or in Unaffiliated. Never add 🚨 or 📌 yourself. If you think a line is urgent, say so and ask.

## Shaping a standing goal
1. **Purpose and What Belongs Here.** Ask Sarah what kind of work it collects and why no goal would take it, in her words, and what looks close but doesn't belong. Draft Purpose, What Belongs Here and Out of Scope from the Standing Goal template, keeping her wording. Show her the draft and wait for her approval, then write the note to `notes/goals/<name>.md`, with `confirmed` set to today.
2. **The Roadmap.** For a new standing goal, add `- [[<name>]]` under `## Standing Goals` at the end of the Goals section, adding the subheading if it's missing. Add its heading, `## [[<name>]]`, in Later after the ranked goals' headings and before Unaffiliated.
3. **Scope.** Follow step 3, judging candidates against Purpose and What Belongs Here instead of Purpose and Done When. Offer tooling here like any other work when What Belongs Here covers it.

Then go to step 8. Steps 4 to 7 don't apply: a standing goal has no Done When and is never ranked.

## Drawing a goal from a standing goal
The drawn goal is an ordinary goal, named `<standing goal> YYYY-MM-DD` with today's date. It goes through steps 2 to 7 like any new goal, with two differences:
- **Step 2:** its Purpose starts with "Drawn from [[<standing goal>]]."
- **Step 3:** before searching, offer the work that serves the standing goal: the lines under its heading in Later, the lines elsewhere that carry its 🎯 link, and the collecting-note items that carry it. Offer a collecting note's linked items together, as one candidate. Go through the candidates one at a time. Sarah says:
  - **In:** the work moves to the drawn goal. A line under the standing goal's heading moves under the drawn goal's heading. Anywhere else, the standing goal's 🎯 link becomes the drawn goal's, on the line or on each item. A collecting note's Roadmap line gets the drawn goal's link, and keeps the standing goal's only if another of its items still carries it.
  - **Not this time:** it stays with the standing goal, and nothing is recorded.

  Then go on with step 3's search for other related work.

If Sarah takes work out of a drawn goal in a later re-shape, it goes back to its standing goal: under the standing goal's heading, or ending with its 🎯 link.

## 8. Report and stop
Triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". There's no story to pull into, so offer route or drop only.

Then tell Sarah:
- the goal or standing goal note, created or updated
- each line or collecting-note item moved or linked, grouped by where it went
- each note created for a gap
- the designs the goal is waiting on
- the tooling shortlist, and what she put under the goal
- the Goals order, and which lines moved into or out of Next

Leave every change unstaged. Stop there, and don't start work on any story.
