---
name: plan-steps
description: Break a note's approved approach into implementation steps that each carry one idea and end in checks Sarah can do in the running app. Writes the approved plan to the note's Implementation section.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Plan the implementation steps for the note **$ARGUMENTS**.

## Why this skill works the way it does
An agent builds each step. Sarah reviews the diff by hand and checks the step in the running app before the next one starts. The steps are how she makes sure the agent built what she expected, instead of letting it do whatever it wants.

Past plans failed her in two ways:
- **Steps too big.** One step made many unrelated changes, so she couldn't follow the diff.
- **Steps meaningless.** The check was "unit tests pass." `expect(true).toEqual(true)` passes too. Every step has to make progress she can see with her own eyes.

This is planning only. Don't change code. A hook blocks edits outside `notes/` and `.opencode/scratch/`.

## Talking with Sarah
- **One question at a time.** Ask one, wait for the answer, then ask the next. Never send a list of questions, and never ask her to approve a list of decisions at once.
- **Wrong assumptions:** if her answer shows a question rested on a wrong assumption, say the question is no longer needed and move on. Don't apologize or explain how it happened.
- **Out-of-scope items:** keep a running list of anything that belongs outside this story. Don't stop to deal with them as they come up. Step 6 handles them.

## 1. Read the note
Find the note in `notes/features/`. `notes/Note Conventions.md` explains the frontmatter and markers. It needs `status: spec` and an approved approach:
- **Feature:** a `# Suggested Approach`.
- **Pattern:** Rules, Enforcement, and a Migration Checklist. Some older notes call the checklist "Places to Update."

If the status or the approach is missing, tell Sarah what you found and stop. For a feature without an approach, `/assess` comes first.

Read any ⚠️ review callouts and **As built** notes as well. A story split from a hub embeds its design sections from the hub (`![[Hub#Section]]`). Read each embedded section; it's part of this note.

If `.opencode/scratch/<note name> - plan.md` exists because the story was split from a larger plan, start from that draft rather than drafting from nothing.

If the note already has an Implementation section, this is a re-plan. Steps marked ✅ Complete stay exactly as they are. Plan only the remaining work, and in step 4 show what changed compared with the old steps.

## 2. Draft the steps

### One idea per step
- **The idea sentence.** Each step opens with one sentence saying what it does, with no "and." Watch for "and" in disguise: "with", "plus", "while also". If the sentence needs one, it's two steps.
- **Size.** Size steps by idea, not file count. Eighteen files that all serve one new context provider are one step. Six files making unrelated changes are not.
- **Files.** List every file the step expects to create or change, each with a short reason tied to the idea sentence. A file whose reason doesn't serve the idea belongs in a different step.

### Something to see in every step
- **Slice vertically.** Don't split by layer (types, then hook, then component). Layer steps have nothing to see. The first step of new UI puts something on screen in the right place, even if it's hardcoded or unstyled. Each later step replaces one fake part with the real thing or adds one behavior.
- **Order.** For every step, ask: can its checks be done in the running app using only the code through this step? If a check needs a later step, the step is out of order or split wrong. Never end with a "wire it all together" step.
- **Scaffolding.** A temporary page or hardcoded value is fine if it's how Sarah sees progress. Plan when it gets removed.

### Refactors
- **Their own steps.** Every "refactor first", "replace" or "extract shared piece" decision in the approach gets its own step, before the step that builds on it.
- **Their checks.** A refactor step's checks list the existing flows that use the changed code, as click-throughs. Each says the flow should look and work exactly as before.

### Don't give an existing module a second job
When a step adds behavior to an existing module, name the job that module already does and confirm the new behavior is the same job. If it isn't, the behavior needs its own piece. If the approach doesn't already have one, ask Sarah before adding it.

### Checks
Each acceptance criterion is a checkbox with a click-through: "Go to [view], [do something], see [result]." Say which user (for example, read-only), which screen size (phone or desktop), and what data is needed (for example, a day with two meals).

Never use "tests pass", "inspect the code" or "types compile" as a check. Tests passing is assumed for every step. Failure, empty and read-only behaviors are checked in the step that builds them.

### Coverage
Every behavior and every piece in the approach must land in some step. Nothing can land in a step unless it's in the approach.

Coverage also runs back to the note's source material, not just the approach, because the approach can miss things. Every step's **Source:** names the parts of the note it builds or fixes: Requirements bullets, Design Handoff sections, or a pattern's Symptoms. Together the steps must claim every Requirements bullet, every Design Handoff section and every Symptom. Cite handoff sections by heading, not individual pixel values. The implementer reads those sections for the details.

A step that claims a Symptom needs an acceptance check that reproduces the original bug and shows it's gone.

### Format
```
## Step N: <short title>
**Idea:** <one sentence, no "and">

**Source:** <what this step builds or fixes from the note, e.g. "Handoff: Day cell states; Handoff: Behavior (all placements) → keyboard", "Requirement 3" or "Symptom: new recipe missing from saved dishes dropdown">

**Approach:** <how, citing the approach's pieces by name or number, e.g. "Piece 9a". Don't re-argue decisions already made there.>

**Files:**
- `path/to/file.tsx` (new) - reason
- `path/to/other.ts` - reason

**Acceptance:**
- [ ] Go to ..., press ..., see ...
```

Save the draft to `.opencode/scratch/<note name> - plan.md`.

## 3. Have the plan checked

### Several stories?
A draft plan shows most clearly whether a story is really several. Skip this check if you started from a draft saved by a split and haven't changed which steps it holds. Otherwise, send the note path and the draft path to the `split-checker` subagent, as the **Plan** checkpoint. Save its report to `.opencode/scratch/<note name> - split check.md`.

- **One story:** tell Sarah in one line, link the report, and go on to the plan checker.
- **Split:** follow "Splitting a story" at the end of this skill. That ends this session. Each child gets its own `/plan-steps` in a new session, starting from its share of the draft.

### Plan checker
Send the note path and the draft path to the `plan-checker` subagent. Save its report to `.opencode/scratch/<note name> - plan check.md`.

Fix every finding you agree with, then run the checker once more. If you disagree with a finding, leave it as it is and raise it with Sarah in step 4.

## 4. Review with Sarah
1. **The outline.** Show the numbered step titles, each with its idea sentence and a one-line summary of its check. The check line isn't the full acceptance criteria. It just tells Sarah at a glance whether the step is a regression check ("everything looks the same as before") or tests a specific new behavior, and which one. Keep it even when the idea makes the check obvious. Link the draft and the checker report. Then ask whether the order and the split are right. Wait for her answer.
2. **Checker findings you disagreed with.** Raise each one separately. Say what the checker found and why you disagree.
3. **Each step in full, one at a time.** Show the step and wait for her to approve or change it before showing the next. If a change affects a later step, say which one and update it before you get there.

## 5. Write it to the note
Once she has approved every step, write the plan under `# Implementation` in the note. If a template comment is there, replace it.

Then:
- Set `status` to `ready`.
- If the story's line in `notes/Roadmap.md` shows its status, update it.
- Update the note's Where It Stands line, the one ending in ` ^status`, to say what work comes next, e.g. "Ready. Next: build Step 1". It holds the status only, never a description of the story, because the Roadmap embeds it for scanning. Show Sarah the line and wait for her approval before writing it. If the note has no `# Where It Stands` section yet, add one at the top, right after the frontmatter, in the format from `notes/templates/Feature.md`.
- Make sure the story's line in `notes/Roadmap.md` embeds that summary after the link (`![[<note>#^status]]`). Add the embed if it's missing.

## 6. Find a home for out-of-scope items
If the out-of-scope list is empty, you're done.

Otherwise, send the whole list to the `scope-router` subagent. For each item, include what it is, where it was found and why it's outside this story. Then go through the router's suggestions with Sarah **one item at a time**:
1. Show the item and the suggested home, with its reason.
2. Wait for her to approve, change or drop it.
3. Apply that one change to the notes.
4. Move to the next item.

## Splitting a story
`split-checker` proposes the split. Sarah decides, one piece at a time:
1. **Whether to split.** Show the verdict and the reason, plus each child's name and scope line, then ask whether to split. If she says no, carry on as one story.
2. **Each child, one at a time.** Show what it takes, what blocks it and which design sections it embeds. Wait for her to approve or change it. If a change moves something to another child, update that child before you get to it.
3. **Leftovers, one at a time.** Raise anything under Unclaimed, and each move to an existing story.
4. **Apply.** Once she has approved every child, apply the note changes from the report. Create the children first, then rewrite the original as the hub, then update the links in other notes. Show each Roadmap line before you write it, and never reorder the Roadmap.
5. **Save each child's draft.** Write each child's share of the draft steps to `.opencode/scratch/<child name> - plan.md`, so its own `/plan-steps` can start from it.
6. **Route out-of-scope items.** If you've collected any, handle them as in step 6.
7. **Stop.** Don't start work on any child in this session. By now it has read the whole design, the approach, a full draft and the split report, and carrying that into a child's plan bloats the context. Tell Sarah the split is done, and list each child with the command to run in a new session, e.g. `/plan-steps <child name>`.
