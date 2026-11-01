---
type: bug
status: idea
blocked-by: []
confirmed: 2026-10-31
---
# Where It Stands
Next: /investigate ^status

A meal can't be saved without a named dish. The fix drops dishes with no name and no other data when the meal is saved, so a meal can have just a name, or a name and a description.

# Inbox

# Symptoms
You should be able to create a meal with just a title and a description (or just a title).

Today, Add Meal always sends at least one dish:
- The form starts with one empty dish row.
- The remove button is hidden when only one row is left (`DishList.tsx`).
- The server needs every dish to have a name (`zDishFormInput` in `day.types.ts`), so leaving the row blank makes the save fail.

The Mongoose schema (`day.ts`) and the meal's zod types already accept a meal with no dishes, and `MealCard` already shows one. *Found by reading the code while shaping; not yet reproduced in the running app.*

# Who Can Hit This
Any user who can write to a planner and adds a meal without filling in a dish.

# Root Cause

# Fix
Sarah decided 2026-10-31 that saving drops unnamed dishes, as long as they have no other data, and that the Add Meal form itself doesn't change.

# Acceptance Criteria

# Implementation
