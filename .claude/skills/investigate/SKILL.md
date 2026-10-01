---
name: investigate
description: Take a bug or cleanup idea note to spec, or re-investigate one at spec whose fix or Current State no longer holds. For a bug, reproduce it in the running app, find the root cause and settle the fix with Sarah. For a cleanup, scan the code, fill in Current State and settle its decisions with Sarah.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Investigate the note **$ARGUMENTS** and take it to `spec`.

## Why this skill works the way it does
`/shape` gives a bug or cleanup a type and a direction, and stops there on purpose. This skill does the next part. It finds out what's actually in the code, and in the running app for a bug, and settles how to fix or tidy it. After this, the note goes straight to `/plan-steps`. There's no `/assess` step for bugs or cleanups, because the approach is picked here while the root cause or the scan is fresh. For the same reason, it re-investigates a bug or cleanup at `spec` whose Root Cause, Fix or Current State no longer holds, the way `/assess` re-assesses a feature.

A few things shape how it works:
- **Reproduce before you diagnose.** A diagnosis of runtime behavior nobody has seen is a guess. Past agents guessed, fixed the wrong thing and guessed again. Every bug is reproduced in the running app before a root cause is written down. The only exceptions are ones Sarah signs off on.
- **Observation stays apart from diagnosis.** The `bug-reproducer` subagent follows exact steps and reports what it saw. It never gets your theory, so it can't see what it expects to see. You do the diagnosis from its report.
- **Fixes don't pile into existing modules.** A fix that gives an existing module a new job breaks Single Concern in `docs/project_conventions.md`, so it gets reviewed by `code-critic` before Sarah picks it.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## Talking with Sarah
- **Her comments may already answer it.** If one of Sarah's comments already answers a question, show it to her and confirm it's still her answer.

## 1. Read the note
Find the note in `notes/features/` and read all of it. If the Inbox has a retype line, follow the `retyping-a-note` skill's "After a retype".

It should be `type: bug` or `type: cleanup`. If it's another type, check whether that type fits the work. If it doesn't, offer to retype the note, as AGENTS.md describes under "Editing notes". If it does, tell Sarah which skill the note needs, and stop. Then check `status`:
- **`idea`:** a first investigation.
- **`spec`:** a re-investigation, usually because `/check-drift` found that the Root Cause and Fix, or the Current State, no longer hold. Its ⚠️ Check Drift callouts say what changed. Don't start from the old sections. They invite the same anchoring as old code. Do step 2 or 3 fresh, then in step 4 show what changed compared with the old sections.
- **`ready` or later:** tell Sarah what you found and stop. Changes to a planned story go through `/check-drift`.

Check `blocked-by`. If it has a `decision needed` entry, those decisions come first with `/decide`. If another story blocks it, the investigation may be wasted until that story lands. In either case, tell Sarah and ask whether to go on anyway. An entry that only waited on this skill being built is stale. Remove it in step 4.

If the note lists questions for this step to answer, at the top of Root Cause or Current State (or under Where It Stands in an older note), each one gets an answer in the note by the end of this run.

Don't check whether the issue is still relevant. Sarah running `/investigate` on it means she believes it is. If reproduction or the scan shows it's already fixed, step 2 or 3 handles that.

Then follow step 2 for a bug, or step 3 for a cleanup.

## 2. Bug notes

### 2a. Repro steps
Write exact steps to reproduce the symptom: where to start, which user, what to click or type, the screen size when it matters, and what goes wrong. Build them from Symptoms. Where the note doesn't say, ask Sarah. Don't fill gaps with guesses about what she meant.

Also write down the values that would show the symptom plainly, e.g. an element's position against the viewport, or the console error after Save.

### 2b. Reproduce it
Send the `bug-reproducer` subagent the repro steps, the symptom and the values to capture. Don't send it a theory about the cause. Save its report to `.scratch/<note name> - repro.md`.

- **Reproduced:** go on to 2c.
- **Not reproduced:** stop and tell Sarah what the report says happened instead. She decides what comes next: sharper repro steps (run it again), or it's already fixed and the note is dropped with `/close`.
- **Can't be reproduced through the app:** some bugs can't be reached through the UI, such as a server action that anyone can call directly. Others would change data in a way that can't be undone. Don't skip reproduction on your own. Tell Sarah why it can't be done and ask her to sign off on diagnosing from code. Record her sign-off in Symptoms.

### 2c. Root cause
Read the code the symptom runs through. Find where the fault starts, not where it shows up. Write down:
- **Where:** the file (and function) where the fault starts. If it spans several modules, list each one.
- **What it does versus what it should do.**
- **Evidence:** "confirmed in the running app" or "found by reading code". The second is allowed only with Sarah's sign-off from 2b.
- **Tests:** which of these applies, since `/plan-steps` needs it:
  - a test covers the behavior, but the code is wrong
  - no test covers the behavior
  - a test covers it and passes, but the behavior is still wrong: either the test is wrong, or it mocks away the very thing that breaks. Say which.

If the cause depends on runtime behavior, such as layout, timing or the data the page actually got, confirm it rather than reasoning to it. Send `bug-reproducer` the same steps again, with the values that would prove or disprove the cause. Still don't tell it what you expect. Save the report next to the first one.

If the same mistake is made in many places, the cause is systemic. Keep this note about its symptoms, and add "a Pattern note for <the mistake>" to the out-of-scope list.

### 2d. Settle the fix
Work out the reasonable fixes. Read the project docs they touch (`docs/project_conventions.md`, `project_structure.md`, `unit_tests.md`), and check any library a fix relies on as AGENTS.md describes under "Library APIs".

**Review fixes that add a job.** If a fix adds behavior or a responsibility to an existing module, and doesn't just correct what the module already does, send `code-critic` that module with the fix's job as a one-sentence target piece. Don't say which fix you prefer. Save its report to `.scratch/<note name> - critic.md`. Add its "Outside this story" and "Duplication" items to your out-of-scope list. Pure corrections, like a wrong condition or a bad transform, skip this.

**Triage the out-of-scope list** as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in becomes part of the fix: work it into the fixes before you present them.

**Present it.** Show Sarah the root cause from 2c, then the fix:
- **One reasonable fix:** what changes and where, and why. If the critic reviewed it, give its verdict. Wait for her approval.
- **More than one:** give each option with its trade-offs, what it touches and the critic's verdict if it has one. Then recommend one, following "Recommendations" in AGENTS.md. Wait for her to pick.

If Sarah wants to think it over, or the choice needs research beyond this bug, don't push. Write it as an Open Decisions question with the options under it, and add a `"decision needed: ..."` entry to `blocked-by` if it doesn't have one. `/decide` settles it later.

## 3. Cleanup notes

### 3a. Scan the code
Find everything in the note's scope as it stands today, with file paths and line numbers. Use more than one search: by name, by import and by pattern, since the same smell often hides under different names. Answer each question the note asks of this step. If the scan shows the thing is already gone, tell Sarah. She decides whether the note is dropped with `/close`.

Record how you checked each finding, e.g. "grep for `CalendarEvent` on 2026-09-26" or "read both files". Cleanup notes go stale quickly, and `/plan-steps` re-checks them.

### 3b. Settle the decisions
First, triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". An item Sarah pulls in joins the scan: find it in the code as in 3a, and record how you checked it.

The scan usually raises questions about how to tidy something, such as whether a type needs to exist, or whether two shapes can line up. Take each one to Sarah with its options and trade-offs and a recommendation, following "Recommendations" in AGENTS.md. Read the project docs and library docs as in 2d when an option depends on them.

If Sarah wants to think one over, or it needs research beyond this scan, leave it for `/decide`. It gets an Open Decisions question, and a `"decision needed: ..."` entry in `blocked-by` if the note doesn't have one.

## 4. Write it to the note
Draft the changes and show them to Sarah before writing. Keep her wording wherever the note already has it.

**Bug notes:**
- **Symptoms:** the repro steps, and how it was checked: "Reproduced in the running app on YYYY-MM-DD", or "Not reproduced: <reason>. Sarah signed off on diagnosing from code on YYYY-MM-DD".
- **Who Can Hit This:** fill in or correct it from what you found.
- **Root Cause:** everything from 2c, with file paths.
- **Fix:** the chosen fix, where it goes and why. If there were other reasonable options, one line says why this one won. If the choice was left for `/decide`, the Fix section says which Open Decision it waits on. An older note may still have a `# Fix Options` section; replace it with `# Fix`.
- **Acceptance Criteria:** the repro steps, ending in the symptom being gone, checked in the running app. Add any nearby flows the fix could break, named so Sarah can click through them.

**Cleanup notes:**
- **Current State:** everything from 3a, with how each finding was checked.
- **Open Decisions:** each decision from 3b, with its answer on a **Decided** line under it, e.g. "**Decided 2026-09-26:** keep `CalendarEvent`, renamed to `CalendarMeal`." Questions left for `/decide` stay open.
- **Acceptance Criteria:** usually "X no longer exists", plus the existing flows that must stay unchanged, named.

**Both:**
- **Re-investigation:** before writing, show Sarah what changed compared with the old Root Cause and Fix, or Current State and Open Decisions, and replace them only once she approves. Remove the ⚠️ Check Drift callouts on the sections you replaced, since the new sections answer them.
- **Questions for this step:** remove their list from Root Cause or Current State, or from Where It Stands in an older note, now that the note answers them.
- **Where It Stands:** update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Next: /plan-steps" or "Waiting on your fix decision. Next: /decide, then /plan-steps".
- **Frontmatter:** set `status: spec` and `confirmed` to today. Update `blocked-by`: remove entries this run settled or that only waited on this skill being built, and add a `decision needed` entry if 2d or 3b left decisions open.
- **Roadmap:** fix any text on the story's line in `notes/Roadmap.md` that this run made wrong, like "blocked on the investigate skill".

## 5. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this step.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 6. Stop
Don't start planning steps in this session. It has read the code and the repro reports, and carrying that into `/plan-steps` anchors the plan to this session's reading. Tell Sarah the note is at `spec`, and give the command to run in a new session: `/plan-steps <note name>`, or `/decide <note name>` if a decision was left open.
