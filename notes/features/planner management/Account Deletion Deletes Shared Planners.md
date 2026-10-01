---
type: 
status: idea
confirmed: 2026-10-01
---
# Where It Stands

Next: /shape ^status

# Notes
Account deletion may delete planners other users still share. In `src/_actions/user/deleteAccount.ts:20-27`, the loop goes over membership subdocuments, not planner ids, so the owner count probably always comes back 1, and `Planner.deleteOne` either deletes every planner the user belongs to (shared ones included) or matches nothing. Not reproduced, found by reading the code.

Overlaps [[Settings Data Refresh]] Step 18, which edits the same file, and [[Transfer Ownership of Planner]], which says what happens to planners on account deletion.

# Questions
