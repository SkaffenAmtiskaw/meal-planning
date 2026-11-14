# Freezing a Dated Copy
What happens to an item that starts with a `**Blocked by [[Story]]:**` marker depends on the note and the story:
- **If the note is a sweep and the story is in this release, as the `roadmap-rules` skill's "What joins every release" describes:** the copy keeps it.
- **Otherwise:** it's held back for the next kickoff, because its story isn't in this release or the note has no `blocked-by` to wait through.

Copy the note to `<name> YYYY-MM-DD` (today's date), then edit both:
- **The original:** remove every item except the held-back ones.
- **The copy:** remove the held-back items, and set it up for its next skill:
  - **A sweep:** set `status: spec`, and move the story from each remaining marker to `blocked-by`. If `blocked-by` has a story, set the `^status` line to "Kicked off. Blocked by [[Story]]; then /check-drift". Otherwise, set it to "Kicked off. Next: /check-drift".
  - **A collecting workflow note:** set the `^status` line to "Kicked off. Next: /tooling".
