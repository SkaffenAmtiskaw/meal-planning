---
type: 
status: idea
confirmed: 2026-09-26
---
# Where It Stands

Next: /shape ^status

# Notes
Concern: the custom calendar may be keeping data shapes that only existed to feed schedule-x. `SerializedDish`, `SerializedMeal`, `SerializedDay` and `SavedItem` live in `src/app/[planner]/calendar/_utils/toScheduleXEvents.ts`, a schedule-x-era file, and about 14 live calendar files import them. Audit whether these types, and the calendar code built on them, still carry schedule-x-driven shapes rather than what the custom calendar needs.

First look (2026-09-26, by reading the two files, not a full audit):
- The four types being moved mirror stored planner data (days → meals → dishes, Mongo `_id`s, date strings), not schedule-x.
- `CalendarEvent` in `src/app/[planner]/calendar/_utils/toCalendarEvents.ts` looks like the carried-over shape. It matches schedule-x's `MealEvent` in `toScheduleXEvents.ts` field for field (`id`, `start`, `end`, `title`, `description`, `dishes`), with string dates in place of `Temporal.PlainDate`. `toCalendarEvents` is `toScheduleXEvents` without Temporal. It still sets `start` and `end` to the same date (a schedule-x all-day event) and renames the meal's `name` to `title`.
- [[Remove Schedule-X]] deletes `MealEvent` and `toScheduleXEvents`. After that, the comparison is only in git history (e.g. commit `52d0189`).
- Overlaps the Roadmap item to rename "event" to "meal" in calendar code (`CalendarEvent`, `toCalendarEvents`, `MealEventCard`).

Related:
- [[Shared Types Directory]] moves these four types to `src/_types/` (decided 2026-09-26 in [[Remove Schedule-X]]).
- [[Remove Schedule-X]] deletes the rest of the schedule-x code and waits on this audit.

# Questions

