---
name: roadmap-placement
description: How to check which goals a committed story serves, then place its Roadmap line. Use when committing a story.
user-invocable: false
---

# Checking the Goals
Whether to read the goal notes depends on the work. The cases:
- **The user has already named the goals,** such as by placing the line under a goal's heading or giving it 🎯 links: go on to placing the line.
- **It's a bug the Roadmap's "How this file works" puts under Bugs:** its line goes under that heading, so go on to placing the line.
- **Otherwise:** read the notes in `notes/goals/`. If a goal's Roadmap Instructions say the work belongs to it, it does. Another goal fits when a line in its Purpose, Done When or What Belongs Here could include the work, and dev tooling also fits a goal it would make easier. If none fits, don't ask. Otherwise, ask the user which ones the work serves, naming each goal that fits and quoting that line. Don't recommend one for tooling, because whether tooling joins a ranked goal is the user's priority call.

# Placing a Story's Line
If the line is in Ideas or Unaffiliated, move it as the Roadmap's "How this file works" describes under Later and Bugs. A line already under a goal's heading, or in Now, Next or Planning, stays where it is. It goes into Next or Planning only if the user says so.
