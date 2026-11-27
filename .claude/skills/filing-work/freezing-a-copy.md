# Freezing a Dated Copy
A dated copy holds the items a release takes on from a collecting note, so they can finish while the note keeps collecting. It's named `<name> YYYY-MM-DD`, with today's date. If a note of that name already exists, add a number after the date, starting at 2. Which items the copy takes depends on why it's made:
- **At a kickoff:** every item in the note, except the ones below that are held back or go in a copy of their own.
- **For one item after a kickoff,** such as a problem this release caused, as the `filing-work` skill routes it, or a sweep item that `/check-drift` finds now waits on a story in this release: only that item, because after a kickoff, only work the release caused or already holds joins it.

At a kickoff, what happens to an item that starts with a `**Blocked by [[Story]]:**` marker depends on the note and the story:
- **If the note is a sweep and the story is in this release, as the `roadmap-rules` skill's "What joins every release" describes:** it goes in a copy of its own, with any other items that wait for the same story, so only those items wait for it.
- **Otherwise:** it's held back for the next kickoff, because its story isn't in this release or the note has no `blocked-by` to wait through.

Copy the note, then edit it as the case needs:
- **At a kickoff:** remove from the original every item a copy takes, and from each copy every item it doesn't.
- **For one item after a kickoff:** leave the original as it is, and replace the copy's items with that item.

Then set the copy up for its next skill:
- **A sweep:** set `status: spec`, and move the story from each remaining marker to `blocked-by`. If `blocked-by` has a story, set the `^status` line to "Kicked off. Blocked by [[Story]]; then /check-drift". Otherwise, set it to "Kicked off. Next: /check-drift".
- **A collecting workflow note:** set the `^status` line to "Kicked off. Next: /tooling".

## The Roadmap Line of a Copy Frozen After a Kickoff
The line goes in Next and ends with 🔁. Where in Next depends on whether a release is under way, meaning the building goal's line under Goals includes ` · releasing`:
- **If one is:** put the line below the 🔥 lines and the lines for notes the goal note's `# Release` section already links, and above every other line. Then add a bullet to that section that links the copy, so the release freeze lets it be built.
- **Otherwise:** ask where in Next it goes, as "Placing a Line in Next or Planning" in the `roadmap-placement` skill describes.

If the goal's line ends with ` · Next: /finish-goal` or ` · Next: /ship-goal`, remove that part, because the new copy is open work in the release.
