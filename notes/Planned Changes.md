*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

# High-Priority
- [[Filtering Recipe List|allow filtering in recipe list]]
- [[Sign Out|add sign-out]]
- [[Add Email Sign-In|add email sign-in option]]
- [[Reset Password|add reset password flow]]
- render calendar
- [[Add Meal Plan|add meal plan & render meals as events]]
- edit meals
- delete meals
- move meals to different days (drag and drop) & reorder meals within days

# Medium Priority
- batch delete meals
- batch delete recipes/bookmarks
- update Google one-tap sign in
- add Apple SSO
- add passkey sign in
- increase session length
- redirect user to current page after signing in when session expired
- add user settings
- allow user to change their email
- allow user to have multiple planners (pre-requisite of inviting other users to shared planner)
- allow users to invite other users to a shared planner
- allow users to have access levels to a planner - (owner/admin, write, read)
- add planner settings
- tag management - edit/delete (should live under user settings)
- recipe list style updates
- add AI instruction to avoid use of `let` - refactor code that uses it unnecessarily
- investigate mongo/mongoose caching
- add images to recipes
- let user set avatar
- a11y audit

# Low Priority
- enable dependabot
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too
- expandable card view in recipe list
- create e2e tests
- toggle light/dark mode
- confirm if Biome recommended settings are turned on
- theme colors
- audit code for client component surface area - move as much as possible to server components