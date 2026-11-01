---
name: infra-design
description: Writes an infra note's Goals, Design, Conventions, Setup Outside the Repo and Build Order with the user. Use when an infra note's next step is /infra-design.
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

## 1. Read the Note
Read all of the note, and the notes it links to when its Goals, Design or Open Decisions depend on them.

Check that it's ready for this skill:
- **`type: infra` and `status: idea`.** If `type` is blank, the next step is `/shape`.
- **`status: spec`:** its Design was already approved.
  - **If the note says it's due a revision,** such as its `^status` line naming `/infra-design` or an Inbox item asking for one, it's a revision.
  - **Otherwise,** ask the user whether this is a revision. If it isn't, stop.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.
- **No open decisions.** The note isn't ready if it has a `decision needed` entry in `blocked-by`, or an item under `# Open Decisions` with no **Decided** line. An item with only a **Partly answered** line still counts as open. List the open decisions, one line each, tell the user the next step is `/decide <note name>`, and stop.

**In a revision,** find what to rework in whatever called for it: the Inbox item, the ⚠️ Check Drift callouts, the `^status` line or the user's answer. Each step below works only on that, apart from the Goals check in step 2, which every revision runs. Everything else keeps its approval as written unless the rework changes it. Where step 2, 3 or 4 shows a part for approval, show the reworked part next to the version it replaces. Remove the callouts on the parts you rework, since the new text answers them.

## 2. Goals
Draft the Goals. The user wants an infra story to work, and cares little about how it's built. So each Goal names something they want to get out of the story: something that must be true when it's done, and that they can see for themselves, such as "a PR into `main` shows four check jobs". If a Goal needs "and" to join two things that can fail separately, it's two Goals.

A requirement that only serves a Goal isn't a Goal, however sensible it is. To tell them apart, take each line that might be a Goal and ask whether the user would mind if the story met its Goals without it. If they wouldn't, it's a requirement. It goes in the Design, under the Piece it belongs to, and the implementer checks it. For example, "the vault scripts work from the main checkout, from a worktree or in a routine" is a requirement of moving the notes into their own repo, not something the user wants from the move. Every revision checks the existing Goals against this rule, and moves each requirement it finds into the Design.

Get each Goal approved, then write the Goals under `# Goals` as checkboxes.

## 3. Design
### Draft
Read what the story changes or builds on, and the docs its conventions will land in. Also read the Conventions of other `type: infra` notes and the Rules of `type: pattern` notes that cover the same ground.

Then draft the whole Design before showing any of it, so you can see where Pieces overlap or should split before the user approves one. The Design has:
- **Pieces:** each thing that gets built or changed, such as a workflow, a script, a config file, a skill or a service. For each: its path, or where it lives outside the repo, its one purpose, any requirement it has to meet, and a block ID (` ^piece-N`) that the Flow and the Build Order link to.
- **The Flow:** only what no single Piece holds: what starts a run, the hand-offs between Pieces and failure paths that cross Pieces. It links each Piece it mentions, as in `[[#^piece-7|Piece 7]]`.

Check each service, config key and Claude Code feature the Design uses against its current docs, because what a service offers changes. Check each Piece against the project docs and the other notes' Conventions and Rules.

Where the note's decisions and the user's comments don't settle something the Design or Build Order needs, settle it with the user as the `settling-a-decision` skill describes.

### Approve
Get each Piece approved, then the Flow. Once all are approved, write them under `# Design`, so they survive if the session ends.

## 4. Conventions
Draft what later work must follow once this exists, such as how a routine added later starts its session. Cover only what the decisions and the Design settle, because a convention stretched to cases no story has asked for can bind later work in ways nobody chose. Each convention names where it lands, as the `rule-placement` skill describes.

Never propose a test, lint rule or hook to check a convention. These conventions are about CI, workflows and agent behavior, so what keeps later work to them is the doc or skill they land in, and review.

If the story sets none, delete the section and say so. Otherwise, get each one approved, then write them under `# Conventions`.

## 5. Setup Outside the Repo
List everything set up by hand outside the repo, such as an app install, a GitHub setting, a hosted service's configuration or a secret. For each, say what it is, where it's set up, and which doc or file records it.

If an item depends on a fact about the user's setup that only they know, such as whether they already have an account or which plan they're on, ask them about that fact first.

If there's none, delete the section and say so. Otherwise, write the list under `# Setup Outside the Repo`, then show it as information, not for approval, since each item follows from the Design they approved.

## 6. Out-of-Scope Items
Triage the out-of-scope list. An item the user pulls in becomes part of the Goals, Design, Conventions or Setup Outside the Repo, whichever it belongs to, so the Build Order covers it.

## 7. Build Order
### Draft
In a revision, steps marked ✅ Complete stay exactly as they are. Draft each step in this format:
```
### Step 1: <title>
**Builds:** [[#^piece-2|Piece 2]] and [[#^piece-3|Piece 3]]
**Setup first:** <a Setup Outside the Repo item, or none>
**Implementer checks:** <how the step's requirements and failure paths get checked, or none>
**Sarah checks:**
- [ ] <what the implementer kicks off, if anything>. <What the user runs, opens or reads>, see <result>. Goal: <which Goal it proves, if any>.
```

Each step follows these rules:
- **Size:** it fits one session. The implementer reads the docs and files for every Piece the step builds, so the Pieces in one step share an area: the same files, docs or library. If two Pieces sit in unrelated areas, such as a GitHub workflow and a skill, and each can be checked on its own, they're separate steps.
- **Order:** its checks work with only what's built through that step.
- **Setup first:** each Setup Outside the Repo item goes in the first step whose checks need it.
- **Implementer checks:** each says only what the Design doesn't: how a requirement or failure path gets checked, and what to do if the check fails. A check about one Piece links it rather than restating it, so the note keeps one copy of it. A failure path gets a check only if the Design already names that path and it's worth checking, because an invented one proves nothing.
- **Sarah checks:**
  - **When a step has them:** if the step proves a Goal, or needs something only the user can do, such as a check in the claude.ai UI. Otherwise, it has "Sarah checks: none". If a check doesn't prove a Goal and a run on the implementer's own machine can show what it would prove, it's an Implementer check.
  - **What each one proves:** that something the story builds works, not that its code matches what the user expected.
  - **Who does what:** the implementer kicks off everything it can, such as pushing a throwaway branch, opening a PR or running a skill locally. The user's part is verifying the results, plus what needs their access or their eyes, because they want as few manual steps as possible.
  - **Usable as written:** each one spells out the exact command the user runs, the text they paste or the screen they open. If that can only be known at build time, such as a token or a generated URL, the check says the implementer gives it to them in chat, ready to paste. A check never sends them to another part of the note, such as "Step 1's token" or "the command from the Design".

Across the Build Order, every Piece and Convention is built by some step, and every Goal is proved by a Sarah check in some step.

### Approve
Show the outline, not the whole Build Order, because a whole one is too detailed to review closely (Sarah's call). The outline has the numbered step titles. Each title comes with the Pieces the step builds, its **Setup first** line and a one-line summary of its Sarah checks or "none". In a revision, the outline marks which steps changed.

Then ask whether the user approves the Build Order as a whole. They may first ask to see a step in full, or change one.

Once they approve, write it under `## Build Order`, at the end of `# Design`.

## 8. Update the Note's Status
- Set `status` to `ready`.
- Set `confirmed` to today, since the user approving the Design confirms the note.

## 9. Route Out-of-Scope Items and Stop
Route the out-of-scope list. Then tell the user the next step is `/implement <note name>` in a new session, and stop.
