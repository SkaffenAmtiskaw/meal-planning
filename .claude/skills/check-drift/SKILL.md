---
name: check-drift
description: Checks a note's remaining work for drift and routes the note to its next step. Use when a note's next step is /check-drift.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh docs'
---

Check the note **$ARGUMENTS** for drift.

Find where the note's remaining work no longer holds, mark each place with a ⚠️ Check Drift callout and send the note to the skill that fixes it. Make only the changes the steps below name, and correct any name or path that moved. Don't rewrite anything else, because the skill that wrote each section settled it with the user and is the one to re-settle it.

## 1. Read the note
If the note's status isn't `spec`, `ready` or `in-progress`, tell the user what you found and stop.

Read the whole note, with the images its Design Handoff links and the artboards it names. Then work out its **remaining work**, which is all you check:
- **`spec`:** the approach, meaning the sections that say what to build or change and what that work relies on, such as a design.
- **`ready` or `in-progress`:** the steps not yet marked complete, and the approach sections they build.

## 2. Find the user's comments
Run `sh scripts/user-comments.sh "<note name>"`. It lists the lines that look like the user's comments. Anything the user asks to change in chat this session counts as a new comment too. For each comment:
- **The code or the note already does what it asks:** the comment is done, so there's nothing to trace.
- **Otherwise, if it's old:** leave it, since it was handled when `confirmed` was set.
- **Otherwise, if it's new:** it's a change the user has already decided, so each place it affects in the remaining work becomes a finding.

## 3. Send out the checkers
Write the note's footprint to a scratch file, from the remaining work:
- **Named code:** every file, component, hook, action, route and prop it names.
- **Kinds of things it builds,** such as a server action, a modal form or a unit test for a hook.
- **UI areas,** such as the mobile day section header.
- **Services:** every service, config key and Claude Code feature it uses.

Then run the `code-drift-checker` and `note-drift-checker` subagents in parallel. Give each one the note path, the `confirmed` date, the footprint file and the remaining work: which steps, or "the whole approach" for a `spec` note. Don't tell them what you expect them to find, because a checker that knows what you expect tends to find that and miss the rest.

If the note is a pattern, also run the `rule-auditor` subagent alongside them, as `pattern.md` in this skill's folder describes.

## 4. Sort the checkers' findings
If one of the user's comments already settles a checker's finding, merge it into the finding from that comment. It needs no decision. Drop any finding that an earlier ⚠️ Check Drift callout already settled.

Write each callout directly above the text it's about, in this form:

`> ⚠️ **Check Drift YYYY-MM-DD:** what no longer matches, and what it means for this note. How it was found, and anything it wasn't verified against.`

For example, "From Sarah's comment" or "Found by reading GitHub's docs, not verified in the repo's settings."

**If the note is a sweep,** sort its findings and triage the out-of-scope list as `sweep.md` in this skill's folder describes, then go on to step 5.

**Otherwise:**
1. If the note is a pattern, compare `rule-auditor`'s report with the note's Migration Checklist, as `pattern.md` describes.
2. Sort each finding:
   - **A place in a cleanup's scope is new or gone, and its approach still holds:** correct Current State without asking, because it only records what's there. Beside each new place, record the search that found it, because the next re-check repeats the searches recorded there.
   - **Needs a decision:** anything else that changes what gets built or how, such as a conflict with another story's design, project docs that disagree with recent code, or a piece another story already built.
3. Triage the out-of-scope list. An item the user pulls in becomes a finding that needs a decision.

## 5. Settle the findings and write the callouts
What you do with each finding depends on where it came from:
- **The user's comments:** add a callout at each place a comment affects, pointing back to it, e.g. "Sarah's comment under Behaviors (2026-09-24) drops the week view, so this step's week toggle no longer applies."
- **Findings that need a decision:** go through them with the user, each with its evidence and the options. If one depends on how the app behaves or on what's set up outside the repo, and reading didn't settle it, give the user a quick check they can do in the app or where the thing is set up, rather than checking it yourself. If the finding has an **Unverified** line, use that. Write a callout recording each answer, such as "Sarah decided 2026-09-25 that the ring replaces the tint here". Write one even when the plan holds, because otherwise a later session raises the finding again.

Some answers need more than a callout:
- **Recent code wins over the project docs,** or follows a convention they don't cover: it's a doc gap.
- **The project docs win:** the code that breaks them goes on the out-of-scope list.
- **Another story has to change:** that change goes on the out-of-scope list.

## 6. Route the note
**If the note is a sweep,** set `status` to `spec`. Step 4 left nothing to re-settle, so its next step is `/plan-steps`, after any story in `blocked-by`.

**Otherwise,** route it by what its findings mean for it once the user has answered. If more than one case applies, the biggest wins: **Approach** beats **Steps**, and **Steps** beats **Plan holds**. **Blocked** can go with any of them.
- **Plan holds:** `status` stays as it is, and the next step is the one its type and status call for, such as `/implement` for a `ready` note.
- **Steps:** the approach holds but the remaining steps don't, such as when a pattern's Migration Checklist or a cleanup's Current State gains places its steps don't cover. Set `status` to `spec`. The next step is `/plan-steps`, or `/infra-design` for infra.
- **Approach:** the approach, or part of it, no longer holds, such as a pattern's Rule that the re-audit reported as Unclear. Set `status` to `spec`. The next step is the skill that settled the approach:
  - **Feature:** `/assess`.
  - **Bug:** `/investigate`.
  - **Cleanup:** `/audit`.
  - **Pattern:** `/architect`.
  - **Infra:** `/infra-design`.
  - **Tweak:** `/decide`. First add what needs re-deciding to Open Decisions as a new question, and add a `decision needed` entry to `blocked-by`, because `/decide` only works on open questions.
- **Blocked:** the note waits on another story, or on a decision the user left for later. If the blocker is a story, add it (`"[[link]]"`) to `blocked-by`.

Then update Where It Stands, with a `^status` line such as "Drift found. Next: /plan-steps to re-plan from Step 4", and set `confirmed` to today.

## 7. Summarize, route the out-of-scope list and stop
Show the user:
1. **Changes made without asking:** a table with one row per change, saying where it is and what changed.
2. **Decisions:** one line per answer they gave, and where it was recorded.
3. **Doc updates:** each doc changed, with a one-line summary.
4. **Where the note goes next:** any change to `status` or `blocked-by`, and the new `^status` line.

Then triage any items added to the out-of-scope list since step 4, and route the list. Last, give the user the command for the note's next step, such as `/plan-steps <note name>`, to run in a new session, and stop. This session's context is full of the checkers' reports, which the next skill doesn't need.
