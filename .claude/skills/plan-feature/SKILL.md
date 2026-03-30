---
name: plan-feature
argument-hint: [feature]
description: plan a feature — trigger when asked to "plan [feature]", "create a plan for [feature]", "design [feature]", or "figure out how to build [feature]" — discovers existing notes, clarifies scope, produces an incremental implementation plan, gets user confirmation, then begins implementation
---

# When planning a feature:
1. Check the `notes/` directory for any existing plans or guidance related to the feature
2. Define the scope of the work
3. Prompt the user to confirm the scope before proceeding

# Discovery
- Check the `notes/` directory for any existing plans or guidance related to the feature
- Planned work in notes is the minimum requirement — the feature is not complete without it
- If no note exists for a multi-step feature, prompt the user and ask if one should be created

# Scope
- If the scope of the requested feature is unclear, prompt the user for clarification before planning
- Do NOT expand scope beyond what the user requested

# Planning
- Break the feature into incremental steps, each small enough to verify independently
- Write the plan into the relevant note, clearly marking which sections are Claude-generated vs user-generated
- You MUST indicate points at which manual tests can be run
- If updating an existing note, preserve existing user-generated content

# Confirmation
- Present the plan to the user and wait for explicit confirmation before proceeding
- Do NOT begin implementation until the user confirms

# Implementation
- Once confirmed, hand off to the implement flow starting from step 1
- Follow all rules in the `/implement-feature` skill from that point forward
