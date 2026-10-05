---
name: kickoff
description: Kick off a sweep or roundup when Sarah schedules it - ask whether a new one starts collecting, freeze a dated copy or send the note itself on, give it a Roadmap line and point it at its next step.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Kick off **$ARGUMENTS**.

## Why this skill works the way it does
Sweeps (`type: sweep`) and roundups (`type: roundup`) collect items over time until Sarah decides it's time to handle them together. A sweep holds small fixes that are already decided. A roundup holds issues on a broad topic that still need decisions. Running this skill is how she schedules one. A goal that starts building schedules one too, for only the items that serve it, so the goal has a fixed set it can finish. That kickoff also covers collecting workflow notes. `/roadmap` and the `roadmap-placement` skill then follow this skill as "Kicking off for the building goal" describes, so `/kickoff` stays a command only Sarah starts.

Most topics keep turning up, so the note usually keeps collecting while a dated copy is worked. Some don't, and then the note itself is worked and closed. Only Sarah knows which, and only at this point, so this skill asks her every time.

After this, the kicked-off note follows the usual lifecycle:
- **A sweep** goes to `/check-drift` first. Its items can sit for weeks and name exact lines, so each one is re-checked and any already fixed are dropped. Then `/plan-steps`.
- **A roundup** goes to `/decide`. Its researcher reads the current code for each issue, so it doesn't need `/check-drift`. Once every decision is made, `/plan-steps`.
- **A collecting workflow note** goes to `/tooling`, which works its items one at a time and deletes it once it's empty. It's kicked off only for the building goal. Otherwise, `/tooling` works the collecting note's items directly.

This is notes work only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`. Copy and delete notes with plain `cp` and `rm`, never git commands, so every change stays unstaged.

## 1. Read the note
Find the note in `notes/features/` and read all of it. It has to be a collecting note:
- **A sweep:** `type: sweep`, `status: idea`.
- **A roundup:** `type: roundup`, `status: idea`, with no `decision needed` entry in `blocked-by`.

If it's a dated copy (`<name> YYYY-MM-DD`), was already kicked off, or is any other type, tell Sarah what you found and stop.

Items are the unchecked boxes under Items in a sweep, and the questions under Open Decisions in a roundup. An item starting with `**Blocked by [[Story]]:**` can't be worked yet. If every item is blocked, or there are none, tell Sarah and stop.

## 2. Ask whether a new one starts
Ask Sarah: "Should a new <sweep or roundup> start collecting for <note name> after this one is kicked off?"

## 3. Kick it off
**If a new one starts:** copy the note to `<name> YYYY-MM-DD` (today's date) in the same folder with `cp`. The copy is the kicked-off note:
- **The copy:** remove the blocked items. It never gets them.
- **The original:** remove every item except the blocked ones, which roll over to the next kickoff. Leave everything else, so links to it keep working and it keeps collecting.

**If not:** the note itself is the kicked-off note. It has nowhere for blocked items to roll over to, so remove each one and put it on the out-of-scope list with its full text.

In a roundup, renumber the remaining questions after removing any.

Then set up the kicked-off note:
- **A sweep:** set `status: spec` and the `^status` line to "Kicked off. Next: /check-drift".
- **A roundup:** if every question already has a **Decided** line, set `status: spec` and the `^status` line to "Kicked off. Next: /plan-steps". Otherwise, add `"decision needed: the questions under Open Decisions"` to `blocked-by`, and set the `^status` line to "Kicked off. Next: /decide".
- **A collecting workflow note:** set the `^status` line to "Kicked off. Next: /tooling". It has no `status`.

Don't touch `confirmed`. The next skill checks the items against the code and sets it.

## 4. The Roadmap
- **A new one starts:** the kicked-off copy needs a line that links to it and embeds its status (`[[Note]] ![[Note#^status]]`). The original keeps its line.
- **No new one:** the note keeps its line.

Either way, ask Sarah which section the kicked-off note's line goes in and where, as AGENTS.md describes under "Roadmap order". Put it where she says. If it goes in Next, it needs a marker, as "How this file works" in the Roadmap describes. If none of its items serves the building goal, ask her whether it gets 📌 and with what reason.

If any of its items end with a 🎯 goal link, the kicked-off note's line carries those links. The original's line carries none, as the Roadmap's "How this file works" describes under "Collecting notes".

## 5. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this. Otherwise, route it as AGENTS.md describes under "Out-of-scope work". The kicked-off note can't take the items back, so the triage offers route or drop only.

## 6. Report and stop
Tell Sarah:
- which note was kicked off, and whether a new one is collecting
- how many items it holds, and which blocked items stayed behind or were routed elsewhere
- where its Roadmap line went

Give her the next command to run in a new session: `/check-drift <note>` for a sweep. For a roundup, if every question already had a **Decided** line, `/plan-steps <note>`. Otherwise, `/decide <note>`. Leave every change unstaged. Don't start the next step in this session.

## Kicking off for the building goal
When `/roadmap` kicks off the collecting notes with items that serve the building goal, or `roadmap-placement` kicks off an item for one, it follows steps 1 to 5 for each note, with these changes:
- **Step 1:** the note can also be a collecting workflow note (`type: workflow` with a What Belongs Here section), whose items are the unchecked boxes under Items. The items are only those that carry the building goal's 🎯 link. Where a step says to stop, tell Sarah why, skip this note and go back to the calling skill.
- **Step 2:** if any items stay behind, a new one keeps collecting, since the original has to hold them, so don't ask. If every item carries the building goal's link, ask as usual.
- **Step 3:** the copy gets the linked items, except blocked ones. The original keeps everything else.
- **Step 4:** the kicked-off note's line goes under the heading of a goal its items serve in Later, so don't ask where. If no new one starts, the note's own line moves there. The calling skill asks Sarah whether it moves into Next.
- **Step 5:** put the items on the calling skill's out-of-scope list.

Skip step 6. The calling skill reports each kickoff.
