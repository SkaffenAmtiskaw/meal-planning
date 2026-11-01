---
type: pattern
status: idea
blocked-by: []
confirmed: 2026-11-01
---
# Where It Stands
Decisions made. Next: /architect ^status

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
  - **Decided 2026-11-01:** the browser saves its time zone in a cookie, and the server reads the cookie to work out the viewer's day. With no cookie, the browser works out the day, and the calendar shows a skeleton until it has. Any other flash of content also gets a skeleton, not a workaround. Sarah's call: it's the standard way websites handle this.
    - Rejected: browser only, with no cookie - every reload would wait for JS, and a cookie avoids that for returning viewers.
    - Rejected: draw the server's day, then correct it in the browser - it draws the calendar twice and can show the wrong day.
    - Rejected: an inline script that corrects the page before paint - it would have to rebuild a whole month grid with its meals.
    - Rejected: Vercel's `x-vercel-ip-timezone` header - it's based on the IP address, so a VPN moves it, and it isn't the browser's zone.

# Rules
Sarah agreed these while shaping, 2026-11-01:
- "Today" means the day in the viewer's browser time zone, not a time zone saved on the planner or account.
- `CalendarProvider`'s starting selected date is part of the problem, not only the today markers.
- Fixing a page left open past midnight isn't a goal, but the story must not make it worse. Today, each re-render picks up the new day.

# Enforcement

# Migration Checklist
The 11 places, found by grepping `src` on 2026-11-01:
- `src/_components/Calendar/CalendarProvider.tsx:28, 34, 51`
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx:50`
- `src/_components/Calendar/MonthGrid/useMonthGridKeyboard.ts:45`
- `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx:41`
- `src/_components/Calendar/WeekView/WeekView.tsx:46`
- `src/_components/Calendar/WeekView/useWeekViewKeyboard.ts:43`
- `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx:31`
- `src/app/[planner]/calendar/_components/ListView/ListView.tsx:41`
- `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12`: reads `DateTime.now()` itself, so the `today` prop that `ListView` accepts (`ListView.tsx:29, 41`) never reaches the day window. Moved from [[Code Tidy-Ups]] 2026-11-01.

# Out of Scope
- Expiry checks that use `new Date()`, such as invites and email changes: they compare moments in time, not calendar days.
- `src/app/[planner]/calendar/_utils/getWeekStart.ts`: only the dead `useWeekNavigation` hook calls it, and [[Remove Schedule-X]] deletes both.
- How the today and selected day marks look: [[Today and Selected Day Markers]].

# Implementation
