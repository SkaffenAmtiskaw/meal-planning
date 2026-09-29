---
name: roadmap-placement
description: How to check which goals a committed story serves and place its Roadmap line in Later. Use when a skill commits a story, such as /shape after shaping it or /decide after Sarah decides it's worth doing.
user-invocable: false
---

# Checking the story's goals
Read each goal note in `notes/goals/`: its Purpose, Done When and Out of Scope. Which goals are plausible depends on the story:
- **Dev tooling or agent work:** a goal is plausible when a line in its Purpose or Done When could reasonably include the story, or when the story could make the goal's work easier. Judge that from the goal's Done When and the Roadmap lines that serve it.
- **Otherwise:** a goal is plausible when a line in its Purpose or Done When could reasonably include the story.

A goal whose Out of Scope lists the story is never plausible.

If no goal is plausible, don't ask. Place the line with no goal, and mention it in your summary. Otherwise, ask Sarah which goals the story serves:
- **Dev tooling or agent work:** name each plausible goal, and the line that includes the story or the work it would make easier. Don't recommend one. The Roadmap's "How this file works" says tooling stays in Unaffiliated unless Sarah puts it under a goal.
- **Otherwise:** suggest each plausible goal, and quote the line that covers it.

"None" is an answer too.

# Placing the line
Where the line goes depends on where it sits now:
- **In Ideas or Unaffiliated:** if Sarah named a goal, move the line under that goal's heading in Later. Add the heading, `## [[<goal>]]`, if it's missing, placed by the goal's rank. If she named no goal, the line goes in Unaffiliated.
- **Under a goal's heading, or in Now or Next:** leave it where it is. If she says it doesn't serve the goal it sits under, ask her where it goes.

Then end the line with `🎯 [[<goal>]]` for each goal she named that its heading doesn't already cover. A line in Later stays there, even under an active goal, unless Sarah says it goes into Next. If she does, ask her where in Next, as AGENTS.md describes under "Roadmap order".
