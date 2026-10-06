---
name: roadmap-placement
description: How to check which goals a committed story or a new collecting-note item serves, then place the story's Roadmap line in Later or link the item. Use when a skill commits a story, such as /shape after shaping it or /decide after Sarah decides it's worth doing, or when an item is added to a collecting note.
user-invocable: false
---

# Checking the goals
If Sarah already named the story's goals, use them and go on to placing the line. She has named them if she answered this session, such as when its line moved into Next as the skill started, or if its Roadmap line already sits under a goal's heading in Later or ends with 🎯 links, as when `/tooling` spun it off. Otherwise, read each note in `notes/goals/`: a goal's Purpose, Done When, Out of Scope and Roadmap Instructions, and a standing goal's Purpose, What Belongs Here, Out of Scope and Roadmap Instructions.

A goal's Roadmap Instructions are Sarah's own rules, in her own wording. If one says the story or item serves that goal, as Dev Tooling's do for everything in its collecting notes, don't ask about that goal:
- **A story** serves it. Go on to check the other goals.
- **An item** serves it unless Sarah picks another goal below, since an item fits one goal best.

Which goals are plausible depends on the work, a story or an item:
- **Dev tooling or agent work:** a goal is plausible when a line in its Purpose, Done When or What Belongs Here could reasonably include the work, or when the work could make the goal's work easier. Judge that from the goal's Done When and the Roadmap lines that serve it.
- **Otherwise:** a goal is plausible when a line in its Purpose, Done When or What Belongs Here could reasonably include the work.

A goal whose Out of Scope lists the story or item is never plausible. For an item, the building or planning goal (the top two under the Roadmap's Goals) is plausible only when you see a compelling case that the goal can't be complete without it, as the Roadmap's "How this file works" describes under "Collecting notes".

If no goal is plausible, apart from any its Roadmap Instructions settled, don't ask. Place a story's line with only the settled goals, or no goal, or link an item to its settled goal, or leave it with no 🎯 link, and mention it in your summary. Otherwise, ask Sarah which other goals the story or item serves:
- **Dev tooling or agent work:** name each plausible goal, and the line that includes the work or the work it would make easier. Don't recommend one. The Roadmap's "How this file works" says tooling sits under Dev Tooling's heading unless Sarah puts it under a ranked goal.
- **Otherwise:** suggest each plausible goal, and quote the line that covers it.

For an item, ask which one goal it fits best, counting a goal its Roadmap Instructions settled as one of the choices, and give the compelling case for the building or planning goal. It serves two only when neither goal can be done without it.

"None" is an answer too.

# Placing a story's line
Where the line goes depends on where it sits now:
- **In Ideas or Unaffiliated:** if Sarah named a goal, move the line under that goal's heading in Later. Add the heading, `## [[<goal>]]`, if it's missing, placed as the Roadmap's "How this file works" describes under Later. If she named no goal, the line goes in Unaffiliated.
- **Under a goal's heading, or in Now or Next:** leave it where it is. If she says it doesn't serve the goal it sits under, ask her where it goes.

Then end the line with `🎯 [[<goal>]]` for each goal she named that its heading doesn't already cover. A line in Later stays there, even under the building or planning goal, unless Sarah says it goes into that goal's queue: Next for the building goal, Planning for the planning goal. If she does, ask her where in that section, as AGENTS.md describes under "Roadmap order".

# Linking a collecting-note item
End the item with `🎯 [[<goal>]]` for each goal Sarah named. The note's own Roadmap line doesn't change: it carries no 🎯 links, as the Roadmap's "How this file works" describes under "Collecting notes".

If a goal she named is the building goal, the item is kicked off for it now. How depends on what the goal already has:
- **An open kicked-off copy of this note** (`<note> YYYY-MM-DD`, under the goal's heading or ending with its 🎯 link): move the item into the copy, and add any of the item's 🎯 links that the copy's line doesn't have yet.
- **No such copy:** read `.claude/skills/kickoff/SKILL.md` and follow it as its "Kicking off for the building goal" section describes.

If the copy's line is in Later, ask Sarah whether it moves into Next. If it does, ask her where in Next, as AGENTS.md describes under "Roadmap order".
