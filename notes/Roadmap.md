*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

# Bugfixes/User Issues/Tech Debt
## Calendar Page
- [[✨ Add Meal Changes (Saved Recipes)|User Feedback - Add Meal Changes]]
- [[🛑 Unified Date Picker Component|Date Picker Component]]
- [[Meal Detail Modal & Edit Meals|Edit Meals & Update Meal Detail Modal]]
- [[Stale Data Issues]]
- you should be able to create a meal with just a title and a description (or just a title)
- meal color should be based on hex of title + description
- change segmented control theme to match design from Claude
- Desktop: month view current date circle is truncating numbers
## Recipes Page
- deleting a recipe from the recipe detail page always reports success - `RecipeDetail` ignores the `deleteRecipe` result
## Planner Settings
- [[Zero Planners Crash|root page crashes for users with zero planners (e.g. invited user leaves or is removed from their only planner)]]
## Tech Debt
- [[Modal Form Architecture|refactor all modal forms to separate presentation and data concerns]]
# High-Priority

## Observability
- Add Sentry for logging
- Add PostHog for analytics
- Add a feedback button
## Calendar Page
- [[Mobile List View]]
- edit meals
- delete meals
- add meals by clicking month cell
- add meals by clicking week day
- default to week view on desktop - list view on mobile
- calendar list view infinite scroll
## Planner Settings
- [[Delete Planner|allow user to delete a planner]]
- [[Transfer Ownership of Planner|transfer ownership of planner]]
## Misc
- [[features/style fixes|style fixes]]
- [[Email Improvements|email improvements]]
- [[Cleanup|fix deprecated Zod types - replace `z.string().email()` with `z.email()` and audit for other deprecated patterns]]
# Medium Priority

## Sign In Improvements
- add passkey sign in
- add Apple SSO
## UX Improvements
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app
- [[Filtering Recipe List|allow filtering in recipe list]]
- batch delete meals
- batch delete recipes/bookmarks
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too
- [[🧠 DND|move meals to different days (drag and drop) & reorder meals within days]]
- add images to recipes
- group ingredients when adding/editing a recipe
- when adding/editing a recipe, make the instructions expand if you type more than a line
- skip to content
- [[Keyboard Shortcuts|keyboard shortcuts]]
## Misc
- [[Tag Management|tag management - edit/delete]] (should live under planner settings)
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it?
- could we get rid of mongoose and use zod + mongodb on its own? what does mongoose get us?
- a11y audit
- security - string validation on inputs
- audit app works fully in mobile
- switch all types files to `*.types.ts` - `*.types.d.ts` is awful

# Low Priority
## Dev Tooling
- enable dependabot
- e2e tests
- disable biome a11y checks on unit test mocks

## Misc
- let user set avatar
- email formatting
- audit code for client component surface area - move as much as possible to server components
- add different import order sorting for `.test.ts(x)` - vitest and react/testing-library should be at the top
- toggle light/dark mode
# Undecided
- [[Link SSO Login to Email|Link SSO to Email Login]]
- Allow user to change meal color in calendar

# Blocked
- [[Granular Webfetch Permissions|Update OpenCode agents webfetch permissions]]