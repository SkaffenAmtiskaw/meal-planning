*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

## How this file works
- **Now** - in progress. Keep this to 2-3 items.
- **Next** - the queue, in order. The top item is the next one to plan or build.
- **Blocked** - committed, but waiting on something. The reason matches the note's `blocked-by`.
- **Later** - committed, not ordered, grouped by area.
- **Ideas** - not committed.
- A story's status (`idea` / `spec` / `ready` / `in-progress` / `done`) lives in its note's frontmatter. This file only decides order.
- *(was high)* etc. is the item's priority under the old High / Medium / Low layout, kept for reference while the queue is being ordered. *(was bugfix)* means it was in the old "Bugfixes/User Issues/Tech Debt" section.

# Hubs
- [[Meal Editing]] - every story that edits, moves, duplicates, deletes or reorders meals, with open decisions. Includes [[Meal Detail Modal & Edit Meals]] (blocked on [[Unified Date Picker Component]]), mobile delete, batch delete, [[DND]], and the mobile agenda Edit / Move to… buttons.

# Now
- [[Unit Testing - Clean Up Mocks]] - remaining: a few straggler files in `@/_actions`, `@/_models` and `@mantine/hooks`; `@/_components` and `@/_utils` not started

# Next
*Ordered 2026-09-25. All four are `spec`, so "next" means next to get implementation steps (via `architect`), then build.*
1. [[Stale Data Issues]] - spec. Unblocks [[Add Meal Changes (Saved Recipes)]] and [[Mobile List View]]; every meal-editing mutation should follow its pattern. *(was bugfix)*
2. [[Unified Date Picker Component]] - spec. Unblocks [[Meal Detail Modal & Edit Meals]]. *(was high)*
3. [[Remove Schedule-X]] - spec. Has an open decision on where shared types live, which overlaps [[Shared Types Directory]]. *(was bugfix)*
4. [[Shared Types Directory]] - spec, last reviewed April. May move up or fold into [[Remove Schedule-X]] depending on where that story puts the shared types.

# Blocked
- [[Add Meal Changes (Saved Recipes)|User Feedback - Add Meal Changes]] - ready. Waiting on [[Stale Data Issues]]. *(was bugfix)*
- [[Mobile List View]] - ready. Waiting on re-review of Steps 2 and 5, and on [[Stale Data Issues]]. *(was high)*
- [[Zero Planners Crash|root page crashes for users with zero planners (e.g. invited user leaves or is removed from their only planner)]] - spec. Waiting on your decision on which fix to use (deferred 2026-09-25). *(was bugfix)*
- [[Delete Planner|allow user to delete a planner]] - idea. Waiting on the [[Zero Planners Crash]] decision. *(was high)*
- [[Keyboard Shortcuts|keyboard shortcuts]] - spec. Out of date; re-review once the calendar views are mostly complete. *(was medium)*
- calendar list view keyboard navigation - needs design review once the calendar views are mostly complete (see Step 16 in [[Replace Schedule-X]])
- [[features/calendar/Style Fixes|calendar style fixes]] - idea. Do after the calendar header is aligned across all views.
- [[Granular Webfetch Permissions|Update OpenCode agents webfetch permissions]] - idea. Waiting on an OpenCode release.

# Later
## Calendar
- you should be able to create a meal with just a title and a description (or just a title) *(was bugfix)*
- meal color should be based on hex of title + description *(was bugfix)*
- change segmented control theme to match design from Claude *(was bugfix)*
- Desktop: month view current date circle is truncating numbers - check whether [[Unified Date Picker Component]] covers this, since it realigns every "today" indicator *(was bugfix)*
- add meals by clicking month cell *(was high)*
- add meals by clicking week day *(was high)*
- default to week view on desktop - list view on mobile *(was high)*
- calendar list view infinite scroll *(was high)*
- clicking "+N more" in the month grid switches to list view at that day - approach needs review (see Step 17 in [[Replace Schedule-X]])

## Recipes
- deleting a recipe from the recipe detail page always reports success - `RecipeDetail` ignores the `deleteRecipe` result *(was bugfix)*
- [[Filtering Recipe List|allow filtering in recipe list]] *(was medium)*
- batch delete recipes/bookmarks *(was medium)*
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too *(was medium)*
- add images to recipes *(was medium)*
- group ingredients when adding/editing a recipe *(was medium)*
- when adding/editing a recipe, make the instructions expand if you type more than a line *(was medium)*

## Planner Settings
- [[Transfer Ownership of Planner|transfer ownership of planner]] *(was high)*
- [[Tag Management|tag management - edit/delete]] - wishlist; nothing depends on it. Spec last reviewed April - tag creation with palette cycling already exists (`TagCombobox` → `addTag`), so reconcile before planning. *(was medium)*

## Sign In & Account
- add passkey sign in *(was medium)*
- add Apple SSO *(was medium)*
- let user set avatar *(was low)*

## Observability
- Add Sentry for logging *(was high)*
- Add PostHog for analytics *(was high)*
- Add a feedback button *(was high)*

## App-Wide UX & Quality
- [[features/style fixes|style fixes]] *(was high)*
- [[Email Improvements|email improvements]] *(was high)*
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app *(was medium)*
- skip to content *(was medium)*
- a11y audit *(was medium)*
- security - string validation on inputs *(was medium)*
- audit app works fully in mobile *(was medium)*
- toggle light/dark mode *(was low)*

## Tech Debt
- [[Modal Form Architecture|refactor all modal forms to separate presentation and data concerns]] *(was bugfix)*
- rename "event" to "meal" in calendar code (`CalendarEvent`, `toCalendarEvents`, `MealEventCard`)
- `ConfirmButton` does nothing when `useAsyncStatus` hits an actual exception - seems incorrect?
- `InviteSettings.tsx` - if the user is undefined, shouldn't it render nothing? (shouldn't the user always be defined in settings?)
- `InviteForm.tsx` - uses an email regex instead of a zod type check
- replace the async hook with a native React hook
- replace date utils with luxon
- route management - emails create paths & query params the app must consume, but nothing keeps them in sync
- move domain-specific components/utils used app-wide (e.g. access colors) to `src/app/_components` / `src/app/_utils` with an alias, and spell out in project conventions what goes in each
- switch all types files to `*.types.ts` - `*.types.d.ts` is awful *(was medium)*
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it? *(was medium)*
- could we get rid of mongoose and use zod + mongodb on its own? what does mongoose get us? *(was medium)*
- audit code for client component surface area - move as much as possible to server components *(was low)*

## Dev Tooling & Testing
- switch testing library to `vitest-browser-react`
- enable dependabot *(was low)*
- e2e tests *(was low)*
- disable biome a11y checks on unit test mocks *(was low)*
- add different import order sorting for `.test.ts(x)` - vitest and react/testing-library should be at the top *(was low)*

# Ideas
- [[Grocery List Integration]]
- [[Link SSO Login to Email|Link SSO to Email Login]] *(was undecided)*
- Allow user to change meal color in calendar *(was undecided)*
