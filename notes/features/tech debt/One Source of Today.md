---
type: 
status: idea
confirmed: 2026-11-01
---
# Where It Stands
Next: /shape ^status

# Notes
"Today" is computed independently in 11 calendar places with `DateTime.now()`. They only run in the browser now, because `PlannerProvider` renders nothing until its `useEffect` has fetched the planner. [[Calendar and Recipes Data Refresh]] Step 2 makes the layout pass the planner as a server prop, so the calendar renders on the server for the first time. The server's time zone can then mark the wrong day or cause a hydration mismatch. Consider one source of "today".

The 11 places, found by grepping `src` on 2026-11-01:
- `src/_components/Calendar/CalendarProvider.tsx:28, 34, 51`
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx:50`
- `src/_components/Calendar/MonthGrid/useMonthGridKeyboard.ts:45`
- `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx:41`
- `src/_components/Calendar/WeekView/WeekView.tsx:46`
- `src/_components/Calendar/WeekView/useWeekViewKeyboard.ts:43`
- `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx:31`
- `src/app/[planner]/calendar/_components/ListView/ListView.tsx:41`
- `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12`

Related: the [[Code Tidy-Ups]] item on `getListDayRange.ts`, whose `today` prop never reaches the day window.

# Questions
