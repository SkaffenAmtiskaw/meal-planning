---
name: review
description: Review how an in-review story's code fits together across all its steps, against a fresh target design, then go through the findings with Sarah, fix the small ones here and route the rest to the notes.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-config.sh'
---

Review the story **$ARGUMENTS** now that every step is implemented.

## Why this skill works the way it does
Sarah already reviewed each step's diff as it was built, so re-reviewing steps adds little. This review is for what no single step shows:
- scaffolding a step planned to remove that is still there
- helpers or logic duplicated across two steps
- a module that picked up a second job gradually, one reasonable step at a time
- dead code left by **As built** changes: unused exports or props, branches nothing reaches
- a piece that made sense early in the story but doesn't once the later steps exist

Most of these can be proven mechanically, and that's where most of the value is. Architecture findings are rarer, but they're the kind that get expensive later.

**The bias this skill is built against.** The review agent this replaces strongly favored whatever had been built. It read the diff first, so the code became the frame, and it had no target of its own to compare against. So here the target design comes first, from an agent that never sees the code. Where the code and the target differ, that's a finding for Sarah to decide. The code doesn't win by default. "It works" and "it's already there" aren't reasons to keep it.

## 1. Read the note
Find the note in `notes/features/`. It needs `status: in-review`. If it has a different status, tell Sarah what you found and stop.

Read the note. Don't open the story's code yet.

The review depends on `type`:
- **feature:** the full review, steps 2 to 8.
- **pattern, bug, cleanup, sweep or roundup:** there's no behavior list to design a target from, so skip the fresh design and `code-critic`. Step 3 explains what runs instead.

## 2. Find the story's code
Commit messages don't name the story, and commits often mix code with notes changes, so work the range out from the note's history and have Sarah confirm it.

1. Find the first commit that marked a step complete: `git log --follow -S'**Status:** ✅ Complete' --format='%h %ad %s' --date=short -- "<note path>"`, and take the last line (`--follow` doesn't work with `--reverse`). Its parent is the proposed start. Check the few commits before it for changes to step 1's files, in case the code was committed separately, and move the start back if so.
2. The range runs to `HEAD`. If `git status` shows uncommitted changes to code files, include them too.
3. List the code and test files changed in the range, leaving out `notes/` and `.opencode/`. Split them into two groups: files named in a step's Files list or an As built note, and everything else. The second group may come from other stories committed in between.

Show Sarah the range (first and last commit, with their subjects), whether uncommitted changes are included, and both groups of files. Wait for her to confirm or correct them. This one confirmation covers the range and the file list together.

## 3. Build the target and run the checks
Save each agent's report to `.scratch/<note name> - <agent name>.md`.

**For every story:** send the note path, the confirmed range and the confirmed files to the `leftovers-checker` subagent. Start it now, in the background, so it runs while you do the rest of this step.

**For a feature:**
1. Send the `target-designer` subagent the story's behaviors, numbered, from the Suggested Approach or wherever the note lists them, and the paths to the Design Handoff sections and images. Give it nothing else, and don't describe the built code or the approved approach to it.
2. When its design comes back, read the story's files. Map each file to the target piece it fills. Files that fill no piece still go on the list, marked "no target piece". A job the fresh design didn't need is worth asking about.
3. Send the list to the `code-critic` subagent: each target piece with its job and the files mapped to it. Tell it this is a review of a finished story, so every file on the list has already been changed by the story. Don't pre-judge the code for it.
4. Compare the fresh design with the approved Suggested Approach table. Each place they differ is a finding: what the approach planned, what a fresh design has, and what the code does. These are where the approach may have gone wrong once the later steps existed.

**For a pattern, bug, cleanup, sweep or roundup:** read the conventions the story was meant to apply, such as a pattern's Rules section, a roundup's **Decided** lines or the `.opencode/docs/` file a cleanup aligns code with (for example `unit_tests.md`). Then read the story's files and check each change against them. Findings need `file:line` evidence and the rule they break.

Every agent's "Outside this story" and "Duplication" items that fall outside the story become findings in step 4, proposed as route to the notes, instead of going straight to the out-of-scope list. Step 5 is their triage: fix here pulls one into the story, and skip drops it.

## 4. Collect the findings
Merge everything into one list, in `.scratch/<note name> - review findings.md`:
- One root cause is one finding, with every place it shows up, even when two sources found it separately.
- Order: architecture findings first (the critic's verdicts, differences from the approach, convention breaks), then the leftovers.
- For each finding, propose one of:
  - **Fix here:** it's small, and any decision it needs can be settled in a question or two.
  - **Route to the notes:** it's bigger, needs design work, or reaches well outside the story's files.

Don't review steps one by one. If you trip over a clear bug, include it. Otherwise, don't hunt for issues inside a single step.

If there are no findings, tell Sarah in one line and go to step 8.

## 5. Go through the findings with Sarah
First, tell her in one line how many findings there are. Then show each one:

```
F[n] of [total]: [title]
[what's wrong, with file:line locations and the evidence]
Found by: [agent or check]
Proposed: [fix here, with the fix in a sentence or two / route to the notes, and why]
```

Wait for her answer: fix here, route to the notes, skip, or something else. If she chooses fix here and the fix has open choices, settle them now, following "Settle the open choices" in `.claude/skills/implement/SKILL.md`. By the end of this step, every fix must be fully decided.

Record each answer in the findings file as you go. Routed findings join the out-of-scope list. Skipped findings are dropped and never recorded anywhere.

Don't start fixing until every finding has an answer.

## 6. Make the fixes, one at a time
Put the approved fixes in dependency order. For each one:
1. Tell Sarah in one line which fix you're on.
2. Make it following `.claude/skills/implement/SKILL.md`: "Use current library APIs", "Write the tests first, then the code", and "Run the checks", including its `cleanup.md`. The open choices were settled in step 5. If a new one comes up, stop and ask. If the fix turns out bigger than it looked, stop and ask Sarah whether to route it to the notes instead.
3. If the fix changes anything she could see in the app, redo the story's acceptance checks that cover it, as `first-pass.md` in the implement skill's folder describes.
4. Leave it unstaged, so her unstaged changes show just this fix.
5. Report: the files changed, the tests and the logic each covers, the checks run, and the acceptance checks redone with what you saw.
6. Ask her whether she approves the fix, and wait. Handle any feedback as "Handle her feedback" in the implement skill describes, using its `bugs.md` for bugs. Once she approves, stage the files the fix changed, and go on to the next approved fix in the order.

## 7. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 8. Update the note
1. Set `status` to `done`.
2. Update the `^status` line to "Reviewed. Next: /close".

Write nothing else to the note. The fixes live in the commits, and routed findings live in the notes they went to. Leave the note changes unstaged.

## 9. Stop
Tell Sarah the review is done. Closing the story with `/close`, in a new session, comes next and isn't part of this skill.
