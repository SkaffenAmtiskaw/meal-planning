---
type: cleanup
status: idea
blocked-by: []
confirmed: 2026-09-25
---
# Purpose
A handful of small smells in the calendar code. The code-critic review for [[Unified Date Picker Component]] turned them up, but that story doesn't need them fixed. Each one is small on its own, so they're collected here rather than as separate Roadmap lines.

# Current State
*Found 2026-09-25 by reading code during the Unified Date Picker review, not verified in the running app. Re-check before planning.*

- [ ] `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12` reads `DateTime.now()` itself, so the `today` prop that `ListView` accepts (`ListView.tsx:29, 41`) never reaches the day window.
- [ ] `src/app/[planner]/calendar/_components/ListView/_components/DayRow.module.css` L45-77 hold `ListViewAddMealTrigger`'s styles (`.addButton`, `.ghostRow`). `ListViewAddMealTrigger.tsx:6` imports this module, so one component's styles live in another's file. `.ghostRow` also hard-codes `border-radius: 8px` instead of the theme radius.
- [ ] `src/app/[planner]/calendar/page.tsx:20-21` uses `as unknown as` double casts for `calendar` and `savedItems`.
- [ ] `src/_components/Calendar/CalendarProvider.tsx` L37-43 wrap setters that are already stable, and the context value (L62) isn't memoized.
- [ ] `src/_components/Calendar/_utils/formatCalendarLabel.ts` holds view display names and default view order as well as the title formatters. The file name only describes the last. Moving the first two into a views config would fix that.
- [ ] `src/app/[planner]/calendar/_components/MobileListViewPlaceholder/MobileListViewPlaceholder.tsx:1` has `'use client'` with no hooks or event handlers. [[Mobile List View]] removes the placeholder, so this may resolve itself.

# Out of Scope
- Dead schedule-x code: [[Remove Schedule-X]].
- Duplicated calendar logic (group-by-date, meal color, adapter components, keyboard hooks): separate Roadmap line.

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Calendar month, week and list views, jump-to-date, and Add Meal from the list view behave as before.

# Implementation
%% The step plan goes here - then set status to `ready`. %%
