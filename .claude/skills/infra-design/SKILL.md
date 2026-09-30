---
name: infra-design
description: Turn an infra note's settled decisions into Goals, a Design, Conventions for later work and the Setup Outside the Repo, approved with Sarah one piece at a time. Moves the note from idea to spec, ready for /plan-steps.
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
An infra note builds something new that the app is built, tested or run with, such as CI, a test setup or a hosted service. It's planned the way infrastructure usually is, with a design doc: what must be true when it's done, what gets built and how the pieces connect, what later work has to follow, and what gets set up by hand outside the repo. `/plan-steps` turns that design into steps.

It isn't a pattern. There's usually no existing code to audit or migrate, and its conventions are about CI, workflows and agent behavior, which are held by the doc or skill they land in and by review. So this skill writes no Enforcement and never proposes a test, lint rule or hook to check a convention.

This skill starts after the thinking is done. `/shape` gave the note its type and direction, and `/decide` settled its open decisions, so the design is built from her comments and the **Decided** lines. Don't write implementation steps here. Steps are `/plan-steps`' job.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## 1. Read the note
Find the note in `notes/features/` and read all of it. Read the notes it links to when the Goals, Design or Open Decisions depend on them. If Where It Stands has a retype line, follow the `retyping-a-note` skill's "After a retype".

Check that it's ready for this skill:
- **`type: infra` and `status: idea`.** If `type` is blank, the next step is `/shape`. If it's another type, check whether that type fits the work. If it doesn't, offer to retype the note, as AGENTS.md describes under "Editing notes". If it does, tell Sarah which skill the note needs, and stop.
- **`status: spec`:** its design was already approved. Ask Sarah whether this is a revision. If it is, work through steps 2 to 6 as usual, but show what changed compared with the existing sections before replacing each one.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.
- **No open decisions.** An item under `# Open Decisions` with no **Decided** line (a **Partly answered** or **Leaning** line still counts as open), or a `decision needed` entry in `blocked-by`, means the note isn't ready. List them in one line each, tell Sarah the next step is `/decide <note name>`, and stop.

Then read what the design touches: the config, scripts, workflows, skills and docs it changes or builds on, and the docs its conventions land in. Also read the Conventions of every other `type: infra` note and the Rules of every `type: pattern` note in `notes/features/` that cover the same ground, so you can spot overlaps and conflicts.

## 2. Goals
Draft the Goals from Purpose, the **Decided** lines and any rough bullets already under `# Goals`: each one something that must be true when the story is done, and that Sarah can see for herself, such as "a PR into `main` shows four check jobs". If a goal needs "and" to join two things that can fail separately, it's two goals.

Show each goal and wait for her to approve or change it. Once all are approved, write them under `# Goals` as checkboxes.

## 3. Design
### Draft
Draft the whole design before showing any of it. If the Design section lists questions for this step, each one gets an answer in the design. The design has:
- **Pieces:** each thing that gets built or changed, such as a workflow, a script, a config file, a skill or a service. For each: its path, or where it lives outside the repo, and its one job. A piece with two jobs is two pieces.
- **The flow:** how a run moves through the pieces, from what starts it to where its result ends up, including what happens when it fails.

Every API, config key and Claude Code feature the design uses needs a source, as AGENTS.md describes under "Library APIs". Check each piece against the project docs and the other notes' Conventions and Rules. A conflict is a question for Sarah, not something to reconcile yourself.

### Gaps
Where the decisions don't settle something the design needs, don't fill it in:
- **She can answer it on the spot** (a name, a scope boundary): ask her, and read her answer as the `answer-confidence` skill describes. If it's hedged, send `decision-researcher` the note path, the question and her answer as a check, save its report to `.scratch/<note name> - decision <N>.md`, and show her any problems it finds before you use her answer.
- **It needs research** (which service feature, what best practice says): send the `decision-researcher` subagent the note path and the question, with the answers she's given this session. Save its brief to `.scratch/<note name> - decision <N>.md`, walk her through the options and recommendation, and record her answer under `# Open Decisions` in the format the `/decide` skill uses (a **Decided** line plus one **Rejected** line per option she turned down). Show the entry and wait for her approval before writing it.

### Approve
Show each piece with its job, then the flow, and wait for her to approve or change each. If a change affects a later piece, say which one and update it before you get to it. Once all are approved, write them under `# Design`, so they survive if the session ends.

## 4. Conventions
Draft what later work must follow once this exists, such as how a later source of CI results starts its session. Cover only what the decisions and the design settle. Don't write conventions for cases no story has asked for yet. Each convention says in plain words what later work does, and names where it lands: a file in `docs/` if it describes the codebase, or a skill, a shared-rule skill or AGENTS.md if it's about how agents work, as the `tooling` skill describes.

If the story sets no conventions, tell Sarah in one line and delete the section. Otherwise, show each one and wait for her to approve or change it, then write them under `# Conventions`.

## 5. Setup Outside the Repo
List everything set up by hand outside the repo, such as an app install, a GitHub setting, a hosted service's configuration or a secret: what it is, where it's set up, and which doc or file records it. A secret's value is never recorded, only its name.

If there's none, tell Sarah in one line and delete the section. Otherwise, show the list and ask whether it's complete, then write it under `# Setup Outside the Repo`.

## 6. Out-of-scope items
Triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes part of the Goals, Design, Conventions or Setup, whichever it belongs to: draft the change, show it and wait for her approval before writing it.

## 7. Update the note's status
- Set `status` to `spec`. The note isn't `ready` until `/plan-steps` has written its steps.
- Set `confirmed` to today. Sarah approving the design counts as confirming the note.
- Update the `^status` line as AGENTS.md describes under "Editing notes": "Design approved. Next: /plan-steps", or what building waits on if `blocked-by` names another story.

## 8. Find a home for out-of-scope items
If the out-of-scope list is empty, skip to step 9.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 9. Stop
Tell Sarah the design is written, and that the next step is `/plan-steps <note name>` in a new session. Don't start planning in this session. It deserves a fresh context.
