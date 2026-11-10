---
name: audit-release
description: Runs one of a release's audits, files a fix story for each finding the user keeps, then deletes the audit note. Use when an audit note's next step is /audit-release.
argument-hint: "[audit note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Run the audit **$ARGUMENTS**, file a fix story for each finding the user keeps, and delete the audit note.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Read the Audit
Run `git rev-parse --path-format=absolute --git-dir --git-common-dir`. If the two paths differ, this is a worktree. Stop, and tell the user to run `/audit-release` in a session in the main checkout. The main checkout is on the latest `develop`, which is what the release ships.

Find the note in `features/releases/` in the notes repo. If its `type` isn't `audit` or its `status` isn't `ready`, tell the user what you found, and stop.

Read its Kind, Scope and Goal, then the file for its kind in this skill's folder, `<kind>.md`, such as `security.md`.

## 2. Run It
Run `git fetch origin`, so a scope that's a range reads the latest `main` and `develop`. Then run the audit as the kind's file describes, passing a subagent the scope as the note gives it.

## 3. Go Through the Findings
If the kind's file says how to go through its findings, follow it.

One root cause is one finding, with every place it shows up. Before you show the user a finding, check whether an open note or Roadmap line already covers it, searching for the same problem in other words too. If one does, tell the user which, and file nothing for it.

Go through the rest with the user one at a time. For each, show what it is, where it is and its evidence, then ask whether to keep it as a fix story or drop it. If they keep it:
1. **The fix story's note:** a new idea note in `features/<area>/` in the notes repo, from `.claude/note-templates/Idea.md`. Under Notes, write the finding as the problem, with its evidence and a line saying this audit found it. Leave out any fix the finding suggests, from the Notes and from the note's name, unless the user names or settles one, because a later session builds a fix it finds written there without weighing it. `/shape` then gives it its type.
2. **Its Roadmap line:** `[[<fix story>]] ![[<fix story>#^status]] 🎯 [[<goal>]]` in Next. Put it above every line except 🔥 lines and those for notes the goal note's `# Release` section already links, so the release's work stays ahead of everything but hotfixes. Renumber the lines below it.
3. **The `# Release` section:** in the goal note's `# Release` section, add a bullet that links the fix story's note, so the release freeze lets it be built.

## 4. Delete the Audit Note
Delete the audit note as the `deleting-a-note` skill describes.

## 5. Report
Tell the user which fix stories you filed and which findings they dropped. If the goal's Roadmap line now says ` · Next: /ship-goal`, give them that command to run in a new session. Otherwise, tell them the fix stories are at the top of Next, each starting at `/shape`.
