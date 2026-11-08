# The Cross-Story Review
The steps, in order:
1. **The story merges:** list them with `git log --first-parent --oneline <scope>`.
2. **The leftovers:** send the `leftovers-checker` subagent the range and the story merges, and say it's in goal mode. Start it in the background, so it runs while you do the next step.
3. **The conventions:** read `docs/project_conventions.md`, then the range's diff, and list each place the range breaks a convention, with `file:line` and the convention it breaks. Only the code the range adds or changes counts, because the rest of the app is App Health's to tidy.
4. **The merge:** once `leftovers-checker` reports, merge its findings and your conventions list into one list. A place both found is one finding. Then go on to the skill's step 3, Go Through the Findings.
