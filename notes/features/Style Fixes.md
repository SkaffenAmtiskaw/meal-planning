---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items. Next: /kickoff when you schedule it ^status

# Inbox

# Purpose
Small visual style fixes anywhere in the app. Each one is too small for its own story, so they're collected here and handled in one sweep. Style fixes that still need a decision go in the [[Style Decisions]] roundup.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Visible style fixes anywhere in the app (spacing, alignment, colors, component variants) where the target look is already decided. Code tidy-ups that change nothing visible don't belong here.

# Items
- [ ] **Blocked by [[Header Date Picker]]:** the calendar header's prev/next buttons don't line up vertically with the period label. Header Date Picker rebuilds this row, so check whether it still happens once that lands. From the calendar style fixes list (2026-09-08), not re-checked. 🎯 [[Calendar Page]]

# Out of Scope
- Style fixes that still need a decision: [[Style Decisions]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Every screen an item touches looks as before, apart from the fix.

# Implementation
