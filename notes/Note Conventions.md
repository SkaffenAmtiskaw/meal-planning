How notes in this vault are organized. The [[Roadmap]] decides order; everything else about a story lives in its note.

# Frontmatter
| Property | Values | Meaning |
|---|---|---|
| `type` | `feature` · `bug` · `pattern` · `cleanup` · `sweep` · `hub` | Which template the note follows. Blank on an `idea` note until its kind is clear. |
| `status` | `idea` · `spec` · `ready` · `in-progress` · `in-review` · `done` | See lifecycle below. Hubs have no status. |
| `blocked-by` | list | Why the story can't move forward: another story (as a `"[[link]]"`), a decision that's needed, or an outside release. Empty when nothing blocks it. |
| `confirmed` | date | When the note was last confirmed to match reality. Sarah shaping or re-shaping a note counts, since she only does that for issues she believes are still relevant. Don't bump it for moves, renames or link fixes. |

# Lifecycle
- **idea** - rough notes. Nobody builds from this.
- **spec** - a detailed design or technical approach exists, but it isn't broken into steps.
- **ready** - has implementation steps. A story is **not** ready until it has steps, however settled the design is - steps are what make the work reviewable in small pieces. Any change to a `ready` note's design or steps sends it back to `spec` until Sarah re-reviews it.
- **in-progress** - work has started.
- **in-review** - every step is implemented and confirmed. The code is waiting for a review of how the whole story fits together.
- **done** - finished. Move the note to `archive/`.

# Templates
Templates are in `templates/`. Pick by the shape of the fix, not where the work came from:
- **Feature** - new user-facing behavior, often with a design handoff.
- **Bug** - something is broken and the fix is local. If the root cause turns out to be systemic, create a Pattern note and link it; the bug note stays about its symptoms.
- **Pattern** - introduce or standardize a convention and migrate code to it. Must include an Enforcement section.
- **Cleanup** - remove or tidy code without a new convention.
- **Sweep** - a rolling checklist of small fixes that share a logical grouping (e.g. unit test fixes, style fixes), collected until Sarah schedules one sweep for them all. Every item must be small, with no ambiguity and no open decisions. See Sweeps below.
- **Idea** - jot something down quickly.
- **Hub** - a map of several stories that touch the same area (e.g. [[Meal Editing]]), or a big idea that will clearly be several stories but needs decisions before it can be split. Not implemented directly. If the open decisions would only change *how* one story is built, not *what* the stories are, it's a story with `decision needed` entries in `blocked-by`, not a hub. When a story with a design is split, the original note becomes the hub and keeps the design in one copy. The child stories embed the sections they build rather than copying them.

# Sweeps
A sweep note collects small fixes until Sarah decides it's time to handle them together. It follows the normal lifecycle, but in two notes: one that keeps collecting, and a dated copy for each sweep.
- **Collecting** - the note stays at `idea`, with its Roadmap line in Later under its area. Anyone may add an item that meets its What Belongs Here rule. When several related small fixes fit no sweep, suggest a new sweep to Sarah rather than creating one.
- **Freezing** - when Sarah schedules a sweep, copy the note to `<name> YYYY-MM-DD` (today's date) in the same folder. Set the copy's `status` to `spec`, set its `^status` line to "Frozen. Next: /check-drift", and give it a Roadmap line where Sarah wants it. In the original, clear the Items except blocked ones and leave everything else, so links to it keep working and it keeps collecting. Blocked items (`**Blocked by [[Story]]:**`) roll over to the next sweep. The frozen copy never gets them.
- **Sweeping** - the dated copy goes through `/check-drift` (re-check each item, drop any already fixed), `/plan-steps` and `/implement`, then review and `archive/` like any story. It never gets new items. Anything found during the sweep goes into the collecting note.

# Next Step by Note State
A note's `type` and `status` say what should happen to it next. This is the starting spec for agents that each take one kind of note and do its next step. Only the `/shape`, `/decide`, `/assess`, `/plan-steps`, `/implement` and `/check-drift` skills exist today; the other agent names are placeholders.

| Note state                                                              | Next step                                                                                                                                                                          | Moves to                                                                                  | Agent                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| `idea`, no `type`                                                       | Choose a template, move the notes into it, set a direction and next step in Where It Stands, and flag blocking decisions. No design or root cause.                                 | `idea` with a `type`, or a hub                                                            | `/shape` skill                       |
| a `decision needed` entry in `blocked-by`, or a hub with Open Decisions | Work through the decisions with Sarah one at a time, researching each as needed. Record each answer in Open Decisions and remove its `blocked-by` entry.                           | a story: unchanged, ready for its usual next step · a hub: unchanged, plus idea-note children for `/shape` when the answers imply new stories | `/decide` skill                       |
| `bug` · `idea`                                                          | Reproduce, find the root cause, list fix options                                                                                                                                   | `spec`                                                                                    | investigate *(planned)*              |
| `cleanup` · `idea`                                                      | Scan the code and fill in Current State                                                                                                                                            | `spec`                                                                                    | investigate *(planned)*              |
| `sweep` · `idea`                                                        | Collect items. When Sarah schedules a sweep, freeze a dated copy (see Sweeps)                                                                                                      | the copy moves to `spec`; the original stays `idea`                                       | by hand                              |
| `sweep` · `spec`                                                        | Re-check every item against the code and drop any already fixed, then plan steps                                                                                                   | `ready`                                                                                   | `/check-drift`, then `/plan-steps`   |
| `feature` · `spec`                                                      | Suggested Approach, then implementation steps                                                                                                                                      | `ready`                                                                                   | `/assess`, then `/plan-steps` skills |
| `pattern` · `spec`                                                      | Rules, Enforcement and Migration Checklist, then implementation steps                                                                                                              | `ready`                                                                                   | architect for patterns *(planned)*   |
| `ready`                                                                 | Build it one step at a time                                                                                                                                                        | `in-progress` → `in-review`                                                               | `/implement` skill                   |
| `in-review`                                                             | Review how the code fits together across the whole story: what no single step's review can show                                                                                    | `done`                                                                                    | code review *(planned)*              |
| `spec` · `ready` · `in-progress`                                        | Check the remaining work against the code, conventions, other notes and Sarah's comments. Add ⚠️ Check Drift callouts, update `confirmed`                                          | unchanged, back to `spec` for `/plan-steps` or `/assess`, or add `blocked-by`             | `/check-drift` skill                 |
| `done`                                                                  | Move unfinished pieces to their owner, add As built notes, unblock stories that waited on it (their `blocked-by`, their `^status` line and their Roadmap line) and remove its `**Blocked by**` marker from any sweep item waiting on it, move to `archive/` | archived                                                                                  | archive *(planned)*                  |

`feature` · `idea` and `pattern` · `idea` have no agent yet: turning rough notes into a detailed design or a set of rules is done with the user, e.g. via Claude Design for features.

# Markers Inside Notes
- **Where It Stands** - every note starts with this section. Its line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on. Never a description of the story. The [[Roadmap]] embeds it with `![[<note>#^status]]` so Sarah can scan what work each story needs. Whoever moves a story forward updates that line. It is not the frontmatter `status` property - that says which lifecycle stage the note is in; this says what is happening right now.
- **Embedded sections** - `![[Note#Section]]` shows another note's section inline, e.g. a child story embedding the hub's design. Agents reading the raw file see only the link, so they must open each embedded section and treat it as part of the note.
- **Step status** - `**Status:** ✅ Complete`, `❌ Will Not Do`, or `🚛 Moved to [[note]]`.
- **As built** - when the build deviates from a step's plan, add an **As built:** note under the step. Never edit the plan text itself.
- **Check Drift callouts** - when a note is checked against the code and something no longer matches, add `> ⚠️ **Check Drift YYYY-MM-DD:** ...` where the problem is, rather than rewriting the plan. Say whether it was verified in the running app or found by reading code.
- **Sarah's comments** - a line where her name is a tag or a signature (`[Sarah] I want X instead.`, `Change this to Y - Sarah`) is Sarah's own words, usually a change of mind. Agents never edit her comments, and never write in her voice or sign as her. Third-person records of her decisions ("Approved by Sarah 2026-09-25") are fine.
- **From the Split** - an unapproved handoff (behaviors or draft steps) that a split leaves in a child note, right before `# Suggested Approach`. The child's next skill starts from it and deletes it once it writes the real section. Nothing else builds from it.
- **Moving unfinished work** - when a story is done except for one piece, move that piece (the full step, image embeds and relevant handoff text - not a summary) to the note that owns it, often a hub's Deferred Work section. Leave a 🚛 pointer behind. Archived notes are effectively invisible, so design references must travel with the work.

# Files
- Filenames are plain names - no emoji or status prefixes.
- Stories live in `features/<area>/`; finished stories in `archive/`.
- Images go in `assets/<story-name>/`.
- Design prototypes (`*.dc.html`) sit in the vault root and load `./support.js` and `assets/weeknight-header-dark.svg`. Don't duplicate those files; embed the existing ones.
