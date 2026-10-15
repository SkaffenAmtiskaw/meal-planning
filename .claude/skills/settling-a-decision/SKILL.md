---
name: settling-a-decision
description: How to settle one open decision with the user and record it in the note. Use when settling a decision with the user.
user-invocable: false
---

# Settling a Decision
Settle one decision at a time, and don't research the next one until this one is recorded, because its answer can change the next one's options.

## Ask First
Research takes time, and the user often already knows what they want. So if one of their comments in the note already answers the question, show it to them and ask whether it's still their answer. Otherwise, tell them what the decision is and ask whether they already have an answer in mind.

What happens next depends on how they word their answer. If you can't tell whether it's confident or hedged, treat it as hedged.
- **Confident,** such as "I want X" or "Let's do X": record it without research or confirmation.
- **Hedged,** such as "I think it should probably be X" or "maybe X": have the researcher check it.
- **No answer,** or they want to see the options first: have the researcher research it.

## Check or Research
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, and the answers the user has given earlier in this session. What else you send, and what you do with its report, depends on why you're sending it:
- **To check a hedged answer:** send that answer too. If the researcher finds no problems, record the answer. Otherwise, show the user each problem, and let them keep their answer, change it or ask for full research.
- **To research:** don't tell the researcher which answer you expect. Walk the user through its brief. If they want more research, send it a follow-up with what they want researched further and the earlier brief's path.

## Record
How you record a decision depends on where the answer came from:
- **An answer the user already had in mind,** given confidently or checked with no problems found: write it under the question right away. Print the Decided line in chat and go on without waiting for approval, since the user will say if it looks wrong.
- **Any other answer,** after research or after a check found problems, including one that settles only part of the question or waits on something else: draft the change, show it and wait for their approval before writing it.

**Decided.** Under the question in Open Decisions:
```
   - **Decided YYYY-MM-DD:** <the answer>. <one sentence on why>
     - Rejected: <option> - <one-line reason>
```
If the choice is the user's call, the why says "<their name>'s call", followed by their reason if they gave one. For an answer that was checked, the why says so. If the choice isn't the user's call, and the answer wasn't checked or researched, leave the why out rather than make one up. For example:
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
