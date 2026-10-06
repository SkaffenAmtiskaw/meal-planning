---
name: infra-design
description: Turn an infra note's settled decisions into Goals, a Design and Conventions for later work, approved with Sarah one piece at a time, the Setup Outside the Repo, and a Build Order she approves as a whole. Moves the note from idea to ready, for /implement.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Write the design for the infra note **$ARGUMENTS**.

## Why this skill works the way it does
An infra note builds something new that the app is built, tested or run with, such as CI, a test setup or a hosted service. It's planned the way infrastructure usually is, with a design doc: what must be true when it's done, what gets built and how the pieces connect, what later work has to follow, and what gets set up by hand outside the repo. The design ends with a Build Order, the session-sized steps `/implement` builds it in.

For an infra story, Sarah wants it to work, and cares little about how it's built. So its Goals name only what she wants to get out of it, and her checks prove that it works. Everything else is the implementer's to check.

It isn't a pattern. There's usually no existing code to audit or migrate, and its conventions are about CI, workflows and agent behavior, which are held by the doc or skill they land in and by review. So this skill writes no Enforcement and never proposes a test, lint rule or hook to check a convention.

This skill starts after the thinking is done. `/shape` gave the note its type and direction, and `/decide` settled its open decisions, so the design is built from her comments and the **Decided** lines.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Read the note
Find the note in `notes/features/` and read all of it. Read the notes it links to when the Goals, Design or Open Decisions depend on them. If the Inbox has a retype line, follow the `retyping-a-note` skill's "After a retype".

Check that it's ready for this skill:
- **`type: infra` and `status: idea`.** If `type` is blank, the next step is `/shape`. If it's another type, check whether that type fits the work. If it doesn't, offer to retype the note, as AGENTS.md describes under "Editing notes". If it does, tell Sarah which skill the note needs, and stop.
- **`status: spec`:** its design was already approved. Ask Sarah whether this is a revision. If it is, work through steps 2 to 7 as usual, but show what changed compared with the existing sections before replacing each one.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.
- **No open decisions.** An item under `# Open Decisions` with no **Decided** line (a **Partly answered** or **Leaning** line still counts as open), or a `decision needed` entry in `blocked-by`, means the note isn't ready. List them in one line each, tell Sarah the next step is `/decide <note name>`, and stop.

Then read what the design touches: the config, scripts, workflows, skills and docs it changes or builds on, and the docs its conventions land in. Also read the Conventions of every other `type: infra` note and the Rules of every `type: pattern` note in `notes/features/` that cover the same ground, so you can spot overlaps and conflicts.

## 2. Goals
Draft the Goals from Purpose, the **Decided** lines and any rough bullets already under `# Goals`. Each one names something Sarah wants to get out of the story: something that must be true when it's done, and that she can see for herself, such as "a PR into `main` shows four check jobs". If a goal needs "and" to join two things that can fail separately, it's two goals.

A requirement that only serves a Goal isn't a Goal, however sensible it is. If Sarah wouldn't mind the story meeting its Goals some other way, it's a requirement: it goes in the Design, under the piece it belongs to (step 3), and the implementer checks it, not Sarah. For example, "the vault scripts work from the main checkout, from a worktree or in a routine" is a requirement of moving the notes into their own repo, not something she wants from the move. In a revision, check the existing Goals against this rule too, and move each requirement you find into the Design.

Show each goal and wait for her to approve or change it. Once all are approved, write them under `# Goals` as checkboxes.

## 3. Design
### Draft
Draft the whole design before showing any of it. If the Design section lists questions for this step, each one gets an answer in the design. If a question has a **Decided** line under it, that's Sarah's answer. If it has a **Leaning** line, check it as part of this step's own work, not with a separate `decision-researcher` run, for the problems the `answer-confidence` skill lists under "Checking a leaning". If you find none, use her answer. If you find any, show her each one, and go on as that skill describes. The design has:
- **Pieces:** each thing that gets built or changed, such as a workflow, a script, a config file, a skill or a service. For each: its path, or where it lives outside the repo, its one job, and any requirement from step 2 that it has to meet. A piece with two jobs is two pieces.
- **The flow:** how a run moves through the pieces, from what starts it to where its result ends up, including what happens when it fails.

Every API, config key and Claude Code feature the design uses needs a source, as AGENTS.md describes under "Library APIs". Check each piece against the project docs and the other notes' Conventions and Rules. A conflict is a question for Sarah, not something to reconcile yourself.

### Gaps
Where the decisions don't settle something the design needs, don't fill it in:
- **She can answer it on the spot** (a name, a scope boundary): ask her, and read her answer as the `answer-confidence` skill describes. If it's hedged, send `decision-researcher` the note path, the question and her answer as a check, save its report to `.scratch/<note name> - decision <N>.md`, and show her any problems it finds before you use her answer.
- **It needs research** (which service feature, what best practice says): send the `decision-researcher` subagent the note path and the question, with the answers she's given this session. Save its brief to `.scratch/<note name> - decision <N>.md`, walk her through the options and recommendation, and record her answer under `# Open Decisions` in the format the `/decide` skill uses (a **Decided** line plus one **Rejected** line per option she turned down). If she answered confidently, write the entry right away, print the Decided line in chat and go on without waiting for approval. Otherwise, show the entry and wait for her approval before writing it.

### Approve
Show each piece with its job, then the flow, and wait for her to approve or change each. If a change affects a later piece, say which one and update it before you get to it. Once all are approved, write them under `# Design`, so they survive if the session ends.

## 4. Conventions
Draft what later work must follow once this exists, such as how a later source of CI results starts its session. Cover only what the decisions and the design settle. Don't write conventions for cases no story has asked for yet. Each convention says in plain words what later work does, and names where it lands: a file in `docs/` if it describes the codebase, or a skill, a shared-rule skill or AGENTS.md if it's about how agents work, as the `tooling` skill describes.

If the story sets no conventions, tell Sarah in one line and delete the section. Otherwise, show each one and wait for her to approve or change it, then write them under `# Conventions`.

## 5. Setup Outside the Repo
List everything set up by hand outside the repo, such as an app install, a GitHub setting, a hosted service's configuration or a secret: what it is, where it's set up, and which doc or file records it. A secret's value is never recorded, only its name.

If an item depends on a fact about Sarah's setup that only she knows, such as whether she already has an account or which plan she's on, ask her about that fact first, one item at a time.

If there's none, tell Sarah in one line and delete the section. Otherwise, write the list under `# Setup Outside the Repo`, then show it to her as information, not an approval: each item follows from the Design she approved, as AGENTS.md describes under "Approval covers the edits".

## 6. Out-of-scope items
Triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes part of the Goals, Design, Conventions or Setup, whichever it belongs to: draft the change, show it and wait for her approval before writing it.

## 7. Build Order
The Build Order is the last part of `# Design`: the steps `/implement` builds the story in, one session each. They're called steps so that `/final-review`, `/close` and `/check-drift`, which look for steps and their ✅ Complete lines, work on it as they do on any other story.

### Draft
Draft the whole Build Order before showing any of it, in this format:
```
### Step 1: <title>
**Builds:** Pieces 2 and 3
**Setup first:** <a Setup Outside the Repo item, or none>
**Implementer checks:** <requirements and failure paths from the Design that the implementer verifies on its own, or none>
**Sarah checks:**
- [ ] Run `<command>`, see <result>. Goal: <which Goal it proves>.
```

Each step follows these rules:
- **Size:** it fits one session. An implementer reads the docs and files for every Piece the step builds, so the Pieces in one step share an area: the same files, docs or library. If two Pieces sit in unrelated areas, such as a GitHub workflow and a skill, and each can be checked on its own, they're separate steps.
- **Order:** its checks work with only what's built through that step. If a check needs a later step, the step is out of order or split wrong.
- **Setup first:** each item of Setup Outside the Repo goes in the first step whose checks need it.
- **Coverage:** every Piece is built by some step, and every Goal is reached by some step.
- **Implementer checks:** the requirements the Design gives the pieces this step builds. A failure path gets a check only where the Design already has one worth checking. Don't invent failure paths to fill the line.
- **Sarah checks:** if the step reaches a Goal, or needs something only Sarah can do, such as a push or a check in the claude.ai UI, it has Sarah checks. Otherwise, it has "Sarah checks: none". Each check proves that something the story builds works, not that its code matches what she expected, and ends by naming the Goal it proves. If a run the implementer can do on its own machine already shows what a check would prove, it's an Implementer check instead.
- **Usable as written:** each Sarah check spells out the exact command she runs, the text she pastes or the screen she opens. If that can only be known at build time, such as a token or a generated URL, the check says `/implement` gives it to her in chat, ready to paste. A check never sends her to another part of the note to work out what it refers to, such as "Step 1's token" or "the command from the Design".

If ordering the steps turns up a decision the Design doesn't settle, handle it as "Gaps" in step 3 describes.

In a revision, steps marked ✅ Complete stay exactly as they are. Order only the remaining work.

Save the draft to `.scratch/<note name> - build order.md`.

### Approve
Show the outline: the numbered step titles, each with the Pieces it builds, its Setup first and a one-line summary of its Sarah checks, or "none". Link the draft, then ask whether she approves the Build Order as a whole. She may first ask to see a step in full, or change one. If a change affects another step, update that step too, show her both, and ask again.

Once she approves, write it under `## Build Order`, at the end of `# Design`.

## 8. Update the note's status
- Set `status` to `ready`. For an infra story, the approved Build Order is what makes it ready.
- Set `confirmed` to today. Sarah approving the design counts as confirming the note.
- Update the `^status` line as AGENTS.md describes under "Editing notes": "Ready. Next: /implement", or, if `blocked-by` names another story, a link to it with `/implement` after it.

## 9. Find a home for out-of-scope items
If the out-of-scope list is empty, skip to step 10.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 10. Stop
Tell Sarah the design and its Build Order are written, and that the next step is `/implement <note name>` in a new session, which builds Step 1. Don't start building in this session. It deserves a fresh context.
