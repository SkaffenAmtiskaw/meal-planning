---
type: workflow
confirmed: 2026-11-02
---
# Where It Stands
Next: /tooling ^status

# Notes
[Sarah] I've been kind of mulling over changing how sweeps work. It seems like there will always be tidy ups and tech debt, and it's good to just kick off the sweep for them every time a release is kicked off. That way those items don't wait forever for the sweep to finally be prioritized. We don't even need to tie sweep items to a specific goal - they can just move into a release because part of the release can be to address outstanding issues.

Likewise, I wonder if instead of having a bug goal I should just pull in any existing bugs whenever I move a release to in progress.

It does mean I need to keep the sweeps and the bugs tidier perhaps, but that's totally doable.

This goes before [[Sweep Kickoff Review]], because three of that review's Issues Found are about text this change rewrites: the "Kicking off for the building goal" section, the 🎯 and 📌 rules at `kickoff:60-62`, and the wording difference between `/roadmap` and `roadmap-placement`.

An agent's read of what this reaches, from 2026-11-02:
- **The moment already exists.** "A release is kicked off" maps to a goal starting to build, in `/roadmap` step 7, so this doesn't wait on the release process in [[Branching and Releases]].
- **Sweep items and bugs differ in size.** Sweep items are small and already decided. Bug lines include stories that still need `/investigate`, such as [[Account Deletion Deletes Shared Planners]], and a goal can't ship until its work is done.
- **Files that mention it:** `/kickoff`, `/roadmap`, `roadmap-placement`, `filing-work`, `gather-goal`, `check-drift`, `notes/templates/Sweep.md`, `scripts/vault-lint.sh`, AGENTS.md's "A new item in a collecting note", Note Conventions, the Roadmap's "How this file works", the `Bugs` standing goal and the sweeps' own 🎯 links.
- **A similar rule already exists.** [[Dev Tooling]]'s Roadmap Instructions kick off its three collecting notes whenever a goal is drawn from it.

# Questions
