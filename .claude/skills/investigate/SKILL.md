---
name: investigate
description: Reproduces a bug, finds its root cause and settles the fix. Use to take a bug note to spec, or to redo one whose approach no longer holds.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Investigate the bug note **$ARGUMENTS** and take it to `spec`.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Read the note
Read all of the note. If its `status` is `ready` or later, tell the user what you found and stop, because changes to a planned story go through `/check-drift`. If it's `spec`, this run is a re-investigation: do steps 2 to 4 fresh rather than working from the old sections, because that anchors you to their conclusions.

Run check 2 in `starting-on-a-branch.md`, in the `building-code` skill's folder, and stop wherever it says to. A hotfix has to be diagnosed against `main`'s code, which production runs, and `/investigate` usually runs in the main checkout on `develop`.

In each of these cases, tell the user and ask whether to go on anyway:
- **`blocked-by` has a `decision needed` entry:** those decisions come first with `/decide`.
- **Another story blocks the note:** the investigation may be wasted until that story lands.

Answer each question the note leaves for `/investigate`, in the note, by the end of this run.

## 2. Repro steps
Write exact steps to reproduce the symptom, including which account to sign in as and, when it matters, the screen size. Build them from the note's Symptoms section, and choose the account as `.claude/skills/running-the-app/which-user.md` describes. Where the note doesn't say, ask the user rather than guessing what they meant.

## 3. Reproduce and diagnose it
Reproduce the bug and diagnose it as `.claude/skills/building-code/reproducing-a-bug.md` describes. Add to the diagnosis whether a test covers the behavior, since `/plan-steps` needs it to plan the fix's tests.

If it doesn't reproduce, stop and tell the user what happened instead. They decide what comes next: sharper repro steps, or the bug is already fixed and the note is dropped with `/close`.

If the cause depends on what the browser does, such as layout, timing or the data the page actually got, confirm it in the running app, however you reproduced the bug. Send `bug-reproducer` the repro steps with the values that would prove or disprove the cause, but not the cause itself.

How far this note's fix goes depends on where the mistake comes from, not on how many places it's in. The cases:
- **If code written separately has already gone wrong the same way more than once, or every new file of some kind, such as a new mutation, faces the same choice:** the cause is systemic. Keep this note to this bug's own symptoms and fix, because changing the mistake everywhere is a Pattern's work. Add "a Pattern note for <the mistake>" to the out-of-scope list.
- **Otherwise:** the fix covers every place the mistake is in, because changing today's code ends the problem, even if later code could bring it back. For example, clock calls that only go wrong once another story moves rendering to the server.

## 4. Settle the fix
Work out the reasonable fixes. Before the user picks, work out what each fix does to the modules it touches. The cases, and whether each needs a review:
- **If it gives an existing module a new job:** have `code-critic` review it, because a new job in an existing module breaks Single Concern in `docs/project_conventions.md`. Send the critic that module, with the fix's job as a one-sentence target piece, and say the story isn't built yet. Don't say which fix you prefer, so its verdict isn't anchored to yours. Add its "Outside this story" and "Duplication" items to your out-of-scope list.
- **If it only corrects what a module already does,** such as a wrong condition or a bad transform: it needs no review.

Triage the out-of-scope list. An item the user pulls in becomes part of every fix it applies to, so work it in before you present them.

Show the user the root cause, then the fixes, with the critic's verdict on each one it reviewed. If this is a re-investigation, also say what changed from the old Root Cause and Fix, so the user's answer covers replacing those sections. What you ask depends on how many fixes are reasonable:
- **One:** ask them to approve it.
- **More than one:** give each with its trade-offs, and ask them to pick.

## 5. Write it to the note
The parts of the note to update:
- **Symptoms:** add the repro steps below what's already there, with the date.
- **Who Can Hit This:** fill it in, or correct it from what you found.
- **Root Cause:** the diagnosis from step 3, with file paths. If you wrote a unit test to reproduce the bug, say what it runs and what it gets, then remove the test. The pre-commit hook's test run picks up a failing test anywhere in the repo, `.scratch/` included, and blocks commits.
- **Fix:** the chosen fix, where it goes and why. If there were other reasonable options, add one line on why this one won. If the choice was left for `/decide`, put the options under its question in Open Decisions, and say here which Open Decision it waits on.
- **Acceptance Criteria:** the repro steps, ending in the symptom being gone, checked in the running app. Add any nearby flows the fix could break, named so the user can click through them.
- **Check Drift callouts:** in a re-investigation, remove the ones on the sections you replaced, since the new sections answer them.
- **Questions the note left for `/investigate`:** remove them from where they were, now that the note answers them.
- **Frontmatter:** set `status: spec` and `confirmed` to today, and remove the `blocked-by` entries this run settled.

## 6. Route and stop
Route the out-of-scope list. Then tell the user the note is at `spec`, and give the command to run in a new session: `/plan-steps <note name>`, or `/decide <note name>` if a decision was left open. Don't start planning steps in this session, because it has read the code and the repro reports, and carrying them into `/plan-steps` anchors the plan to this session's reading.
