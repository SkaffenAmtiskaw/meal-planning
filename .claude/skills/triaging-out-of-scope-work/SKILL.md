---
name: triaging-out-of-scope-work
description: How to sort the out-of-scope list, take the user through what's left, and route what they send elsewhere. Use when triaging or routing the out-of-scope list.
user-invocable: false
---

# Triaging Out-of-Scope Work
The user decides what's out of scope. Each item costs them a decision, so sort the list first and bring them only what's really theirs to decide.

## 1. Sort the List
Before step 2, search the notes repo for each item, including notes that word it differently. If a note or Roadmap line covers it, take it off the list. Then check each remaining item against these cases, which say what to do with it. An item they don't take off stays on the list for step 2:
- **The story can't meet its own Purpose without it,** such as gitignoring the output of a tool the story adds: it's part of the story, even when a subagent reports it as outside its rules. If the steps are written, add it to the step that needs it. Otherwise, add it to the section that lists what the story changes, such as its Suggested Approach. Name it in your summary.
- **It's small, needs no decision and sits in a file this story already edits:** it's a Boy Scout fix, which joins the story without asking the user, so each story leaves its files a little cleaner. Where it goes depends on how far the story has got:
  - **Its steps are written, and the step that edits the file isn't built:** add "Boy Scout fix: <the problem>" to that step's **Source:** line, or its **Builds:** line in a Build Order.
  - **Its steps are written, and that step is built:** make the fix now, and record it the way your skill records its other changes, such as an As built note.
  - **Otherwise:** add it, starting "Boy Scout fix:", to the section that lists what the story changes.
- **A case that would add a piece or a question to a story past `/shape`:** weigh what goes wrong if the story doesn't handle it. Consider who it affects and how often, because each piece added for a case makes a story harder to follow. If it's rare and the harm is small, drop it, as AGENTS.md's "Problems You Find" describes for a small problem. An example is a viewer who changes time zones while the two zones are on different dates, and sees the wrong day as today for one load.
- **The item's only problem is that another note hasn't reached a later step's format yet, or predates the current conventions,** such as a Roadmap line with a description after its status embed: take it off the list, because each note is formatted and brought up to date when it's next worked on. A wrong fact or a real conflict in that note stays on the list.
- **Your change affects another story:**
  - **If the change is built,** and it changes more than a name or path in that story's remaining work: take the item off the list and add an Inbox item to that story saying what changed and what it means there. Leave out how to handle it, because that story's own skills work that out against the code as it stands then. Name the story in your summary.
  - **If it's only decided or planned:** work out whether one story has to wait on the other. A story that could ship on the existing code, with the other story correcting that code later, doesn't have to wait. If one has to wait, ask the user whether to add a `blocked-by` entry, then take the item off the list. Otherwise, take it off the list, because the other story's own checks, such as `/check-drift`, catch the effect once the change is built.

## 2. Triage With the User
For each item, show what it is, where it was found and why it looks outside this work. Then offer the choices below. If your skill has no story to pull into, offer only route or drop. Otherwise, offer all three:
- **Pull it in:** your skill says how it enters this story.
- **Route it:** if the user names where, put it there now, written as the `filing-work` skill describes for that kind of home.
- **Drop it:** take it off the list and don't record it anywhere.

## 3. Route What's Left
If your skill has a later step for routing, do this there. Otherwise, do it right after triage.
1. Send the `scope-router` subagent the notes repo's path and each item the user routed without naming a home. For each one, include what it is, where it was found and why it's outside this work.
2. Show the user each item with its suggested home and reason. Wait for them to approve, change or drop it, then apply their answer to the notes.

If an item turns up after triage, sort it, triage it and route it the same way, at the end.
