How notes in this vault are organized. The [[Roadmap]] decides order; everything else about a story lives in its note.

# Frontmatter
| Property | Values | Meaning |
|---|---|---|
| `type` | `feature` · `bug` · `pattern` · `cleanup` · `hub` | Which template the note follows. Blank on an `idea` note until its kind is clear. |
| `status` | `idea` · `spec` · `ready` · `in-progress` · `done` | See lifecycle below. Hubs have no status. |
| `blocked-by` | list | Why the story can't move forward: another story (as a `"[[link]]"`), a decision that's needed, or an outside release. Empty when nothing blocks it. |
| `reviewed` | date | When the note was last confirmed to match reality. Don't bump it for moves, renames or link fixes. |

# Lifecycle
- **idea** - rough notes. Nobody builds from this.
- **spec** - a detailed design or technical approach exists, but it isn't broken into steps.
- **ready** - has implementation steps. A story is **not** ready until it has steps, however settled the design is - steps are what make the work reviewable in small pieces.
- **in-progress** - work has started.
- **done** - finished. Move the note to `archive/`.

# Templates
Templates are in `templates/`. Pick by the shape of the fix, not where the work came from:
- **Feature** - new user-facing behavior, often with a design handoff.
- **Bug** - something is broken and the fix is local. If the root cause turns out to be systemic, create a Pattern note and link it; the bug note stays about its symptoms.
- **Pattern** - introduce or standardize a convention and migrate code to it. Must include an Enforcement section.
- **Cleanup** - remove or tidy code without a new convention.
- **Idea** - jot something down quickly.
- **Hub** - a map of several stories that touch the same area (e.g. [[Meal Editing]]). Not implemented directly.

# Next Step by Note State
A note's `type` and `status` say what should happen to it next. This is the starting spec for agents that each take one kind of note and do its next step. Only `architect` and `implement` exist today; the other agent names are placeholders.

| Note state | Next step | Moves to | Agent |
|---|---|---|---|
| `idea`, no `type` | Choose a template, move the notes into it, ask the open questions | `idea` with a `type` | shape *(planned)* |
| `bug` · `idea` | Reproduce, find the root cause, list fix options | `spec` | investigate *(planned)* |
| `cleanup` · `idea` | Scan the code and fill in Current State | `spec` | investigate *(planned)* |
| `feature` · `spec` | Suggested Approach, then implementation steps | `ready` | architect |
| `pattern` · `spec` | Rules, Enforcement and Migration Checklist, then implementation steps | `ready` | architect for patterns *(planned)* |
| `ready` | Build it one step at a time | `in-progress` → `done` | implement |
| any `spec` / `ready` | Check the note against the code, add ⚠️ review callouts, update `reviewed` | unchanged, or add `blocked-by` | review *(planned)* |
| `done` | Move unfinished pieces to their owner, add As built notes, move to `archive/` | archived | archive *(planned)* |

`feature` · `idea` and `pattern` · `idea` have no agent yet: turning rough notes into a detailed design or a set of rules is done with the user, e.g. via Claude Design for features.

# Markers Inside Notes
- **Step status** - `**Status:** ✅ Complete`, `❌ Will Not Do`, or `🚛 Moved to [[note]]`.
- **As built** - when the build deviates from a step's plan, add an **As built:** note under the step. Never edit the plan text itself.
- **Review callouts** - when a note is checked against the code and something no longer matches, add `> ⚠️ **Review YYYY-MM-DD:** ...` where the problem is, rather than rewriting the plan. Say whether it was verified in the running app or found by reading code.
- **Moving unfinished work** - when a story is done except for one piece, move that piece (the full step, image embeds and relevant handoff text - not a summary) to the note that owns it, often a hub's Deferred Work section. Leave a 🚛 pointer behind. Archived notes are effectively invisible, so design references must travel with the work.

# Files
- Filenames are plain names - no emoji or status prefixes.
- Stories live in `features/<area>/`; finished stories in `archive/`.
- Images go in `assets/<story-name>/`.
- Design prototypes (`*.dc.html`) sit in the vault root and load `./support.js` and `assets/weeknight-header-dark.svg`. Don't duplicate those files; embed the existing ones.
