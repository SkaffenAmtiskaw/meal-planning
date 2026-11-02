---
type: pattern
status: spec
blocked-by: []
confirmed: 2026-11-01
---
# Where It Stands
Rules approved. Next: /plan-steps ^status

# Inbox

# Purpose
"Today" is computed independently in 11 calendar places with `DateTime.now()`. They only run in the browser now, because `PlannerProvider` renders nothing until its `useEffect` has fetched the planner. [[Calendar and Recipes Data Refresh]] Step 2 makes the layout pass the planner as a server prop, so the calendar renders on the server for the first time. The server's time zone can then mark the wrong day or cause a hydration mismatch. Consider one source of "today".

# Symptoms
None yet, since the problem starts when [[Calendar and Recipes Data Refresh]] Step 2 is built. Found by reading code, not by running it. At the end of this story these should not happen:
- [ ] the calendar marks the wrong day as today because of the server's time zone
- [ ] the calendar has a hydration mismatch from reading today on the server and in the browser

# Open Decisions
- How does the calendar get the viewer's day, given that the server doesn't know their time zone?
  - Nothing in the app stores or sends a time zone today. Found by reading code.
  - [[Calendar and Recipes Data Refresh]] Step 2's last check says the calendar is there as soon as the page paints, with no empty content area first. If the day is only known in the browser, the calendar may not be able to pass that check as written.
  - **Decided 2026-11-01:** the browser saves its time zone in a cookie, and the server reads the cookie to work out the viewer's day. With no cookie, the browser works out the day, and the calendar waits until it has. Sarah's call: it's the standard way websites handle this.
    - Rejected: browser only, with no cookie - every reload would wait for JS, and a cookie avoids that for returning viewers.
    - Rejected: draw the server's day, then correct it in the browser - it draws the calendar twice and can show the wrong day.
    - Rejected: an inline script that corrects the page before paint - it would have to rebuild a whole month grid with its meals.
    - Rejected: Vercel's `x-vercel-ip-timezone` header - it's based on the IP address, so a VPN moves it, and it isn't the browser's zone.
- What does the calendar do when the time zone cookie is out of date and the server draws a different day from the browser's?
  - **Decided 2026-11-01:** right after the first paint, the today mark moves to the browser's day. The selected date stays on the old day for that load, and the browser updates the cookie, so the next load is right.
    - Rejected: move the selected date too - it needs an extra piece that fires once after load, so it doesn't also move the selected date for a page left open past midnight.

# Rules
## Rule 1 - One reader of the clock
Today comes from `useToday()`, never from the clock. Outside `src/_utils/today/`, no non-test file calls `DateTime.now()`, or `DateTime.local()` with no arguments.
- **Check:** search a file for those two calls. Any match outside `src/_utils/today/` breaks the rule.
- **Breaks it:** `src/_components/Calendar/MonthGrid/MonthGrid.tsx:50`, and `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12` for a plain function.
- **Lands in:** a new "Today" section in `docs/project_conventions.md`.

## Rule 2 - Today is the browser's day
"Today" means the calendar day in the viewer's browser time zone. `src/_utils/today/` works out today only from the browser's zone or from the cookie the browser saved. It doesn't use a zone saved on the planner or account, a request header such as `x-vercel-ip-timezone`, or the server's own zone.
- **Check:** read `src/_utils/today/`. Every value it returns as today uses only the browser's default zone or the cookie's value.
- **Lands in:** the "Today" section of `docs/project_conventions.md`.

# Enforcement
- **Rule 1 - a Biome lint rule.** A `.grit` plugin, loaded through an override in `biome.jsonc`, flags `DateTime.now()` and no-argument `DateTime.local()` as errors, except in `src/_utils/today/` and test files. Pre-commit and `pnpm lint:ci` catch it. A type can't, because the call is valid in Luxon's own types. It goes in once the migration is done, because it fails on the old calls until then. Sarah asked for this `biome.jsonc` edit on 2026-11-01.
- **Rule 2 - unit tests on the module.** Tests in `src/_utils/today/` check that `getServerToday()` returns the day in the cookie's zone, including when that differs from the server's own day, and returns no day when the cookie is missing or invalid. Pre-commit and `pnpm test:coverage` catch it. A type or lint rule can't tell which zone a value came from. The tests don't stop a new path in the module using another zone, such as a planner's, so that part relies on the rule in `docs/project_conventions.md`.

# Migration Checklist
## A. Infrastructure
- [ ] `useSaveTimeZone`, run from `src/app/[planner]/layout.tsx`, saves the browser's zone in the `timeZone` cookie on each load.
- [ ] `getServerToday()` works out the day from the cookie, and returns no day if the cookie is missing or invalid.
- [ ] `useToday()` reads the browser's clock, except while React hydrates what the server drew, when it returns the day the server used.
- [ ] `CalendarView` doesn't mount `CalendarProvider` until `useToday()` has a day (`src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx:101`).

## B. Clock Calls
- [ ] `src/_components/Calendar/CalendarProvider.tsx:28`
- [ ] `src/_components/Calendar/CalendarProvider.tsx:34`
- [ ] `src/_components/Calendar/CalendarProvider.tsx:51`
- [ ] `src/_components/Calendar/MonthGrid/MonthGrid.tsx:50`
- [ ] `src/_components/Calendar/MonthGrid/useMonthGridKeyboard.ts:45`
- [ ] `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx:41`
- [ ] `src/_components/Calendar/WeekView/WeekView.tsx:46`
- [ ] `src/_components/Calendar/WeekView/useWeekViewKeyboard.ts:43`
- [ ] `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx:31`
- [ ] `src/app/[planner]/calendar/_components/ListView/ListView.tsx:41`: also removes the optional `today` prop (lines 29, 35), which only a test passes.
- [ ] `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12`: takes today as an argument, and its one caller (`ListView.tsx:40`) passes it.

## C. Tests
- [ ] A shared mock for the module, in `test/mocks/@/_utils/`.
- [ ] These 10 test files move off fake timers or the clock and onto that mock, with one exception: `getListDayRange.test.ts` passes today as an argument instead.
  - `CalendarProvider.test.tsx`
  - `CalendarView.test.tsx`
  - `MonthGrid.test.tsx`
  - `useMonthGridKeyboard.test.ts`
  - `MobileMonthGrid.test.tsx`
  - `WeekView.test.tsx`
  - `useWeekViewKeyboard.test.ts`
  - `MobileAgenda.test.tsx`
  - `ListView.test.tsx`
  - `getListDayRange.test.ts`

## D. Enforcement
- [ ] Rule 1: the Biome `.grit` plugin and its `biome.jsonc` override, added once group B is done.
- [ ] Rule 2: unit tests in `src/_utils/today/`.

## E. Docs
- [ ] Rule 1 in a new "Today" section of `docs/project_conventions.md`.
- [ ] Rule 2 in the same section.

# Out of Scope
- Expiry checks that use `new Date()`, such as invites and email changes: they compare moments in time, not calendar days.
- `src/app/[planner]/calendar/_utils/getWeekStart.ts`: only the dead `useWeekNavigation` hook calls it, and [[Remove Schedule-X]] deletes both.
- How the today and selected day marks look: [[Today and Selected Day Markers]].
- What the content area shows while the calendar waits for a day: [[Calendar and Recipes Data Refresh]].

# Implementation
