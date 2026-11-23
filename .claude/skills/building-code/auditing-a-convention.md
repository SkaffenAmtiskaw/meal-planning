# Auditing a Convention
How to find every place that breaks a pattern's Convention, and merge what the audit finds with the note's Migration Checklist.

## Audit
Send the `convention-auditor` subagent the Convention's text: as approved for a new Convention, or as changed for one you're changing while you build. Don't send the note path or the note's Migration Checklist, which is the starting list, so the audit isn't anchored to it. The starting list can't be trusted. A pattern note usually arrives with one written while the problem was found and marked "not a full audit", and one written for an earlier version of the Convention is out of date. A migration planned from it leaves violations behind, and later code copies them.

## Merge
Every place the auditor listed as a violation goes in, with its `file:line`, unless it looks like a deliberate exception. That's a question for the user.

For each place the auditor was unsure about, decide whether it breaks the Convention, as `unclear-places.md` in the `settling-a-decision` skill's folder describes. A place you still can't tell about is a question for the user.

For each item only in the starting list, work out why:
- **Forward-looking on purpose,** such as code another story is about to change: keep it, in its own group.
- **Already fixed:** drop it, and name it when you show the checklist.
- **Never broke the Convention:** a question for the user, because they may have meant the Convention to cover that place.
