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

This skill **flags and routes**. It never rewrites the plan. It adds ⚠️ Check Drift callouts where the note no longer matches, and sends the note to whichever skill fixes it: `/plan-steps` to re-plan, `/assess` to re-assess. The one thing it fixes itself is a convention doc, and only with Sarah's approval of the wording, because docs that wait for later never get updated.

It only reads code. It never runs the app and never changes code. A hook blocks edits outside `notes/`, `.opencode/scratch/` and `.opencode/docs/`.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Her decisions are made.** When she has written or said that she wants something changed, don't ask whether she still wants it, and don't ask again for every place it touches. Ask only where applying it leaves a real choice open.
- **Out-of-scope items:** keep a running list of anything that belongs outside this story. Don't stop to deal with them as they come up. Step 8 handles them.

## 1. Read the note
Find the note in `notes/features/`. `notes/Note Conventions.md` explains the frontmatter and markers. It needs `status: spec`, `ready` or `in-progress`. If it has another status, tell Sarah what you found and stop.

Read the whole note, including:
- each embedded section (`![[Hub#Section]]`), which is part of the note
- the Design Handoff and its images in `notes/assets/<story>/`
- existing ⚠️ Check Drift callouts, and **As built** notes

Then work out the **remaining work**. That's all you check:
- `spec`: the design, behaviors and Suggested Approach.
- `ready` or `in-progress`: the steps with no `**Status:**` line, plus the design and approach sections they build. Skip completed steps. Their As built notes already record what happened.

Note the `confirmed` date. It's the baseline for everything below.

## 2. Find Sarah's comments
A line is Sarah's own comment when her name is used as a tag or a signature, e.g. `[Sarah] I want to do X instead.` or `This needs to change to Y - Sarah`. Third-person mentions like "Approved by Sarah 2026-09-25" are records written by agents, not her comments.

Run `git blame --date=short` on the note. A comment is **new** when its line was added after `confirmed`, or isn't committed yet. Older comments were handled when `confirmed` was set. A change she tells you in chat this session counts as new too.

For each new comment, trace it through the remaining work: every behavior, design section, approach row and step it affects. Each affected place becomes a finding (step 4). Most will be clear from what she wrote. Ask her only where there are two reasonable ways to apply it.

Never edit her comments, and never write in her voice or sign as her. When you record a decision she made, write it in the third person.

## 3. Map the footprint and send out the checkers
From the remaining work, write the story's footprint to `.opencode/scratch/<note name> - footprint.md`:
- **Named code:** every file, module, component, hook, action, route and prop the remaining work names.
- **Kinds of things it builds:** e.g. a server action, a modal form, a hook, a unit test for a hook.
- **UI areas:** e.g. the mobile day section header, the today marker.
- **Related notes:** its hub, the notes it links to, the stories in `blocked-by`.

Then run the `code-drift-checker` and `note-drift-checker` subagents in parallel. Give each one the note path, the `confirmed` date, the footprint file and the remaining work (which steps, or "the whole approach" for a `spec` note). Don't tell them what you expect them to find.

Save each report, unedited, to `.opencode/scratch/<note name> - drift (code).md` and `.opencode/scratch/<note name> - drift (notes).md`. Add their "Outside this story" items to your out-of-scope list.

## 4. Sort the findings
Put the findings from Sarah's comments and both reports into one list. Merge findings that are the same problem seen from two sides.

Sort each one:
- **Mechanical:** the plan's intent still works as written, just with a different name or path. A hook moved, a prop was renamed, a file the plan edits was split.
- **Needs a decision:** anything that changes what gets built or how. A conflict with another story's design, docs vs. recent code, a module that now does a different job, a piece another story already built.

Findings that trace one of Sarah's comments are neither. She has decided. They get a callout recording her decision, and a question only where applying it is open.

For each finding, also note what it means for the note:
- **Callout only:** the plan still holds.
- **Steps:** the approach holds but the remaining steps don't. It needs a re-plan.
- **Approach:** the approach, or part of it, no longer holds. It needs a re-assessment.
- **Blocked:** it can't go ahead until another story lands or a decision is made.

## 5. Write the callouts
A callout goes directly above the text it's about, in this format:

`> ⚠️ **Check Drift YYYY-MM-DD:** what no longer matches, and what it means for this story. Found by reading code, not verified in the running app.`

Say how it was found: by reading code, by reading notes, or from Sarah's comment. When a finding depends on runtime behavior, label it unverified and add a quick check Sarah can do in the app. Never edit the plan text itself.

**Mechanical findings:** add their callouts without asking. Keep a list for the summary in step 7.

**Sarah's comments:** add a callout at each place her comment affects, pointing back to it, e.g. "Sarah's comment under Behaviors (2026-09-24) drops the week view, so this step's week toggle no longer applies."

**Findings that need a decision:** go through them with Sarah **one at a time**:
1. Show the finding, where it applies, its evidence (`file:line` or note and section) and how it was found.
2. Say what the options are, and which you'd recommend and why.
3. Wait for her answer.
4. Write the callout, recording her decision in the third person, e.g. "Sarah decided 2026-09-25 that the ring replaces the tint here."

Some decisions need more than a callout:
- **Recent code wins over the docs**, or recent code follows a convention the docs don't mention and Sarah says it's the convention: draft the change to the doc in `.opencode/docs/`, show it to her and write it once she approves. Match the doc's existing style.
- **The docs win:** the recent code that breaks the convention goes on the out-of-scope list.
- **The other story has to change:** that change goes on the out-of-scope list. Don't edit the other note here.
- **A decision she wants to make later:** add a `"decision needed: <short question>"` entry to `blocked-by`, and the question to the note's Open Decisions.

## 6. Route the note
Work out the next step from the findings' meanings in step 4:
- **Nothing beyond callouts:** `status` stays as it is.
- **Steps:** set `status` to `spec`. Next is `/plan-steps`, which keeps the ✅ steps and re-plans the rest.
- **Approach:** set `status` to `spec`. Next is `/assess`, as a re-assessment.
- **Blocked:** add the story (`"[[link]]"`) or decision to `blocked-by`.

If more than one applies, the biggest wins: approach over steps over callouts only. Blocked can go with any of them.

Show Sarah the new `^status` line, with any change to `status` or `blocked-by`, e.g. "Drift found. Next: /plan-steps to re-plan from Step 4". Wait for her approval before writing it. The line holds the status only, never a description of the story, because the Roadmap embeds it.

Then:
- Set `confirmed` to today.
- Make sure the story's line in `notes/Roadmap.md` embeds that summary after the link (`![[<note>#^status]]`). Add the embed if it's missing. Never reorder the Roadmap.

## 7. Summarize
Show Sarah:
1. **Mechanical callouts:** a table with one row per callout, with where it is and what it says. This is for information. She can delete any she thinks are wrong.
2. **Decisions:** one line per decision she made, and where it was recorded.
3. **Doc updates:** each doc changed, with a one-line summary.
4. **Reports:** links to the two reports and the footprint.

## 8. Find a home for out-of-scope items
If the out-of-scope list is empty, skip this.

Otherwise, send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found (with `file:line` if it came from code) and why it's outside this story. Then go through its suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.

## 9. Stop
Don't start the next step in this session. Tell Sarah the check is done and give her the command for a new session, e.g. `/plan-steps <note name>`, `/assess <note name>` or `/implement <note name>`.
