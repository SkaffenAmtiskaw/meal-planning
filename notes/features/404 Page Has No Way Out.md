---
type: 
status: idea
confirmed: 2026-11-02
---
# Where It Stands
Next: /shape ^status

# Notes
The app's 404 is Next's default page, with no links or buttons, so a user who reaches it has no way back into the app. A user sees it when they open a planner they've lost access to, even if they still have other planners (`src/app/[planner]/layout.tsx:26` calls `notFound()`), and `src/app` has no `not-found.tsx`.

Seen in the running app 2026-11-02, while reproducing [[Zero Planners Crash]].

Sarah decided 2026-11-02 that the solution is adding a page with a button to go home. `/` already sends each user to the right place: the sign-in prompt, or their last opened planner.

# Questions
