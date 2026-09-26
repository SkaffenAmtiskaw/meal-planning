---
type: cleanup
status: idea
blocked-by: ["investigate skill (not built yet)"]
confirmed: 2026-09-26
---
# Where It Stands

Blocked until the investigate skill is built, then: investigate - fill in Current State. ^status

Direction: find which calendar meal data shapes still carry schedule-x-driven fields or naming, then reshape them for the custom calendar, including renaming "event" to "meal".

Questions investigate answers as part of its scan:
- Which fields on `CalendarEvent` and the meal types built from it (`CalendarMeal`, `MonthGridMeal`, `WeekViewMeal`, `MobileMonthGridEvent`) exist only because of schedule-x?
- Does `CalendarEvent` need to exist as its own shape, separate from the view-level meal types?
- Do `SerializedDish`, `SerializedMeal`, `SerializedDay` or `SavedItem` carry anything driven by schedule-x?
- Why does `src/app/[planner]/calendar/page.tsx:20-21` need `as unknown as` double casts to turn `planner.calendar` and `planner.saved` into `SerializedDay[]` and `SavedItem[]`? Can the shapes line up so the casts go? (Moved in 2026-09-26 from [[Code Tidy-Ups]], found by reading code 2026-09-25.)

First look (2026-09-26, by reading the two files, not a full audit):
- The four types being moved mirror stored planner data (days → meals → dishes, Mongo `_id`s, date strings), not schedule-x.
- `CalendarEvent` in `src/app/[planner]/calendar/_utils/toCalendarEvents.ts` looks like the carried-over shape. It matches schedule-x's `MealEvent` in `toScheduleXEvents.ts` field for field (`id`, `start`, `end`, `title`, `description`, `dishes`), with string dates in place of `Temporal.PlainDate`. `toCalendarEvents` is `toScheduleXEvents` without Temporal. It still sets `start` and `end` to the same date (a schedule-x all-day event) and renames the meal's `name` to `title`.
- [[Remove Schedule-X]] deletes `MealEvent` and `toScheduleXEvents`. After that, the comparison is only in git history (e.g. commit `52d0189`).

# Purpose
Concern: the custom calendar may be keeping data shapes that only existed to feed schedule-x. `SerializedDish`, `SerializedMeal`, `SerializedDay` and `SavedItem` live in `src/app/[planner]/calendar/_utils/toScheduleXEvents.ts`, a schedule-x-era file, and about 14 live calendar files import them. Audit whether these types, and the calendar code built on them, still carry schedule-x-driven shapes rather than what the custom calendar needs.

This story also takes in the Roadmap item to rename "event" to "meal" in calendar code (`CalendarEvent`, `toCalendarEvents`, `MealEventCard`) (moved in 2026-09-26 by /shape). "Event" is schedule-x's word for a meal, and both changes touch the same files.

Related:
- [[Shared Types Directory]] moves the four types to `src/_types/` (decided 2026-09-26 in [[Remove Schedule-X]]).
- [[Remove Schedule-X]] deletes the rest of the schedule-x code and waits on this audit.

# Current State
%% What exists now, with file paths. Say how it was checked (e.g. "static import scan on 2026-09-25", "grep for X") - cleanup notes go stale quickly, so re-check before planning. %%

# Out of Scope
- Duplicated calendar logic (group-by-date, meal color, the `MealCalendar` / `MealWeekView` adapters, keyboard hooks) - the "calendar duplication" line under Tech Debt on the [[Roadmap]]. It's about duplicated logic, not schedule-x.
- Moving the four shared types to `src/_types/` - [[Shared Types Directory]].
- Deleting schedule-x code, packages and docs - [[Remove Schedule-X]].

# Acceptance Criteria
%% Cleanup rarely adds behavior, so criteria are usually "X no longer exists" plus "these existing flows are unchanged". Name the flows. %%
- [ ] No calendar type, function or component is named "event" (`CalendarEvent`, `toCalendarEvents`, `MealEventCard`)
- [ ] Each schedule-x leftover listed in Current State is reshaped, or kept with a reason recorded here
- [ ] Month, week and list views on desktop and mobile, Add Meal and the meal detail modal behave as before

# Implementation
%% The step plan goes here - then set status to `ready`. %%
