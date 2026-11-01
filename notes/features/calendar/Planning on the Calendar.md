---
type: hub
confirmed: 2026-11-01
---
# Where It Stands
Next: /brainstorm ^status

# Inbox
- From the deleted DND note: We need DND functionality in all desktop views. Users should be able both to drag a meal to a different day, but also to reorder meals within the same day.
- add meals by clicking week day - reuse the interaction decisions from [[Add Meal from Month Cell]]'s design so month and week behave the same
- clicking "+N more" in the month grid switches to list view at that day - approach needs review. [[Add Meal from Month Cell]]'s questions below also ask what this click does.
- From [[Add Meal from Month Cell]], questions for the design session:
  - What counts as "empty space" in a cell that already has meal cards and a "+N more" link? What does each click target do?
  - What cue shows that a cell can be clicked (hover state, cursor, a "+" that appears)?
  - What's the keyboard equivalent? Today, Enter on a focused day opens its meal (one meal) or steps into its meals (several), and does nothing on an empty day. [[Keyboard Shortcuts]] also plans `C` to open Add Meal.
  - Does clicking a day in the leading or trailing weeks of another month behave the same way?

# Purpose
Acting directly on the calendar's days: clicking a day to add a meal there, and dragging a meal to another day or a new spot within its day. None of it has a design yet, and these interactions compete for the same click and drag targets in a day cell, so they're explored and designed together.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Requirements

# Design Handoff

# Coverage

# Child Stories
| Story | Status | Scope in this area | Blocked by |
|---|---|---|---|
| [[Add Meal from Month Cell]] | idea | clicking a desktop month cell opens Add Meal with that day's date | this hub's design |

**Related, not child stories:**
- [[Meal Editing]] - Move to, Duplicate and open decision 8 on reordering on phones
- [[Meal Detail Modal & Edit Meals]] - moving onto a day that already has meals stacks them, which dragging should match

# Build Order

# Open Decisions

# Deferred Work
