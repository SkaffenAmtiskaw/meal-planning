---
name: implement-feature
description: implement a planned feature — trigger when asked to "implement [feature]", "build [feature]", "work on [feature]", "continue [feature]", "implement step N", or "do step N of [feature]" — looks up the plan from notes, asks which step to start from, and works through each step with user confirmation
---

# Plan Lookup
- Look up the plan from the `notes/` directory
- If no plan is found, ask the user before proceeding
- Ask the user which step to start from (default: step 1)

# Incremental Execution
- Work through one step at a time
- After completing each step, ask the user for confirmation before moving to the next
- When pausing, if manual steps exist for the step, you MUST quote the exact manual test steps from the plan verbatim
- Do NOT expand scope beyond the plan — if something unclear arises, prompt the user

# Notes
- After completing each step, update the note to indicate what has been done
- At the end of the feature, check if this work affects other planned features and update their notes accordingly
