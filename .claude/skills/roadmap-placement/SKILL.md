---
name: roadmap-placement
description: How to check which goals a committed story or a new collecting-note item serves, then place the story's Roadmap line in Later or link the item. Use when a skill commits a story, such as /shape after shaping it or /decide after Sarah decides it's worth doing, or when an item is added to a collecting note.
user-invocable: false
---

# Checking the goals
Read each goal note in `notes/goals/`: its Purpose, Done When and Out of Scope. Which goals are plausible depends on the work, a story or an item:
- **Dev tooling or agent work:** a goal is plausible when a line in its Purpose or Done When could reasonably include the work, or when the work could make the goal's work easier. Judge that from the goal's Done When and the Roadmap lines that serve it.
- **Otherwise:** a goal is plausible when a line in its Purpose or Done When could reasonably include the work.

A goal whose Out of Scope lists the story or item is never plausible.

If no goal is plausible, don't ask. Place a story's line with no goal, or leave an item with no 🎯 link, and mention it in your summary. Otherwise, ask Sarah which goals the story or item serves:
- **Dev tooling or agent work:** name each plausible goal, and the line that includes the work or the work it would make easier. Don't recommend one. The Roadmap's "How this file works" says tooling stays in Unaffiliated unless Sarah puts it under a goal.
- **Otherwise:** suggest each plausible goal, and quote the line that covers it.

"None" is an answer too.

# Placing a story's line
Where the line goes depends on where it sits now:
- **In Ideas or Unaffiliated:** if Sarah named a goal, move the line under that goal's heading in Later. Add the heading, `## [[<goal>]]`, if it's missing, placed by the goal's rank. If she named no goal, the line goes in Unaffiliated.
- **Under a goal's heading, or in Now or Next:** leave it where it is. If she says it doesn't serve the goal it sits under, ask her where it goes.

Then end the line with `🎯 [[<goal>]]` for each goal she named that its heading doesn't already cover. A line in Later stays there, even under an active goal, unless Sarah says it goes into Next. If she does, ask her where in Next, as AGENTS.md describes under "Roadmap order".

# Linking a collecting-note item
End the item with `🎯 [[<goal>]]` for each goal Sarah named. Then add the same links to the end of the note's Roadmap line, except any it already has. The line doesn't move: in Later it stays in Unaffiliated, as the Roadmap's "How this file works" describes under "Collecting notes". If it's in Later and Sarah says it goes into Next, ask her where in Next, as AGENTS.md describes under "Roadmap order".
