---
name: editing-notes
description: The rules for changing a note in notes/. Use before changing a note.
user-invocable: false
---

# Editing Notes
Later sessions build on what a note says, so a note says what is true now, and says the user decided something only if they did.

If no skill's steps cover what you're doing, read `.claude/note-conventions.md` before creating, moving, closing or deleting a note, or changing its `status`.

## Working on a Note
What to do once your skill has read the note and hasn't stopped, or when you start work on a note with no skill, rather than just editing it in passing, in order:
1. **Whether the note fits:**
   - **If its type doesn't fit its work:** tell the user which type fits and why, and ask how they want to handle it, since retypes are rare and each one is different.
   - **If the type fits but your skill doesn't take it:** tell them which skill the note needs, and stop, because a skill's steps are written for the types it takes.
2. **The Inbox:** decide which items are your step's to act on, and act on each one where it fits in your work. Once you have, if it's one of the user's lines, handle it as "The User's Lines" describes. Otherwise, delete it. Leave items that belong to a later step.
3. **A note behind the current conventions:** add a missing Inbox. If Where It Stands holds anything other than its `^status` line and summary, move it: a question or finding for a later step to the top of the section that step writes, and anything else to the Inbox.
4. **The story's Roadmap line:** if your skill moves the line into Now, leaves it or removes it, follow your skill. Otherwise, if the line is in Later or Ideas, follow the `roadmap-placement` skill.

## The User's Lines
You may do two things with one of the user's lines:
- **If it's done or out of date:** show it to them and ask whether to remove it.
- **If it needs a workflow marker:** add a `🎯 [[Goal]]` link to its end or a `**Blocked by [[Story]]:**` prefix to its start, without asking. They sit outside the user's words.

## What You Write
The kinds of text you add, change or remove in a note, and the rule for each:
- **What the user said:** write that they decided, agreed to or asked for something only if they did. Write that they will do something only if they've committed to it. Record their decisions in the third person ("Sarah decided 2026-09-25 that ..."). If you aren't sure they meant it that way, ask them. These can pass for something they said:
  - **If they said yes to an agent's text, other than a story's scope, or didn't object to it:** they've only approved it, so don't write that they agreed. If the note needs the text as an assumption, say it's an agent's assumption.
  - **If it's an agent's own account,** such as its list of what went wrong: keep it apart from the user's quotes and say it's the agent's.
- **A choice that's the user's call:** mark it, because later agents stop and ask before changing one. Mark a **Decided** line as the `settling-a-decision` skill describes, and end a piece of a Design, Convention or plan with whose call it is, such as "(Sarah's call)". A line they wrote and a story's scope need no mark.
- **A changed Decided line:** rewrite it with the new answer and today's date, and add the old answer as a **Rejected** line saying why, so a later session doesn't propose it again.
- **An open question:** a note holds only the questions the user wants to think over or research.
  - **If the code or docs can answer it:** look it up.
  - **If you aren't sure what the user meant or what they'd pick:** ask them.
  - **If they want to think it over:** write it under Open Decisions. If the note is a story with no `decision needed` entry in `blocked-by`, add one, so `/decide` picks up the note.
- **Something dropped or replaced:** delete it and say only what's true now, because a later reader never saw the old way. Cut lines about what it used to do, such as "no longer", "instead of" or "no X step". If a reader with no history would do the wrong thing without a negative, keep it.
- **A story added to `blocked-by`:** if the blocked story is in Next and the blocker isn't in Now or Next, or the blocked story is in Planning and the blocker isn't in Now, Next or Planning, propose moving the blocker's line into the blocked story's section. It goes directly ahead of the blocked line, with the same markers. Say why, because if the blocker's line stays where it is, the blocked line waits on work no queue will reach.

If you add or move a Roadmap line, follow the `roadmap-placement` skill, unless your skill says where it goes.

## Where It Stands
This is the first section of every note except a goal or standing goal, right after the frontmatter.

Its `^status` line says what the story needs next, so the user can tell from the Roadmap without opening the note. It names the next skill as a command, or links what blocks the story and then names the skill. It may start with a state word or two, and it never describes the story. Examples:
- `Design approved. Next: /plan-steps`
- `Next: /plan-steps. Building waits on [[A]] and [[B]]`, which tells the user what they can do now and what has to wait.
- `Blocked by [[A]]; then /plan-steps`

If the next step needs a skill or agent that isn't built, mark the note blocked on building it, and offer no manual stopgap, because a blocker is how the user sees which skill to build next.

Below the line goes a summary of a few sentences, only if the line leaves out something worth noting, such as what work remains. It doesn't describe the story, because Purpose does.

If you move a story forward, update both. If the next step is settled, make the change without asking and name it in your summary. If there's a real choice, such as what the story is blocked on, show the user the line and wait for their approval.

## The Inbox
The Inbox comes right after Where It Stands in every story, hub and workflow note. It holds what reaches a note outside the usual handoff from one skill to the next: the user's items, items from another note's work, and why a note was sent back to an earlier step. A finding or question for a later step in the usual flow goes at the top of the section that step writes instead.

## A Note That's Wrong or Out of Date
What you do depends on where the mistake is and what it changes:
- **The story you're working on has a mistake that changes its remaining work,** such as a wrong assumption in its approach: if the mistake is in a choice that's the user's call, stop and ask them. Otherwise, fix the text and name the fix in your summary.
- **Only a name or path changed,** and the plan still works as written: correct it in place, because the user approved the intent, not the path.
- **A built change affects another story's remaining work:** handle it as the `triaging-out-of-scope-work` skill describes.
- **It changes nothing about the work,** such as a wrong detail in a finding: if it's a line an agent wrote in a note you're working on, and not plan text, correct it. Otherwise, leave it, because changing plan text or another note costs a review and changes nothing.

## A `ready` Note Whose Plan Changes
If a `ready` note's design or steps change, its status depends on the change:
- **The plan is still what the user approved,** as with a corrected path or a Boy Scout fix: it stays `ready`.
- **You changed a choice they only approved:** it stays `ready`, because your summary tells them about the change.
- **Otherwise:** it goes back to `spec` until they re-review it, because `ready` means they approved this plan.
