---
name: shape
description: Turn an idea note or a Roadmap line into a typed story (feature, bug, pattern, infra or cleanup) with a chosen direction and next step, or into a hub of open decisions when it is too big to split yet. Light research only - no design, no root cause.
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

It stops there on purpose. Design, Suggested Approach, root cause, fix options, a Current State scan, pattern Rules and an infra Design each belong to a later step, and each of those steps has its own process and checks. An answer worked out here would skip those checks, and it would anchor the later step to whatever this skill guessed. Blocking decisions are different, because they're Sarah's to make. This skill never answers one itself, but it checks each with her, since she may already know what she wants. The ones she wants to think over or research stay open for `/decide`. If you catch yourself tracing a call chain or sketching components, stop. That's the next step's job.

Pick the type by the shape of the fix, not by where the idea came from. A user report can turn out to be a missing pattern. A "cleanup" can turn out to be a feature.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Find the idea
Read `notes/Note Conventions.md` first. It explains the frontmatter, the note types and what step comes next for each note.

- **A note name:** find it in `notes/features/`. It should have `status: idea`. If `type` is already set, this is a re-shape: confirm the type in step 4 rather than assuming it. If the status is `spec` or later, tell Sarah it's past shaping and stop.
- **A Roadmap line:** find it in `notes/Roadmap.md`. If it already links to a note, use that note. Otherwise there's no note yet. Step 6 creates one.

If you can't find it, or more than one thing matches, ask Sarah which she means.

**Workflow changes skip shaping.** If the note is already `type: workflow`, tell Sarah to run `/tooling` on it, and stop. If the idea builds new infrastructure, such as CI, a test setup or a hosted service, it's an infra story: shape it like any other story. Otherwise, if the idea changes how the app is built rather than what it does (skills, subagents, hooks, AGENTS.md, Note Conventions, templates, docs or tooling config), tell Sarah it's a workflow note. With her OK, rewrite it from `notes/templates/Workflow.md`, keeping her content under Notes, write it as in step 6, and stop. `/tooling` does the rest.

## 2. Look around, briefly
Don't check whether the idea is still relevant, meaning whether the problem it describes still exists. Sarah running `/shape` on it means she believes it is, and she'll ask for a deeper check if she isn't sure. Whether it's worth doing is a different question, and it's covered under blocking decisions below. Look just enough to tell the options apart:
- **The vault:** search `notes/features/`, `notes/archive/` and the Roadmap for stories that already cover this, overlap it or block it. Check the hubs too.
- **The code:** find the area the idea touches, meaning which files or modules and roughly how many places. That's usually what separates a local bug or cleanup from a pattern. Also check whether the behavior already exists in some form. Name files; don't trace them.
- **Story count:** whether this is one story or several. Signs of several: parts with different types (e.g. a bug for the symptoms and a pattern for the systemic cause), parts that could ship and be reviewed on their own, or parts that already belong to other stories.
- **Libraries:** only if the idea could be a feature, a pattern or infra. Check `package.json` for something already installed that covers it (Mantine often does), then do a quick search for libraries that solve the problem. Names only. Don't compare them, read their docs in depth or judge their fit. Whether to adopt one is a decision (next bullet), not something to settle here.

- **Blocking decisions:** a question is a blocking decision in either of these cases:
  - **The next step can't start until it's answered.** For example: can we use an outside service at all, who it's for, where the data lives, which platforms come first, adopt a library or build, or what another story decides. For a pattern, if the note says what's wrong but not what the convention should be ("these are all bad the same way, but what's the right fix?"), choosing the convention is a blocking decision. `/architect` writes the Rules for a chosen convention; it doesn't choose one. If the idea says it needs research to know whether it's worth doing at all, "Is this worth doing?" is a blocking decision.
  - **Later stories will build on or follow its answer,** even when the next step could answer it as part of its own work. For example: where a kind of code lives, how tests sign in, or a convention other code will copy. These set the project's direction, so they're Sarah's to decide.

  If neither case applies, the next step answers the question as part of its own work, like layout details for Claude Design or which flow a first E2E test covers. List the blocking decisions; don't answer them.

Don't read external docs unless the idea depends on what a library can do, and then only enough to know whether it's possible.

### Check the blocking decisions with Sarah
If step 2 found none, skip this. Otherwise, go through them one at a time. For each one, tell Sarah what needs deciding and which case makes it a blocking decision, then ask whether she already has an answer in mind. Read her answer as the `answer-confidence` skill describes. What happens next depends on it:
- **Confident:** it's decided. Note it.
- **Hedged:** don't check it here. Note it as her leaning. The decision stays open, and `/decide` checks it.
- **No answer,** or she wants to think it over or research it: it stays open for `/decide`.

Do this before step 3, because her answers can change how many stories there are and which directions are worth offering.

## 3. One story or several
Tell Sarah which of these it is, and why:
- **One story.** Do steps 4 to 6 once.
- **Several stories.** Give each one a one-line scope. Once she agrees to the split, follow "Splitting an idea" below. That ends this session. Each story gets its own `/shape` in a new session.
- **Too big and too undecided to split yet.** It becomes a hub. Skip steps 4 and 5 and draft it as described under "Drafting a hub" below.

**Hub, or a story blocked by decisions?** Consider whether the decisions Sarah is leaving open would change *what the stories are*, or only *how one story gets built*. If you can write a Purpose now that stays true whatever the decisions say, it's one story, blocked by those decisions. If at least one answer would change how many stories there are, where they split or what type they are, it's a hub. The number of decisions doesn't matter. When you can't tell, make it a story; it can be re-shaped into a hub later if working through the decisions shows it's really several.

Wait for her to agree or change it.

### Drafting a hub
Rewrite the note from `notes/templates/Hub.md`:
- **Where It Stands:** e.g. "Not split yet. Next: work through Open Decisions with Sarah. ^status"
- **Purpose:** what the idea is, in Sarah's words.
- **Open Decisions:** each blocking decision from step 2 on its own line, written as a question, not a proposal. If Sarah gave a confident answer, put it on a **Decided** line under the question, as the `answer-confidence` skill describes, e.g. "**Decided 2026-09-28:** web first, phones later. Sarah's call." If she gave a hedged one, put it on a **Leaning** line in that skill's format. If she's leaving an adopt-or-build decision open, list the candidates from step 2 under it, without ranking them.
- **Child Stories:** leave the table empty. Children get their own `/shape` run once the decisions make them clear.
- **Leave** Coverage, Build Order and Deferred Work as bare headings.
- **Frontmatter:** `type: hub` and `confirmed` set to today. Hubs have no `status` or `blocked-by`.

Show her the draft and wait for her approval, then write it as in step 6. A hub keeps its Roadmap line while it has open decisions, so the line stays where it is.

### Splitting an idea
Each story gets a placeholder now, and its real shaping later in its own session:
1. **One idea note per story.** Create it in `notes/features/<area>/` from `notes/templates/Idea.md`, with `type` left blank. Its Where It Stands line is just the next step: "Next: /shape ^status". Under Notes goes a line saying which idea it was split from (a link to the original), its one-line scope, and the parts of Sarah's idea that belong to it, in her wording. If a part fits no story, ask her where it goes rather than dropping it. Show her each note before you write it.
2. **The original.** If it's an idea note, replace its content with 🚛 pointers to the new notes. Never delete it. If it's a Roadmap line with no note, it gets replaced in the next step.
3. **The Roadmap.** Each new note gets a line that links to it and embeds its summary (`[[Note]] ![[Note#^status]]`). Ask Sarah which section each one goes in.
4. **Stop.** Don't start shaping any of the stories in this session, so the context from this one doesn't carry over. List each new note with the command to run in a new session, e.g. `/shape <note name>`.

## 4. Present the directions
Give Sarah two or three directions, each with:
- **Type:** feature, bug, pattern, infra or cleanup.
- **Direction:** one or two sentences on which way to take it.
- **Next step:** what happens next and who does it. If Sarah is leaving any blocking decisions open, the next step is working through them with `/decide`, then the usual one. Use the Next Step by Note State table in Note Conventions, e.g. "design session in Claude Design, then `/assess`", "investigate", "write the Rules with Sarah" or "blocked until [[X]] lands".
- **Why:** what you found in step 2 that supports it.

Recommend one and say why. These are also valid directions:
- **Fold it into an existing note,** if step 2 found a story that already covers it.
- **Fold it into a sweep or roundup,** if it fits a collecting sweep's or roundup's What Belongs Here rule (`type: sweep` or `type: roundup`), as the `scope-router` agent describes under "Sweep" and "Roundup". Never create a new one. If none fits but the Roadmap already has related items, tell Sarah they could be grouped into a new sweep or roundup. Whether to create one is her call.
- **Drop it,** if it's already done or no longer makes sense.

**Don't settle the decisions Sarah is leaving open,** even if a direction seems to depend on one. She wants to think them over or research them first, and that happens in `/decide`. Say which of them each direction depends on instead.

Wait for her to pick one or suggest her own.

## 5. Draft the note
**If Sarah picked "drop it",** there's nothing to draft or write:
- **A Roadmap line with no note:** remove the line.
- **An idea note:** run `sh scripts/note-refs.sh "<note name>"`. If its vault or outside-the-vault sections list anything other than its own Roadmap line, tell Sarah it needs `/close` in a new session. Otherwise, delete it with `rm`, as AGENTS.md describes under "Git and files", and remove its Roadmap line.

Then stop. Step 6 doesn't apply.

**For the "fold it into an existing note" direction,** draft the addition to that note, following the rules in the `scope-router` agent (`.claude/agents/scope-router.md`) under "Existing note". In particular, a `ready` note that gets new work goes back to `spec`.

**For the "fold it into a sweep or roundup" direction,** draft the item for the collecting note, following the rules in the `scope-router` agent under "Sweep" or "Roundup".

**Otherwise,** draft the note from the template in `notes/templates/` for the chosen type:
- **Where It Stands:** the `^status` line, with the next step or what the story is waiting on. Don't restate the direction on it. Below the line, give the chosen direction in a sentence or two.
- **Open Decisions:** each blocking decision from step 2 on its own line, written as a question, not a proposal. If Sarah gave a confident answer, put it on a **Decided** line under the question, as the `answer-confidence` skill describes, e.g. "**Decided 2026-09-28:** web first, phones later. Sarah's call." If she gave a hedged one, put it on a **Leaning** line in that skill's format. If she's leaving an adopt-or-build decision open, list the candidates from step 2 under it, without ranking them. Delete the section if step 2 found no blocking decisions.
- **Sarah's content:** move everything from the idea into the template's sections. Keep her wording. If something fits no section, put it under Where It Stands rather than dropping it.
- **Sections that belong to a later step:** Design Handoff, Suggested Approach, Root Cause, Fix, Current State, Rules, Migration Checklist, Design, Conventions, Setup Outside the Repo and Implementation. Don't fill them. If the next step will answer questions as part of its own work, list them at the top of the section that step writes, under the line "Questions for this section:", so a reader finds each question where its answer will go. The sections are Design Handoff for a design session, Suggested Approach for `/assess`, Root Cause for a bug's `/investigate`, Current State for a cleanup's `/investigate`, Rules for `/architect`, and Design for `/infra-design`. Leave every other one as a bare heading.
- **Frontmatter:** set `type`, leave `status: idea`, set `confirmed` to today, and add `blocked-by` entries if the direction depends on another story. If Sarah is leaving any decisions open, add one `"decision needed: ..."` entry to `blocked-by` that covers them all.

Show her the draft and wait for her approval.

## 6. Write it
Once she approves:
- **An existing idea note:** rewrite it in place, so links to it keep working. Don't rename or move it without asking.
- **A Roadmap line with no note:** create the note in `notes/features/<area>/`, with a plain filename (no emoji or prefixes). If the area isn't obvious, ask her which folder.
- **Folded into an existing note, a sweep or a roundup:** apply the addition there. Replace the idea note's content with a 🚛 pointer to where it went. Never delete the file.
- **Folded into a sweep or roundup from a Roadmap line with no note:** add the item and remove the Roadmap line.
- **The Roadmap:** make the story's line link to the note and embed its summary, e.g. `[[Note]] ![[Note#^status]]`. Keep annotations like *(was high)*. Then, depending on what was shaped:
  - **A hub, or a story whose "Is this worth doing?" decision is still open:** keep the line where it is. Neither is committed yet. `/decide` moves the story's line once Sarah decides it's worth doing.
  - **A new note from a split:** ask Sarah which section its line goes in.
  - **Otherwise:** shaping commits the story. Check its goals and place its line as the `roadmap-placement` skill describes.
