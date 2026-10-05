---
type: infra
status: idea
blocked-by:
  - "decision needed: whether an infra story keeps a lighter step plan or skips steps"
confirmed: 2026-10-05
---
# Where It Stands
Next: /decide ^status

Shaped 2026-10-05 as an infra story that redesigns how an infra story gets from an approved Design to a working build, either with a much lighter plan or with no steps at all. Decision 1 is open, and nothing is designed yet.

# Inbox
- From the idea note, for `/infra-design`: the change reaches Note Conventions, `/infra-design`, `/plan-steps`, `/implement`, `/check-drift`, `/final-review` and the infra template.

# Purpose
Sarah wonders whether `/plan-steps` is inappropriate for `infra` stories. It's built for small incremental work, which she does want for feature work, where she reviews the code to make sure it matches what she expects. For infra, such as wiring up a GitHub Actions routine, she just wants it to work. Part of her problem is how finicky the steps are.

# Goals
- [ ] Sarah's checks on an infra story prove that it works, not that its code matches what she expected. The Goals `/infra-design` already writes could serve as the end checks.
- [ ] The other jobs steps do still have a home: splitting a big design into session-sized pieces, giving a session a place to stop and resume, and saying when Sarah does each piece of Setup Outside the Repo.
- [ ] Planning for feature, bug, pattern, cleanup, sweep and roundup stories is unchanged.
- [ ] Infra notes that already have steps move onto the new path, as the Design's rollout says.

# Open Decisions
1. Should an infra story keep a step plan, just a much lighter one (for example a few session-sized chunks, each with its Setup and a Goal or two as its check)? Or should it skip steps entirely, so `/implement` builds straight from the approved Design with the Goals as checks? Every later infra story follows the answer. Found by /shape (2026-10-05).

# Design
Questions for this section:
- Which infra notes that already have steps get the re-pass once the new path exists?
  - **Decided 2026-10-05:** all except [[Dependency Update PRs]], which is in progress and finishes on its current steps. So [[Notes Vault Repo]], [[Dependency Release Analysis]] and [[Major Upgrade Sweeps]] get the re-pass. Sarah's call.

# Conventions

# Setup Outside the Repo

# Out of Scope

# Implementation
