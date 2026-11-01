---
type: feature
status: spec
blocked-by: []
confirmed: 2026-10-31
---
# Where It Stands
Next: /assess ^status

Skips the design session and `/place-design`, since there's nothing visual to design: Sarah decided 2026-10-31 that the Requirements below are its whole spec.

# Inbox

# Purpose
A meal's color should be based on a hash of its name and description, not its name alone.

# Requirements
- A meal's color comes from its name plus its description, so two meals with the same name and different descriptions can get different colors.
- The color is still one of the existing meal color palette entries, not an arbitrary hex color.
- A meal with no description keeps the color it has today.
- Every calendar view that colors meals shows the same color for the same meal.
- Once meals can be edited ([[Meal Editing]]), changing a meal's description can change its color. That's expected.

# Out of Scope
- Letting the user pick a meal's color: the "Allow user to change meal color in calendar" line in Ideas on the [[Roadmap]].
- Merging the duplicated meal color code: [[Calendar Duplication]].
- The schedule-x components that still call the color function (`MonthGridEvent`, the old `WeekView`): [[Remove Schedule-X]] deletes them.

# Suggested Approach

# Implementation
