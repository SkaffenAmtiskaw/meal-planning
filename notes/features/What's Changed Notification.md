---
type: 
status: idea
confirmed: 2026-10-04
---
# Where It Stands

Next: /shape ^status

# Inbox

# Notes
An in-app "what's changed" notification that tells users what a release changed. Sarah would someday like one somewhere in the app (2026-10-04, during `/decide` on [[Branching and Releases]]). That story left versions and release notes to this one:
- Decision 5: "**Decided 2026-10-04:** no versions or release notes for now; they're for a future story, if Sarah adds an in-app \"what's changed\" notification. Sarah's call, checked against the code and notes: until then version numbers add nothing, nothing in the code or planned work needs one, and adding them later is cheap."

Found during that check: adding versions later is cheap, since tools such as release-please and Changesets can start at any commit. Until then, each release is the merge of a PR from `develop` into `main`, and Branching and Releases' Design suggests the release PR's title names its goal.

# Questions
