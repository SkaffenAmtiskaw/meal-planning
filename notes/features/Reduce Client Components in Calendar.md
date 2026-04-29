# Reduce Client Components in Calendar

## Goal
Minimize the client-side rendering surface area in the `[planner]/calendar` route.

## Strategy

**Server components** — fetch data directly via `getPlanner` (ensure it's cached so repeated calls in the same request are free). Do not pass data down as props through multiple layers.

**Client components that need reactive/shared state** — use `PlannerContext` (`usePlannerContext`, `usePlannerSavedItems`, etc.). The context is populated client-side via `getPlannerClient` in `PlannerProvider`. Reserve this for components that genuinely need to be client-side rendered (e.g. interactive forms, calendar UI).

**Do not prop-drill** — server components pass data to their direct children only; deeper client components pull from context.

## Current State
- `PlannerProvider` wraps all `[planner]` layout children, fetching planner data client-side via `useEffect`
- `CalendarView`, `AddMealForm`, and `AddMealButton` consume context instead of receiving props

## TODO
- Audit which components under `[planner]/calendar` are currently `'use client'` unnecessarily
- Cache `getPlanner` (investigate Next.js `cache()` or Mongoose-level caching) so server components can call it without extra DB hits per request
- Migrate server-renderable components to call `getPlanner` directly and remove `'use client'` where not needed