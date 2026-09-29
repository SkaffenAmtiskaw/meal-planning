---
type: 
status: idea
confirmed: 2026-09-29
---
# Where It Stands

Waiting on [[Services and Environments Audit]]; then /shape ^status

# Notes
If [[Services and Environments Audit]] finds that the dev database in `.env.local` runs on the same Atlas cluster as production, add a `pnpm` script that reads `db.version()` from the dev database and checks that its release series (major.minor) matches the MongoDB version pinned for the E2E memory server. If they're on different clusters, the script can't tell what production runs, so it isn't worth building.

This would back up [[E2E Test Setup]]'s Rule 14 (the memory server matches Atlas's MongoDB release series), whose enforcement is process only for now. Nothing that runs in tests or CI can read Atlas's version without Atlas credentials, and E2E Test Setup's decision 3 avoided needing them, so the script is run by hand.

Sarah asked for this 2026-09-29 during `/architect` on [[E2E Test Setup]].

# Questions
