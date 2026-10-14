---
name: settling-a-decision
description: How to settle one open decision with the user and record it in the note. Use when settling a decision with the user.
user-invocable: false
---

# Settling a Decision
Settle one decision at a time, and don't research the next one until this one is recorded. Its answer can change the next one's options.

## Ask First
Research takes time, and the user often already knows what they want. So if one of their comments in the note already answers the question, show it to them and ask whether it's still their answer. Otherwise, tell them what the decision is and ask whether they already have an answer in mind.

What happens next depends on how they word their answer. If you can't tell whether it's confident or hedged, treat it as hedged.
- **Confident,** such as "I want X" or "Let's do X": record it without research or confirmation.
- **Hedged,** such as "I think it should probably be X" or "maybe X": check it.
- **No answer,** or they want to see the options first: research it.

## Check
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, the answers the user has given earlier in this session, and their answer to this one. What happens next depends on what it finds:
- **No problems:** record their answer.
- **Problems:** show the user each one, and let them keep their answer, change it or ask for full research.

## Research
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, and the answers the user has given earlier in this session. Don't tell it which answer you expect.

## Present
Walk the user through the brief: the question with its constraints and the earlier decisions that bear on it, each option with its trade-offs, then the recommendation. If they want more research, send the researcher a follow-up with their question and the earlier brief's path.

## Record
How you record a decision depends on where the answer came from:
- **The user's own answer,** given confidently or checked with no problems found: write it under the question right away. Print the Decided line in chat and go on without waiting for approval. The user will say if it looks wrong.
- **Any other answer,** after research or after a check found problems, including one that settles only part of the question or waits on something else: draft the change, show it and wait for their approval before writing it.

**Decided.** Under the question in Open Decisions:
```
   - **Decided YYYY-MM-DD:** <the answer>. <one sentence on why>
     - Rejected: <option> - <one-line reason>
```
If the user gave a reason of their own or said the choice matters to them, the why says "<their name>'s call" and gives that reason. Otherwise it doesn't, even when they picked one of the options they were shown: later agents ask the user before changing a choice marked as their call, so the mark is only for choices that matter to them. For an answer that was checked, the why says so. For example:
- "**Decided 2026-09-29:** web first, phones later. Sarah's call: phones can wait until the planner works."
- "**Decided 2026-09-29:** web first, phones later. Checked against the code and notes."

Add one **Rejected** line per option the user considered and turned down, such as an option the brief laid out or one they named, so later agents don't propose it again. Don't add one for an option they never saw.

**Partly answered, or not yet.** If the user just wants to skip it for now, write nothing. Otherwise, under the question:
```
   - **Partly answered YYYY-MM-DD:** Settled: <...>. Still open: <...>. Waits on: <e.g. a design session in Claude Design, or [[Other Story]]>.
     - <each research finding the next session needs, one line, with where it came from>
```
The findings lines matter because the brief will be gone by the next session.

**Don't reword the original question.** Progress goes in lines under it.
