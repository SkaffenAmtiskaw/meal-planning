---
name: answer-confidence
description: How to act on Sarah's answer to a decision. A confident answer is decided as she gave it, and a hedged one is checked before it counts as decided. Use when a skill asks whether she already has an answer, such as /decide before researching a decision, /shape when checking blocking decisions, or /architect when she answers a gap in the Rules.
user-invocable: false
---

# How sure she is
Research takes time, and Sarah often already knows what she wants. How you act on her answer depends on how she words it:
- **Confident,** such as "I want X" or "Let's do X": it's decided. Don't research it or ask her to confirm it.
- **Hedged,** such as "I think it should probably be X" or "maybe X": it's her leaning, not yet a decision. It's checked before it counts as decided. The skill you're running says who checks it and when.
- **No answer,** or she wants to see the options first: follow the skill's own research path.

If you can't tell whether an answer is confident or hedged, treat it as hedged.

# Checking a leaning
A check looks only for what would make her answer a problem: something in the code or notes it conflicts with, a constraint it breaks, a best practice it goes against, or a follow-up decision or story it forces. It doesn't lay out other options. The `decision-researcher` subagent does the check when it's sent her answer. What happens next depends on what it finds:
- **No problems:** it's decided.
- **Problems:** show her each one. She may keep her answer, change it or ask for full research.

# Recording her answer
When her own answer goes on a **Decided** line (a confident answer, or a checked one with no problems), the why says it was her call. It includes her reason if she gave one, and for a checked answer, that the check found no problems. For example:
- "**Decided 2026-09-29:** web first, phones later. Sarah's call: phones can wait until the planner works."
- "**Decided 2026-09-29:** web first, phones later. Sarah's call, checked against the code and notes."

Add **Rejected** lines only for options she named and turned down.

A leaning that hasn't been checked yet goes under the question like this, and the question stays open:
```
   - **Leaning YYYY-MM-DD:** <her answer, in her words>. Not checked yet.
```
