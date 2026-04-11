*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.
# Refactors
- should emails be moved from `_auth/`?
# High-Priority

## Style Improvements
- recipe list style updates
- [[Style Fixes|fixes]]
## Calendar Page
- [[Render Calendar List View|render list view]]
- [[Render Month Agenda View (Mobile)|render (or verify) meals in month agenda view (mobile)]]
- [[Replace Calendar Header|replace header]]
- add meals by clicking month cell
- add meals by clicking week day
- work through adding meals on mobile (get rid of the header button and add a FAB maybe?)
- edit meals
- delete meals
- default to week view on desktop - list view on mobile
- styling fixes to calendar view
- [[Reduce Client Components in Calendar|reduce client components in calendar]]
## Planner Settings
- [[Shared Planners|allow users to invite other users to a shared planner]]
- allow user to delete a planner

# Medium Priority

## Sign In Improvements
- update Google one-tap sign in - warning in console
- add Apple SSO
- add passkey sign in
## UX Improvements
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app
- [[Filtering Recipe List|allow filtering in recipe list]]
- batch delete meals
- batch delete recipes/bookmarks
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too
- move meals to different days (drag and drop)
- reorder meals within days
- add images to recipes
- group ingredients when adding/editing a recipe
- when adding/editing a recipe, make the instructions expand if you type more than a line
- skip to content
- keyboard shortcuts
## Misc
- [[Tag Management|tag management - edit/delete]] (should live under planner settings)
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it?
- a11y audit
- security - string validation on inputs
- audit app works fully in mobile

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
- toggle light/dark mode - make sure schedule-x corresponds to it

# Undecided
- [[Link SSO Login to Email|Link SSO to Email Login]]
- Allow user to change meal color in calendar
