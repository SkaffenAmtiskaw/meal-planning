---
type: tweak
status: ready
blocked-by: []
confirmed: 2026-11-04
---
# Where It Stands
Next: /implement ^status

# Inbox

# Purpose
Local's `DB_URL` signs in as an `atlasAdmin` user, so local credentials can reach production's `staging` database, and only the database name and the seed's guard keep local work off it. Found 2026-11-04 by [[Services and Environments Audit]].

Local signs in as a new Atlas user with only `readWrite@test`, and `.env.local` no longer uses `seadams`. Worktree databases are out of scope: [[Branching and Releases]] settles how they get access. Production sharing a Free cluster with dev has its own Roadmap line.

# Open Decisions
1. Does local stop reaching production because production moves to its own Atlas project, or because local's user gets narrowed on the shared cluster?
   - **Decided 2026-11-04:** local's user gets narrowed on the shared cluster. Sarah's call.
     - Rejected: production moves to its own Atlas project - Sarah's call.

# Acceptance Criteria
- [ ] Atlas has a user whose only role is `readWrite@test`.
- [ ] `DB_URL` in `.env.local` signs in as that user.
- [ ] `pnpm seed`, `pnpm sign-in` and `pnpm dev` work with it.
- [ ] That user can't read the `staging` database.
