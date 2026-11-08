---
name: deleting-a-note
description: How to delete a note in the notes repo and clean up what it leaves behind. Use when deleting a note, or when removing a story's Roadmap line.
user-invocable: false
---

# Deleting a Note
1. **Check for anything worth keeping.** A note is never kept just as a record, since git history keeps it. If it holds something worth keeping for reference, such as a convention or the reason the code is the way it is, handle it as a doc gap before going on.
2. **Find every link to it** with `sh scripts/note-refs.sh "<note name>"`.
3. **Reword or remove each link,** even one that's still true, since it would point at nothing. Never add a line saying the note was removed.
4. **Remove its Roadmap line.** A building goal with no work left is ready for the next step of its release, and nothing else flags it. The line served the building goal if it sat under the goal's heading, carried its 🎯 link or ended with 🔁. If it did, check what the goal has left once the line is gone. It has no work left if both of these hold:
   - No other open line sits under its heading or carries its 🎯 link.
   - No other line ends with 🔁.

   If it has none left, add the release's next command to the end of its line under Goals. Which command depends on the line:
   - **If it says ` · releasing`:** its audits and their fixes have closed, so add ` · Next: /ship-goal`.
   - **Otherwise:** its own work is done and its release hasn't started, so add ` · Next: /finish-goal`.
5. **Delete the note.**
6. **Delete files nothing references anymore.** Run `sh scripts/vault-orphans.sh` after step 5, so the deleted note's references don't count. Delete each file it lists, then remove each folder it says is left empty.
