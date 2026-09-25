---
type: pattern
status: idea
blocked-by: []
reviewed: 2026-09-25
---
# Purpose
`src/_components`, `src/_hooks` and `src/_utils` are meant for generic, reusable code with no domain knowledge (see `.opencode/docs/project_conventions.md`). Some domain-specific code (meals, planners, invites, tags) lives there anyway. This story decides where domain code used across the app should live, likely `src/app/_components` / `src/app/_utils` with an alias. It also spells that out in the project conventions and moves the existing code over.

Originally a Roadmap line: "move domain-specific components/utils used app-wide (e.g. access colors) to `src/app/_components` / `src/app/_utils` with an alias, and spell out in project conventions what goes in each".

# Rules
%% To decide with Sarah. Starting questions: what counts as "domain-specific"; where app-wide domain code goes versus code used by one route; what the alias is. %%

# Enforcement
%% Required. A candidate: a lint or import-boundary rule that stops `src/_components`, `src/_hooks` and `src/_utils` from importing `@/_actions`, `@/_models` or `@/app/**`. To decide. %%

# Migration Checklist
*Found 2026-09-25 by grepping the generic folders for domain words and for imports of `@/_actions` / `@/_models`. This is a starting list, not a full audit. Re-check before planning.*

## Components in `src/_components` that call server actions
- [ ] `src/_components/TagCombobox.tsx`: imports `addTag` from `@/_actions/library`
- [ ] `src/_components/UserMenu/InviteBadge.tsx`: imports `getUserInvites` and `getUser` from `@/_actions`

## Meal-specific code in `src/_components/Calendar`
- [ ] `src/_components/Calendar/_types/CalendarMeal.types.ts`: the meal type
- [ ] `src/_components/Calendar/MealCard/`
- [ ] `src/_components/Calendar/_components/DishListItem/`
- [ ] `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx`: hard-coded meal copy ("1 MEAL" / "N MEALS", "Nothing planned yet")
- [ ] Check whether `MonthGrid`, `MobileMonthGrid`, `WeekView` and their keyboard hooks are generic grids with meal-shaped props, or meal-specific. The grep matched them on "meal" naming.

## Planner-specific code
- [ ] `src/_components/Navbar/PlannerContextSection.tsx` (+ `.module.css`)
- [ ] Check `src/_components/Navbar/Navbar.tsx` and `src/_components/UserMenu/UserMenu.tsx`. The grep matched them on planner / invite naming.

## Already fine (for reference)
- Access level colors (`src/app/settings/_utils/getAccessLevelColor.ts`, `AccessLevelBadge`) are only used under `src/app/settings/`, so they're co-located correctly today. They'd only move if another area starts using them.

# Out of Scope
%% Related problems found along the way that this story won't fix. Each should also be on the Roadmap. %%

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. %%
