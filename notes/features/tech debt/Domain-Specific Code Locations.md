---
type: pattern
status: idea
blocked-by: []
confirmed: 2026-09-25
---
# Purpose
`src/_components`, `src/_hooks` and `src/_utils` are meant for generic, reusable code with no domain knowledge (see `docs/project_conventions.md`). Some domain-specific code (meals, planners, invites, tags) lives there anyway. This story decides where domain code used across the app should live, likely `src/app/_components` / `src/app/_utils` with an alias. It also spells that out in the project conventions and moves the existing code over.

Originally a Roadmap line: "move domain-specific components/utils used app-wide (e.g. access colors) to `src/app/_components` / `src/app/_utils` with an alias, and spell out in project conventions what goes in each".

# Rules
**Decided 2026-09-26, while planning the `getUserInvites` server-only fix. To land in `docs/project_conventions.md`'s "Generic vs Domain-Specific Utilities" section when this note is implemented; other notes should link there once it does, rather than repeat it:**

A `_`-prefixed directory's contents are scoped for consumption from anywhere within its own parent directory, not just its immediate siblings. `src/_actions/`, `src/_components/`, `src/_hooks/`, `src/_models/`, `src/_theme/` and `src/_utils/` are all `_`-prefixed children of `src/`, so each is consumable from anywhere in `src/`. A domain folder inside one of them (e.g. `_actions/sharing/`) isn't itself `_`-prefixed, so it inherits that same `src/`-wide scope - a plain file there is exactly as available to a component or a page as to another action. Only another `_`-prefixed directory nested inside it (e.g. `_actions/sharing/_utils/`) introduces a new, tighter scope: consumable only from within that domain folder, not from elsewhere in `src/` or even a different domain.

So a function's home isn't found by computing "the lowest common parent of all its consumers" as a one-off calculation - it's found by checking which enclosing `_`-prefixed directory's scope already covers every consumer. A function consumed from elsewhere in `src/` belongs as a plain file in its domain folder, the same as any other action. It only moves into a nested `_utils/` when its real consumers are narrower than that: limited to sibling files inside the same domain folder. A function that doesn't fit any domain folder's scope at all doesn't belong under `_actions` at all - it moves to `app/` or a new src-level directory (with its own alias), never into the generic `src/_utils/`, which stays reserved for utilities with no domain knowledge.

%% Still to decide with Sarah. Starting questions: what counts as "domain-specific"; where app-wide domain code goes versus code used by one route; what the alias is. %%

# Enforcement
%% Required. A candidate: a lint or import-boundary rule that stops `src/_components`, `src/_hooks` and `src/_utils` from importing `@/_actions`, `@/_models` or `@/app/**`. To decide. %%

# Migration Checklist
*Found 2026-09-25 by grepping the generic folders for domain words and for imports of `@/_actions` / `@/_models`. This is a starting list, not a full audit. Re-check before planning.*

## Components in `src/_components` that call server actions
- [ ] `src/_components/TagCombobox.tsx`: imports `addTag` from `@/_actions/library`
- [ ] `src/_components/UserMenu/InviteBadge.tsx`: imports `getUserInvites` and `getUser` from `@/_actions`

> ⚠️ **Check Drift 2026-09-27:** Found while making `getUserInvites` server-only. `InviteBadge.tsx` now imports `getUserInvites` straight from `@/_actions/sharing/getUserInvites`, not the barrel. That's a temporary fix until [[Server-Only Code Behind Barrels]] decides how server-only code is exported, so re-check this line's imports against that story's Rules when planning.

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
