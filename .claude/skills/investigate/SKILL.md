---
name: investigate
description: Reproduces a bug, finds its root cause and settles the fix, or scans the code for a cleanup and settles its decisions. Use to take a bug or cleanup note to spec, or to redo one whose approach no longer holds.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Investigate the note **$ARGUMENTS** and take it to `spec`. This is planning only, so don't change the repo's code.

## 1. Read the note
Find the note in `notes/features/` and read all of it. It should be `type: bug` or `type: cleanup`. What this run does depends on its `status`:
- **`idea`:** a first investigation.
- **`spec`:** a re-investigation. Its ⚠️ Check Drift callouts, or an Inbox item from `/implement`, say what changed. Do step 2 or 3 fresh rather than starting from the old sections, because reading them first anchors you to their conclusions.
- **`ready` or later:** tell the user what you found and stop, because changes to a planned story go through `/check-drift`.

If `blocked-by` has a `decision needed` entry, those decisions come first with `/decide`. If another story blocks the note, the investigation may be wasted until that story lands. In either case, tell the user and ask whether to go on anyway.

If the note leaves questions for this step at the top of a section this step writes, answer each one in the note by the end of this run.

Then follow step 2 for a bug note or step 3 for a cleanup note. A run takes only one of them.

## 2. Bug notes

### 2a. Repro steps
Write exact steps to reproduce the symptom, including which account to sign in as and, when it matters, the screen size. Build them from the note's Symptoms section, and choose the account as `.claude/skills/running-the-app/which-user.md` describes. Where the note doesn't say, ask the user rather than guessing what they meant.

### 2b. Reproduce and diagnose it
Reproduce the bug and diagnose it as `.claude/skills/building-code/reproducing-a-bug.md` describes. Add to the diagnosis whether a test covers the behavior, since `/plan-steps` needs it to plan the fix's tests.

If it doesn't reproduce, stop and tell the user what happened instead. They decide what comes next: sharper repro steps, or the bug is already fixed and the note is dropped with `/close`.

Whatever reproduced the bug, if the cause you found depends on what the browser does, such as layout, timing or the data the page actually got, confirm the cause in the running app rather than reasoning to it. Send `bug-reproducer` the repro steps with the values that would prove or disprove the cause, but not the cause itself.

If the same mistake is made in many places, the cause is systemic. Keep this note to this bug's own symptoms and fix, because changing the mistake everywhere is a Pattern's work: setting a convention and moving the code to it. Add "a Pattern note for <the mistake>" to the out-of-scope list.

### 2c. Settle the fix
Work out the reasonable fixes. Before the user picks, check what each fix does to the modules it touches:
- **If it gives an existing module a new job:** have `code-critic` review it, because a new job in an existing module breaks Single Concern in `docs/project_conventions.md`. Send the critic that module, with the fix's job as a one-sentence target piece, and say the story isn't built yet. Don't say which fix you prefer, so its verdict isn't anchored to yours. Add its "Outside this story" and "Duplication" items to your out-of-scope list.
- **If it only corrects what a module already does,** such as a wrong condition or a bad transform: it needs no review.

Triage the out-of-scope list. An item the user pulls in becomes part of every fix it applies to, so work it in before you present them.

Show the user the root cause, then the fixes, with the critic's verdict on each one it reviewed. If this is a re-investigation, also say what changed from the old Root Cause and Fix, so their answer covers replacing them. If there's one reasonable fix, ask them to approve it. Otherwise, give each fix with its trade-offs, and ask them to pick.

If the fix choice is left for `/decide`, put the options under its question in Open Decisions.

## 3. Cleanup notes

### 3a. Scan the code
Find everything in the note's scope as it stands today, with file paths and line numbers. Use more than one search: by name, by import and by pattern, since the same smell often hides under different names. Answer each question the note asks of this step. If the scan shows the thing is already gone, tell the user. They decide whether the note is dropped with `/close`.

Record how you checked each finding, e.g. "grep for `CalendarEvent` on 2026-09-26" or "read both files". Cleanup notes go stale quickly, and `/plan-steps` re-checks them.

### 3b. Settle the decisions
First, triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item the user pulls in joins the scan: find it in the code as in 3a, and record how you checked it.

The scan usually raises questions about how to tidy something, such as whether a type needs to exist, or whether two shapes can line up. Take each one to the user with its options and trade-offs.

If the user wants to think one over or research it, leave it for `/decide`.

## 4. Write it to the note
**Bug notes:**
- **Symptoms:** add the repro steps below what's already there, with the date.
- **Who Can Hit This:** fill it in, or correct it from what you found.
- **Root Cause:** the diagnosis from 2b, with file paths. If you wrote a unit test to reproduce the bug, say what it runs and what it gets, then remove the test, because the pre-commit hook's test run picks up a failing test anywhere in the repo, `.scratch/` included, and blocks commits.
- **Fix:** the chosen fix, where it goes and why. If there were other reasonable options, add one line on why this one won. If the choice was left for `/decide`, say which Open Decision it waits on. If the note still has an older `# Fix Options` section, replace it with `# Fix`.
- **Acceptance Criteria:** the repro steps, ending in the symptom being gone, checked in the running app. Add any nearby flows the fix could break, named so the user can click through them.

**Cleanup notes:** if this is a re-investigation, first show the user what changed compared with the old Current State and Open Decisions, and replace them only once the user approves.
- **Current State:** everything from 3a, with how each finding was checked.
- **Open Decisions:** each decision from 3b, with its answer on a **Decided** line under it, e.g. "**Decided 2026-09-26:** keep `CalendarEvent`, renamed to `CalendarMeal`." Questions left for `/decide` stay open.
- **Acceptance Criteria:** usually "X no longer exists", plus the existing flows that must stay unchanged, named.

**Both:**
- **Re-investigation:** remove the ⚠️ Check Drift callouts on the sections you replaced, since the new sections answer them.
- **Questions for this step:** remove them from the top of the sections they were in, now that the note answers them.
- **Frontmatter:** set `status: spec` and `confirmed` to today, and remove the `blocked-by` entries this run settled.

## 5. Route and stop
Route the out-of-scope list. Then tell the user the note is at `spec`, and give the command to run in a new session: `/plan-steps <note name>`, or `/decide <note name>` if a decision was left open. Don't start planning steps in this session, because it has read the code and the repro reports, and carrying them into `/plan-steps` anchors the plan to this session's reading.
