---
type: workflow
confirmed: 2026-10-04
---
# Where It Stands

Next: /tooling ^status

Split from [[Branching and Releases]] and made a workflow note 2026-10-04. Nothing is changed yet; `/tooling` makes the whole change.

# Notes
Split from [[Branching and Releases]]. Only one goal is built at a time; the next goal's stories can be shaped, decided and designed, but not implemented until the goal before it is done. Branching and Releases' release design relies on it: a release is `develop` merged into `main` once the goal is finished, which only works if `develop` holds no other goal's work. From that story's Open Decisions:
- Decision 6: "**Decided 2026-10-02:** a branch is one story. Only one goal is built at a time: the next goal's stories can be shaped, decided and designed, but not implemented until the goal before it is done. A story's branch merges into `develop` once the whole story is done, so `develop` only gets full pieces of work, and when the goal is finished, `develop` is released to `main`. Sarah's call after two checks: `develop` never holds another goal's unfinished work, so a finished goal releases all at once; which goal goes first and how big it is are her prioritization calls."

Findings from `/decide` on Branching and Releases (2026-10-02 to 2026-10-04):
- **Sarah decisions this changes:** the top two goals are active (2026-09-28; the Roadmap's "How this file works" and the Now/Next markers), and collecting notes are kicked off for active goals (2026-10-02, commit e4e3981). A kicked-off workflow copy is built straight away by `/tooling`, so it can't serve a goal that's only being planned.
- **Where "active goals" is written today:** `.claude/skills/roadmap/SKILL.md` (description, steps 6 and 7), `.claude/skills/kickoff/SKILL.md` ("Kicking off for active goals"), `.claude/skills/roadmap-placement/SKILL.md`, `.claude/skills/close/SKILL.md`, `.claude/skills/tooling/SKILL.md`, `scripts/vault-lint.sh` (the active-goal check on Now and Next lines), AGENTS.md "Editing notes" ("Starting on a story in the backlog", "A blocker outside the queue"), `notes/Note Conventions.md` (the sweep and roundup row), `notes/templates/Workflow.md`, and the Roadmap's "How this file works".
- **`/implement` needs a gate:** its step 1 checks no goal today, so nothing stops it on a story that serves only the goal being planned.
- **A new marker (Sarah, 2026-10-04):** call out when a story can't be architected until other work is done, the way "Building waits on" a linked story works today.
- **Planning ahead:** shaping, deciding and designs in Claude Design are worth doing for the next goal (Sarah, 2026-10-04). A story planned down to steps long before its turn will likely need `/check-drift` and re-planning.
- **Sarah's plan:** a rolling dev tooling goal once [[Dev Foundations]] is released. Dev tooling that helps a goal is already pulled into that goal when the goal is shaped.

# Questions
