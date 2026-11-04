---
name: audit
description: Scans the code in a cleanup note's scope, writes its Current State and settles its decisions with the user. Use when a cleanup note's next step is /audit.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Audit the cleanup note **$ARGUMENTS** and take it to `spec`.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Read the Note
Read all of the note. If its `status` is `ready` or later, tell the user what you found and stop, because changes to a planned story go through `/check-drift`. If it's `spec`, this run is a re-audit.

In each of these cases, tell the user and ask whether to go on anyway:
- **`blocked-by` has a `decision needed` entry:** those decisions come first with `/decide`, because their answers can change what the scan has to cover.
- **Another story blocks the note:** the audit may be wasted until that story lands.

## 2. Scan and Write Current State
Find everything in the note's scope as it stands today, and say where each one is. Use more than one search, such as by name, by import and by pattern, since the same thing often hides under different names.

In a re-audit, scan fresh rather than checking the old Current State, because working from it anchors you to its findings.

If what the note sets out to remove or tidy is already gone, tell the user. They decide whether the note is dropped with `/close`.

Write the findings to Current State, replacing any older findings. Keep any other line in the section, such as a warning about what the work mustn't break, since a scan wouldn't find it again. With each finding, say how you checked it, such as "grep for `CalendarEvent` on 2026-09-26" or "read both files", since cleanup notes go stale quickly and whoever re-checks one needs to know what to repeat. Don't ask the user to approve Current State, because it only records what's there, and a scan can run to more than anyone can usefully review.

Answer each question the note leaves for `/audit`, in the note.

Triage the out-of-scope list. An item the user pulls in joins the scan, so find it the same way and add it to Current State.

## 3. Settle the Decisions
As the `settling-a-decision` skill describes, settle each question the scan raises about how to tidy something, such as whether a type needs to exist. Record each one as a question under Open Decisions, with its answer.

## 4. Finish the Note
The parts of the note to update:
- **Acceptance Criteria:** usually "X no longer exists", plus the name of each existing flow that must stay unchanged.
- **Check Drift callouts:** remove the ones the new Current State and decisions answer.
- **Questions the note left for `/audit`:** remove them from where they were, now that the note answers them.
- **Frontmatter:** set `status: spec` and `confirmed` to today, and remove the `blocked-by` entries this run settled.

## 5. Route and Stop
Route the out-of-scope list. Then tell the user the note is at `spec`, and sum up in a few lines what the scan found. Give the command to run in a new session: `/plan-steps <note name>`, or `/decide <note name>` if a decision was left open. Don't start planning steps in this session, because carrying its reading of the code into `/plan-steps` anchors the plan to it.
