---
name: tooling
description: Makes one change to the agent workflow or dev tooling in a single session and cleans up the notes it reaches. Use when the user or a session's brief asks for /tooling.
argument-hint: "[note name, an item in a note, a description of the change, or #<PR> to finish a merged PR's held notes work]"
---

Make this workflow or tooling change: **$ARGUMENTS**

A tooling change skips the story lifecycle, which exists so product code is built and reviewed in small pieces. The user can take in a whole change to a skill or a convention and review it directly.

Invoke the `editing-notes` skill first, since this run changes notes.

If the argument is a PR number, such as `#41`, the change has already merged and only its held notes work is left. Follow `finishing-held-work.md` in this skill's folder instead of the steps below.

## 1. Find Out What's Changing
If the argument is a description, search the notes repo for notes and items about the same thing, because they may already hold details or decisions. Tell the user what you found.

If it names a note or an item in one, the note's `type` says what the change is:
- **`workflow` with a What Belongs Here section:** a collecting note. If it has a kicked-off copy (`<name> YYYY-MM-DD`), work the copy instead. If the argument names no item, list the items and point out any that are logically grouped, such as several rules that all land in the same doc. Ask the user which item or group this session does.
- **`workflow` without one:** the whole note is the change.
- **Any other type, or none:** it's story work, so this skill doesn't take it.

If the change comes from a note or item, invoke the `roadmap-rules` skill and read its line on the Roadmap. If, by the skill's "Goals" rules, it can't be built yet, tell the user which goal it waits on, and stop.

### Is It a Story?
Some changes need the story lifecycle, whichever note they came from. Once you've read the files the change touches, check for these cases:
- **It changes what the app does for its users.**
- **It builds new infrastructure,** such as CI, a test setup or a hosted service.

If one applies, tell the user which and why, and ask whether to spin the change off into a story. If they say yes, read `spinning-off-a-story.md`, follow it and stop.

### Where the Change Is Made
Run checks 1 and 3 in `starting-on-a-branch.md`, in the `building-code` skill's folder, and stop wherever they say to. If the change comes from a note, give the freeze check the note's name, so that during a release it lets through a note the goal's `# Release` section links. Otherwise, give it none.

### Showing the Work in Now
Now shows the work in flight in a session, so the user can see it on the Roadmap at a glance. So once the checks pass, put this session's work in Now. How depends on what it takes on:
- **A whole note,** meaning a workflow note without a What Belongs Here section, or every item left in a kicked-off copy: move the note's line into Now. If the line has no marker, end it with 🔁, because every Now line needs one and the change joins the release without belonging to a goal.
- **Some of a note's items:** leave the note's line where it is, because the rest of its items aren't in flight. Add a line to Now that names this session's items in one short sentence and links the note. End it with the marker from the note's line, or with 🔁 if that line has none. For example: `` `/tooling` moves its work into Now, from [[Agent Workflow Changes 2026-11-16]] 🔁``. The items stay in the note until step 5.
- **A change from a description:** add a line to Now that names the change in one short sentence. End it with 🔁, because the change joins the release without belonging to a goal.

## 2. Settle the Change
If the change is meant to fix how agents behave, and this session hasn't yet worked out with the user what caused the behavior, work that out first, as `diagnosing.md` in this skill's folder describes. A fix shaped before its cause is known tends to patch the one case that was reported. If the diagnosis settles on no change, undo what step 1 did in Now: remove the line you added, or move the note's line back. If the work came from an item, ask the user whether to remove it. Then stop.

Settle with the user what the change is. If it adds or moves a rule, decide where it goes as the `rule-placement` skill describes. If it adds or renames a skill or agent, read `adding-a-skill-or-agent.md`.

Then find everything the change reaches. Search the repo, including `.claude/note-conventions.md` and `.claude/note-templates/`, for the skill, agent, rule or term being changed, because each reference is part of this change. Step 5 handles the notes repo.

If settling the change or the search opens more work, check "Is It a Story?" again.

## 3. Make the Change
What the change needs depends on what it touches:
- **A Claude Code feature,** such as skill frontmatter, hooks, subagents or rules: check the current Claude Code docs, never memory.
- **A skill or agent:** follow the `keeping-sessions-lean` skill.
- **Project config:** by asking for this change, the user has asked for any config edit it names.
- **An existing Roadmap line or section,** such as a section's name: hold the edit until the change's PR merges, as step 7 describes. Other sessions run the new skills only once they're on `develop`, so until then the edited Roadmap wouldn't match the workflow they follow.

## 4. Get the Change Approved
Triage the out-of-scope list. An item the user pulls in becomes part of this change. Then show the table of changed files and ask for the change's final approval. Once the user gives it, commit the change.

## 5. Clean Up the Notes
Once the user approves, search the whole notes repo for:
- items that this change does or settles, such as a sweep item, a Docs Updates item or another note's open question
- text the change made wrong, such as a `^status` line naming a renamed skill or a note describing the old workflow

Decide how hard to search other stories' remaining work from how widely the change reaches.

In the note or item this session worked from, and in each item you found, remove the text for what this change did and keep the rest. The user's own lines are the exception. If removing that text finishes a note that isn't collecting, or empties the kicked-off copy this session worked from, hold the note's deletion until the PR merges, as step 7 describes. Deleting it removes its Roadmap line, which stays until the change is on `develop`. Deleting a note doesn't remove a Now line you added, so hold that line's removal as well, for the same reason.

How to handle text the change made wrong depends on what it is:
- **An existing Roadmap line or section:** hold the edit as step 3 describes.
- **A note that only follows a convention this change replaced:** leave it as it is, because it's updated when it's next worked on.
- **Anything else:** handle it as the `editing-notes` skill's "A Note That's Wrong or Out of Date" describes.

## 6. Open the PR
Route the out-of-scope list. Then open the change's PR as `opening-the-pr.md`, in the `building-code` skill's folder, describes. Its held notes work is the Roadmap edits, Now line removals and note deletions you held.

## 7. Make the Held Edits
The held edits are the Roadmap edits, Now line removals and note deletions from steps 3 and 5. If you held none, skip this step. Otherwise, wait for the PR to merge and make them, as `waiting-for-the-merge.md` in the `building-code` skill's folder describes. Delete each held note as the `deleting-a-note` skill describes, and remove each held Now line as step 3 of that skill describes, so the building goal gets its next command if the line was its last work.

## 8. Stop
Each change gets its own session, so this session has nothing left to do. End the turn by asking in `wrap_up` whether to archive it.

In the message after `wrap_up`, give the user the PR's link and show the table of changed files. Under "Held until the merge", list each held edit, and say whether you've made it.
