---
name: settling-a-decision
description: How to settle one open decision with the user - ask whether they already have an answer, check a hedged one or research it with the decision-researcher subagent, present the brief and record the answer under the question. Use when a skill settles a decision with the user, such as /decide for each decision the user picks, or /shape for a blocking decision.
user-invocable: false
---

# Settling a Decision
Settle one decision at a time, and don't research the next one until this one is recorded. Its answer can change the next one's options.

## Ask First
If the question has a **Leaning** line, show it to the user and ask whether it's still their answer. Otherwise, tell them what the decision is and ask whether they already have an answer in mind. Read the answer as the `answer-confidence` skill describes. What happens next depends on it:
- **Confident:** record it without research, as Record describes for the user's own answers.
- **Hedged:** check it, as Check describes.
- **No answer:** research it, as Research describes.

## Check
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, the answers the user has given earlier in this session, and their answer to this one. Say it's a check of their answer. Save its report to `.scratch/<note name> - decision <N>.md`. What happens next depends on what it finds:
- **No problems:** record their answer, as Record describes for the user's own answers.
- **Problems:** show the user each one and link the report. If they ask for full research, go on as Research describes. Otherwise, record what they decide, as Record describes for anything else.

## Research
Send the `decision-researcher` subagent the note path, the question as written with its constraints, any Partly answered lines under it, and the answers the user has given earlier in this session. Don't tell it which answer you expect.

Save its brief to `.scratch/<note name> - decision <N>.md`.

## Present
Show the user:
1. **The question** as the brief restates it, its constraints, and the earlier decisions that bear on it.
2. **The options,** each with its trade-offs and what it touches.
3. **The recommendation,** with the practice it rests on. Or say it's a preference call and what separates the options. Or say it can't be decided yet, and why.

Link the brief. When the user questions an option, read them the relevant part of the brief and discuss it. If they want more research, send the researcher a follow-up with their question and the earlier brief's path.

## Record
How you record a decision depends on where the answer came from:
- **The user's own answer,** given confidently or checked with no problems found: write it under the question right away, in the format the `answer-confidence` skill describes. Print the Decided line in chat and go on without waiting for approval. The user will say if it looks wrong.
- **Anything else:** they'll decide, partly decide or set it aside. Draft the change, show it and wait for their approval before writing it.

**Decided.** Under the question in Open Decisions:
```
   - **Decided YYYY-MM-DD:** <the answer>. <one sentence on why>
     - Rejected: <option> - <one-line reason>
```
If the answer is the user's call, as AGENTS.md describes under "Her decisions can change", such as an option they picked for a reason of their own, the why says so, as the `answer-confidence` skill describes. Add one Rejected line per option they considered and turned down, so later agents don't propose it again. Remove any **Leaning** line under the question.

**Partly answered, or not yet.** If the user just wants to skip it for now, write nothing. Otherwise, under the question:
```
   - **Partly answered YYYY-MM-DD:** Settled: <...>. Still open: <...>. Waits on: <e.g. a design session in Claude Design, or [[Other Story]]>.
     - <each research finding the next session needs, one line, with where it came from>
```
The `decision needed` entry stays. The findings lines matter because the brief will be gone by the next session.

**Don't reword the original question.** Progress goes in lines under it.
