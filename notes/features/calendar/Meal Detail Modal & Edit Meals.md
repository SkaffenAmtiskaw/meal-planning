---
type: feature
status: spec
blocked-by:
  - "[[Meal Editing]]"
  - "[[Header Date Picker]]"
  - "[[Meal Form Date Picker]]"
confirmed: 2026-09-25
---
# Where It Stands
Blocked by [[Meal Editing]], [[Header Date Picker]] and [[Meal Form Date Picker]]; then /assess ^status

# Inbox

# Purpose
The meal detail modal styling is bare-bones and does not match the rest of the calendar. It also needs to easily allow a user to edit a meal.

The modal also needs to be updated to follow current project coding conventions. It refers to "meal events" which do not follow the new naming convention of not using the word "event" (because these even though we use a calendar, they aren't really events). It also needs to use the `CalendarModalContext` like the "add meal" modal currently does.

![[Meal Editing#Purpose]]

# Design Handoff
🚛 Moved to [[Meal Editing]]'s Inbox, for `/design-feature`.
