---
name: place-design
description: Places a design into the stories it belongs to, and settles where it disagrees with the designs they already have. Use when the user has a new design handoff, or a note's next step is /place-design.
argument-hint: "[handoff zip path, or note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Place the design from **$ARGUMENTS** into the stories it belongs to.

## Why this skill works the way it does
A design often reaches beyond one story. A handoff can touch several stories, some of which already have a design, and parts of it may belong to no story yet. So each design is kept in one copy, in its story's note or in a hub when several stories build it, and those stories embed the parts they build. When a new design disagrees with an older one, the user picks the answer and the losing text is rewritten, so every story that embeds it reads one answer.

A handoff's files go in one fixed place. When they were placed by hand, they landed somewhere different each time, and agents inferred patterns from where they sat that didn't hold.

The design is the user's, made in Claude Design. Change what it says only where the user settles a conflict. Step 4's edits only fit it into the vault and leave what it says as it is. Don't change code.

## 1. Find the design
The argument is one of:
- **A zip from Claude Design:** unzip it into a new, empty folder in `.scratch/`, and read its files without running any of them, since a downloaded file is untrusted. In October 2026 a zip held a folder named `design_handoff_<name>`, with the handoff text in `README.md`, screenshots, `.dc.html` prototypes and the `support.js` they load. Find each piece by what it is rather than where it sits, because the export format is changing.
- **A note whose Inbox holds design material:** the note was only the material's likeliest home when it was filed, so this skill decides where it really goes.
- **A note and sections of its design it won't build:** if the user hasn't named the sections, ask which ones rather than working them out from the code or the steps, because which parts of its design a story leaves out is the user's call.

Read the whole design, images included.

## 2. Find the stories it belongs to
Search `notes/features/` and the Roadmap, hubs included, for stories before `in-review` that build the screens, components or behaviors the design covers, and read each one. A story `in-review` or later has all its steps built, so it takes no design.

If the handoff text names another handoff, such as "implement this after `design_handoff_date_picker`", search `notes/` for that folder name to find the note that holds it, since each design this skill places names its handoffs' folders in its first line. Step 3 checks its design for conflicts along with the stories' designs, because a design that builds on another may change it, and step 4 links to it. If no note names the folder, ask the user which note holds that handoff.

For each story, show the user the design sections it would build and why, and wait for them to confirm or change the list. Then propose new feature stories for the sections no story covers, each with a name and a one-line scope, and wait for the user to approve, change or drop each one.

The design's home follows from the answers:
- **If a hub already holds it:** that hub.
- **Otherwise, if one story builds all of it:** that story's note.
- **Otherwise:** a new hub. Propose a name for it, taken from the design, such as "Calendar Popover Restyle".

## 3. Settle conflicts with older designs
For each story from step 2, read the designs it already has: its own Design Handoff and the hub sections it embeds. List each point where the new design and an older one disagree, meaning the same element with a different look or behavior. Go through them with the user, showing both versions with their images, and ask which holds or what the answer is.

Write each answer into each design it changes. If that includes the new design, write it in when step 4 places it:
- **Text:** rewrite it in place to the answer, with no record of the old version.
- **An image:** images can't be edited, so add a callout directly under it saying what in it no longer holds and what replaces it, such as `> [!note] This popover now has square corners.`

## 4. Write it into the notes
1. **A new hub,** if step 2 made one: from `notes/templates/Hub.md`, in the `notes/features/<area>/` folder of its stories, asking the user which one if they're in more than one. Give its `^status` line its child stories as the next step, write a Purpose of a sentence or two on what the design covers, and copy the `## Meta-Instructions` under `# Design Handoff` from `notes/templates/Feature.md` into its `# Design Handoff`. It gets no Roadmap line, because a hub has one only while it has open decisions.
2. **Each new story:** from `notes/templates/Feature.md`, in `notes/features/<area>/`, asking the user which folder if the area isn't clear. Set `status: spec`, give its `^status` line `/assess` as the next step, and draft its Purpose from the design. Then add its Roadmap line, checking its goals as the `roadmap-placement` skill describes.
3. **A zip's files:** if `notes/assets/<the handoff's folder name>/` already exists, another handoff's files are in it, so ask the user what to name this one. Then copy every file except the handoff text into that folder, keeping the layout the zip gives them, because the prototypes and the handoff text find other files by their relative path.
4. **A zip's handoff text:** copy it into `.scratch/` for item 6, then make these changes in the copy:
   - Its first line names the `notes/assets/` folder its files are in.
   - Its title heading is dropped, since `# Design Handoff` stands in for it.
   - Image links point to `assets/<folder>/<the image's path in that folder>`.
   - A reference to another handoff by its folder name becomes a link to the note that holds it.
5. **Design already in the vault:**
   - **If a hub holds it:** it stays there, and step 3's answers are written into it there. Remove its embeds from any story that won't build it, and skip item 6.
   - **Otherwise:** copy it from the note it's in, with its image links, into `.scratch/` for item 6. Then, if it's an Inbox item, delete the item. Otherwise, leave a pointer to its new home, as the `filing-work` skill describes under "Content From Another Note". Then point any `🚛 Moved to` pointer to it at its new home.
6. **The new design,** with step 3's answers written in: in its home's `# Design Handoff`, after the Meta-Instructions and before any hub embeds.
   - **If the home has no design of its own:** write it there.
   - **If the home is a story with a design of its own:** combine the two into one design, so the story's readers find everything about each element in one place. The user approves its outline, and `design-merge-checker` reads the whole of it in their place:
     1. Show the user an outline of the combined design: each section, what it covers and which design it comes from, with an element both designs cover in one section. Wait for their approval.
     2. Write the combined design in `.scratch/`, following the outline, with a first line naming every handoff folder the design's files are in.
     3. Send the `design-merge-checker` subagent the story's note path, the new design's path and the combined design's path.
     4. Fix what it finds, asking the user where a fix needs a choice.
     5. Replace the story's own design with the combined one, without asking the user to approve its wording.
7. **Each story that builds part of a hub's design:** embed the sections it builds as the `filing-work` skill describes under "Content From Another Note". Its own design stays apart from the hub sections, because combining them would copy the hub's design into one story.

## 5. Move each story on
For each story before `in-review` that got design or had its design changed, including each one that embeds a section step 3 rewrote:
- **If it has no Suggested Approach yet:** set `status: spec`, and give its `^status` line `/assess` as the next step.
- **Otherwise:** its approach rests on the old design. Set `status: spec`, leaving any steps marked ✅ Complete as they are, and give its `^status` line `/assess` as the next step, as a re-assessment.

If a story's `^status` line names `/place-design` but it took no design, remove `/place-design` from the line, leaving the step `filing-work` kept after it.

## 6. Stop
Triage the out-of-scope list, offering only route or drop, since this skill places a design rather than working one story. Then list each story the design reached with its next step, and each new hub and story. Don't start `/assess` in this session: each story gets its own, with a fresh context.
