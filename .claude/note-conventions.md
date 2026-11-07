How notes are organized and move through their lifecycle. The Roadmap decides order; everything else about a story lives in its note.

# Frontmatter
| Property | Values | Meaning |
|---|---|---|
| `type` | `feature` · `bug` · `pattern` · `infra` · `cleanup` · `tweak` · `sweep` · `workflow` · `hub` · `goal` · `standing-goal` | Which template the note follows. Blank on an `idea` note until its kind is clear. |
| `status` | `idea` · `spec` · `ready` · `in-progress` · `in-review` · `done` · `dropped` | See lifecycle below. Hubs, goals, standing goals and workflow notes have no status. Not the ` ^status` line under Where It Stands: this says which lifecycle stage the note is in, that line says what's happening right now. |
| `blocked-by` | list | Why the story can't move forward: another story or a hub whose shared design it waits on (as a `"[[link]]"`), open decisions (one `"decision needed: ..."` entry for all of them), or an outside release. Empty when nothing blocks it. Work a story waits on gets its own note, not an item in a sweep or collecting workflow note. Such work usually has to be done on its own before the waiting story can move, and a blocker inside a collecting note makes the Roadmap harder to read. |
| `confirmed` | date | When the note was last confirmed to match reality. The user shaping or re-shaping a note counts, since they only do that for issues they believe are still relevant. Don't bump it for moves, renames or link fixes. |
| `kept-for` | list | Archived notes only. The open stories (as `"[[link]]"`) that still rely on this note's content, such as its design. |

# Lifecycle
- **idea** - rough notes. Nobody builds from this.
- **spec** - a detailed design or technical approach exists, but it has no approved steps yet, or its remaining steps need re-planning. A story sent back to `spec` keeps its steps marked ✅ Complete.
- **ready** - can be built. A tweak is ready once it has no open decision, because it has no steps. Any other story needs implementation steps first, however settled its design, because steps are what make the work reviewable in small pieces. An infra story's steps are its Build Order.
- **in-progress** - work has started.
- **in-review** - every step is implemented and confirmed. The code is waiting for a review of how the whole story fits together, or, once its `^status` line names a PR, for that PR to merge.
- **done** - finished, with its PR merged. `/close` sets it after checking the merge on GitHub.
- **dropped** - won't be built.

# Templates
Each note type's template is in `.claude/note-templates/`. For a story, pick by the shape of the fix, not where the work came from:
- **Feature** - new user-facing behavior, often with a design handoff.
- **Bug** - something is broken and the fix is local.
- **Pattern** - introduce or standardize a convention and migrate code to it.
- **Infra** - build something new that the app is built, tested or run with, such as CI, a test setup or a hosted service, whether or not it sets conventions for later work.
- **Cleanup** - remove or tidy code without a new convention.
- **Tweak** - a quick one-off with at most one decision, such as which of two styles a pair of similar links should share. It skips `/plan-steps` and `/final-review`, because one fix leaves nothing to plan and no parts to review together. A story is too big for a tweak if its fix would take more than one implementation step, or if settling it needs `/design-feature`, a root-cause investigation or a new convention that code must migrate to.
- **Sweep** - a rolling checklist of small fixes that share a logical grouping (e.g. unit test fixes, style fixes), collected until a goal starts building. Every item must be small, with no ambiguity and no open decisions. It skips `/final-review`, because its items are unrelated by design, which leaves no parts to review together.
- **Workflow** - a change to how the app is built, not what it does: skills, subagents, hooks, AGENTS.md, these conventions, templates, docs or tooling config. It skips the lifecycle. If the change builds new infrastructure, such as CI or a test setup, it's a story instead. A workflow note with a What Belongs Here section is a collecting note: it gathers items over time and stays.
- **Idea** - jot something down quickly.
- **Hub** - the single home for design or decisions that several stories share. It can hold the design of a story that was split, or a design `/place-design` places there. It can also hold the design and decisions of stories that overlap substantially, such as `Meal Editing`, or of stories that `/design-feature` designs together. Part of a goal that's still being explored is an exploration hub, which also holds that part's Requirements. Not implemented directly.
- **Goal** - an epic: work the user ranks and ships together as one release. The Roadmap, not the note, lists the work that serves it. It has no Where It Stands. Not implemented directly.
- **Standing Goal** - collects work that no goal would take on its own, such as library upgrades and tech debt, which never block a feature. It never ships and is never ranked, building or planning. It has no Where It Stands and no Done When.

# Next Step by Note State
A note's state, usually its `type` and `status`, says what should happen to it next. The rows run in lifecycle order and, within a stage, in the order of the `type` list. Notes outside the lifecycle come last.

| Note state | Next step | Moves to | Skill |
|---|---|---|---|
| `idea`, no `type` | Settled with the user: scope, blocking decisions, template, direction and next step. A committed story's Roadmap line goes in Later. No design or root cause. | `idea` with a `type`, `ready` for a tweak with no open decision, `spec` for a feature with nothing visual to design, or a hub | `/shape` |
| a `decision needed` entry in `blocked-by`, or a hub with Open Decisions | Each decision answered in Open Decisions, with research as needed, and the `decision needed` entry removed once none remain | a tweak: `ready` · any other story: unchanged, ready for its usual next step · either: `dropped` if the user decides it isn't worth doing · a hub: unchanged, plus idea-note children for `/shape` when the answers imply new stories, and `/design-feature` next if it has something to design | `/decide` |
| a hub whose `^status` line names `/brainstorm` | Its options brainstormed and researched with the user, and sorted in a quick first pass | unchanged, with its Requirements and Open Decisions filled in, and `/decide` or `/design-feature` next | `/brainstorm` |
| `feature` · `idea` or a hub, whose `^status` line names `/design-feature` | Its screens designed with the user on a canvas, and the approved design saved in the vault | unchanged, with `/place-design` next | `/design-feature` |
| a story or hub whose `^status` line names `/place-design` | The design placed in the stories it belongs to, with any disagreement with their older designs settled, and feature notes for the parts no story covers | a story: `spec` · a hub: unchanged, with its child stories next | `/place-design` |
| `bug` · `idea`, or a `bug` · `spec` whose `^status` line names `/investigate` | The bug reproduced, its root cause found and the fix settled with the user | `spec` | `/investigate` |
| `pattern` · `idea`, no open decisions, or a `pattern` · `spec` whose `^status` line names `/architect` | Its convention if none is chosen, written as a short guide, then an audited Migration Checklist, approved with the user | `spec` | `/architect` |
| `infra` · `idea`, no open decisions | Goals, Design and Conventions, approved with the user one piece at a time, the Setup Outside the Repo, and a Build Order they approve as a whole | `ready` | `/infra-design` |
| `cleanup` · `idea`, or a `cleanup` · `spec` whose `^status` line names `/audit` | Current State filled in from a scan of the code, and its decisions settled with the user | `spec` | `/audit` |
| a collecting note: `sweep` · `idea` or `workflow` | Items collected until a goal starts building, then a dated copy frozen from them | a sweep's copy to `spec` · the original stays as it is | `/roadmap` |
| `feature` · `spec` | Suggested Approach, then implementation steps | `ready` | `/assess`, then `/plan-steps` |
| `bug` · `spec` | Implementation steps, since `/investigate` already settled the fix | `ready` | `/plan-steps` |
| `pattern` · `spec` | Implementation steps, since `/architect` already settled the Convention and every place to migrate | `ready` | `/plan-steps` |
| `infra` · `spec` | The Design and the Build Order's remaining steps revised | `ready` | `/infra-design` |
| `cleanup` · `spec` | Implementation steps, since `/audit` already settled the cleanup's decisions | `ready` | `/plan-steps` |
| `sweep` · `spec` | Every item re-checked against the code, any already fixed dropped, then steps planned | `ready` | `/check-drift`, then `/plan-steps` |
| `infra` · `ready` | Its Build Order built one step at a time | `in-progress` → `in-review` | `/infra-build` |
| `tweak` · `ready` | Built from its Purpose and any **Decided** line, as one step, then its PR opened into `develop` | `in-progress` → `in-review` | `/implement` |
| `sweep` · `ready` | Built one step at a time, then its PR opened into `develop` | `in-progress` → `in-review` | `/implement` |
| `ready`, any other type | Built one step at a time | `in-progress` → `in-review` | `/implement` |
| `spec` · `ready` · `in-progress`, when `/plan-steps` finds code changes since `confirmed` that could touch the story, or when `/close` unblocks the story and the story's next step wouldn't check its planned work against the code | ⚠️ Check Drift callouts where the remaining work no longer matches the code, conventions, the services it uses, other notes or the user's comments, and an updated `confirmed` | unchanged, back to `spec` for `/plan-steps` or the skill that re-settles its approach (`/assess`, `/investigate`, `/audit`, `/architect`, `/infra-design` or `/decide`), or add `blocked-by` | `/check-drift` |
| `in-review`, with no PR on its `^status` line | The code reviewed across the whole story, for what no single step shows, then its PR opened into its base | unchanged, with the PR on its `^status` line | `/final-review` |
| `in-review`, with a PR on its `^status` line | The PR's merge confirmed on GitHub, then closed as a `done` note is, and its worktree, branch and database removed | `done`, then archived or deleted | `/close` |
| `done` · `dropped` · a hub whose `^status` line names `/close` | The note kept in `archive/` for the stories that still rely on it, or deleted, and the notes around it updated | archived or deleted | `/close` |
| `workflow` | The change settled with the user and made everywhere it reaches, and every note that refers to it cleaned up | deleted · a collecting note loses the items it did and stays · a kicked-off copy is deleted once its last item is done | `/tooling` |
| `goal` | Shaped with the user: purpose, Done When, scope, gaps, supporting tooling and rank | unchanged · Roadmap lines moved under it, into Next or into Planning · once it's building, collecting notes kicked off and bug lines moved into Next | `/roadmap` |
| a `goal` whose lines and notes are scattered or messy | Cleaned up with the user, with work put into hubs where it needs exploring, shares design or decisions, or should share a design | unchanged · any new hubs, with `/brainstorm`, `/design-feature` or their child stories next | `/gather-goal` |
| a goal with no open stories or 🔁 lines | Released. The release process isn't built yet, so the goal waits, marked on its Roadmap line | - | none yet |
| `standing-goal` | Shaped with the user: purpose, what belongs in it and scope, or a goal drawn from it | unchanged · Roadmap lines moved under it · a new goal `<name> YYYY-MM-DD`, with the work the user picks moved to it | `/roadmap` |

# Files
- Filenames are plain names, with no emoji or status prefixes, because links use the filename and a prefix would go stale.
- In the notes repo, stories live in `features/<area>/`, goals and standing goals in `goals/`; closed stories that other stories still rely on live in `archive/`.
- In the notes repo, a design's files go in `assets/<its folder name>/`. Other images go in `assets/<story-name>/`.
