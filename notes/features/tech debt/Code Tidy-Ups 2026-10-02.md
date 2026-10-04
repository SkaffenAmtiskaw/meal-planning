---
type: sweep
status: spec
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands
Kicked off. Next: /check-drift ^status

Kicked off 2026-10-02 from [[Code Tidy-Ups]] with the item that serves [[Calendar Page]].

# Inbox

# Purpose
Small code smells anywhere in the app. Each one is small on its own, so they're collected here and handled in one sweep rather than as separate Roadmap lines.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Tidy-ups to app code that change nothing a user can see or do. Test-only fixes go in [[Unit Test Tidy-Ups]], visible style fixes in [[Style Fixes]] and config changes in [[Dev Tooling Tidy-Ups]].

# Items
*Items are added as they're found. Re-check each one before planning.*

- [ ] `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12` reads `DateTime.now()` itself, so the `today` prop that `ListView` accepts (`ListView.tsx:29, 41`) never reaches the day window. Found by reading code during the [[Unified Date Picker Component]] review, 2026-09-25. 🎯 [[Calendar Page]]

# Out of Scope
- Dead schedule-x code: [[Remove Schedule-X]].
- Duplicated calendar logic (group-by-date, meal color, adapter components, keyboard hooks): separate Roadmap line.

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Calendar month, week and list views, jump-to-date, and Add Meal from the list view behave as before.

# Implementation
