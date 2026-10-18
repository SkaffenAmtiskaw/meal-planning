---
type: workflow
confirmed: 2026-10-15
---
# Where It Stands
Next: /tooling ^status

# Notes
Part of [[Agent Instructions Audit]]. Split from Feature Implement Review on 2026-10-15, since it needs its own decisions across `/implement`, `/final-review` and AGENTS.md.

Moved from Agent Workflow Changes on 2026-10-06:
- **A change that affects another story gets buried in the summary** - AGENTS.md "Editing notes", the "Your change affects another story's remaining work" bullet, tells a session to leave the other note alone and tell Sarah in its summary what the change means for that story. It ends up inside a long summary block rather than as a decision, so it's easy to miss: every `/infra-design` session on 2026-10-06 ended that way. Sarah wants it either treated as part of the note's own work or put on the out-of-scope list. She also said planning sessions shouldn't update other notes in anticipation of their changes, especially notes likely to be finished first: "Other notes should only be updated when the work is done. If there is a high risk of conflict, then we can use blocked-by." A second example: `/shape` on [[Database Backup and Restore]] (2026-10-06) said a yes on its decision 2, a backup before each release into `main`, would change [[Branching and Releases]]' release process. Sarah said the step is the story's own work: if it's built before Branching and Releases builds the release process, the story adds an Inbox item there once the step is built. The other half: once a story's work is built, nothing finds other notes that still describe the old behavior. `/implement` updates only the story's own note, `/final-review` reviews only the story's code, and AGENTS.md "A note that's wrong or out of date" covers another story's remaining work but not notes that describe built work. Example: once [[Notes Vault Repo]] Step 7 is built, [[Local Dependency Update Alerts]] still says sweep items reach `develop` through the PR (Piece 4's sub-step 5 and Flow step 6). Sarah expects the session that builds the work to update such notes, with `/final-review` as the backstop. Decide how: a step in `/implement` that finds notes describing the changed behavior and updates them, a matching check in `/final-review`, and where AGENTS.md says it. Found 2026-10-06 during `/infra-design` (revision) on Notes Vault Repo.

# Questions
