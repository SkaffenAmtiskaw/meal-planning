---
name: settling-a-decision
description: How to settle one open decision with the user and record it in the note. Use when settling a decision with the user.
user-invocable: false
---

# Settling a Decision
Settle one decision at a time, and don't research the next one until this one is recorded, because its answer can change the next one's options.

## Ask First
Research takes time, and the user often already knows what they want. So if one of their comments in the note already answers the question, show it to them and ask whether it's still their answer. Otherwise, tell them what the decision is and ask whether they already have an answer in mind.

Their answer rests on what you tell them, so describe only what's true now. Don't describe something that would still have to be built, such as a routine no one has set up, as if it already works. If the question already lists options they didn't write, say they're an agent's guesses, not a researched set, so they don't take them for the full set.

What happens next depends on their reply. Use the first case that fits. If you can't tell whether an answer is confident or hedged, treat it as hedged.
- **No answer,** or they want to see the options first: have the researcher research it.
- **An answer that rests on how something works,** such as "if the routine sessions will show it to me, that's enough": check that it works that way. If it does, handle the rest of the answer by the case below that fits it. If it doesn't, tell them what's true and ask again, because a Decided line built on it would record a choice they never made.
- **A reply that doesn't directly and fully answer the question, could be read as more than one answer, or adds something other than a reason for its answer:** ask them about it, then go on from what they say next. Later sessions treat what's recorded as their decision. Examples are an answer to only part of the question, an "it" that could mean either the story or the thing the story changes, and a remark about how something else should have worked.
- **Confident,** such as "I want X" or "Let's do X": record it without research or confirmation.
- **Hedged,** such as "I think it should probably be X" or "maybe X": have the researcher check it.

## Check or Research
Send the `decision-researcher` subagent the notes repo's path, the note path, the question as written with its constraints, any Partly answered lines under it, and the answers the user has given earlier in this session. What else you send, and what you do with its report, depends on why you're sending it:
- **To check a hedged answer:** send that answer too. If the researcher finds no real problems, record the answer. Otherwise, show the user each real one, and let them keep their answer, change it or ask for full research.
- **To research:** don't tell the researcher which answer you expect, and don't narrow its options with your own framing, such as a premise no one chose. When its brief comes back, check its options against `real-options.md` in this folder before you walk the user through it, because the researcher can miss one of them. If the options fail one of its tests, what you do depends on which:
  - **If an option isn't a real choice:** drop it, and tell the user why.
  - **If the usual approach or a premise's alternative is missing, or an option leaves out a cost:** send the researcher a follow-up asking for it before you show the brief.

  If they want more research, send it a follow-up with what they want researched further and the earlier brief's path.

## Record
How you record a decision depends on where the answer came from:
- **An answer the user already had in mind,** given confidently or checked with no real problems found: write it right away. Print what you wrote in chat and go on without waiting for approval, since the user will say if it looks wrong.
- **Any other answer,** after research or after a check found real problems, including one that settles only part of the question or waits on something else: draft the change, show it and wait for their approval before writing it.

Where you write it depends on what the decision settles:
- **A question under Open Decisions:** under that question, in the formats below.
- **Something a section you're drafting needs,** such as a Convention or a piece of a design: into that section. If it isn't an answer the user already had in mind, also write the question under `# Open Decisions` with its Decided and Rejected lines, so later agents don't propose the options the user turned down.

**Decided.** Under the question in Open Decisions:
```
   - **Decided YYYY-MM-DD:** <the answer>. <one sentence on why>
     - Rejected: <option> - <one-line reason>
```
If the choice is the user's call, the why says "<their name>'s call", followed by their reason if they gave one. For an answer that was checked, the why says so. If the choice isn't the user's call, and the answer wasn't checked or researched, leave the why out rather than make one up. For example:
- "**Decided 2026-09-29:** web first, phones later. Sarah's call: phones can wait until the planner works."
- "**Decided 2026-09-29:** web first, phones later. Checked against the code and notes."

If stating the answer on the Decided line would take something the user didn't say or pick, that part isn't answered yet, so ask them about it. Later sessions build on the whole line.

Add one **Rejected** line per option the user considered and turned down, such as an option the brief laid out or one they named, so later agents don't propose it again. Don't add one for an option they never saw.

**Partly answered, or not yet.** If the user just wants to skip it for now, write nothing. Otherwise, under the question:
```
   - **Partly answered YYYY-MM-DD:** Settled: <...>. Still open: <...>. Waits on: <e.g. `/design-feature`, or [[Other Story]]>.
     - <each research finding the next session needs, one line, with where it came from>
```
The findings lines matter because the brief will be gone by the next session.

**Don't reword the original question.** Progress goes in lines under it.
