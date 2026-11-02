---
type: bug
status: ready
blocked-by: []
confirmed: 2026-11-01
---
# Where It Stands
Ready. Next: /implement Step 1 ^status

# Inbox

# Symptoms
None yet, since the problem starts when [[Calendar and Recipes Data Refresh]] Step 2 is built. Found by reading code, not by running it. At the end of this story these should not happen:
- [ ] the calendar marks the wrong day as today because of the server's time zone
- [ ] the calendar has a hydration mismatch from reading today on the server and in the browser

# Who Can Hit This
Anyone who loads the calendar, once [[Calendar and Recipes Data Refresh]] Step 2 is built. The wrong day shows when the viewer's day differs from the server's.

# Open Decisions
- How does the calendar get the viewer's day, given that the server doesn't know their time zone?
  - Nothing in the app stores or sends a time zone today. Found by reading code.
  - **Decided 2026-11-01:** the browser saves its time zone in a cookie, and the server reads the cookie to work out the viewer's day, so the calendar is drawn once, at first paint. With no cookie, the server draws nothing, and the calendar stays blank until the browser draws it with its own zone. Sarah's call: it's the design she expected from the start, and a blank moment on a device's first load is fine.
    - Rejected: the calendar waits for the browser on every load, with no cookie - every reload would be blank until JS runs.
    - Rejected: fall back to the server's zone when there's no cookie - it can show the wrong day, and the calendar only needs to wait.
    - Rejected: draw the server's day, then correct it in the browser - it draws the calendar twice and can show the wrong day.
    - Rejected: an inline script that corrects the page before paint - it would have to rebuild a whole month grid with its meals.
    - Rejected: Vercel's `x-vercel-ip-timezone` header - it's based on the IP address, so a VPN moves it, and it isn't the browser's zone.
- What does the calendar do when the time zone cookie is out of date and differs from the browser's zone?
  - **Decided 2026-11-01:** the calendar uses the cookie's zone for that one load. The browser updates the cookie, so the next load is right.
    - Rejected: move the today mark to the browser's day right after the first paint - it needs separate server and browser values in the hook, for the rare viewer who changed time zones on a day when the two differ.
- Does a rule and a lint rule keep new clock calls out of the calendar?
  - **Decided 2026-11-01:** no. Sarah's call: this story only needs to prevent a bug.
    - Rejected: a written rule with a Biome lint plugin - it treats one small utility as a project-wide convention.

# Root Cause
`PlannerProvider` renders nothing until its `useEffect` has fetched the planner, so the calendar only runs in the browser today. [[Calendar and Recipes Data Refresh]] Step 2 makes the layout pass the planner as a server prop, so the calendar renders on the server for the first time. 11 places in the calendar call `DateTime.now()` during render, which on the server reads the server's time zone. Found by reading code.

# Fix
The pieces:
- `useSaveTimeZone`, in `src/app/_hooks/useSaveTimeZone/`, saves the browser's zone in the `timeZone` cookie on each load. A thin `SaveTimeZoneWrapper` component beside it runs it from `src/app/layout.tsx`, which is a server component and can't call a hook. The root layout runs on every page, including sign-in, so the cookie is usually there before the calendar's first request.
- `getCookieTimeZone()`, in `src/app/[planner]/_utils/`, reads the cookie on the server, and returns no zone if it's missing or invalid.
- `TimeZoneProvider`, in `src/_hooks/useToday/` and rendered by `src/app/[planner]/layout.tsx`, hands that zone to client components.
- `useTimeZone()`, in the same directory, returns the provider's zone. With none, it has no zone while the server draws and React hydrates, then returns the browser's own.
- `useToday()`, in the same directory, returns today in that zone.

`CalendarView` (`src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx:101`) draws nothing while `useTimeZone()` has no zone. What the content area shows during that wait belongs to [[Calendar and Recipes Data Refresh]].

These 11 clock calls switch to `useToday()`:
- `src/_components/Calendar/CalendarProvider.tsx:28`
- `src/_components/Calendar/CalendarProvider.tsx:34`
- `src/_components/Calendar/CalendarProvider.tsx:51`
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx:50`
- `src/_components/Calendar/MonthGrid/useMonthGridKeyboard.ts:45`
- `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx:41`
- `src/_components/Calendar/WeekView/WeekView.tsx:46`
- `src/_components/Calendar/WeekView/useWeekViewKeyboard.ts:43`
- `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx:31`
- `src/app/[planner]/calendar/_components/ListView/ListView.tsx:41`: also removes the optional `today` prop (lines 29, 35), which only a test passes.
- `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12`: takes today as an argument, and its one caller (`ListView.tsx:40`) passes it.

These 10 test files move off fake timers or the clock and onto the shared mock in `test/mocks/@/_hooks.ts`, with one exception: `getListDayRange.test.ts` passes today as an argument instead.
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

Not part of this fix:
- Expiry checks that use `new Date()`, such as invites and email changes: they compare moments in time, not calendar days.
- `src/app/[planner]/calendar/_utils/getWeekStart.ts`: only the dead `useWeekNavigation` hook calls it, and [[Remove Schedule-X]] deletes both.
- How the today and selected day marks look: [[Today and Selected Day Markers]].

# Acceptance Criteria
- [ ] With a valid cookie, the calendar's today is the day in the cookie's zone.
- [ ] With a missing or invalid cookie, the server draws nothing from `CalendarView`, and the browser draws it with its own zone.

# Implementation
## Step 1: The browser saves its time zone
**Idea:** The browser saves its time zone in the `timeZone` cookie on each load.

**Source:** Fix: `useSaveTimeZone`, `SaveTimeZoneWrapper`; Open Decisions: the browser saves its time zone in a cookie, and updates an out-of-date one

**Approach:** `useSaveTimeZone` writes `Intl.DateTimeFormat().resolvedOptions().timeZone` to the cookie in a `useEffect`, with the same attributes as `useLastOpenedPlanner` (`path=/; max-age=31536000; SameSite=Lax`). `SaveTimeZoneWrapper` is a thin client component that calls the hook and returns its children, because the root layout is a server component and can't call a hook. The write uses `document.cookie` as `useLastOpenedPlanner` does, so that line and its test's cleanup line each need a `biome-ignore lint/suspicious/noDocumentCookie` comment (Sarah approved both 2026-11-01).

**Files:**
- `src/app/_hooks/useSaveTimeZone/useSaveTimeZone.ts` (new) - writes the cookie
- `src/app/_hooks/useSaveTimeZone/useSaveTimeZone.test.ts` (new) - the cookie holds the browser's zone after mount
- `src/app/_hooks/useSaveTimeZone/SaveTimeZoneWrapper.tsx` (new) - lets the root layout run the hook
- `src/app/_hooks/useSaveTimeZone/SaveTimeZoneWrapper.test.tsx` (new) - coverage only, since it has no logic
- `src/app/_hooks/useSaveTimeZone/index.ts` (new) - barrel, as hook directories have
- `src/app/layout.tsx` - wraps its children in `SaveTimeZoneWrapper`
- `src/app/layout.test.tsx` - covers the wrapper the way it covers `OneTapSignInWrapper`

**Acceptance:**
- [ ] Desktop, signed out, in a new private window: open the app, then DevTools → Application → Cookies → the app's address. `timeZone` holds your zone, such as `America/Denver`. Proves: the cookie is saved before sign-in, ahead of the calendar's first request.
- [ ] Same window: DevTools → More tools → Sensors → Location → Tokyo, then reload. `timeZone` now holds `Asia/Tokyo`. Set Location back to No override. Proves: each load corrects an out-of-date cookie.

## Step 2: The calendar reads today from `useToday()`
**Idea:** Every calendar place reads today from the viewer's zone through `useToday()`.

**Source:** Fix: `getCookieTimeZone()`, `TimeZoneProvider`, `useTimeZone()`, `useToday()`, `CalendarView`, the 11 clock calls, the 10 test files; Symptoms: both; Acceptance Criteria: both; Open Decisions: the server reads the cookie, with no cookie the calendar waits, and an out-of-date cookie lasts one load

**Approach:**
- `getCookieTimeZone()` is `server-only`, reads the cookie with `cookies()` from `next/headers`, and returns `null` if it's missing or `IANAZone.isValidZone` rejects it.
- `[planner]/layout.tsx` passes its result to `TimeZoneProvider`, a client component that holds the zone in context. With no zone, it uses Mantine's `useMounted`: `null` until mounted, then the browser's own zone. Holding this in the provider gives every component the same value, including ones that mount later.
- `useTimeZone()` reads that context.
- `useToday()` returns `DateTime`, not `null`, so each clock call is a one-line swap: `CalendarView` doesn't mount anything below it until `useTimeZone()` has a zone. With no zone it throws, as `useCalendarContext` does outside its provider. It works out the ISO date in that zone, and memoizes the `DateTime` on that date and zone, keeping the zone on it, so the keyboard hooks' effects don't re-run on every render. A page left open past midnight picks up the new day on its next render, as `DateTime.now()` does now.
- `useTimeZone.ts` and `useToday.ts` start with `'use client'`, because a server layout imports them through the `@/_hooks` barrel.
- `CalendarView` returns `null` while `useTimeZone()` is `null`.
- `CalendarProvider` keeps its optional `initialDate`, falling back to `useToday()`. The keyboard hooks pass today to `computeInitialFocusIndex`. `ListView` passes it to `getListDayRange(rangeAnchor, today)` and to `DayRow`, and drops its `today` prop.
- Tests named for the implementer: `CalendarView` renders no content with no zone; with no zone passed, `TimeZoneProvider` gives `null` during `renderToString` and the browser's zone after mount, using the real `useMounted`; with a zone passed, it gives that zone during `renderToString`; `useToday` throws with no zone, and returns the same object for the same day; `getCookieTimeZone` returns no zone for a missing or invalid cookie. The server side can't be seen in the app until [[Calendar and Recipes Data Refresh]] Step 2 draws the calendar on the server, so these tests are its proof.

**Files:**
- `src/app/[planner]/_utils/getCookieTimeZone.ts` (new) - reads the zone from the cookie
- `src/app/[planner]/_utils/getCookieTimeZone.test.ts` (new) - a valid, missing and invalid cookie
- `src/_hooks/useToday/TimeZoneProvider.tsx` (new) - hands the zone to client components
- `src/_hooks/useToday/TimeZoneProvider.test.tsx` (new) - with and without a zone passed, during and after hydration
- `src/_hooks/useToday/useTimeZone.ts` (new) - reads the zone, or none while waiting
- `src/_hooks/useToday/useToday.ts` (new) - today in that zone
- `src/_hooks/useToday/useToday.test.tsx` (new) - the day in the zone, the same object for the same day, and the throw with no zone
- `src/_hooks/useToday/index.ts` (new) - barrel for the directory
- `src/_hooks/index.ts` - exports the directory
- `test/mocks/@/_hooks.ts` - adds `TimeZoneProvider`, `useTimeZone` and `useToday`
- `src/app/[planner]/layout.tsx` - reads the zone, renders `TimeZoneProvider`
- `src/app/[planner]/layout.test.tsx` - covers the new imports
- `src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx` - waits for a zone
- `src/_components/Calendar/CalendarProvider.tsx` - clock calls at lines 28, 34 and 51
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx` - clock call
- `src/_components/Calendar/MonthGrid/useMonthGridKeyboard.ts` - clock call
- `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx` - clock call
- `src/_components/Calendar/WeekView/WeekView.tsx` - clock call
- `src/_components/Calendar/WeekView/useWeekViewKeyboard.ts` - clock call
- `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx` - clock call
- `src/app/[planner]/calendar/_components/ListView/ListView.tsx` - clock call, drops the `today` prop
- `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts` - takes today as an argument
- `src/_components/Calendar/CalendarProvider.test.tsx` - onto the shared mock
- `src/app/[planner]/calendar/_components/CalendarView/CalendarView.test.tsx` - onto the shared mock, covers the wait
- `src/_components/Calendar/MonthGrid/MonthGrid.test.tsx` - onto the shared mock
- `src/_components/Calendar/MonthGrid/useMonthGridKeyboard.test.ts` - onto the shared mock
- `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.test.tsx` - onto the shared mock
- `src/_components/Calendar/WeekView/WeekView.test.tsx` - onto the shared mock
- `src/_components/Calendar/WeekView/useWeekViewKeyboard.test.ts` - onto the shared mock
- `src/_components/Calendar/MobileAgenda/MobileAgenda.test.tsx` - onto the shared mock
- `src/app/[planner]/calendar/_components/ListView/ListView.test.tsx` - onto the shared mock
- `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.test.ts` - passes today as an argument

**Acceptance:**
- [ ] Desktop, signed in as `read`, calendar in month view: today's day number is in an ember circle. Press Tab until focus reaches the grid: it lands on today's cell. Click the next-month arrow twice, then Today: the grid is back on this month, with today marked. Proves: the month grid, its keyboard focus and the Today button still find today.
- [ ] Desktop, same user: switch to week view. Today's column header is an ember badge. Switch to list view: today's row has an ember circle on a tinted row. Proves: week and list views still find today.
- [ ] Phone, same user, calendar in month view: today's cell is marked, and the card beneath the grid is headed `Today · <today's date>`. Proves: the phone month grid and agenda still find today.
- [ ] Desktop, same user, on the calendar: paste this in the DevTools console, and note the two dates: `['Pacific/Kiritimati','Pacific/Pago_Pago'].map(timeZone => new Date().toLocaleDateString('en-CA',{timeZone}))`. In DevTools → Application → Cookies, change `timeZone` to whichever of those zones has a date that isn't today where you are, then reload. The today mark is on that zone's date. Reload again: it's back on your own day. Proves: today comes from the cookie's zone, and an out-of-date cookie lasts one load.
- [ ] Same screen: delete the `timeZone` cookie, then reload. The calendar appears with your own day marked. Change `timeZone` to `Not/AZone`, then reload. The same day is marked. Proves: with a missing or invalid cookie, the calendar still draws, using the browser's zone.
