---
type: 
status: idea
confirmed: 2026-11-01
---
# Where It Stands
Next: /shape ^status

# Notes
Move existing code to follow the "Hooks and Their Supporting Components" convention that [[Docs Updates]] adds to `docs/project_conventions.md`. A component that exists only to support a hook lives with that hook, in a directory named after the hook inside a `_hooks` directory. The `_hooks` directory sits in the lowest common parent of the modules that use the hook. Other hooks built on the same context go in that directory too. Found 2026-11-01 during `/plan-steps` on [[One Source of Today]], whose new files already follow it.

Code to move, with its tests and barrel files:
- `src/app/[planner]/_components/PlannerContext/` (context, provider, `usePlannerContext`, `useCanWrite`)
- `src/app/[planner]/_components/ToggleContext/` (context, provider, `useToggleContext`)
- `src/app/[planner]/calendar/_components/CalendarModal/` (context with its hook, provider)
- `src/_components/Calendar/CalendarContext.tsx` and `CalendarProvider.tsx`
- `src/_hooks/useOneTap.ts` and `src/_components/OneTapSignInWrapper.tsx`

The ad-hoc mocks of `usePlannerContext`, `useCanWrite` and `useCalendarContext` change their import paths too. See [[Unit Testing - New Centralized Mocks]].

`CalendarContext` and `CalendarProvider` are used in `src/_components/Calendar/` and in `src/app/[planner]/calendar/_components/`, so their lowest common parent is `src/`. That would put a calendar hook in the generic `src/_hooks/`, and [[Domain-Specific Code Locations]] decides where domain code used across the app lives.

# Questions
