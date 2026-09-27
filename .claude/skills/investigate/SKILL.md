---
name: investigate
description: Take a bug or cleanup idea note to spec. For a bug, reproduce it in the running app, find the root cause and settle the fix with Sarah. For a cleanup, scan the code, fill in Current State and settle its decisions with Sarah.
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
`/shape` gives a bug or cleanup a type and a direction, and stops there on purpose. This skill does the next part. It finds out what's actually in the code, and in the running app for a bug, and settles how to fix or tidy it. After this, the note goes straight to `/plan-steps`. There's no `/assess` step for bugs or cleanups, because the approach is picked here while the root cause or the scan is fresh.

A few things shape how it works:
- **Reproduce before you diagnose.** A diagnosis of runtime behavior nobody has seen is a guess. Past agents guessed, fixed the wrong thing and guessed again. Every bug is reproduced in the running app before a root cause is written down. The only exceptions are ones Sarah signs off on.
- **Observation stays apart from diagnosis.** The `bug-reproducer` subagent follows exact steps and reports what it saw. It never gets your theory, so it can't see what it expects to see. You do the diagnosis from its report.
- **Fixes don't pile into existing modules.** Single concern is one of Sarah's top priorities. A fix that gives an existing module a new job gets reviewed by `code-critic` before Sarah picks it.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.scratch/`.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once. A later question often depends on an earlier answer.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Her decisions are made.** A line where her name is a tag or a signature (`[Sarah] ...`, `... - Sarah`) is her own words. If one already answers a question, show it to her and confirm it's still her answer. Never edit her comments.
- **Recommendations:** give one when best practice supports it, and name the practice. When a choice comes down to her preference, say so and don't guess.
- **Out-of-scope items:** keep a running list of anything that belongs outside this story. Don't stop to deal with them as they come up. Step 5 handles them.

## 1. Read the note
Read `notes/Note Conventions.md` first. Then find the note in `notes/features/` and read all of it, including each embedded section (`![[Note#Section]]`), which is part of the note.

It should be `type: bug` or `type: cleanup`, with `status: idea`. Otherwise, tell Sarah what you found and stop. A note at `spec` or later that needs re-checking goes through `/check-drift`.

Check `blocked-by`. If it has a `decision needed` entry, those decisions come first with `/decide`. If another story blocks it, the investigation may be wasted until that story lands. In either case, tell Sarah and ask whether to go on anyway. An entry that only waited on this skill being built is stale. Remove it in step 4.

If Where It Stands lists questions for this step to answer, each one gets an answer in the note by the end of this run.

Don't check whether the issue is still relevant. Sarah running `/investigate` on it means she believes it is. If reproduction or the scan shows it's already fixed, step 2 or 3 handles that.

Then follow step 2 for a bug, or step 3 for a cleanup.

## 2. Bug notes

### 2a. Repro steps
Write exact steps to reproduce the symptom: where to start, which user, what to click or type, the screen size when it matters, and what goes wrong. Build them from Symptoms. Where the note doesn't say, ask Sarah, one question at a time. Don't fill gaps with guesses about what she meant.

Also write down the values that would show the symptom plainly, e.g. an element's position against the viewport, or the console error after Save.

### 2b. Reproduce it
Send the `bug-reproducer` subagent the repro steps, the symptom and the values to capture. Don't send it a theory about the cause. Save its report, unedited, to `.scratch/<note name> - repro.md`.

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
Work out the reasonable fixes. Read the project docs they touch (`.opencode/docs/project_conventions.md`, `project_structure.md`, `unit_tests.md`), and read the installed version's docs for any library a fix relies on, never what you remember of its API:
- Mantine: https://mantine.dev/llms.txt
- better-auth: https://better-auth.com/llms.txt
- Next.js: `node_modules/next/dist/docs/`

**Review fixes that add a job.** If a fix adds behavior or a responsibility to an existing module, and doesn't just correct what the module already does, send `code-critic` that module with the fix's job as a one-sentence target piece. Don't say which fix you prefer. Save its report, unedited, to `.scratch/<note name> - critic.md`. Add its "Outside this story" and "Duplication" items to your out-of-scope list. Pure corrections, like a wrong condition or a bad transform, skip this.

**Present it.** Show Sarah the root cause from 2c, then the fix:
- **One reasonable fix:** what changes and where, and why. If the critic reviewed it, give its verdict. Wait for her approval.
- **More than one:** give each option with its trade-offs, what it touches and the critic's verdict if it has one. Then recommend one, following the Recommendations rule above. Wait for her to pick.

If Sarah wants to think it over, or the choice needs research beyond this bug, don't push. Write it as an Open Decisions question with the options under it, and add a `"decision needed: which fix to use"` entry to `blocked-by`. `/decide` settles it later.

## 3. Cleanup notes

### 3a. Scan the code
Find everything in the note's scope as it stands today, with file paths and line numbers. Use more than one search: by name, by import and by pattern, since the same smell often hides under different names. Answer each question the note asks of this step. If the scan shows the thing is already gone, tell Sarah. She decides whether the note is dropped with `/close`.

Record how you checked each finding, e.g. "grep for `CalendarEvent` on 2026-09-26" or "read both files". Cleanup notes go stale quickly, and `/plan-steps` re-checks them.

### 3b. Settle the decisions
The scan usually raises questions about how to tidy something, such as whether a type needs to exist, or whether two shapes can line up. Take each one to Sarah, one at a time, with its options and trade-offs and a recommendation, following the Recommendations rule above. Read the project docs and library docs as in 2d when an option depends on them.

If Sarah wants to think one over, or it needs research beyond this scan, leave it for `/decide`. It gets an Open Decisions question and a `"decision needed: <short question>"` entry in `blocked-by`.

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
- **Where It Stands:** remove the questions that were for this step, now that the note answers them. Draft the new ` ^status` line. It says what happens next and nothing else, e.g. "Next: /plan-steps" or "Waiting on your fix decision. Next: /decide, then /plan-steps". Show Sarah the line and wait for her approval.
- **Frontmatter:** set `status: spec` and `confirmed` to today. Update `blocked-by`: remove entries this run settled or that only waited on this skill being built, and add any `decision needed` entries from 2d or 3b.
- **Roadmap:** make sure the story's line in `notes/Roadmap.md` links to the note and embeds its status (`![[<note>#^status]]`). Fix any text on the line that this run made wrong, like "blocked on the investigate skill". Never reorder the Roadmap.

## 5. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this step.

Otherwise, send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found (with `file:line` if it came from code) and why it's outside this story. The router reads the notes and suggests a home for each item. It doesn't change anything.

Then go through its suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.

## 6. Stop
Don't start planning steps in this session. It has read the code and the repro reports, and carrying that into `/plan-steps` anchors the plan to this session's reading. Tell Sarah the note is at `spec`, and give the command to run in a new session: `/plan-steps <note name>`, or `/decide <note name>` if a decision was left open.
