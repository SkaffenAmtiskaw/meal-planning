# Changing an Approved Part of the Plan
While you build, an approved part of a story's plan may have to change, such as an infra Piece, a pattern's Convention or a bug's Root Cause. Most of these changes are settled in this session. A send-back costs the user a new session and stalls the build, and this session can run the same check the earlier skill would. What to do depends on the change:
- **If it replaces the approach as a whole:** send the story back, as "Sending a Story Back" describes. Examples are a change to an infra story's Goals or to what a pattern's Convention is for, or a bug whose cause isn't the one under Root Cause. Settling one of these is the earlier skill's whole job, so it needs a session of its own.
- **Otherwise:** settle it here, as "Settling It Here" describes. Examples are a Piece that does more than designed, a Convention detail like where exported types go, or a Root Cause narrowed to the code path that really fails.

## Settling It Here
The steps, in order:
1. Run the check that the earlier skill runs on that part, from the file for it in this folder:
   - **A Piece:** `checking-a-piece.md`.
   - **A Convention:** `auditing-a-convention.md`.
   - **A Root Cause:** `reproducing-a-bug.md`.
2. Show the user the changed part and what the check found, and ask whether they approve.
3. Once they approve, update the part in the note, along with what it changes elsewhere in the note, such as the Flow, the Migration Checklist or the remaining steps. Then keep building.

## Sending a Story Back
The steps, in order:
1. Stop coding, and leave the work as it is.
2. Under the step you were building, add an **As built:** note saying what's done and what isn't. Then add an Inbox item saying why the plan needs to change.
3. Set `status` to `spec`.
4. Update Where It Stands, with a `^status` line such as "Needs re-plan. Next: /investigate" or "Needs re-plan. Next: /infra-design (revision)".
5. Triage and route the out-of-scope list. For each item the user pulls in, add it to that Inbox item, so the next skill plans it.
6. Tell the user to run the next skill in a new session.
