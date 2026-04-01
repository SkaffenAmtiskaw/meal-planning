---
name: implement-feature
description: implement a planned feature — trigger when asked to "implement [feature]", "build [feature]", "work on [feature]", "continue [feature]", "implement step N", or "do step N of [feature]"
model: sonnet
---

# Plan Lookup
- Look up the plan from the `notes/` directory
- If no plan is found, ask the user before proceeding
- Ask the user which step to start from (default: step 1)

# Incremental Execution
- Work through one step at a time
- When writing test files, test ONLY the file currently being written using @test-runner
- If coverage gaps are reported on files not being tested, that is an indication imported modules need to mocked
- When the step is complete, have a run `pnpm coverage` to ensure 100% code coverage
- After code coverage is confirmed, STOP and ask the user for verification of the step - you MUST quote the exact manual test steps from the plan verbatim
- If the user confirms the check passed, update the note to indicate the step is complete
- AFTER the user has confirmed the check passed proceed to the next step

# Final Audit
- When a feature is complete, assess whether the changes made fell within the planned scope
- Check if this work affects other planned features and update their notes accordingly
- Ask for user confirmation to remove the feature from the notes
