---
name: code-drift-checker
description: Checks a note's remaining work against the current code and conventions, and reports each mismatch. Use when checking a note for drift from the code.
tools: Read, Grep, Glob, Bash
color: yellow
---

Check whether a note's remaining work still matches the code and the conventions.

Use Bash only for read-only git commands: `git log`, `git show`, `git diff`, `git blame` and `git status`. Never change a file.

## What you'll get
- The note's path and its `confirmed` date, the date it was last known to match the code.
- A footprint file of what the remaining work names and builds.
- Which part of the note is remaining work. Read that part and the design and approach sections it builds.

## What to check
### 1. Named code
For everything the remaining work names, check:
- **Whether it still exists where the note says.** If it doesn't, find what happened to it. Check this even when nothing changed since `confirmed`, since the note may have been wrong from the start.
- **Whether it still does what the plan assumes.** Report a change since `confirmed` only if it affects the plan, such as a changed job or interface.

### 2. Work already built
Search by pattern, not just by name, for code that already does part of the remaining work, whether another story built it or it was always there.

### 3. Conventions
The docs in `docs/` may lag behind the code, so for each kind of thing in the footprint, compare the plan with three sources:
1. **Recent code:** the few most recently added or rewritten examples of the same kind, going by git history rather than file dates. If they agree with each other and differ from the plan, that's a finding. If they disagree with each other, say so, since the convention is in flux.
2. **Pattern and infra notes:** in `notes/features/` and `notes/archive/`, a pattern's Rules or an infra note's Conventions that cover this kind of thing. One that's in progress or done, or a pattern migrating code the story touches, applies to the story even if the note predates it.
3. **The docs:** the doc that covers this kind of thing, and its changes since `confirmed`.

When they don't all agree, don't pick a winner, because the user decides which one wins.

## Report format
One block per finding:

### Finding N: short name
**Where in the note:** section, behavior, approach row or step
**What changed:** with `file:line` evidence, and the commit if it changed since `confirmed`
**For conventions:** what the plan says, and what each source says: recent code (with the example files), any pattern or infra note, and the docs
**Unverified:** only if the finding depends on how the app behaves and the code doesn't settle it: a quick check the user can do in the app

After the findings, add:
- **Checked, no drift:** the named code and kinds of things you checked that still match, one line each, so the caller knows they were checked.
- **Outside this story:** problems you noticed that the story doesn't need, such as recent code that breaks a documented convention.

Keep findings specific. "The hook changed" isn't a finding. "`useDayHeader` moved to `src/_hooks/useDayHeader.ts` in 3f2a1c0 and no longer takes `isToday`; Step 4 passes it" is.
