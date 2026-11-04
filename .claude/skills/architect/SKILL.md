---
name: architect
description: Writes a pattern note's Convention and an audited Migration Checklist with the user. Use when a pattern note's next step is /architect.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Write the Convention and Migration Checklist for the pattern note **$ARGUMENTS**. A pattern note introduces a convention ("everything should work this way") and moves the existing code over to it. Once the convention exists, agents and reviewers judge code against it.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Read the Note
Find the note in `notes/features/` and read all of it. Also read each linked note that its Convention or Open Decisions depend on.

An older note may have `# Rules` in place of `# Convention`. Treat it as the note's Convention.

What its `type` and `status` mean, case by case:
- **`type` is blank:** the next step is `/shape`.
- **`type: pattern` and `status: idea`:** go on to the checks below.
- **`status: spec`:** its Convention was already approved.
  - **If the note says it's due a revision,** such as its `^status` line naming `/architect` or an Inbox item asking for one, it's a revision.
  - **Otherwise,** ask the user whether this is a revision. If it isn't, stop.
- **`ready` or later:** stop. Changes to a planned story go through `/check-drift`.

Then check the two things this skill needs from the note:
- **No open decisions.** The note isn't ready if it has a `decision needed` entry in `blocked-by`, or an item under `# Open Decisions` with no **Decided** line. An item with only a **Partly answered** line still counts as open. List the open decisions, one line each, tell the user the next step is `/decide <note name>`, and stop.
- **A problem a convention fits.** A convention suits a problem that comes from how code keeps getting written. A Convention and an audit are far more than a one-time fix needs. Check where the note's problem comes from:
  - **If code written separately has already gone wrong the same way more than once, or every new file of some kind, such as a new mutation, faces the same choice:** the note needs a convention.
  - **Otherwise,** changing today's code ends the problem, even if later code could bring it back, so the note's type doesn't fit its work. For example, clock calls that only go wrong once another story moves rendering to the server: switching them ends the problem.

Then read the Convention of every other `type: pattern` note in `notes/features/`, so you can spot overlaps and conflicts.

**In a revision,** whatever called for it names what to rework: the Inbox item, ⚠️ Check Drift callouts, the `^status` line or the user's answer. Each step below works only on those parts and their checklist items. Everything else keeps its approval as written. Show each reworked piece next to the version it replaces before writing it. Remove the callouts on those parts, since the new text answers them.

## 2. Choose the Convention
A convention says what code should do, not just what's wrong with it today. A note hasn't chosen one if it only describes the problem or asks for the right fix, such as "these are all bad the same way, help me find the right solution". If no **Decided** line or comment from the user says what code should do, settle it as the `settling-a-decision` skill describes.

## 3. Write the Convention
The Convention is a short guide, written much as it will read in the docs, as `docs.md` in the `writing-standard` skill's folder describes. That way, the user approves the text that goes into the doc.

### Draft
Sources, in order of authority: the user's comments, **Decided** lines, then Purpose and Symptoms. Don't write for cases no story has asked for yet, because text stretched to them can bind later work in ways nobody chose.

Text already under the section is one of these:
- **Questions for this step:** each one is something the Convention has to settle. If the sources settle it, answer it in the Convention. Otherwise, it's a gap (below).
- **Other text marked as decided or approved:** keep it, and check it against the code and the rest of the draft.
- **Anything else:** treat it as a draft.

The guide says:
- **What code should do, and why.** A reader who knows the aim can apply it to a case the text doesn't name.
- **What that looks like here.** One or two examples from this codebase: code that follows it and code that doesn't, when both exist.
- **Where it lands.** The doc and section in `docs/` it goes into once the story is built.

Be exact only where the aim itself is exact. "Only `src/_utils/today/` reads the clock" is exact because any other code that reads the clock breaks the aim. Where applying the Convention takes judgment, leave it to the reader, rather than adding a criterion or a definition to settle it.

Cut the draft down to what has to be true for the convention to hold. For each requirement in it, ask what would go wrong in later code if it were broken:
- **If nothing would, and it describes the workings of a piece of code that only gets written once:** keep it for the Migration Checklist's Infrastructure items, because no later code will have to match it.
- **If nothing would, and it's anything else:** cut it. For example, if the current date has to have one source, that holds however a component gets the date, so the Convention doesn't need to list the ways.

Check the draft against the project docs and the other patterns' Conventions.

### Gaps
Where the sources don't settle something the Convention needs, don't fill it in. Settle it with the user as the `settling-a-decision` skill describes.

### Approve
Show the draft and wait for the user to approve or change it. Beside it, give the `file:line` of each example, so they can look at the code. Once they approve, write it under `# Convention` before the audit, replacing what was there, including an older note's `# Rules`, so it survives if the session ends.

## 4. Migration Checklist
Build the full checklist from an audit of the approved Convention, then settle it with the user.

### Audit
Pattern notes usually arrive with a Migration Checklist that was written while the problem was found and is marked "not a full audit": the starting list. A migration planned from it leaves violations behind, and later code copies them. So send the `convention-auditor` subagent the approved Convention as written in the note. Don't send the note path or the starting list, so the audit isn't anchored to it.

### Merge
Every place the auditor listed as a violation goes in, with its `file:line`, unless it looks like a deliberate exception. That's a question for the user.

For each place the auditor was unsure about, decide whether it breaks the Convention, as `unclear-places.md` in the `settling-a-decision` skill's folder describes. A place you still can't tell about is a question for the user.

For each item only in the starting list, work out why:
- **Forward-looking on purpose,** such as code another story is about to change: keep it, in its own group.
- **Already fixed:** drop it, and name it when you show the checklist.
- **Never broke the Convention:** a question for the user, because they may have meant the Convention to cover that place.

Then add the items that don't come from violations:
- **Infrastructure:** each piece the Convention needs built, with the requirements cut from the draft.
- **Docs:** the Convention, in the doc and section it lands in.

### Triage the Out-of-Scope List
If the user pulls an item into the story, how it joins the checklist depends on the Convention:
- **If it breaks the approved Convention:** add it.
- **If it doesn't:** ask the user whether later code should follow it too. If so, change the Convention with them to cover it, update the note and send the change to the auditor again. If not, add it as a one-off item in its own group.

### Enforcement
Docs are the usual way to keep later code to a convention, because `/final-review` checks code against the docs, and a convention that's written down often ends the problem. A mechanism such as a type, a lint rule or a code test is worth suggesting when docs won't do the job. For example, the docs may already say it and keep getting missed. Or the check may suit a program better than a reader: with line endings, a linter settles it and a doc line would only be bloat.

If you think one earns its place, show the user what it is, which breaks of the Convention it catches and when, and why docs aren't enough. If they approve, add it to the checklist under an Enforcement group, with that reason. If an older note has an `# Enforcement` section, weigh what it says here, then remove it.

### Approve
What to go through with the user, in order:
1. **The checklist as a whole.** Group the items by kind, as checkboxes, and show them with the number of items in each group. Nothing here needs an answer yet.
2. **Each question the merge turned up.** What each answer means for the place:
   - **It has to change:** it joins the checklist.
   - **It stays as it is:** list it under a group of places left as they are, with the reason, so a later audit doesn't add it back.

   If the user says later code should follow the answer too, also add it to the Convention in the note, and send the change to the auditor again. If the checklist has an Enforcement item, check that it still catches what the Convention now covers.
3. **The finished checklist.** Ask whether it's complete.

Write it under `# Migration Checklist`, replacing what was there.

## 5. Update the Note's Status
- Set `status` to `spec`.
- Set `confirmed` to today, since the user approving the Convention confirms the note.
- Update the `^status` line: the Convention is approved, and the next step is `/plan-steps`.

## 6. Stop
Route the out-of-scope list. Then tell the user the next step is `/plan-steps <note name>` in a new session, and stop.
