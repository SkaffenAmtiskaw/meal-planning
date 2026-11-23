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

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Read the Note
Read all of the note, and the notes it links to when its Goals, Design or Open Decisions depend on them.

Check that it's ready for this skill:
- **`type: infra` and `status: idea`.** If `type` is blank, the next step is `/shape`.
- **`status: spec`:** its Design was already approved.
  - **If the note says it's due a revision,** such as its `^status` line naming `/infra-design` or an Inbox item asking for one, it's a revision.
  - **Otherwise,** ask the user whether this is a revision. If it isn't, stop.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.
- **No open decisions.** The note isn't ready if it has a `decision needed` entry in `blocked-by`, or an item under `# Open Decisions` with no **Decided** line. An item with only a **Partly answered** line still counts as open. List the open decisions, one line each, tell the user the next step is `/decide <note name>`, and stop.

**In a revision,** find what to rework in whatever called for it: the Inbox item, the ⚠️ Check Drift callouts, the `^status` line or the user's answer. If it's something the Design missed, work out where the Design falls short of what the Goals and Purpose say the user wants from the story, and rework the Design there. The Goals change only if what the user wants has changed. They record what the user wants, so a miss in the Design isn't a flaw in their wording. Each step below works only on the parts the revision calls for. Everything else keeps its approval as written unless the rework changes it. Where step 2, 3 or 4 shows a part for approval, show the reworked part next to the version it replaces. Remove the callouts on the parts you rework, since the new text answers them.

## 2. Goals
The Goals say what the user wants from the story. Later steps weigh the Design, the research and the checks against the Goals, so a Goal the user doesn't care about steers the work wrong.

Before drafting, work out what the user wants from the story, from the Purpose and their own words in the note. If it's unclear, ask them. Their settled decisions say how the work gets done, not what they want from it.

Then draft the Goals from what they want, so there are usually only a few. Each one is something that must be true when the story is done and that the user can see for themselves, such as "a PR into `main` shows four check jobs". The user wants an infra story to work and cares little about how it's built, so each Goal is a result they can see. Anything that only serves what they want is a requirement, however sensible it is. To tell them apart, ask of each line whether the user would mind if the story gave them what they want without it. If they wouldn't, it's a requirement, and it goes in the Design, under the Piece it belongs to. For example, "the vault scripts work from the main checkout, from a worktree or in a routine" is a requirement of moving the notes into their own repo, not something the user wants from the move.

Show the Goals together and ask whether they capture what the user wants from the story. Asked about one Goal at a time, the user judges whether that line does any harm, not whether it's what they want, so they approve lines that aren't. Once they agree, write the Goals under `# Goals` as checkboxes.

## 3. Design
### Draft
Read what the story changes or builds on, and the docs its conventions will land in. Also read the Conventions of other `type: infra` notes and the Convention of `type: pattern` notes that cover the same ground.

Then draft the whole Design, and check where Pieces overlap or should split. The Design has:
- **Pieces:** each thing that gets built or changed, such as a workflow, a script, a config file, a skill or a service. For each: its path, or where it lives outside the repo, its one purpose, any requirement it has to meet, and a block ID (` ^piece-N`) that the Flow and the Build Order link to.
- **The Flow:** only what no single Piece holds: what starts a run, the hand-offs between Pieces and failure paths that cross Pieces. It links each Piece it mentions, as in `[[#^piece-7|Piece 7]]`.

Check each Piece as `.claude/skills/building-code/checking-a-piece.md` describes.

Where the note's decisions and the user's comments don't settle something the Design or Build Order needs, settle it with the user as the `settling-a-decision` skill describes.

### Approve
The user approves the Design as a whole, because most of it carries out what the Goals and the note's decisions already settle. Show these in one message, ending with the approval:
1. **The Pieces,** as a table with each Piece's path and its one purpose.
2. **The Flow,** in full.
3. **The user's choices.** If a Piece makes a choice that's the user's call and the user hasn't settled it yet, show that part of the Piece in full and say what it picks. If no Piece does, say so in one line.
4. **The approval.** Ask whether the user approves the Design. If they change a Piece, update the Flow and any other Piece the change affects.

Once they approve, write the Design under `# Design`, so it survives if the session ends.

## 4. Conventions
Draft what later work must follow once this exists, such as how a routine added later starts its session. Cover only what the decisions and the Design settle, because a convention stretched to cases no story has asked for can bind later work in ways nobody chose. Each convention names where it lands, as the `rule-placement` skill describes.

Never propose a test, lint rule or hook to check a convention. These conventions are about CI, workflows and agent behavior, so what keeps later work to them is the doc or skill they land in, and review.

If the story sets none, delete the section and say so. Otherwise, get each one approved, then write them under `# Conventions`.

## 5. Setup Outside the Repo
List everything set up by hand outside the repo, such as an app install, a GitHub setting, a hosted service's configuration or a secret. For each, say what it is, where it's set up, and which doc or file records it. If a service's own tooling could take over an item, and step 3 found a reason not to use it, give the reason in the item.

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
**Implementer checks:** <a list, or none>
- <how a requirement, failure path or Goal gets checked>. Goal: <which Goal it proves, if any>.
**Sarah checks:** <a list, or none>
- [ ] <what the implementer kicks off, if anything>. <What the user runs, opens or reads>, see <result>. Goal: <which Goal it proves, if any>.
```

Each step follows these rules:
- **Size:** it fits one session. The implementer reads the docs and files for every Piece the step builds, so the Pieces in one step share an area: the same files, docs or library. If two Pieces sit in unrelated areas, such as a GitHub workflow and a skill, and each can be checked on its own, they're separate steps.
- **Order:** its checks work with only what's built through that step.
- **Setup first:** each Setup Outside the Repo item goes in the first step whose checks need it.
- **Whose check it is:** a check is the user's only in two cases: the implementer can't see the result without them, such as a page it could reach only if they signed in for it, or the check needs a judgment only they can make. Every other check is the implementer's. Before giving a check to the user, work out how the implementer could see the result with what it has, such as a CLI or API that's already signed in, the browser pane where the user is already signed in, or a screenshot through computer use. The user wants infra work done, and opening windows for checks the implementer could have run is what they mind most (Sarah's call).
- **Implementer checks:** each says only what the Design doesn't: how a requirement, failure path or Goal gets checked, and what to do if the check fails. A check about one Piece links it rather than restating it, so the note keeps one copy of it. A failure path gets a check only if the Design already names that path and it's worth checking, because an invented one proves nothing.
- **Sarah checks:**
  - **What each one proves:** that something the story builds works, not that its code matches what the user expected.
  - **Who does what:** the implementer kicks off everything it can, such as pushing a throwaway branch, opening a PR or running a skill locally.
  - **Usable as written:** each one spells out the exact command the user runs, the text they paste or the screen they open. If that can only be known at build time, such as a token or a generated URL, the check says the implementer gives it to them, ready to paste. A check never sends them to another part of the note, such as "Step 1's token" or "the command from the Design".

Across the Build Order, every Piece and Convention is built by some step, and every Goal is proved by a check in some step.

### Approve
Show the outline, not the whole Build Order, because a whole one is too detailed to review closely (Sarah's call). The outline has the numbered step titles. Each title comes with the Pieces the step builds, its **Setup first** line, the Goals its checks prove and a one-line summary of its Sarah checks or "none". In a revision, the outline marks which steps changed.

Then ask whether the user approves the Build Order as a whole. They may first ask to see a step in full, or change one.

Once they approve, write it under `## Build Order`, at the end of `# Design`.

## 8. Update the Note's Status
- Set `status` to `ready`.
- Set `confirmed` to today, since the user approving the Design confirms the note.

## 9. Route Out-of-Scope Items and Stop
Route the out-of-scope list. Then tell the user the next step is `/infra-build <note name>` in a new session, and stop.
