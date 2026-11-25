---
name: assess
description: Works out with the user which pieces of a feature to build new and which existing code to use as-is, refactor or replace, and writes the result to the note's Suggested Approach. Use when a note's next step is /assess.
argument-hint: "[note name]"
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/notes-only-edits.sh'
---

Assess the feature note **$ARGUMENTS** against the codebase and write its Suggested Approach. This skill plans, so don't change code.

Past planning agents started from the existing code, reused it because it was there, and piled new behavior into modules that already had a job, which broke Single Concern in `docs/project_conventions.md`. So this skill has a target designed before anyone reads the existing modules, then judges those modules against it, and "use as-is" is the verdict that needs evidence.

Invoke the `editing-notes` skill first, since this run changes notes.

## 1. Read the note
Find the note in `features/` in the notes repo and read all of it. Check that it's ready for this skill:
- **`type: feature`.**
- **`status: spec`.** If it's `idea`, tell the user that `/place-design` moves it to `spec` once its design is placed, and stop. If it has any other status, tell the user what you found and stop.

If the Suggested Approach lists questions for this step, answer each one in the Suggested Approach by the end of this run. If it holds an earlier approach, this is a re-assessment. Don't start from the old approach, because it anchors you the same way old code does. Do steps 2 to 5 fresh, then in step 6 show what changed compared with the old approach.

### Check other notes for design changes
Another story's design or build may have changed shared UI or a shared module since this note was confirmed. Check now, before the behaviors are confirmed, since a changed design changes them.

Write the story's footprint to a scratch file:
- **UI areas:** e.g. the mobile day section header, the today marker.
- **Kinds of things it builds:** e.g. a modal form, a list grouped by day.
- **Named code:** only what the note itself names. Don't search the code for more, since that's step 4.

Send the `note-drift-checker` subagent the notes repo's path, the note path, its `confirmed` date, the footprint file and "the whole design and behaviors" as the remaining work.

If it found nothing, tell the user in one line and go on. Otherwise, settle each finding before step 2:
- **If it blocks the story** until another story lands, tell the user and ask whether to go on anyway. If they say no, add that story to `blocked-by` and stop.
- **If it changes what the design or behaviors say,** beyond a name or path, such as a conflict between two designs, **or another story plans to build something this one needs:** show the user the finding, the other note and what conflicts, and ask what they want. If they want to decide it later, stop.
- **Otherwise,** such as another story having built or changed a module this one will use: tell the user in one line, and keep it for step 4.

## 2. Confirm the behaviors
If the note has a `# From the Split` section, start from its behaviors. The user confirmed them before the split and approved this story's share during it, so asking again only repeats that review. The parent's `/assess` also settled their E2E marks, so keep those as they are. What happens next depends on step 1:
- **If step 1 changed none of them:** go on to step 3, since the split already checked them for hidden stories.
- **Otherwise:** show the behaviors step 1 changed, with an E2E recommendation for any failure among them, as the next paragraphs describe. Wait for the user to confirm them, then check whether it's several stories.

If there's no `# From the Split` section, list the story as numbered behaviors, one line each. Cover what a person using the app does and every way the app can respond: success, each kind of failure, empty states, and differences for people with read-only access. Where the note doesn't say, ask the user rather than filling the gap yourself.

Some failures may need the user's call on an E2E test. "Failures the User Sees" in `docs/e2e_tests.md` says which ones. Read only that section: find its heading with Grep, then Read from there to the next heading. For each of those failures, add your recommendation on whether it gets an E2E test, so the user settles it as they confirm the list. Mark each one they want "(E2E test)", because `/plan-steps` plans a failure's E2E test only if the approach marks it. A failure added to the list later in this run gets a recommendation too.

Show the list and wait for the user to confirm it before going on.

### Check whether it's several stories
If the user's scope decisions under Open Decisions cover all the story's work, skip this check, because the user has already placed that work. A scope decision records that the user kept the story whole, or kept a piece of work in it. Rewording or splitting up behaviors a decision covered leaves them covered.

Otherwise, send the `hidden-story-checker` subagent the notes repo's path, the note path, the confirmed behaviors as the **Behaviors** checkpoint and, if Open Decisions records any scope decisions, the behaviors for the work none of them covers. Then, depending on its verdict:
- **One story:** tell the user in one line, and go on to step 3.
- **Hidden stories:**
  1. Put each one whose Shared design is "none" on the out-of-scope list with its behaviors, and triage it right away. The rest of this run works from the behavior list. When you put one to the user, its case for leaving this story is that a smaller story is easier to review and test properly. If the user doesn't pull it in, take its behaviors out of the list.
  2. If no hidden story shares design, go on to step 3. Otherwise, they need a hub to keep the shared design whole, so send `split-checker` the notes repo's path, the note path, the confirmed behaviors as the **Behaviors** checkpoint, the path of `hidden-story-checker`'s report and the hidden stories that share design. Then go through the split with the user as the `splitting-a-story` skill describes.
  3. If they don't split the story, go on to step 3. If they split it:
     1. Triage the out-of-scope list. An item the user pulls in becomes one or more behaviors in the `# From the Split` section of each child they belong to.
     2. Check that each child's `# From the Split` section holds its full share of the confirmed behaviors, including any changes the user made while approving the children, since the child's own `/assess` starts from it.
     3. Route the out-of-scope list.
     4. Stop, and tell the user the split is done. Give `/assess <child name>` for each child, to run in a new session, since this one has read the whole design and the split report, and carrying them into a child's assessment bloats it.

## 3. Design the target
Send the `target-designer` subagent the confirmed behaviors, numbered, the notes repo's path and the paths to the note's Meta-Instructions, its Design Handoff sections, its images and its artboards.

Also send it the behaviors of each later story that will build on this story's pieces, with the story's name. A later story is one whose `blocked-by` names this story and whose design or behaviors add to what this story builds, as another child of the same split often does. Take its behaviors from its `# From the Split` section or its Suggested Approach. Without them, the target fits this story alone, and the later story has to rework pieces this one has just built.

Give it nothing else, and don't describe the existing code or an old approach to it, so its design isn't anchored to what's already there.

When its design comes back, show the user its Assumptions and ask about each one the note doesn't settle, since each fills a gap that step 2 leaves to the user. If an answer adds or changes a behavior, update the list and run this step again.

## 4. Find overlapping code and have it reviewed
For each target piece, search for existing code that does the same job in whole or in part. Search by pattern, not just by name: another modal, another form with a list of rows, another list grouped by day. Also list existing modules the story will have to change even though no target piece replaces them, such as callers, providers and contexts, because that's where new behavior tends to get piled in, and each module a drift finding from step 1 was kept for.

Send the list to the `code-critic` subagent: each target piece with its job, and the existing files you mapped to it. It returns a verdict for each file. Don't pre-judge the code for it, and don't say what you're hoping to reuse.

Then triage the out-of-scope list. An item the user pulls in becomes one or more behaviors. Show them the new lines for the behavior list, then run step 3 again with the updated list. A piece is new or changed if its job or its behaviors differ from those in the design you mapped the code against. Map and review the overlapping code for those pieces before you present the approach.

Once you have the verdicts for every piece, including any the triage added, design each target piece other code will call or copy, as "Every New Piece Sets a Precedent" in `docs/project_conventions.md` describes. Start from the code your search found and the critic's verdicts. Follow each verdict unless you disagree with it.

## 5. Present the approach
Present the approach in a message that maps the feature's parts, then one message for each part. A part is a group of behaviors the user would check together, such as saving the form, or what a read-only viewer sees. The user settles each part's pieces here, before any code is written, because later code copies them. A reviewer spends most of their effort working out what a change is, so each message holds what the user needs to approve it, in the order they'll follow it.

The messages, in order:
1. **The map:** what changes for a person using the app, in a few sentences. Then a small tree of how the pieces connect, giving each piece its decision and a few words on what it is. For example:
   ```
   RecipeCard: the card in the recipe list, changed
   ├─ CookTimeBadge: built new, the "25 min" pill, styled like DishTagPill
   └─ formatMinutes: used as-is, from the meal form
   ```
   Then the list of parts, with the behaviors each covers. Order the parts so the part that shows a piece comes before the parts whose code calls it, so the user meets each name before it's used. Move whole parts, not single behaviors.

   Write a table of every piece to a scratch file, with its number, name, job, decision, existing code and reason. Link the table and the critic's report, so the user can look up the detail behind a piece.

   If a refactor in the tree looks out of proportion to the story, such as moving a lot of code over to a new way, ask in this message whether to do it in this story or move it out, rather than deferring it yourself. Otherwise, refactors are part of the story. Ask whether the shape looks right.
2. **Each part,** once the user approves the message before it, holding:
   - **The case:** a real case from this project, with what happens today and what happens after. If a piece's decision could go another way than this case shows, give that decision a case of its own.
   - **Each piece it needs:** if an earlier part already showed the piece, name that part instead of showing the piece again. Otherwise, give its decision in words, with the existing code the decision applies to. The decision is one of built new, used as-is, refactored first, replaced, extracted as a shared piece, or changed, for an existing module the story changes that no target piece replaces. If the decision goes against the critic's verdict, say so and why, rather than quietly overriding it. Then its code: the whole piece if it's new, a diff if it changes existing code, and only the call it's used through if it's used as-is. For a piece you designed in step 4, say what later code will copy from it, such as its shape or names, and which existing code it follows. If it departs from that code, say why and name the code that moves over to the new way.
   - **Client components:** which of its pieces are client components, and why.
   - **Cut pieces:** if `target-designer` cut a piece for a later story and it touches this part's behaviors, show it with the later story and the reason, so the user can confirm the cut before it's written to the note.

   Ask whether the user approves the part.

Once the user has approved every part, go on to step 6.

## 6. Write it to the note
Once the user approves, if this is a re-assessment, first show them what changed compared with the old approach, and replace it only once they approve that too.

Then write the behavior list and the approach under `# Suggested Approach`. If that section holds a list of questions for this step, replace it. The approach is written for `/plan-steps`, which turns it into steps, so it's a reference rather than the messages you showed. Keep the parts, and give each one:
- the behaviors it covers
- its case, as a check the build has to pass
- for each piece, an entry with its number and name, its file, its decision, the existing code it follows or moves over to the new way, what later code copies from it, and the code the user approved, copied unchanged along with the code around it that showed where it runs
- which of its pieces are client components, and why
- each disagreement with the critic, as settled, with its reason
- each cut piece, with its later story and the reason

Keep a fact about today's code only if a step depends on it, such as a function that today sorts as well as filters.

If the note has a `# From the Split` section, delete it, since the approved behaviors now live in the Suggested Approach.

Then:
- Leave `status` at `spec`, since the note isn't ready until it has implementation steps.
- Set `confirmed` to today. `code-critic` just reviewed the code and `note-drift-checker` the notes, so the note matches both as of now.
- Update the `^status` line, for example to "Approach approved. Next: /plan-steps".

Last, route the out-of-scope list.
