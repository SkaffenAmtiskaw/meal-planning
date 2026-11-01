---
name: check-drift
description: Checks a note's remaining work against the code, the conventions, other notes and the user's comments, and routes the note to its next step. Use when a note's next step is /check-drift.
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

A note is planned against the code, the conventions and other notes as they were on its `confirmed` date, and by the time it's built any of them may have moved on, or the user may have changed their mind. Find where the remaining work no longer holds, mark each place with a ⚠️ Check Drift callout and send the note to the skill that fixes it. Don't rewrite the plan beyond correcting a name or path, because the skill that wrote each section settled it with the user and is the one to re-settle it.

## 1. Read the note
Find the note in `notes/features/`. If its status isn't `spec`, `ready` or `in-progress`, tell the user what you found and stop.

Read the whole note, with the images its Design Handoff links and the artboards it names. Then work out its **remaining work**, which is all you check:
- **`spec`:** the approach, meaning the sections that say what to build and what they rest on, such as a feature's design, behaviors and Suggested Approach, a cleanup's Current State, or a sweep's unchecked Items.
- **`ready` or `in-progress`:** the steps not yet marked complete, and the design and approach sections they build. An infra note's steps are its Build Order, at the end of its Design.

## 2. Find the user's comments
Run `sh scripts/user-comments.sh "<note name>"`. It lists the lines that look like the user's comments, each marked new or old against `confirmed`. Anything the user asks to change in chat this session counts as a new comment too. For each comment:
- **The code or the note already does what it asks:** the comment is done, so there's nothing to trace.
- **Otherwise, if it's old:** leave it, since it was handled when `confirmed` was set.
- **Otherwise, if it's new:** it's a change the user has already decided, so each place it affects in the remaining work becomes a finding that needs no decision. Ask them only where there are two reasonable ways to apply it.

## 3. Send out the checkers
Write the story's footprint to a scratch file, from the remaining work:
- **Named code:** every file, component, hook, action, route and prop it names.
- **Kinds of things it builds,** such as a server action, a modal form or a unit test for a hook.
- **UI areas,** such as the mobile day section header.
- **Related notes:** its hub, the notes it links to and the stories in `blocked-by`.

Then run the `code-drift-checker` and `note-drift-checker` subagents in parallel. Give each one the note path, the `confirmed` date, the footprint file and the remaining work: which steps, or "the whole approach" for a `spec` note. Don't tell them what you expect them to find, because a checker that knows what you expect tends to find that and miss the rest.

If the note is a pattern, also run the `rule-auditor` subagent alongside them. The note's Migration Checklist was audited on its `confirmed` date, so code written since then that breaks the Rules isn't on it. Send the auditor only the Rules as written in the note, not the note path or the checklist, so the audit isn't anchored to the checklist.

## 4. Sort the checkers' findings
Merge findings that are the same problem seen from two sides. A checker's finding that one of the user's comments already settles is part of that comment's finding, so it needs no decision. Drop any finding that an earlier ⚠️ Check Drift callout already settled.

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
- **Now waits on another story:** move it back to the collecting note, starting with `**Blocked by [[Story]]:**`, so it rolls over to the next sweep. If no collecting note exists, put it on the out-of-scope list instead. Leave a callout where it was saying where it went and why.

A sweep never needs a re-assessment and never gets a `decision needed` entry.

**If the note isn't a sweep,** sort each finding:
- **Mechanical:** the plan still works as written with a different name or path, such as a renamed prop or a moved hook. Correct the name or path in place.
- **Needs a decision:** anything that changes what gets built or how, such as a conflict with another story's design, docs that disagree with recent code, or a piece another story already built.

Then triage the out-of-scope list. If an item is a sweep item this step took out, it can't be pulled back in, so offer route or drop only. If the note is a sweep, an item the user pulls in must be decided before it joins: if it still needs a decision, ask them for it. If they want to think it over, it can't join the sweep, so offer route or drop only. Otherwise, add it as a new unchecked box under Items, written as the Items comment in `notes/templates/Sweep.md` describes, with "Pulled in by <their name> YYYY-MM-DD" and any answer they gave ("<their name> decided: ..."). If the note isn't a sweep, an item the user pulls in becomes a finding that needs a decision.

## 5. Settle the findings and write the callouts
Write each callout directly above the text it's about, in this form:

`> ⚠️ **Check Drift YYYY-MM-DD:** what no longer matches, and what it means for this story. Found by reading code, not verified in the running app.`

End it with how the finding was found: by reading code, by reading notes or from the user's comment. If the finding depends on how the app behaves, don't check it in the app yourself. Add a quick check the user can do there.

How you write each callout depends on where its finding came from:
- **The user's comments:** add a callout at each place a comment affects, pointing back to it, e.g. "Sarah's comment under Behaviors (2026-09-24) drops the week view, so this step's week toggle no longer applies."
- **Findings that need a decision:** go through them with the user, each with its evidence and the options. Write a callout recording each answer, e.g. "Sarah decided 2026-09-25 that the ring replaces the tint here", even when the plan stands, so no later session raises it again.

Some answers need more than a callout:
- **Recent code wins over the docs,** or follows a convention they don't cover: it's a doc gap.
- **The docs win:** the code that breaks them goes on the out-of-scope list.
- **Another story has to change:** that change goes on the out-of-scope list.

If the note is a roundup and the user leaves a finding for later that reopens a decided question, the question written for it under Open Decisions names the one it reopens, and a callout on the old **Decided** line points to it.

## 6. Route the note
If the note is a sweep, it stays at `spec` and goes to `/plan-steps` next. Otherwise, route it by what its findings mean for it once the user has answered. If more than one case applies, the biggest wins: approach over steps over plan holds, and blocked can go with any of them.
- **Plan holds:** `status` stays as it is, and the next step is the one its type and status call for, such as `/implement` for a `ready` note.
- **Steps:** the approach holds but the remaining steps don't, such as when a pattern's Migration Checklist gains places its steps don't migrate. Set `status` to `spec`. The next step is `/plan-steps`, or `/infra-design` for infra, which keeps the ✅ steps and re-plans the rest.
- **Approach:** the approach, or part of it, no longer holds. Set `status` to `spec`. The next step is the skill that settled the approach:
  - **Feature:** `/assess`.
  - **Bug or cleanup:** `/investigate`.
  - **Pattern:** `/architect`.
  - **Infra:** `/infra-design`.
  - **Roundup:** if the user left any finding for later in step 5, `/decide`. Otherwise, the approach is settled again, so route it as **Steps**.
- **Blocked:** it waits on another story, or on a decision the user left for later. Add the story (`"[[link]]"`) to `blocked-by`.

Then update Where It Stands, with a `^status` line such as "Drift found. Next: /plan-steps to re-plan from Step 4", and set `confirmed` to today.

## 7. Summarize, route and stop
Show the user:
1. **Changes made without asking:** a table with one row per change: a corrected name or path, a dropped sweep item, a sweep item moved back to its collecting note, or a place added to a pattern's Migration Checklist. Each row says where it is and what changed. It's for information, not approval.
2. **Decisions:** one line per answer they gave, and where it was recorded.
3. **Doc updates:** each doc changed, with a one-line summary.
4. **Where the note goes next:** any change to `status` or `blocked-by`, and the new `^status` line.

Then triage any items added to the out-of-scope list since step 4, and route the list. Last, give the user the command for the note's next step, such as `/plan-steps <note name>`, to run in a new session, and stop, since this session's context is full of the checkers' reports, which the next skill doesn't need.
