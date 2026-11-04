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

## A Goal's Own Instructions
A goal or standing goal can hold instructions for this skill under its Roadmap Instructions heading, in any wording. Whenever you work with a goal or standing goal, read its instructions and follow each where it applies. An instruction is the user's decision, so ask only if you can't tell what it wants or when it applies.

If the user asks for a new instruction during a run, write what they meant under the goal note's Roadmap Instructions.

## 1. Find the Goal
Read `notes/Roadmap.md`. In a re-shape, show the user what the note or Roadmap already says at each step, and ask only what's changed. What happens next depends on the argument:
- **A name:** look for it in `notes/goals/`. What you find decides the path:
  - **A goal** (`type: goal`): this is a re-shape.
  - **A standing goal** (`type: standing-goal`): ask the user whether to re-shape it or draw a goal from it. To re-shape it, follow "Shaping a Standing Goal". To draw a goal, read `drawing-a-goal.md` in this skill's folder and follow it.
  - **Nothing:** ask the user whether it's a goal or a standing goal. For a goal, go on to step 2. For a standing goal, follow "Shaping a Standing Goal".
- **No argument:** go to step 6.

## 2. Purpose and Done When
Ask the user what the goal is for and what shipping it means, noting any work they name as out of scope and why. Draft Purpose, Done When and Out of Scope from its template, keeping what they meant. Each Done When item is something the user can check in the running app, or a named piece of work being finished. Once they approve the draft, write the note.

## 3. Scope
Search the Roadmap, including Ideas, and `notes/features/` for stories and hubs that look related to the goal's Purpose and Done When. A hub counts only if it has a next step of its own. These stay out:
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
Compare Done When with the in-scope work. For each Done When item that nothing covers, draft a note and show it to the user. The item decides the kind of note:
- **If the item covers a whole area and what to build there isn't known yet:** an exploration hub, with `Next: /brainstorm` as its `^status` line.
- **Otherwise:** an idea note.

Once they approve it, write the note and add its line under the goal's heading.

## 5. Tooling
If the goal is about how the app is built, skip this step, because step 3 covered its tooling. Otherwise, find the tooling that would make this goal's stories easier. Look at tooling lines in Later and Ideas, and at workflow and tooling notes other than collecting ones.

Give the user a shortlist, most helpful first. For each entry, say what it would make easier, for which stories, and any goal it already serves. If they put one under this goal, handle it as "In" in step 3.

## 6. Rank
Show the Goals list, and name any dependencies you can point to in the notes or code, such as an in-scope story whose `blocked-by` names a story under another goal. If you're shaping a goal, ask the user where it goes. Otherwise, ask which goals move. If those dependencies point to a spot, recommend it.

Put the Goals list and the Later headings in the order they give.

## 7. Next and Planning
If a goal just became the building or planning goal, read its Roadmap Instructions, then read `filling-the-queues.md` in this skill's folder and follow it.

## Shaping a Standing Goal
1. **Purpose and What Belongs Here.** Ask the user what kind of work it collects, why no goal would take it, and what looks close but doesn't belong. Draft Purpose, What Belongs Here and Out of Scope from its template, keeping what they meant. Once they approve the draft, write the note.
2. **The Roadmap.** For a new standing goal, add it to the Goals section's Standing Goals list and give it a heading in Later.
3. **Scope.** Follow step 3, judging candidates against Purpose and What Belongs Here instead of Purpose and Done When.

Then go to step 8.

## 8. Report and Stop
Triage the out-of-scope list. Then tell the user what changed, along with:
- the command for each dated copy's next step
- the designs the goal is waiting on, which are the in-scope stories and hubs whose next step is `/design-feature`
- if the goal's lines and notes overlap or look scattered, `/gather-goal <goal>` as the next step

Stop there, and don't start work on any story.
