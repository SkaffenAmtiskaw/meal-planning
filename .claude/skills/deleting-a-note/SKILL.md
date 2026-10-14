---
name: deleting-a-note
description: How to delete a note in notes/ and clean up what it leaves behind. Use when deleting a note, or when removing a story's Roadmap line.
user-invocable: false
---

# Deleting a Note
1. **Check for anything worth keeping.** A note is never kept just as a record, since git history keeps it. If it holds something worth keeping for reference, such as a convention or the reason the code is the way it is, handle it as a doc gap before going on.
2. **Find every link to it** with `sh scripts/note-refs.sh "<note name>"`.
3. **Reword or remove each link,** even one that's still true, since it would point at nothing. Never add a line saying the note was removed.
4. **Remove its Roadmap line.** First note the goals it served: the goal heading it sat under and its 🎯 links. A goal with no work left waits on a release, and nothing else flags it. So for each one that isn't a standing goal: if no other open line sits under its heading or carries its 🎯 link, and no collecting-note item carries its 🎯 link, add ` - waiting on a release process` to the goal's line under Goals.
5. **Delete the note.**
6. **Delete files nothing references anymore.** Run `sh scripts/vault-orphans.sh` after step 5, so the deleted note's references don't count. Delete each file it lists, then remove each folder it says is left empty.
