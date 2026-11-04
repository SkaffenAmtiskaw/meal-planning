---
name: roadmap-placement
description: How to place or move a story's Roadmap line. Use when adding or moving a Roadmap line, or when working on a story whose line is in Later or Ideas.
user-invocable: false
---

# Placing a Roadmap Line
Where a line goes follows from its work and the goals it serves, and the user decides its place in an ordered queue. If you're starting on a story whose line is in Later or Ideas, follow "Starting on a Story in the Backlog".

## Checking the Goals
Whether to read the goal notes depends on the work. The cases:
- **The user has already named the goals,** such as by placing the line under a goal's heading or giving it 🎯 links: go on to where the line goes, below.
- **It's a bug the Roadmap's "How this file works" puts under Bugs:** its line goes under that heading, so go on to where the line goes, below.
- **Otherwise:** read the notes in `notes/goals/`. If a goal's Roadmap Instructions say the work belongs to it, it does, so don't ask about that goal. Another goal fits when a line in its Purpose, Done When or What Belongs Here could include the work, and dev tooling also fits a goal it would make easier. If no other goal fits, don't ask. Otherwise, ask the user which ones the work serves, naming each goal that fits and quoting that line. Don't recommend one for tooling, because whether tooling joins a ranked goal is the user's priority call.

## Moving an Existing Line
If the story is committed and its line is in Ideas or Unaffiliated, move it. The Later and Bugs entries in the Roadmap's "How this file works" say where it goes. A line goes into Next or Planning only if the user says so.

## Placing a New Line
If something about the work makes its usual spot look wrong, such as when the user has said in the session that it needs prioritizing, or when a line in Next or Planning waits on it, ask them. Otherwise, the spot follows from its work:
- **It's a bug the Roadmap's "How this file works" puts under Bugs:** it goes under that heading in Later.
- **It serves a goal:** it's committed, so it goes under that goal's heading in Later.
- **It serves no goal:** it's uncommitted, so it goes in Ideas.

## Placing a Line in Next or Planning
Next and Planning are ordered queues, so ask the user where a line goes. If the notes or the Roadmap make the spot clear, suggest it and say why. Otherwise, ask without a suggestion.

## Starting on a Story in the Backlog
The user running a skill on a story means they want it worked, whether it's a problem to fix or an idea to weigh. So don't set out to check whether it's still needed, and don't recommend dropping it out of hand.

If the story's line is in Later or Ideas when a skill starts on it, what you do depends on the line:
- **A line under the Bugs heading:** leave it, because a bug is shaped, investigated and planned ahead of the release that picks it up.
- **Otherwise:** ask the user whether it moves into Next or Planning. If it does:
  1. Check its goals, as "Checking the Goals" describes, and give it a 🎯 link for each goal they name.
  2. If one of them is the building goal, it goes in Next. Otherwise, if one is the planning goal, it goes in Planning. If neither, ask whether it goes in Next with 📌, and with what reason.
  3. Ask where in that section it goes, as "Placing a Line in Next or Planning" describes.
