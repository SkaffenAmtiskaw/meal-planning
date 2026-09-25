---
type: cleanup
status: spec
reviewed: 2026-09-25
---
# Purpose
The custom calendar has replaced schedule-x in every view (see [[Replace Schedule-X]]), but schedule-x code, types and packages are still in the repo. This story removes them completely.

Live calendar code still imports shared types from a schedule-x-era file, so the types must be moved before the dead code can be deleted cleanly.

# Current State
*Found by static import analysis on 2026-09-25. "Unused" means no non-test file imports it. Confirm with `pnpm check:types` and the test suite before deleting anything.*

## Shared types still in use
`src/app/[planner]/calendar/_utils/toScheduleXEvents.ts` exports `SerializedDish`, `SerializedMeal`, `SerializedDay` and `SavedItem`. About 14 live files import these types from it (e.g. `page.tsx`, `CalendarView`, `AddMealForm`, `MealDetailModal`, `toCalendarEvents`, `resolveDishSource`, `DishLink`). The file's `toScheduleXEvents` function and `MealEvent` type are only used by dead code and tests.

## Apparently unused code
- `_hooks/useScheduleXSync.ts` → `_utils/getScheduleXViewId.ts`
- `_hooks/useWeekNavigation.ts` → `_utils/getWeekStart.ts`
- `_components/MonthGridEvent/`
- `_components/WeekView/` (the old app-level week view: `WeekView.tsx`, `WeekMealCard.tsx`, `index.ts`) - the live week view is `MealWeekView` + `src/_components/Calendar/WeekView`
- `_components/WeekViewHeader/` → `_components/ViewSwitcher/` → `_hooks/useViewType.ts`
- `_components/CalendarView/CalendarView.module.css` - schedule-x theme variables and a today-badge style, with hard-coded hex colors. No file imports it. *(Added 2026-09-25 from the [[Unified Date Picker Component]] code review.)*

All paths are relative to `src/app/[planner]/calendar/`. Each has a test file that goes with it.

## Config and dependencies
- `src/app/layout.tsx` imports `@schedule-x/theme-default/dist/index.css`
- `package.json`: `@schedule-x/calendar`, `@schedule-x/events-service`, `@schedule-x/react`, `@schedule-x/theme-default`
- `temporal-polyfill` (+ its global import in `layout.tsx`) appears to exist only for schedule-x - the only other `Temporal` users are the dead files above and `toScheduleXEvents.ts`. Confirm nothing else needs it before removing.

## Docs
*(Added 2026-09-25 from the [[Unified Date Picker Component]] plan check.)* `.opencode/docs/theme.md` still documents schedule-x. It's the only file in `.opencode/docs/` that mentions it:
- L6: the Calendar line says the calendar is `schedule-x` with separate CSS variable theming. Update it to describe the custom calendar.
- L73-90: the `## Schedule-x calendar theming` section, including `--sx-color-today-bg: rgba(255, 101, 66, 0.08); /* faint ember tint */`. Delete it.
- L123 (dark mode): "schedule-x CSS variables will need a separate `[data-mantine-color-scheme="dark"]` block". Drop that clause.

[[Today and Selected Day Markers]] Step 8 edits theme.md's ember rule (ember is for actions only; today is a navy ring). Keep that edit when removing these sections.

# Open Decision
Where do the shared types (`SerializedDish`, `SerializedMeal`, `SerializedDay`, `SavedItem`) move to? They are DTOs for serialized planner data, which overlaps with [[Shared Types Directory]] (not yet built). Options include a calendar-local `_types/` directory or waiting for / doing the shared `src/_types/` directory first.

# Out of Scope
- Renaming "event" to "meal" in calendar code (`CalendarEvent`, `toCalendarEvents`, `MealEventCard`) - separate Roadmap item, kept out so this change stays small to review
- List view keyboard navigation and the month grid "+N more" → list view behavior - separate Roadmap items

# Acceptance Criteria
- [ ] No file in `src` imports from `toScheduleXEvents.ts`, and the file is deleted
- [ ] All unused files listed above (and their tests) are deleted
- [ ] No `@schedule-x` imports or packages remain; `temporal-polyfill` removed if confirmed unused
- [ ] `.opencode/docs/theme.md` no longer mentions schedule-x
- [ ] `pnpm check:types`, `pnpm test`, `pnpm lint` and `pnpm build` pass
- [ ] Month, week and list views work on desktop and mobile with no visual regressions (schedule-x's CSS no longer loads)
