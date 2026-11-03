# Freezing a Dated Copy
Copy the note to `<name> YYYY-MM-DD` (today's date), then edit both:
- **The original:** remove every item except the blocked ones, which start with `**Blocked by [[Story]]:**` and roll over to the next kickoff.
- **The copy:** remove the blocked items, and set it up for its next skill:
  - **A sweep:** set `status: spec` and the `^status` line to "Kicked off. Next: /check-drift".
  - **A collecting workflow note:** set the `^status` line to "Kicked off. Next: /tooling".
