---
name: check-drift
description: Check a spec, ready or in-progress note against the code, the conventions, other notes and Sarah's own comments, add ⚠️ Check Drift callouts where it no longer matches, and route it to its next step. Never rewrites the plan.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh .opencode/docs'
---

Check the note **$ARGUMENTS** for drift.

## Why this skill works the way it does
A note is written against the codebase, the conventions and the other stories as they were on its `confirmed` date. By the time it's built, any of these may have moved:
- **Code:** things the plan names have moved, been renamed or been deleted, or another story already built part of it.
- **Conventions:** the way this kind of thing is built has changed. The docs in `.opencode/docs/` lag far behind the code, so a diff of the docs catches only a little of this. Recent code is the best evidence of the current convention.
- **Other notes:** another story's design or build changed shared UI or modules this story depends on. This is how design changes usually reach a story.
- **Sarah changed her mind:** she writes a comment tagged or signed with her name in the note, or tells you in chat.

This skill **flags and routes**. It never rewrites the plan. It adds ⚠️ Check Drift callouts where the note no longer matches, and sends the note to whichever skill fixes it: `/plan-steps` to re-plan, or the skill that re-settles its approach: `/assess` for a feature, `/investigate` for a bug or cleanup, `/architect` for a pattern, `/decide` for a roundup. The one thing it may fix itself is a convention doc, as AGENTS.md describes under "Doc gaps".

It only reads code. It never runs the app and never changes code. A hook blocks edits outside `notes/`, `.scratch/` and `.opencode/docs/`.

## Talking with Sarah
- **Her decisions are made.** When she has written or said that she wants something changed, don't ask whether she still wants it, and don't ask again for every place it touches. Ask only where applying it leaves a real choice open.

## 1. Read the note
Find the note in `notes/features/`. It needs `status: spec`, `ready` or `in-progress`. If it has another status, tell Sarah what you found and stop. A collecting sweep (`type: sweep`, `status: idea`) is checked only after it's kicked off. Tell Sarah to run `/kickoff` on it first, then `/check-drift` on the note it kicks off, and stop.

Read the whole note, including:
- the Design Handoff and its images in `notes/assets/<story>/`
- existing ⚠️ Check Drift callouts, and **As built** notes

Then work out the **remaining work**. That's all you check:
- `spec`: the approach. For a feature, that's the design, behaviors and Suggested Approach. For a bug, the Root Cause and Fix. For a cleanup, Current State and the decided Open Decisions. For a pattern, the Rules and Migration Checklist. For a roundup, the decided questions under Open Decisions.
- `ready` or `in-progress`: the steps with no `**Status:**` line, plus the design and approach sections they build. Skip completed steps. Their As built notes already record what happened.
- a `spec` sweep: every unchecked item under Items.

Note the `confirmed` date. It's the baseline for everything below.

## 2. Find Sarah's comments
AGENTS.md says what counts as Sarah's comment, under "Editing notes". Third-person mentions like "Approved by Sarah 2026-09-25" are records written by agents, not her comments.

Run `git blame --date=short` on the note. A comment is **new** when its line was added after `confirmed`, or isn't committed yet. A change she tells you in chat this session counts as new too.

For each comment, old or new: if the code or the note already does what it asks, handle it as AGENTS.md describes under "Editing notes". Otherwise, if it's older than `confirmed`, leave it. It was handled when `confirmed` was set. If it's new, trace it through the remaining work: every behavior, design section, approach row and step it affects. Each affected place becomes a finding (step 4). Most will be clear from what she wrote. Ask her only where there are two reasonable ways to apply it.

## 3. Map the footprint and send out the checkers
From the remaining work, write the story's footprint to `.scratch/<note name> - footprint.md`:
- **Named code:** every file, module, component, hook, action, route and prop the remaining work names.
- **Kinds of things it builds:** e.g. a server action, a modal form, a hook, a unit test for a hook.
- **UI areas:** e.g. the mobile day section header, the today marker.
- **Related notes:** its hub, the notes it links to, the stories in `blocked-by`.

Then run the `code-drift-checker` and `note-drift-checker` subagents in parallel. Give each one the note path, the `confirmed` date, the footprint file and the remaining work (which steps, or "the whole approach" for a `spec` note). Don't tell them what you expect them to find.

Save each report to `.scratch/<note name> - drift (code).md` and `.scratch/<note name> - drift (notes).md`. Add their "Outside this story" items to your out-of-scope list.

## 4. Sort the findings
Put the findings from Sarah's comments and both reports into one list. Merge findings that are the same problem seen from two sides.

If a finding traces one of Sarah's comments, don't sort it. She has decided. It gets a callout recording her decision, and a question only where applying it is open. Sort every other finding as below.

**If the note is a sweep,** its items must stay small and decided, so sort each item's findings this way:
- **Already fixed, or built by another story:** mechanical. The callout says the item is dropped and why, and `/plan-steps` skips it.
- **Moved or renamed:** mechanical, as above.
- **Now needs a decision:** it no longer belongs in a sweep. Take it out straight away, without asking whether to settle it, and put it on the out-of-scope list, where it may go to a roundup or become its own story. Leave a callout where it was saying it moved out and why.
- **Now waits on another story:** move it back to the collecting note, starting with `**Blocked by [[Story]]:**`, so it rolls over to the next sweep. If no collecting note exists, put it on the out-of-scope list instead. Leave a callout where it was saying where it went and why.

A sweep never needs a re-assessment and never gets a `decision needed` entry.

**Otherwise,** sort each finding:
- **Mechanical:** the plan's intent still works as written, just with a different name or path. A hook moved, a prop was renamed, a file the plan edits was split.
- **Needs a decision:** anything that changes what gets built or how. A conflict with another story's design, docs vs. recent code, a module that now does a different job, a piece another story already built.

Then note what it means for the note:
- **Callout only:** the plan still holds.
- **Steps:** the approach holds but the remaining steps don't. It needs a re-plan.
- **Approach:** the approach, or part of it, no longer holds. Its approach needs re-settling.
- **Blocked:** it can't go ahead until another story lands or a decision is made.

Then triage the out-of-scope list as AGENTS.md describes under "Out-of-scope work". If an item is a sweep item this step took out, it can't be pulled back in, so offer route or drop only. Otherwise, an item Sarah pulls in becomes a finding that needs a decision. Sort it like the others.

## 5. Write the callouts
Write each callout as AGENTS.md describes under "Editing notes", worded like this:

`> ⚠️ **Check Drift YYYY-MM-DD:** what no longer matches, and what it means for this story. Found by reading code, not verified in the running app.`

Say how it was found: by reading code, by reading notes, or from Sarah's comment. When a finding depends on runtime behavior, label it unverified and add a quick check Sarah can do in the app.

**Mechanical findings:** add their callouts without asking. Keep a list for the summary in step 7.

**Sarah's comments:** add a callout at each place her comment affects, pointing back to it, e.g. "Sarah's comment under Behaviors (2026-09-24) drops the week view, so this step's week toggle no longer applies."

**Findings that need a decision:** if the note is a roundup and a finding means Approach, don't settle it here. Add it to Open Decisions as a new question that says which decided question it reopens and why, with a `decision needed` entry in `blocked-by` if the note doesn't have one. Write a callout on the old decision that points to the new question. `/decide`'s researcher reads the current code for each question. Otherwise, go through them with Sarah:
1. Show the finding, where it applies, its evidence (`file:line` or note and section) and how it was found.
2. Say what the options are, and which you'd recommend and why.
3. Wait for her answer.
4. Write the callout, recording her decision, e.g. "Sarah decided 2026-09-25 that the ring replaces the tint here."

Some decisions need more than a callout:
- **Recent code wins over the docs**, or recent code follows a convention the docs don't mention and Sarah says it's the convention: it's a doc gap. Handle it as AGENTS.md describes under "Doc gaps".
- **The docs win:** the recent code that breaks the convention goes on the out-of-scope list.
- **The other story has to change:** that change goes on the out-of-scope list. Don't edit the other note here.
- **A decision she wants to make later:** add the question to the note's Open Decisions, and a `"decision needed: ..."` entry to `blocked-by` if the note doesn't have one.

## 6. Route the note
If the note is a sweep, it stays at `spec` and always goes to `/plan-steps` next. Otherwise, work out the next step from the findings' meanings in step 4:
- **Nothing beyond callouts:** `status` stays as it is.
- **Steps:** set `status` to `spec`. Next is `/plan-steps`, which keeps the ✅ steps and re-plans the rest.
- **Approach:** set `status` to `spec`. Next is the skill that re-settles the approach for the note's type:
  - **Feature:** `/assess`, as a re-assessment.
  - **Bug or cleanup:** `/investigate`, as a re-investigation.
  - **Pattern:** `/architect`, as a revision.
  - **Roundup:** `/decide`, for the questions step 5 added.
- **Blocked:** add the story (`"[[link]]"`) or decision to `blocked-by`.

If more than one applies, the biggest wins: approach over steps over callouts only. Blocked can go with any of them.

Update the `^status` line as AGENTS.md describes under "Editing notes", e.g. "Drift found. Next: /plan-steps to re-plan from Step 4", and set `confirmed` to today. Mention any change to `status` or `blocked-by` in your summary.

## 7. Summarize
Show Sarah:
1. **Mechanical callouts:** a table with one row per callout, with where it is and what it says. This is for information. She can delete any she thinks are wrong.
2. **Decisions:** one line per decision she made, and where it was recorded.
3. **Doc updates:** each doc changed, with a one-line summary.
4. **Reports:** links to the two reports and the footprint.

## 8. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, route it as AGENTS.md describes under "Out-of-scope work".

## 9. Stop
Don't start the next step in this session. Tell Sarah the check is done and give her the command for a new session, e.g. `/plan-steps <note name>`, `/assess <note name>`, `/investigate <note name>`, `/architect <note name>`, `/decide <note name>` or `/implement <note name>`.
