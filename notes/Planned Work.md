*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

# High-Priority
## Calendar Page
- [[Render Week View|render week view]]
- [[Render List View|render list view]]
- [[Render Month Agenda View (Mobile)|render (or verify) meals in month agenda view (mobile)]]
- add meals by clicking month cell
- add meals by clicking week day
- work through adding meals on mobile (get rid of the header button and add a FAB maybe?)
- edit meals
- delete meals
- default to week view on desktop - list view on mobile
- style updates - remove left border from events
## Planner Settings
- add planner settings
- [[Multiple Planners|allow user to have multiple planners (pre-requisite of inviting other users to shared planner)]]
- allow user to delete a planner
- [[Planner Access Levels|allow users to have access levels to a planner - (owner/admin, write, read)]]
- [[Shared Planners|allow users to invite other users to a shared planner]]

# Medium Priority
## Sign In Improvements
- update Google one-tap sign in - warning in console
- add Apple SSO
- add passkey sign in
## UX Improvements
- [[Filtering Recipe List|allow filtering in recipe list]]
- batch delete meals
- batch delete recipes/bookmarks
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too
- move meals to different days (drag and drop)
- reorder meals within days
- add images to recipes
## Style Improvements
- recipe list style updates
- toggle light/dark mode
- theme colors
## Misc
- tag management - edit/delete (should live under user settings)
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it?
- a11y audit
- security - string validation on inputs
- audit app works fully in mobile

# Low Priority
## Dev Tooling
- enable dependabot
- e2e tests

## Misc
- let user set avatar
- email formatting
- audit code for client component surface area - move as much as possible to server components

# Undecided
- [[Link SSO Login to Email|Link SSO to Email Login]]
- Allow user to change meal color in calendar
