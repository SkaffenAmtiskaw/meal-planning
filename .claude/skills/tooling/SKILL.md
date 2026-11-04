---
name: tooling
description: Makes one change to the agent workflow or dev tooling in a single session and cleans up the notes it reaches. Use for a change to how the app is built.
argument-hint: "[note name, an item in a note, or a description of the change]"
disable-model-invocation: true
---

Make this workflow or tooling change: **$ARGUMENTS**

A tooling change skips the story lifecycle, which exists so product code is built and reviewed in small pieces. The user can take in a whole change to a skill or a convention and review it directly.

## 1. Find Out What's Changing
If the argument is a description, search `notes/` for notes and items about the same thing, because they may already hold details or decisions. Tell the user what you found.

If it names a note or an item in one, the note's `type` says what the change is:
- **`workflow` with a What Belongs Here section:** a collecting note. If it has a kicked-off copy (`<name> YYYY-MM-DD`), work the copy instead. If the argument names no item, list the items and point out any that are logically grouped, such as several rules that all land in the same doc. Ask the user which item or group this session does.
- **`workflow` without one:** the whole note is the change.
- **Any other type, or none:** it's story work, so this skill doesn't take it.

If the Roadmap's "How this file works" says under "Goals" that the note or item can't be built yet, tell the user which goal it waits on, and stop.

### Is It a Story?
Some changes need the story lifecycle, whichever note they came from. Once you've read the files the change touches, check for these cases:
- **It changes what the app does for its users.**
- **It builds new infrastructure,** such as CI, a test setup or a hosted service.

If one applies, tell the user which and why, and ask whether to spin the change off into a story. If they say yes, read `spinning-off-a-story.md`, follow it and stop.

## 2. Settle the Change
Settle with the user what the change is. If it adds or moves a rule, decide where it goes as the `rule-placement` skill describes. If it adds or renames a skill or agent, read `adding-a-skill-or-agent.md`.

Then find everything the change reaches. Search the repo, including `notes/Note Conventions.md` and `notes/templates/`, for the skill, agent, rule or term being changed, because each reference is part of this change. Step 5 handles the rest of `notes/`.

If settling the change or the search opens more work, check "Is It a Story?" again.

## 3. Make the Change
What the change needs depends on what it touches:
- **A Claude Code feature,** such as skill frontmatter, hooks, subagents or rules: check the current Claude Code docs, never memory.
- **A skill or agent:** follow the `keeping-sessions-lean` skill.
- **Project config:** by asking for this change, the user has asked for any config edit it names.

## 4. Get the Change Approved
Triage the out-of-scope list. An item the user pulls in becomes part of this change. Then show the table of changed files and ask the user whether they approve.

## 5. Clean Up the Notes
Once the user approves, search all of `notes/` for:
- items that this change does or settles, such as a sweep item, a Docs Updates item or another note's open question
- text the change made wrong, such as a `^status` line naming a renamed skill or a note describing the old workflow

Decide how hard to search other stories' remaining work from how widely the change reaches.

In the note or item this session worked from, and in each item you found, remove the text for what this change did and keep the rest. The user's own lines are the exception. If that finishes a note that isn't collecting, or empties the kicked-off copy this session worked from, delete it as the `deleting-a-note` skill describes.

Handle text the change made wrong as you would any note that's wrong or out of date. A note that only follows a convention this change replaced stays as it is, because it's updated when it's next worked on.

## 6. Report and Stop
Route the out-of-scope list. Then show the table of changed files, including each note you deleted.

Stop there, because each change gets its own session.
