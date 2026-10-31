---
type: bug
status: idea
blocked-by: []
confirmed: 2026-10-31
---
# Where It Stands
Next: /investigate ^status

A bug in the Add Meal form's dish row. /investigate reproduces it in develop, finds why the source chip's width cap doesn't protect the dish-name input, and settles the fix with Sarah.

# Inbox

# Symptoms
[Sarah] - Bug - When adding a URL as a reference, the dish title input can shrink too small to read the text (this was observed in the deployed production app but not confirmed in develop yet)

The input is the dish-name input in the Add Meal form's dish row. The long URL is on the dish's source chip, beside it.

# Who Can Hit This
Probably anyone adding a meal on desktop, where the dish-name input and the source chip share one line. On phones the input sits on its own line above the chips.

# Root Cause
- The archived [[Add Meal UX Changes]] capped the source chip at `max-width: min(240px, 50%)` in `src/app/[planner]/calendar/_components/AddMealForm/DishSourceChip.module.css`, so that a long reference would truncate before it squeezed the dish-name input. The squeeze still happens.
- On 2026-10-31, production's Add Meal form code matched develop's apart from tests, so develop most likely has the bug too.
- [[Add Meal Changes (Saved Recipes)]] Step 6b reworks this chip and `formatSourceChip`, and its desktop Saved recipes column makes the dish column narrower.

# Fix

# Acceptance Criteria

# Implementation
