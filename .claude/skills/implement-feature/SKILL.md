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
- When writing test files, test ONLY the file currently being written
- When the step is complete, have a subagent run `pnpm coverage` to ensure 100% code coverage
- After code coverage is confirmed, pause and ask the user for verification of the step - you MUST quote the exact manual test steps from the plan verbatim
- If the user confirms the check passed, update the note to indicate the step is complete

# Final Audit
- When a feature is complete, have a subagent run a check to ensure the changes made did not exceed the scope of the feature
- Have a subagent check if this work affects other planned features and update their notes accordingly
- Ask for user confirmation to remove the feature from the notes
