---
type: sweep
status: spec
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Kicked off. Next: /check-drift ^status

Kicked off 2026-10-02 from [[Style Fixes]] with the item that serves [[Calendar Page]].

# Inbox

# Purpose
Small visual style fixes anywhere in the app. Each one is too small for its own story, so they're collected here and handled in one sweep. Style fixes that still need a decision go in the [[Style Decisions]] roundup.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Visible style fixes anywhere in the app (spacing, alignment, colors, component variants) where the target look is already decided. Code tidy-ups that change nothing visible don't belong here.

# Items
- [ ] Restyle `SegmentedControl` to match the archived [[Add Meal UX Changes]] handoff (`archive/assets/dish-row-states.png`, `add-meal-desktop.png`): a white active pill on a light grey track, the active label in navy, and inactive labels in forest. In `src/_theme/theme.ts:104-108`, remove `color: 'forest'` so Mantine's default white indicator and grey track show. Then set the label colors with Styles API `classNames` in a CSS module in `src/_theme/` (like `focus.module.css`): `label` forest, `label[data-active]` navy. Never use the lightest ramp step, which fails the handoff's 4.5:1 contrast rule. In `docs/theme.md:42`, replace "SegmentedControl active state (white text on forest green)" with the new look. Applies to `ViewSwitcher.tsx:16` and `CalendarHeader.tsx:78, 158`. The Add Meal modal's control is being removed by another story. Moved from the Roadmap 2026-09-26. 🎯 [[Calendar Page]]

# Out of Scope
- Style fixes that still need a decision: [[Style Decisions]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Every screen an item touches looks as before, apart from the fix.

# Implementation
