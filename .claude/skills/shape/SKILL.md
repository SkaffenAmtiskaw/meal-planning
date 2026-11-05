---
name: shape
description: Shapes an idea note or a Roadmap line into a typed story with a direction and a next step, or into a hub for several stories that share a design. Use when a note's next step is /shape.
argument-hint: "[note name or Roadmap line]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Shape **$ARGUMENTS** into a story with a type, a direction and a next step.

Invoke the `editing-notes` skill first, since this run changes notes.

## Why this skill works the way it does
The user jots ideas down fast, as an idea note or a single Roadmap line. Before anything can be planned, someone has to decide what kind of story it is and which way to take it. That's all this skill does: it gives the idea a direction, then stops. Working out a design, an approach or a cause belongs to a later step with its own process and checks. An answer worked out here would skip those checks and anchor that step to a guess. If you catch yourself tracing a call chain or sketching components, stop. That's the next step's job.

Blocking decisions are the user's to make, so this skill never answers one itself. It settles them with the user, with research where they want it, and leaves for `/decide` only the ones they want to think over or come back to.

This is planning only. Don't change code.

## 1. Find the idea
Read `.claude/note-conventions.md` first. It explains the frontmatter, the note types and what step comes next for each note.

The idea is one of these:
- **A note name:** find it in `features/` in the notes repo. If `type` is already set, this is a re-shape: confirm the type in step 5 rather than assuming it.
- **A Roadmap line:** find it in `Roadmap.md` in the notes repo. If it links to a note, use that note. Otherwise the line is the whole idea, and step 7 creates its note.

If you can't find it, or more than one thing matches, ask the user which they mean. If the note's status is `spec` or later, or it's `type: workflow`, it's past shaping: tell the user which skill comes next (`/tooling` for a workflow note), and stop.

## 2. Check for a workflow change
A change to how the app is built rather than what it does, such as a skill, a hook or a template, doesn't need shaping: `/tooling` settles it with the user and makes it in one session. Note Conventions' Workflow type lists what counts. Check for one now, before any other work, because a workflow note skips the rest of this skill:
- **If the idea changes what the app does,** go on to step 3.
- **If it changes how the app is built:**
  - **If it builds new infrastructure,** such as CI or a test setup, it's an infra story. Go on to step 3.
  - **Otherwise,** it's a workflow note. Tell the user why. If they agree, rewrite it from `.claude/note-templates/Workflow.md`, keeping their content under Notes, write it as step 7 describes, and stop.

## 3. Understand the idea
### Look around, briefly
Look just enough to tell the directions apart:
- **The vault:** search `features/` and `archive/` in the notes repo, and the Roadmap, for stories that already cover this, overlap it or block it. Check the hubs too.
- **The code:** find the area the idea touches, meaning which files or modules. Also check whether the behavior already exists in some form. Name files; don't trace them.
- **Whether it's a pattern:** this depends on where the problem comes from, not on how many places it's in. The cases:
  - **If code written separately has already gone wrong the same way more than once, or every new file of some kind, such as a new mutation, faces the same choice:** it's a pattern, because the problem comes from how code keeps getting written.
  - **Otherwise:** it's a local bug or cleanup, because changing today's code ends the problem, even if later code could bring it back. For example, clock calls that only go wrong once another story moves rendering to the server.
- **Story count:** whether this is one story or several. Signs of several: parts with different types (e.g. a bug for the symptoms and a pattern for the systemic cause), parts that could ship and be reviewed on their own, or parts that already belong to other stories.
- **Installed libraries:** only if the idea could be a feature, a pattern or infra. Check `package.json` for something already installed that covers it (Mantine often does), since that can make the story smaller or unneeded. Read a library's docs only if the idea depends on what it can do, and then only enough to know whether it's possible.

### Give the user an overview
The idea is often a line or two, and a wrong guess about its scope would carry into every question and direction that follows. So before you raise any decision or question, tell the user how you understand the idea, in a few lines:
- **Scope:** what you think is in and what's out.
- **The work:** what you tentatively think it will look like, such as the likely type and the areas it touches. It's a first guess, not a direction or a design. Step 5 offers the directions.
- **Assumptions,** only if the scope or the work depends on one: each assumption, and what depends on it. Don't go looking for them, because a listed assumption starts to read as settled.

Ask whether it matches what they have in mind, and wait for the answer. Work their corrections into your understanding. If one changes where you'd look, look again briefly. Everything after this builds on the corrected picture.

### Find the blocking decisions
If the idea looks like a whole area, where what to build isn't known yet, tell the user it should be an exploration hub and why, and wait for them to agree. If they do, only whether it's worth doing can be a blocking decision, because `/brainstorm` finds what to build.

A blocking decision is a question whose answer would change what this skill writes. Judge it only by this skill's own output. This skill doesn't know what each later step needs, and each of those steps checks that for itself and sends the note to `/decide` when something is missing. A blocking decision settles one of these:
- **Whether the idea is worth doing,** when the idea or the user says they're unsure it is, such as an idea to explore whether a new library is worth pulling in.
- **How many stories there are.**
- **The story's type.**
- **The story's direction.**
- **The one choice a likely tweak turns on, if it has one,** because settling it lets this skill set the note to `ready`.

If a question isn't a blocking decision, don't ask the user about it here. The step that needs its answer settles it: how a feature looks and behaves, for example, is settled in `/design-feature`, and which library it's built with comes after that.

If the story has to wait for another story to decide or build something, that isn't a decision either. Add that story to `blocked-by`, as step 6 describes.

### Settle the blocking decisions
Settle them now, so steps 4 and 5 rest on answers rather than guesses and the story leaves this session with its direction set. List them, one line each, with what each answer would change, and ask which ones the user wants to settle now. The rest stay open for `/decide`: the ones they want to think over or research themselves, and any they'd rather leave because each researched decision adds a brief to this session.

Settle each one they pick, in the order they give, as the `settling-a-decision` skill describes. The note isn't drafted yet, so where that skill says to write an answer under its question, keep it for the draft instead. Step 6 puts it under its question in Open Decisions. If the user decides the idea isn't worth doing, skip the other decisions and go to step 7 to drop it.

## 4. One story or several
Go by the first case that fits:
- **The user agreed in step 3 that the idea is a whole area:** check whether it serves a goal, as the `roadmap-placement` skill describes:
  - **It does:** it becomes an exploration hub. Follow `making-a-hub.md` in this skill's folder.
  - **It doesn't:** tell the user it needs a goal from `/roadmap` first, because deciding what's in this release needs a release to compare against. Then stop.
- **Step 3 found no signs of several stories, or the user settled on one there:** it's one story. Say so in passing and go on to step 5, because the user has nothing to weigh.
- **The decisions still open after step 3 would decide how many stories there are:** it's one story for now. Go on to step 5.
- **Otherwise:** tell the user which of these it is, and why, and wait for them to agree or change it:
  - **One story.** Go on to step 5.
  - **Several stories.** Give each one a one-line scope. Once the user agrees, follow `splitting.md` in this skill's folder.
  - **Several stories that overlap substantially,** so they need one shared place for their design and decisions. Give each one a one-line scope. Once the user agrees, follow `making-a-hub.md` in this skill's folder.

## 5. Choose a direction
Pick the type by the shape of the fix, not by where the idea came from. A user report can turn out to be a missing pattern, and a "cleanup" can turn out to be a feature.

Give the user two or three directions, each with:
- **Type:** feature, bug, pattern, infra, cleanup or tweak.
- **Direction:** one or two sentences on which way to take it.
- **Next step:** if any blocking decisions are still open, `/decide` comes first. Otherwise, it's the next step and its skill, from the Next Step by Note State table in Note Conventions, e.g. "`/design-feature`, then `/place-design`", "`/assess`, for a feature with nothing visual to design" or "blocked until [[X]] lands".
- **Why:** what you found in step 3 that supports it.

These are also directions, when they fit:
- **Fold it into an existing note,** if step 3 found a story that already covers it.
- **Fold it into a sweep,** if it fits a collecting sweep's What Belongs Here rule, as the `filing-work` skill describes. If none fits but the Roadmap already has related items, tell the user they could be grouped into a new sweep.
- **Drop it,** if step 3 found it's already done, or it no longer makes sense.

Recommend one and say why. If a direction depends on a blocking decision that's still open, say which one, rather than settling it. Wait for the user to pick one or suggest their own.

## 6. Draft it
What you draft depends on the direction the user picked:
- **Drop it:** there's nothing to draft. Go on to step 7.
- **Fold it into an existing note:** draft the addition to that note, as the `filing-work` skill describes.
- **Fold it into a sweep:** draft the item for the collecting note, as the `filing-work` skill describes.
- **A story:** draft the note from the template in `.claude/note-templates/` for its type, as below.

A story's note:
- **Where It Stands:** the `^status` line and the summary. At this stage, the summary is the chosen direction in a sentence or two.
- **Open Decisions:** each blocking decision from step 3 on its own line, written as a question, not a proposal, with the lines step 3 recorded under it. Delete the section if step 3 found no blocking decisions.
- **The user's content:** move everything from the idea into the template's sections. Keep their wording. If something fits no section, put it in the Inbox rather than dropping it.
- **Scope:** the scope from the overview, with the user's corrections, goes in the template's sections that say what the story covers.
- **Frontmatter:** set `type`, set `confirmed` to today, and fill `blocked-by` as Note Conventions describes. Then set `status`:
  - **A tweak with no open decision:** `status: ready`, because a tweak has no steps to plan.
  - **A feature with nothing visual to design:** `status: spec`, with its behavior under Requirements, because its Requirements are its whole spec.
  - **Any other story:** leave `status: idea`.

Show the user the draft and wait for their approval.

## 7. Write it
Once the user approves the draft, or picks "drop it", what you write depends on what the idea became:
- **Dropped:** if it's a Roadmap line with no note, remove the line. If it's an idea note, run `sh scripts/note-refs.sh "<note name>"`. If its vault or outside-the-vault sections list anything other than its own Roadmap line, tell the user it needs `/close` in a new session. Otherwise, delete it as the `deleting-a-note` skill describes.
- **Folded into an existing note or a sweep:** apply the addition there. Then, if the idea was an idea note, delete it as the `deleting-a-note` skill describes, pointing each link to the note it was folded into. If it was a Roadmap line with no note, remove the line.
- **A story, a hub or a workflow note:** if the idea was an idea note, rewrite it in place, so links to it keep working. Don't rename or move it without asking. If it was a Roadmap line with no note, create the note in `features/<area>/` in the notes repo, and if the area isn't obvious, ask the user which folder. Make the line link to the note. Either way, what happens to its Roadmap line depends on the first case that fits:
  - **A hub whose `^status` line says `Next: its child stories`:** remove the line, as the `roadmap-rules` skill's "Hubs" rule says.
  - **A story whose "Is this worth doing?" decision is still open:** keep the line where it is, because the story isn't committed yet.
  - **Anything else:** shaping commits it. Check its goals and place its line as the `roadmap-placement` skill describes.
