---
name: final-review
description: Reviews a built story's code and settles each finding with the user. Use once every step is built.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-config.sh'
---

Review the story **$ARGUMENTS** now that every step is built.

## Why This Skill Works the Way It Does
This review looks across the steps, at what no single step shows, because the user reviewed each step's diff as it was built. On an infra story they weren't asked to, so step 3 also reads each change for bugs. The review checks three things:
1. **Purpose:** whether the built story does what its note set out to do.
2. **Best practice and conventions:** the code against best practice and the project's conventions.
3. **The plan:** the code against the note's plan.

## 1. Read the Note
If the note's `status` isn't `in-review`, tell the user what you found and stop.

Read the note, but not the story's code until step 3 says to. For a feature, step 3 gets a target design before you read the code. A review that reads the code first ends up favoring it.

## 2. Find the Story's Code
Run `sh scripts/story-range.sh "<note name>"`. The script also lists the commits just before the range. If one of them built part of the story, run the script again with that commit as the second argument, so the range starts there.

Show the user the range (first and last commit, with their subjects), whether uncommitted changes are included, and both groups of files. Wait for them to confirm or correct the range, and to say which of the other files belong to the story. This one confirmation covers the range and the files together.

## 3. Run the Checks
Back every finding with evidence the user can check: `file:line` for code that's there, or, for something the story doesn't do, where you looked for it. Name the rule, note line or plan line it breaks, such as a Purpose or Symptoms line. A clear bug you come across inside a single step is a finding too.

**For every story:** send the `leftovers-checker` subagent the note path, the confirmed range in the `<base>..HEAD` form the script's `Range:` line prints, whether uncommitted changes are part of it, and the confirmed files. Start it in the background, so it runs while you do the rest of this step.

**For a feature,** check 2 runs on a fresh target design, as `target-design.md` in this skill's folder describes.

**For a pattern, infra, bug, cleanup, sweep or roundup,** there are no behaviors to design a target from, so you do check 2 yourself. Read the conventions the story was meant to apply, such as a pattern's Rules section, an infra story's Design and Conventions, a roundup's **Decided** lines or the `docs/` file a cleanup aligns code with. Then read the story's files, and check each change against those conventions, the rest of the project's conventions and best practice.

**On an infra story,** also read each change for bugs.

**Then, for every story,** do checks 1 and 3 yourself:
- **Purpose:** check the built story against what it set out to do. Each place it falls short is a finding.
- **The plan:** compare the code with the note's approach and its steps. The approach is the section that says what to build, such as a feature's Suggested Approach or a bug's Fix. Whether a difference is a finding depends on what it changes:
  - **If it changes what the app does or shows or what the tooling does for the user, or goes against a choice that's the user's call:** it's a finding.
  - **Otherwise,** the difference is only in how the code is written, so it's a finding only if check 2 flags it.

  Keep the finding even when an **As built** note records the difference, because step 4 weighs the note's reason.

## 4. Collect the Findings
Sort what the checks and the agents found:
- **A check 2 or check 3 item that an As built note explains,** with a reason that holds up, isn't a finding.
- **An item outside the story that is a Boy Scout fix** isn't a finding. Add it to the fixes for step 6.
- **Any other item outside the story** is a finding, and you propose routing it, so the user triages it with the rest in step 5. Such items come from the "Outside this story" section of each agent's report, from code-critic's "Duplication" section on a feature, when none of its places are in the story's files, and from the rest of the out-of-scope list.
- **Any other small item on an infra story that changes only how the code is written, not what the tooling does for the user,** isn't a finding. Add it to the fixes for step 6, because the user cares more that an infra story works than how it's written.
- **Anything else** is a finding.

If the sort leaves no findings and no fixes, tell the user in one line and go to step 9. Otherwise, write the fixes to a file in `.scratch/`, and merge the findings into one list in the same file. One root cause is one finding, with every place it shows up, even when two sources found it separately. Order them by check: Purpose first, then best practice and conventions (on a feature, code-critic's verdicts, then other convention breaks, then the leftovers), then the plan, then the items from outside the story. For each finding from the story, propose one of:
- **Fix it here:** it's small, and any decision it needs can be settled in a question or two.
- **Route it:** it's bigger, needs design work, or reaches well outside the story's files.

## 5. Go Through the Findings With the User
Show each finding in this form:

```
F[n] of [total]: [title]
[what's wrong, with the evidence]
Found by: [agent or check]
Proposed: [fix it here, with the fix in a sentence or two / route it, and why]
```

The user answers each one with fix it here, route it or drop it. Fix it here pulls the finding into the story. Don't start any fix until every finding has an answer. The fixes go in dependency order, and you can't order them until you know them all. Act on each answer as it comes:
- **Fix it here:** if the fix has open choices, settle them now, as step 1 of the `building-code` skill describes.
- **Route it:** the finding joins the out-of-scope list.

Record each answer in the findings file, with any choices settled for the fix, before you show the next finding. Step 6 builds the fix from that record.

## 6. Make the Fixes
Put the fixes in dependency order, and build them one at a time. Don't ask the user to approve each one, because each was settled in step 4 or by their answer in step 5. For each fix:
1. Make it as the `building-code` skill describes in steps 2 and 3, "Write It Test First" and "Clean Up and Run the Checks". If the fix turns out bigger than it looked, stop and ask the user whether to route it instead.
2. Redo the checks the fix could affect, as `building-code` describes in step 4, "Do the Acceptance Checks". Which checks depends on the story:
   - **If it's infra:** the Implementer and Sarah checks in its Build Order that cover what the fix changed, because these checks are what prove the fix works.
   - **Otherwise:** if the fix changes anything the user could see in the app, the story's acceptance checks that cover it.

## 7. Show the Fixes
Show a table with one row per fix: its files as markdown links the user can click, a one-line summary, the tests it added or changed, and any checks redone in step 6, with what you saw. Ask whether they want any fix changed, and handle their feedback as `building-code` describes in step 5, "Handle the User's Feedback".

## 8. Triage the Late Out-of-Scope Items
Triage the out-of-scope items that turned up after step 5. Build each one the user pulls in as step 6 describes, and show it as step 7 does.

## 9. Update the Note
1. Set `status` to `done`.
2. Set the `^status` line to "Reviewed. Next: /close". The fixes and routed findings aren't worth noting in the summary below it, since the fixes live in the commits and routed findings in the notes they went to.

## 10. Route the Out-of-Scope Items
Route the out-of-scope list.

## 11. Stop
Tell the user the review is done. Closing the story with `/close`, in a new session, comes next and isn't part of this skill.
