---
type: infra
status: idea
confirmed: 2026-10-05
---
# Where It Stands
Decisions made. Next: /infra-design ^status

Decision 1 is settled: infra stories skip `/plan-steps`, and `/infra-design` writes a Build Order into the Design that `/implement` builds one chunk per session. The Design questions on failure paths and check wording are answered. Nothing is designed yet.

# Inbox
- From the idea note, for `/infra-design`: the change reaches Note Conventions, `/infra-design`, `/plan-steps`, `/implement`, `/check-drift`, `/final-review` and the infra template.

# Purpose
Sarah wonders whether `/plan-steps` is inappropriate for `infra` stories. It's built for small incremental work, which she does want for feature work, where she reviews the code to make sure it matches what she expects. For infra, such as wiring up a GitHub Actions routine, she just wants it to work. Part of her problem is how finicky the steps are.

# Goals
- [ ] Sarah's checks on an infra story prove that it works, not that its code matches what she expected. The Goals `/infra-design` already writes could serve as the end checks.
- [ ] `/implement` asks Sarah to check an infra story far less often than steps did: only where a chunk reaches a Goal or needs something only she can do.
- [ ] The other jobs steps do still have a home: splitting a big design into session-sized pieces, giving a session a place to stop and resume, and saying when Sarah does each piece of Setup Outside the Repo.
- [ ] Planning for feature, bug, pattern, cleanup, sweep and roundup stories is unchanged.
- [ ] Infra notes that already have steps move onto the new path, as the Design's rollout says.

# Open Decisions
1. Should an infra story keep a step plan, just a much lighter one (for example a few session-sized chunks, each with its Setup and a Goal or two as its check)? Or should it skip steps entirely, so `/implement` builds straight from the approved Design with the Goals as checks? Every later infra story follows the answer. Found by /shape (2026-10-05).
   - **Decided 2026-10-05:** C: `/infra-design` adds a short Build Order to the Design, an ordered list of session-sized chunks that each name their Pieces, the Setup Sarah does first and the Goals checkable at the chunk's end. Sarah approves it with the rest of the Design, infra skips `/plan-steps`, and `/implement` builds one chunk per session and marks it ✅ Complete. It covers the three jobs steps did in a few lines, written by the session that already knows the Pieces, without a second planning session and checker that restate the Design.
     - Rejected: A, a lighter `/plan-steps` for infra - it still takes a separate session and checker run to write out the Design's order again, and it adds infra exceptions to plan-steps and plan-checker.
     - Rejected: B, no steps - the build order would be decided one session at a time without Sarah approving it, and agents without an ordered list written up front tend to build everything at once or stop early.

# Design
Findings from Decision 1's research (2026-10-05):
- `/final-review` finds where a story starts from the first commit that writes `**Status:** ✅ Complete` on a step (`.claude/skills/final-review/SKILL.md` step 2), so a Build Order chunk keeps that exact marker.
- Note Conventions' Lifecycle says a story isn't ready until it has steps. For infra, the approved Build Order takes their place.
- On all four existing infra notes, `/plan-steps` brought up real decisions while planning. `/infra-design` has to raise those while it writes the Build Order.
- `/check-drift` sends an infra story's findings about its steps to `/plan-steps` today. With a Build Order, they go to `/infra-design`.
- The re-pass carries over anything a note's old steps hold that its Design doesn't, such as Notes Vault Repo's "Facts the steps rely on" and decisions Sarah made while planning, so nothing is lost when the steps go.

Questions for this section:
- Which infra notes that already have steps get the re-pass once the new path exists?
  - **Decided 2026-10-05:** all except [[Dependency Update PRs]], which is in progress and finishes on its current steps. So [[Notes Vault Repo]], [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]] get the re-pass. Sarah's call. [Sarah] - Also as part of this, I think the agent is defining goals too broadly. A goal should be the thing I personally want to get out of the story. The agent adds a lot of implementation details to it that always seem sensible, but I hesitate to call them a _goal_. For example, in Notes Vault Repo there is a goal which says "`vault-lint.sh`, `vault-orphans.sh`, `note-refs.sh` and `note-section.sh` work on the notes repo when run from the main checkout, from a worktree or in a routine." This seems like a good idea, and I think the story is right to include it. But if we'd achieved the same result a different way I wouldn't have cared. I certainly don't want to spend my time testing that it works.
- Do Sarah's checks have to cover a Design's failure paths (as Goals she checks), or does each Build Order chunk name failure paths the implementer verifies on its own?
  - **Decided 2026-10-05:** case by case. A failure path gets a check only where the Design already has one worth checking, and agents don't invent possible failure paths to fill one in. Sarah's call: she doesn't want agents twisting themselves into knots inventing failure paths.
- How does a Goal become an exact action Sarah can check?
  - **Decided 2026-10-05:** the same rule `/plan-steps` uses now (`.claude/skills/plan-steps/SKILL.md`, "usable as written"), moved into `/infra-design`: each Build Order check spells out the exact command, text or screen, and where that can only be known at build time, the check says `/implement` gives it to her in chat, ready to paste. `/implement` should also ask her to check a lot less than steps did. Sarah's call: `/infra-design` takes over `/plan-steps`' work here.

# Conventions

# Setup Outside the Repo

# Out of Scope

# Implementation
