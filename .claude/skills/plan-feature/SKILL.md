---
name: plan-feature
argument-hint: [feature]
description: plan a feature — trigger when asked to "plan [feature]", "create a plan for [feature]", "design [feature]", or "figure out how to build [feature]" — discovers existing notes, clarifies scope, produces an incremental implementation plan, gets user confirmation, then begins implementation
---

# Steps When Planning a Feature

## 1. Discovery
- Check the `notes/` directory for any existing plans or guidance related to the feature
- _Note: Planned work in notes is the MINIMUM requirement — the feature is not complete without it_
- If no note exists, create one

## 2. Scope Definition
- Define the scope of the story
- If the scope of the requested feature is unclear, prompt the user for clarification before planning
- If any unresolved choices are noted in the notes prompt the user for a decision - provide an opinion or pros/cons if appropriate
- You MUST ask the user for confirmation of scope BEFORE proceeding further
- Write the scope to the note

## 3. Defining Incremental Steps
- Break the feature into the smallest incremental steps that can be *verified by the user*
- Running a unit test is not a user verification step - user verification must confirm the changes work as expected with real data
- Each step MUST have a plan for user verification
- If a step cannot be verified by the user then it is not useful as an independent step
- In order to test incremental changes temporary console.logs can be added to verify data is correct

## 4. Plan Confirmation
- Present the plan to the user and wait for EXPLICIT confirmation before proceeding
- Write the plan to the note
- Do NOT begin implementation until the user confirms

## 5. Implementation
- Once confirmed, hand off to the implement flow starting from step 1
- Follow all rules in the `/implement-feature` skill from that point forward
