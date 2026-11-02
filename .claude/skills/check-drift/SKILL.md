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

A note is planned against the code, the conventions, the services it uses and other notes as they were on its `confirmed` date. By the time it's built, any of them may have moved on, or the user may have changed their mind. Find where the remaining work no longer holds, mark each place with a ⚠️ Check Drift callout and send the note to the skill that fixes it. Apart from the changes the steps below name, such as correcting a name or path, don't rewrite the plan, because the skill that wrote each section settled it with the user and is the one to re-settle it.

## 1. Read the note
If the note's status isn't `spec`, `ready` or `in-progress`, tell the user what you found and stop.

Read the whole note, with the images its Design Handoff links and the artboards it names. Then work out its **remaining work**, which is all you check:
- **`spec`:** the approach, meaning the sections that say what to build and what they rest on, such as a feature's design, behaviors and Suggested Approach, a cleanup's Current State and **Decided** lines, or a sweep's unchecked Items.
- **`ready` or `in-progress`:** the steps not yet marked complete, and the design and approach sections they build.

## 2. Find the user's comments
Run `sh scripts/user-comments.sh "<note name>"`. It lists the lines that look like the user's comments. Anything the user asks to change in chat this session counts as a new comment too. For each comment:
- **The code or the note already does what it asks:** the comment is done, so there's nothing to trace.
- **Otherwise, if it's old:** leave it, since it was handled when `confirmed` was set.
- **Otherwise, if it's new:** it's a change the user has already decided, so each place it affects in the remaining work becomes a finding. If there are two reasonable ways to apply it at a place, ask them which. Otherwise, that finding needs no decision.

## 3. Send out the checkers
Write the story's footprint to a scratch file, from the remaining work:
- **Named code:** every file, component, hook, action, route and prop it names.
- **Kinds of things it builds,** such as a server action, a modal form or a unit test for a hook.
- **UI areas,** such as the mobile day section header.
- **Services:** every service, config key and Claude Code feature it uses.

Then run the `code-drift-checker` and `note-drift-checker` subagents in parallel. Give each one the note path, the `confirmed` date, the footprint file and the remaining work: which steps, or "the whole approach" for a `spec` note. Don't tell them what you expect them to find, because a checker that knows what you expect tends to find that and miss the rest.

If the note is a pattern, also run the `rule-auditor` subagent alongside them. The note's Migration Checklist was audited on its `confirmed` date, so code written since then that breaks the Rules isn't on it. Send the auditor only the Rules as written in the note, not the note path or the checklist, so the audit isn't anchored to the checklist.

## 4. Sort the checkers' findings
If one of the user's comments already settles a checker's finding, that finding is part of the comment's finding, so it needs no decision. Drop any finding that an earlier ⚠️ Check Drift callout already settled.

Write each callout, in this step and step 5, directly above the text it's about, in this form:

`> ⚠️ **Check Drift YYYY-MM-DD:** what no longer matches, and what it means for this story. How it was found.`

End it with how the finding was found and anything it wasn't verified against, such as "From Sarah's comment" or "Found by reading GitHub's docs, not verified in the repo's settings."

**If the note is a pattern,** compare `rule-auditor`'s report with the note's Migration Checklist before sorting the other findings. Its report holds three kinds of item:
- **A violation the note's checklist doesn't list:**
  - **If another story, such as another child of the note's hub, lists it in its own Migration Checklist:** leave it, because that story migrates it.
  - **Otherwise:** the Rules already say it has to change, so add it to the note's checklist without asking. Put it in the group it belongs in, with the files the auditor says change with it. Write a callout above it saying the re-audit found it.
- **A place under Unclear:** a rule can't be applied there without judgment, so it needs sharpening with the user. Write a callout on that rule saying what the auditor was unsure about, and leave it for `/architect`, which sharpens rules and re-audits them. When you route the note in step 6, it counts as **Approach**.
- **An item under Outside These Rules:** put it on the out-of-scope list.

Don't change a checklist item just because the report leaves it out. Enforcement, Docs and forward-looking items never come from an audit. A place fixed since `confirmed` reaches you as a `code-drift-checker` finding, which you sort below.

**If the note is a sweep,** its items must stay small and decided, so sort each item's findings this way:
- **Already fixed, or built by another story:** add a callout, without asking, saying the item is dropped and why. `/plan-steps` skips it.
- **Moved or renamed:** mechanical. Correct the name or path in the item.
- **Now needs a decision:** it no longer belongs in a sweep. Take it out straight away, without asking whether to settle it, and put it on the out-of-scope list, where it may go to a roundup or become its own story. Leave a callout where it was saying it moved out and why.
- **Now waits on another story:** leave a callout where it was saying what it waits on and that it moved out.
  - **If a collecting note exists:** move it back there, starting with `**Blocked by [[Story]]:**`, so it rolls over to the next sweep.
  - **Otherwise:** put it on the out-of-scope list.

**If the note isn't a sweep,** sort each finding:
- **Only a name or path changed:** correct it in place, since the plan still works as written.
- **A place in a cleanup's scope is new or gone, and its approach still holds:** correct Current State without asking, because it only records what's there. Beside each new place, record the search that found it, because the next re-check repeats the searches recorded there.
- **Needs a decision:** anything else that changes what gets built or how, such as a conflict with another story's design, project docs that disagree with recent code, or a piece another story already built.

Then triage the out-of-scope list. A sweep item this step took out can't be pulled back in, so offer route or drop only. What happens to an item the user pulls in depends on the note:
- **If the note isn't a sweep:** it becomes a finding that needs a decision.
- **If the note is a sweep and the item still needs a decision:** ask them for it. If they want to think it over, it can't join the sweep, so offer route or drop only.
- **If the note is a sweep and the item is decided:** add it as a new unchecked box under Items, written as the Items comment in `notes/templates/Sweep.md` describes, with "Pulled in by <their name> YYYY-MM-DD" and any answer they gave ("<their name> decided: ...").

## 5. Settle the findings and write the callouts
What you do with each finding depends on where it came from:
- **The user's comments:** add a callout at each place a comment affects, pointing back to it, e.g. "Sarah's comment under Behaviors (2026-09-24) drops the week view, so this step's week toggle no longer applies."
- **Findings that need a decision:** go through them with the user, each with its evidence and the options. If one depends on how the app behaves or on what's set up outside the repo, and reading didn't settle it, don't check it yourself. Give the user a quick check they can do in the app or where it's set up. If the finding has an **Unverified** line, use that. Write a callout recording each answer, such as "Sarah decided 2026-09-25 that the ring replaces the tint here". Write one even when the plan holds, because otherwise a later session raises the finding again.

Some answers need more than a callout:
- **Recent code wins over the project docs,** or follows a convention they don't cover: it's a doc gap.
- **The project docs win:** the code that breaks them goes on the out-of-scope list.
- **Another story has to change:** that change goes on the out-of-scope list.

If the note is a roundup, the user may leave for later a finding that reopens a decided question. If so, write a new question for the finding under Open Decisions, naming the decided question it reopens. Add a callout on the old **Decided** line pointing to the new question.

## 6. Route the note
If the note is a sweep, it stays at `spec` and goes to `/plan-steps` next. Otherwise, route it by what its findings mean for it once the user has answered. If more than one case applies, the biggest wins: **Approach** beats **Steps**, and **Steps** beats **Plan holds**. **Blocked** can go with any of them.
- **Plan holds:** `status` stays as it is, and the next step is the one its type and status call for, such as `/implement` for a `ready` note.
- **Steps:** the approach holds but the remaining steps don't, such as when a pattern's Migration Checklist or a cleanup's Current State gains places its steps don't cover. Set `status` to `spec`. The next step is `/plan-steps`, or `/infra-design` for infra.
- **Approach:** the approach, or part of it, no longer holds. Set `status` to `spec`. The next step is the skill that settled the approach:
  - **Feature:** `/assess`.
  - **Bug:** `/investigate`.
  - **Cleanup:** `/audit`.
  - **Pattern:** `/architect`.
  - **Infra:** `/infra-design`.
  - **Roundup:** if the user left any finding for later in step 5, `/decide`. Otherwise, the approach is settled again, so route it as **Steps**.
- **Blocked:** it waits on another story, or on a decision the user left for later. If it's a story, add it (`"[[link]]"`) to `blocked-by`.

Then update Where It Stands, with a `^status` line such as "Drift found. Next: /plan-steps to re-plan from Step 4", and set `confirmed` to today.

## 7. Summarize, route and stop
Show the user:
1. **Changes made without asking:** a table with one row per change, saying where it is and what changed. It's for information, not approval.
2. **Decisions:** one line per answer they gave, and where it was recorded.
3. **Doc updates:** each doc changed, with a one-line summary.
4. **Where the note goes next:** any change to `status` or `blocked-by`, and the new `^status` line.

Then triage any items added to the out-of-scope list since step 4, and route the list. Last, give the user the command for the note's next step, such as `/plan-steps <note name>`, to run in a new session, and stop. This session's context is full of the checkers' reports, which the next skill doesn't need.
