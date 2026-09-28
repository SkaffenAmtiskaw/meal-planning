---
paths:
  - ".claude/skills/**"
  - ".claude/agents/**"
---
%% `paths` makes Claude Code load this note whenever a session reads a skill or agent file, through the symlink `.claude/rules/note-conventions.md`. The rules for editing any note live in AGENTS.md under "Editing notes". %%

How notes in this vault are organized and move through their lifecycle. The [[Roadmap]] decides order; everything else about a story lives in its note.

# Frontmatter
| Property | Values | Meaning |
|---|---|---|
| `type` | `feature` · `bug` · `pattern` · `cleanup` · `sweep` · `roundup` · `hub` · `workflow` | Which template the note follows. Blank on an `idea` note until its kind is clear. |
| `status` | `idea` · `spec` · `ready` · `in-progress` · `in-review` · `done` · `dropped` | See lifecycle below. Hubs and workflow notes have no status. Not the ` ^status` line under Where It Stands: this says which lifecycle stage the note is in, that line says what's happening right now. |
| `blocked-by` | list | Why the story can't move forward: another story (as a `"[[link]]"`), open decisions (one `"decision needed: ..."` entry for all of them), or an outside release. Empty when nothing blocks it. |
| `confirmed` | date | When the note was last confirmed to match reality. Sarah shaping or re-shaping a note counts, since she only does that for issues she believes are still relevant. Don't bump it for moves, renames or link fixes. |
| `kept-for` | list | Archived notes only. The open stories (as `"[[link]]"`) that still rely on this note's content, such as its design. |

# Lifecycle
- **idea** - rough notes. Nobody builds from this.
- **spec** - a detailed design or technical approach exists, but it isn't broken into steps.
- **ready** - has implementation steps. A story is **not** ready until it has steps, however settled the design is - steps are what make the work reviewable in small pieces.
- **in-progress** - work has started.
- **in-review** - every step is implemented and confirmed. The code is waiting for a review of how the whole story fits together.
- **done** - finished. Next: `/close`.
- **dropped** - won't be built. Next: `/close`.

# Templates
Templates are in `templates/`. Pick by the shape of the fix, not where the work came from:
- **Feature** - new user-facing behavior, often with a design handoff.
- **Bug** - something is broken and the fix is local.
- **Pattern** - introduce or standardize a convention and migrate code to it.
- **Cleanup** - remove or tidy code without a new convention.
- **Sweep** - a rolling checklist of small fixes that share a logical grouping (e.g. unit test fixes, style fixes), collected until Sarah kicks one off. Every item must be small, with no ambiguity and no open decisions.
- **Roundup** - issues on a broad topic (e.g. form UX, loading states) that still need decisions, collected until Sarah kicks one off. Its decisions are made together, then its fixes are built together.
- **Workflow** - a change to how the app is built, not what it does: skills, subagents, hooks, AGENTS.md, these conventions, templates, docs or tooling config. It skips the lifecycle: `/tooling` makes the change and deletes the note, unless the note collects items over time.
- **Idea** - jot something down quickly.
- **Hub** - a map of several stories that touch the same area (e.g. [[Meal Editing]]), or a big idea that will clearly be several stories but needs decisions before it can be split. Not implemented directly.

# Next Step by Note State
A note's `type` and `status` say what should happen to it next.

| Note state                                                              | Next step                                                                                                                                                                                                                                                                             | Moves to                                                                                                                                      | Agent                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `idea`, no `type`                                                       | Choose a template, move the notes into it, set a direction and next step in Where It Stands, and flag blocking decisions. No design or root cause.                                                                                                                                    | `idea` with a `type`, or a hub                                                                                                                | `/shape` skill                       |
| a `decision needed` entry in `blocked-by`, or a hub with Open Decisions | Work through the decisions with Sarah one at a time, researching each as needed. Record each answer in Open Decisions, and remove the `decision needed` entry once none remain.                                                                                                                              | a story: unchanged, ready for its usual next step · a roundup: `spec` once no decisions remain · a hub: unchanged, plus idea-note children for `/shape` when the answers imply new stories | `/decide` skill                      |
| `bug` · `idea`                                                          | Reproduce it, find the root cause, and settle the fix with Sarah                                                                                                                                                                                                                      | `spec`                                                                                                                                        | `/investigate` skill                 |
| `cleanup` · `idea`                                                      | Scan the code, fill in Current State, and settle its decisions with Sarah                                                                                                                                                                                                             | `spec`                                                                                                                                        | `/investigate` skill                 |
| `sweep` · `idea` or `roundup` · `idea`, collecting | Collect items. When Sarah schedules it, kick it off | the kicked-off note: a sweep to `spec`, a roundup stays `idea` with a `decision needed` entry · a collecting original stays as it is | `/kickoff` skill |
| `sweep` · `spec`                                                        | Re-check every item against the code and drop any already fixed, then plan steps                                                                                                                                                                                                      | `ready`                                                                                                                                       | `/check-drift`, then `/plan-steps`   |
| `roundup` · `spec` | Implementation steps. No `/assess` or `/check-drift` - `/decide` settled each issue against the current code | `ready` | `/plan-steps` skill |
| `feature` · `spec`                                                      | Suggested Approach, then implementation steps                                                                                                                                                                                                                                         | `ready`                                                                                                                                       | `/assess`, then `/plan-steps` skills |
| `pattern` · `idea`, no open decisions                                   | Rules, Enforcement and an audited Migration Checklist, approved with Sarah one piece at a time                                                                                                                                                                                        | `spec`                                                                                                                                        | `/architect` skill                   |
| `pattern` · `spec`                                                      | Implementation steps. No `/assess` step - `/architect` already settled the rules and every place to migrate                                                                                                                                                                           | `ready`                                                                                                                                       | `/plan-steps` skill                  |
| `bug` · `spec`                                                          | Implementation steps. No `/assess` step - `/investigate` already settled the fix while it had the root cause in hand, so there's nothing left to weigh                                                                                                                                | `ready`                                                                                                                                       | `/plan-steps` skill                  |
| `cleanup` · `spec`                                                      | Implementation steps. No `/assess` step - `/investigate` already settled the cleanup's decisions while it had the scan in hand                                                                                                                                                        | `ready`                                                                                                                                       | `/plan-steps` skill                  |
| `ready`                                                                 | Build it one step at a time                                                                                                                                                                                                                                                           | `in-progress` → `in-review`                                                                                                                   | `/implement` skill                   |
| `in-review`                                                             | Review how the code fits together across the whole story: what no single step's review can show                                                                                                                                                                                       | `done`                                                                                                                                        | `/review` skill                      |
| `spec` · `ready` · `in-progress`                                        | Check the remaining work against the code, conventions, other notes and Sarah's comments. Add ⚠️ Check Drift callouts, update `confirmed`                                                                                                                                             | unchanged, back to `spec` for `/plan-steps` or `/assess`, or add `blocked-by`                                                                 | `/check-drift` skill                 |
| `workflow` | Settle the change with Sarah, make it everywhere it reaches, and clean up every note that refers to it | deleted · a collecting note loses the items it did and stays | `/tooling` skill |
| `done` · `dropped` · a hub with no open stories                         | Keep the note in `archive/` for the stories that still rely on it, or delete it, and update the notes around it | archived or deleted                                                                                                                           | `/close` skill                       |

`feature` · `idea` has no agent yet: turning rough notes into a detailed design is done with the user, e.g. via Claude Design. A `pattern` · `idea` with open decisions goes through `/decide` before `/architect`.

# Files
- Filenames are plain names - no emoji or status prefixes.
- Stories live in `features/<area>/`; closed stories that other stories still rely on live in `archive/`.
- Images go in `assets/<story-name>/`.
