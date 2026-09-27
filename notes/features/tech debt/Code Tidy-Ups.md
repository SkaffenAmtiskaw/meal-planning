---
type: sweep
status: idea
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands
Collecting items until you schedule a sweep. ^status

# Purpose
Small code smells anywhere in the app. Each one is small on its own, so they're collected here and handled in one sweep rather than as separate Roadmap lines.

## What Belongs Here
Every item must be small, with zero ambiguity and no open decisions: whoever builds it should never need to ask what to do. An item that still needs a decision doesn't go here. Give it its own Roadmap line until it's decided, then add it.

Tidy-ups to app code that change nothing a user can see or do. Test-only fixes go in [[Unit Test Tidy-Ups]], visible style fixes in [[Style Fixes]] and config changes in [[Dev Tooling Tidy-Ups]].

# Items
*Items are added as they're found. Re-check each one before planning.*

- [ ] `src/app/[planner]/calendar/_components/ListView/_utils/getListDayRange.ts:12` reads `DateTime.now()` itself, so the `today` prop that `ListView` accepts (`ListView.tsx:29, 41`) never reaches the day window. Found by reading code during the [[Unified Date Picker Component]] review, 2026-09-25.
- [ ] `src/app/[planner]/calendar/_components/ListView/_components/DayRow.module.css` L45-77 hold `ListViewAddMealTrigger`'s styles (`.addButton`, `.ghostRow`). `ListViewAddMealTrigger.tsx:6` imports this module, so one component's styles live in another's file. `.ghostRow` also hard-codes `border-radius: 8px` instead of the theme radius. Found by reading code during the [[Unified Date Picker Component]] review, 2026-09-25.
- [ ] `src/_components/Calendar/CalendarProvider.tsx` L37-43 wrap setters that are already stable, and the context value (L62) isn't memoized. Found by reading code during the [[Unified Date Picker Component]] review, 2026-09-25.
- [ ] `src/app/[planner]/calendar/_components/MobileListViewPlaceholder/MobileListViewPlaceholder.tsx:1` has `'use client'` with no hooks or event handlers. [[Mobile List View]] removes the placeholder, so this may resolve itself. Found by reading code during the [[Unified Date Picker Component]] review, 2026-09-25.
- [ ] `src/app/settings/_components/InviteForm.tsx:31` checks the email with a regex. Use `z.email().safeParse(email).success` instead, as `src/_actions/sharing/inviteUser.ts:35` does. Moved from the Roadmap 2026-09-26.
- [ ] `src/_theme/theme.ts:45, 49, 60` hard-code `#1C3144`, `#B1BA95` and `#FFFFFF`. Use `THEME_COLORS.navy` and `THEME_COLORS.sage` from `./colors`, and `theme.white`. (The `#C8C0C3` border and the focus `rgba` stay on the Roadmap: the border has no token yet, and the focus styles never apply.) Moved from the Roadmap 2026-09-26.
- [ ] `src/_theme/theme.ts:1` has `'use client'` with no comment saying why. Add one: the theme holds functions (`variantColorResolver`, the `Input` styles function), which a server component can't pass to `MantineProvider`. Moved from the Roadmap 2026-09-26.
- [ ] Three `.d.ts` files export ordinary types, against the `*.types.ts` convention. Rename them with `git mv` and update their imports: `src/_utils/types.d.ts` → `src/_utils/utility.types.ts` (generic helper types, starting with `Optionalize`); `src/_utils/actionResult/ActionResult.d.ts` → `ActionResult.types.ts`; `src/app/[planner]/calendar/_components/AddMealForm/types.d.ts` → `AddMealForm.types.ts`. Leave the ambient declarations `src/css-modules.d.ts` and `src/mantine.d.ts` alone. [[Shared Types Directory]] may later move `ActionResult` to `src/_types/`; that doesn't change this rename. Moved from the Roadmap 2026-09-26; `utility.types.ts` chosen by Sarah the same day, since `Optionalize` isn't a DTO and stays in `_utils`.

# Out of Scope
- Dead schedule-x code: [[Remove Schedule-X]].
- Duplicated calendar logic (group-by-date, meal color, adapter components, keyboard hooks): separate Roadmap line.

# Acceptance Criteria
- [ ] Each item above is fixed or explicitly dropped.
- [ ] Calendar month, week and list views, jump-to-date, and Add Meal from the list view behave as before.
- [ ] Sending a planner invite, and the app shell header, navbar and inputs, look and work as before.

# Implementation
%% Empty while collecting. When Sarah schedules a sweep, a dated copy is frozen (see Sweeps in Note Conventions) and /plan-steps writes the steps there. %%
