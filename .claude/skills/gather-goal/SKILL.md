---
name: gather-goal
description: Gathers a goal's scattered notes and Roadmap lines, cleans them up, and puts work into hubs where it needs exploring, shares design or decisions, or should share a design. Use when a goal's work is scattered or messy.
argument-hint: "[goal name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Gather the work for the goal **$ARGUMENTS**, clean it up, and put work into hubs where it needs exploring, shares design or decisions, or should share a design.

## 1. Read the Goal's Work
Read the goal's note and `notes/Roadmap.md`. Collecting-note items stay out of this skill, because they're built with their collecting note. Read every other line that serves the goal, and the note each one links.

## 2. Clean Up
Find the lines and notes that are already done, out of date or duplicated. Look at the code only enough to tell, because `/check-drift` checks a story's details when it next moves. Go through them with the user, and do what they decide for each. If a note goes, delete it as the `deleting-a-note` skill describes.

## 3. Propose the Hubs
A hub is only worth its upkeep when work still needs exploring, shares design or decisions, or should share a design. So a goal can end up with no hubs. If it does, go on to step 5.

Sort each remaining line and note, and each existing hub's child stories, by what it is. Child stories are included because a story can stop sharing anything with its hub as the goal changes. These are the cases, and where each goes:
- **An existing hub:** it stays a hub, because hubs don't nest, and it can take in the lines and notes for its part.
- **Ideas that still need exploring, because what to build isn't known yet:** they go in a hub, because `/brainstorm` works from a hub. Ideas that would be designed together share one.
- **A story that shares design or decisions with other work:** it goes in a hub with that work, as a child story.
- **Stories that should share a design but don't, such as ones that touch the same screen with designs that don't line up:** they go in one hub as child stories.
- **Anything else, such as a story that stands alone:** it stays on the Roadmap as it is.

Propose only the hubs the notes clearly support, because you can't see divisions they don't show yet. If the ideas are too thin to divide, propose one hub for the whole area, and `/brainstorm`'s options will show how it divides.

Show the whole proposal at once: each hub's name, its scope, what goes in it, what comes out and where any designs don't line up. This is a deliberate exception to asking one question at a time, because moving one line or note can change what the other hubs hold. Then ask the user whether they approve it.

## 4. Write It
For each approved hub, these are the steps, in order:

1. **The note.** If the hub is new, write it from `notes/templates/Hub.md`, in `notes/features/<area>/`, asking the user which folder if the area isn't clear. Its Purpose gives the hub's scope.
2. **What moves in or out.** How each line or note moves depends on what it is:
   - **A note that hasn't been shaped, meaning its `^status` line names `/shape` or it holds rough ideas with no `^status` line:** its content moves to the hub's Inbox, keeping what the user meant.
   - **A line with no note:** it moves to the hub's Inbox, keeping what the user meant, and leaves the Roadmap.
   - **Any other story going in:** make it a child story of the hub, as `.claude/skills/filing-work/content-from-another-note.md` describes. What else changes depends on the story:
     - **If it should share a design with the others but doesn't:** add the hub to its `blocked-by` and link the hub in its `^status` line, such as `Blocked by [[Hub]]; then /assess`, so it isn't built on a design that's about to change.
     - **Otherwise:** its line, next step and decisions stay as they are, because it doesn't need exploring again.
   - **A story coming out of an existing hub:** take it off Child Stories, and remove its embeds of the hub.
3. **A shared design to make.** If the hub has stories that should share a design but don't, add an Inbox item starting "For `/design-feature`:", so the design session has a starting point and each story stops carrying a design that's about to be replaced. The item names each story, says where their designs disagree, and holds each story's design, moved in full with its image and artboard links.
4. **Its status.** This depends on what the hub now holds, for the first case that fits:
   - **Ideas moved into its Inbox:** put `/brainstorm` first in its `^status` line, and give it a Roadmap line if it has none.
   - **Open decisions remain, and its `^status` line names `/decide`:** leave the line as it is, because `/decide` sets `/design-feature` once none remain.
   - **An Inbox item for `/design-feature`:** put `/design-feature` first in its `^status` line, and give it a Roadmap line if it has none.
   - **Its last open story came out, and its `^status` line says `Next: its child stories`:** its `^status` line is `Next: /close`, and it gets a Roadmap line if it has none.
   - **A new hub:** its `^status` line is `Next: its child stories`.
5. **The notes it replaced.** Delete each note whose content moved in, as the `deleting-a-note` skill describes, pointing each link at the hub.

Then, if the goal's Done When names work the hubs replace, such as a research story, show the user a rewording and wait for their approval.

## 5. Stop
Triage the out-of-scope list, offering only route or drop, since this skill sorts a goal's work rather than working one story. Then list each hub with its next step, such as `/brainstorm <hub name>`, and tell the user to run each one in a new session, so it starts with a fresh context.
