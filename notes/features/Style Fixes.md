---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
Small visual style fixes anywhere in the app. Each one is too small for its own story, so they're collected here and handled in one sweep. Style fixes that still need a decision wait in [[Style Decisions]] and join this list once decided.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Visible style fixes anywhere in the app (spacing, alignment, colors, component variants) where the target look is already decided. Code tidy-ups that change nothing visible don't belong here.

# Items
%% Add each item as an unchecked box. Say which file (with line numbers), exactly what changes, and how and when it was found, e.g. "found by reading code while planning [[Note]], 2026-09-26". Items go stale, so /check-drift re-checks every one when a sweep is scheduled. If an item can't be done until another story lands, start it with `**Blocked by [[Story]]:**`. Block the item, never the whole sweep. Blocked items stay here when a sweep is frozen and roll over to the next one. %%
- [ ] **Blocked by [[Header Date Picker]]:** the calendar header's prev/next buttons don't line up vertically with the period label. Header Date Picker rebuilds this row, so check whether it still happens once that lands. From the calendar style fixes list (2026-09-08), not re-checked.
- [ ] Restyle `SegmentedControl` to match the archived [[Add Meal UX Changes]] handoff (`archive/assets/dish-row-states.png`, `add-meal-desktop.png`): a white active pill on a light grey track, the active label in navy, and inactive labels in forest. In `src/_theme/theme.ts:104-108`, remove `color: 'forest'` so Mantine's default white indicator and grey track show. Then set the label colors with Styles API `classNames` in a CSS module in `src/_theme/` (like `focus.module.css`): `label` forest, `label[data-active]` navy. Never use the lightest ramp step, which fails the handoff's 4.5:1 contrast rule. In `.opencode/docs/theme.md:42`, replace "SegmentedControl active state (white text on forest green)" with the new look. Applies to `ViewSwitcher.tsx:16` and `CalendarHeader.tsx:78, 158`. The Add Meal modal's control is being removed by another story. Moved from the Roadmap 2026-09-26.

# Out of Scope
- Style fixes that still need a decision: [[Style Decisions]].

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Every screen an item touches looks as before, apart from the fix.

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
