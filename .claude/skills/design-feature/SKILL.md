---
name: design-feature
description: Designs the screens of a feature or a hub with the user on a canvas in Claude, then saves the approved design in the vault. Use when a note's next step is /design-feature.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Design **$ARGUMENTS** with the user on a canvas, then save the approved design in the vault.

## Why This Skill Works the Way It Does
The artboards are the design. They're saved in the vault because subagents read only local files. Which stories the design belongs to, and where it disagrees with older designs, are `/place-design`'s job.

## 1. Read the Note
Find the note in `notes/features/` and read all of it, including the designs in any Inbox item for `/design-feature`.

Read `docs/style_guidelines.md` and `docs/theme.md`, and design to them. Otherwise, the canvas gets a look of its own. Then open the running app, as the `running-the-app` skill describes, and look at the screens the design changes, so the design starts from what's there. Stop the servers when you're done, as that skill describes.

## 2. Design It With the User
Before drawing anything, tell the user how you understand what the note asks for, and ask what they have in mind.

If the note links a canvas, work on that one. Otherwise, make one from the Design Artifact type.

Cover every screen and state the design needs, each at desktop and phone sizes, since later steps have no other source for the phone layout. What it needs depends on the note:
- **A hub:** one design for all of it, since a hub's work is sorted by what would be designed together. It covers what its Requirements call for and what the stories in any Inbox item for `/design-feature` cover. If there's such an item, start from where it says their designs disagree.
- **A feature note:** what its Requirements and questions call for.

Before you ask the user to approve the canvas, triage the out-of-scope list. An item they pull in joins the canvas, or the note's Requirements if a canvas can't show it.

## 3. Save the Design
These are the steps of saving the approved design, in order:

1. **The artboards.** Make a new folder in `notes/assets/`, named after the note. Copy each `.dc.html` artboard from the canvas into it, with any other local file it loads, at the path it loads it from. Also copy the canvas's `artifact-type/dc-runtime.js` there as `support.js`. Each artboard loads `./support.js`, and this file matches the version the canvas ran.
2. **The handoff text.** Add it to the note's Inbox, where `/place-design` takes design material from. Write it without asking the user to approve its wording, because they approved the canvas it points to. Its format:
   - Its first line names the `notes/assets/` folder and links the canvas.
   - It has a heading for each artboard, naming what the artboard shows, so stories can build and cite it by heading.
   - Under each heading, give the artboard's path. Then add what the user settled that the artboard can't show, such as what triggers a state, unless the Requirements already say it.

   Add nothing else about what an artboard shows, because a second copy can drift from it and later steps read the artboard itself.
3. **The note's status.** Put `/place-design` first in the `^status` line, in place of `/design-feature`, keeping any step or blocker after it. Set `confirmed` to today, since the user approving the canvas confirms the note.

## 4. Stop
Route the out-of-scope list. Then give the user the canvas link and the folder, and tell them the next step is `/place-design <note name>` in a new session, so it starts with a fresh context.
