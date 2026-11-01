---
type: hub
confirmed: 2026-11-01
---
# Where It Stands
Next: /brainstorm ^status

# Inbox
- two buttons are off-screen when tabbing from the first tab stop on the calendar page - a bug, needs investigating. Moved from the calendar style fixes list 2026-09-26
- calendar focus states look poor - needs a design, possibly a global focus state (see the `theme.ts` item below, whose focus styles never apply). Moved from the calendar style fixes list 2026-09-26
- `theme.ts` - the input border `#C8C0C3` has no color token, and the input `&:focus` styles never apply (Mantine drops pseudo-selectors in `styles`) - see the calendar focus states item 🎯 [[App Health]]
- calendar list view keyboard navigation - needs design review once the calendar views are mostly complete
- skip to content

# Purpose
Getting around the calendar by keyboard and seeing where focus is. This work was spread across separate lines that point at each other, and what to build isn't known yet.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Requirements

# Design Handoff

# Coverage

# Child Stories
| Story | Status | Scope in this area | Blocked by |
|---|---|---|---|

**Related, not child stories:**
- [[Keyboard Shortcuts]] - works alongside the calendar's keyboard navigation, and is out of [[Calendar Page]]

# Build Order

# Open Decisions

# Deferred Work
