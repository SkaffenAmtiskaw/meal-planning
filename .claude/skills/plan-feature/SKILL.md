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
- Ask the user for confirmation of scope before proceeding
- Write the scope to the note

## 3. Defining Incremental Steps
- Break the feature into small incremental steps that can be verified independently
- Each step MUST have a plan for user verification - if necessary temporary console.logs can be added to verify data is correct

## 4. Plan Confirmation
- Present the plan to the user and wait for EXPLICIT confirmation before proceeding
- Write the plan to the note
- Do NOT begin implementation until the user confirms

## 5. Implementation
- Once confirmed, hand off to the implement flow starting from step 1
- Follow all rules in the `/implement-feature` skill from that point forward
