# Freezing a Dated Copy
A dated copy holds the items a release takes on from a collecting note, so they can finish while the note keeps collecting. It's named `<name> YYYY-MM-DD`, with today's date. Which items the copy takes depends on why it's made:
- **At a kickoff:** every item in the note, except the held-back ones below.
- **For a problem this release caused, as the `filing-work` skill routes it:** only that problem's item, because after a kickoff, only work the release caused joins it.

At a kickoff, what happens to an item that starts with a `**Blocked by [[Story]]:**` marker depends on the note and the story:
- **If the note is a sweep and the story is in this release, as the `roadmap-rules` skill's "What joins every release" describes:** the copy takes it.
- **Otherwise:** it's held back for the next kickoff, because its story isn't in this release or the note has no `blocked-by` to wait through.

Copy the note, then edit it as the case needs:
- **At a kickoff:** remove from the original every item the copy takes, and from the copy every item it doesn't.
- **For a problem this release caused:** leave the original as it is, and replace the copy's items with the problem's item.

Then set the copy up for its next skill:
- **A sweep:** set `status: spec`, and move the story from each remaining marker to `blocked-by`. If `blocked-by` has a story, set the `^status` line to "Kicked off. Blocked by [[Story]]; then /check-drift". Otherwise, set it to "Kicked off. Next: /check-drift".
- **A collecting workflow note:** set the `^status` line to "Kicked off. Next: /tooling".
