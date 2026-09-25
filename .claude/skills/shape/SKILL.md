---
name: shape
description: Turn an idea note or a Roadmap line into a typed story (feature, bug, pattern or cleanup) with a chosen direction and next step, or into a hub of open decisions when it is too big to split yet. Light research only - no design, no root cause.
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

## Why this skill works the way it does
Sarah jots ideas down fast, as an Idea note or a single Roadmap line. Before anything can be planned, someone has to decide what kind of story it is and which way to take it. That's all this skill does: it gives the idea a direction.

It stops there on purpose. Design, Suggested Approach, root cause, fix options, a Current State scan, pattern Rules and the decisions that block the next step each belong to a later step, and each of those steps has its own process and checks. An answer worked out here would skip those checks, and it would anchor the later step to whatever this skill guessed. If you catch yourself tracing a call chain or sketching components, stop. That's the next step's job.

Pick the type by the shape of the fix, not by where the idea came from. A user report can turn out to be a missing pattern. A "cleanup" can turn out to be a feature.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.opencode/scratch/`.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once. A later question often depends on an earlier answer.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.

## 1. Find the idea
Read `notes/Note Conventions.md` first. It explains the frontmatter, templates and markers.

- **A note name:** find it in `notes/features/`. It should have `status: idea`. If `type` is already set, this is a re-shape: confirm the type in step 4 rather than assuming it. If the status is `spec` or later, tell Sarah it's past shaping and stop.
- **A Roadmap line:** find it in `notes/Roadmap.md`. If it already links to a note, use that note. Otherwise there's no note yet. Step 6 creates one.

If you can't find it, or more than one thing matches, ask Sarah which she means.

## 2. Look around, briefly
Don't check whether the idea is still relevant. Sarah running `/shape` on it means she believes it is, and she'll ask for a deeper check if she isn't sure. Look just enough to tell the options apart:
- **The vault:** search `notes/features/`, `notes/archive/` and the Roadmap for stories that already cover this, overlap it or block it. Check the hubs too.
- **The code:** find the area the idea touches, meaning which files or modules and roughly how many places. That's usually what separates a local bug or cleanup from a pattern. Also check whether the behavior already exists in some form. Name files; don't trace them.
- **Story count:** whether this is one story or several. Signs of several: parts with different types (e.g. a bug for the symptoms and a pattern for the systemic cause), parts that could ship and be reviewed on their own, or parts that already belong to other stories.
- **Libraries:** only if the idea could be a feature or a pattern. Check `package.json` for something already installed that covers it (Mantine often does), then do a quick search for libraries that solve the problem. Names only. Don't compare them, read their docs in depth or judge their fit. Whether to adopt one is a decision (next bullet), not something to settle here.

- **Blocking decisions:** questions that must be answered before the next step can start. For example: can we use an outside service at all, who it's for, where the data lives, which platforms come first, adopt a library or build, or what another story decides. Questions the next step answers as part of its own work, like layout details for Claude Design, don't count. List them; don't answer them.

Don't read external docs unless the idea depends on what a library can do, and then only enough to know whether it's possible.

## 3. One story or several
Tell Sarah which of these it is, and why:
- **One story.** Do steps 4 to 6 once.
- **Several stories.** Give each one a one-line scope. Once she agrees to the split, follow "Splitting an idea" below. That ends this session. Each story gets its own `/shape` in a new session.
- **Too big and too undecided to split yet.** It becomes a hub. Skip steps 4 and 5 and draft it as described under "Drafting a hub" below.

**Hub, or a story blocked by decisions?** Ask whether the open decisions would change *what the stories are*, or only *how one story gets built*. If you can write a Purpose now that stays true whatever the decisions say, it's one story, blocked by those decisions. If at least one answer would change how many stories there are, where they split or what type they are, it's a hub. The number of decisions doesn't matter. When you can't tell, make it a story; it can be re-shaped into a hub later if working through the decisions shows it's really several.

Wait for her to agree or change it.

### Drafting a hub
Rewrite the note from `notes/templates/Hub.md`:
- **Where It Stands:** e.g. "Not split yet. Next: work through Open Decisions with Sarah. ^status"
- **Purpose:** what the idea is, in Sarah's words.
- **Open Decisions:** the blocking decisions from step 2, one per line. Write them as questions, not proposals. Under an adopt-or-build decision, name the candidates from step 2 without ranking them.
- **Child Stories:** leave the table empty. Children get their own `/shape` run once the decisions make them clear.
- **Leave** Coverage, Build Order and Deferred Work as template comments.
- **Frontmatter:** `type: hub` and `reviewed` set to today. Hubs have no `status` or `blocked-by`.

Show her the draft and wait for her approval, then write it as in step 6. Hubs have their own section on the Roadmap, so ask her whether the line moves there.

### Splitting an idea
Each story gets a placeholder now, and its real shaping later in its own session:
1. **One idea note per story.** Create it in `notes/features/<area>/` from `notes/templates/Idea.md`, with `type` left blank. Its Where It Stands line is just the next step: "Next: /shape ^status". Under Notes goes a line saying which idea it was split from (a link to the original), its one-line scope, and the parts of Sarah's idea that belong to it, in her wording. If a part fits no story, ask her where it goes rather than dropping it. Show her each note before you write it, one at a time.
2. **The original.** If it's an idea note, replace its content with 🚛 pointers to the new notes. Never delete it. If it's a Roadmap line with no note, it gets replaced in the next step.
3. **The Roadmap.** Each new note gets a line that links to it and embeds its summary (`[[Note]] ![[Note#^status]]`). Ask Sarah which section each one goes in, one at a time. Never reorder the Roadmap.
4. **Stop.** Don't start shaping any of the stories in this session, so the context from this one doesn't carry over. List each new note with the command to run in a new session, e.g. `/shape <note name>`.

## 4. Present the directions
Give Sarah two or three directions, each with:
- **Type:** feature, bug, pattern or cleanup.
- **Direction:** one or two sentences on which way to take it.
- **Next step:** what happens next and who does it. If step 2 found blocking decisions, the next step is deciding them with Sarah, then the usual one. Use the Next Step by Note State table in Note Conventions, e.g. "design session in Claude Design, then `/assess`", "investigate", "write the Rules with Sarah" or "blocked until [[X]] lands".
- **Why:** what you found in step 2 that supports it.

Recommend one and say why. These are also valid directions:
- **Fold it into an existing note,** if step 2 found a story that already covers it.
- **Drop it,** if it's already done or no longer makes sense.

**Don't make the blocking decisions from step 2,** even if a direction seems to depend on one. They need research and Sarah, and that's the decide step's job. Say which decisions each direction depends on instead.

Wait for her to pick one or suggest her own.

## 5. Draft the note
Draft the note from the template in `notes/templates/` for the chosen type:
- **Where It Stands:** a status line ending in ` ^status`: the next step, or what the story is waiting on, and nothing else. Don't describe the story or restate the direction on this line. The Roadmap embeds it so Sarah can scan what work each story needs, and the link already names the story. Below the line, give the chosen direction in a sentence or two, then list any questions the next step will answer as part of its own work.
- **Open Decisions:** the blocking decisions from step 2, one per line. Write them as questions, not proposals. Under an adopt-or-build decision, name the candidates from step 2 without ranking them. Delete the section if there are none.
- **Sarah's content:** move everything from the idea into the template's sections. Keep her wording. If something fits no section, put it under Where It Stands rather than dropping it.
- **Don't fill** the sections that belong to a later step: Design Handoff, Suggested Approach, Root Cause, Fix Options, Current State, Rules, Migration Checklist and Implementation. Leave their template comments in place.
- **Frontmatter:** set `type`, leave `status: idea`, set `reviewed` to today, and add `blocked-by` entries if the direction depends on another story. Add one `"decision needed: <short question>"` entry to `blocked-by` for each open decision.

Show her the draft and wait for her approval.

**For the "fold it into an existing note" direction,** draft the addition to that note instead, following the rules in the `scope-router` agent (`.claude/agents/scope-router.md`) under "Existing note". In particular, a `ready` note that gets new work goes back to `spec`.

## 6. Write it
Once she approves:
- **An existing idea note:** rewrite it in place, so links to it keep working. Don't rename or move it without asking.
- **A Roadmap line with no note:** create the note in `notes/features/<area>/`, with a plain filename (no emoji or prefixes). If the area isn't obvious, ask her which folder.
- **Folded into an existing note:** apply the addition there. Replace the idea note's content with a 🚛 pointer to where it went. Never delete the file.
- **The Roadmap:** make the story's line link to the note and embed its summary, e.g. `[[Note]] ![[Note#^status]]`. Keep the line in its current section and keep annotations like *(was high)*. For a new note from a split, ask Sarah which section its line goes in. Never reorder the Roadmap; order is her call.
