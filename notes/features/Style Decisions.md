---
type: cleanup
status: idea
blocked-by:
  - "decision needed: which uses of Mantine `color` should be a `variant`?"
  - "decision needed: which style do recipe and bookmark links share?"
  - "decision needed: how are read-access and owned planners marked consistently?"
  - "decision needed: which style does the leave planner button use?"
  - "decision needed: how is the Google sign-in button styled Mantine's way?"
  - "decision needed: how much horizontal padding does the week view get?"
confirmed: 2026-09-26
---
# Where It Stands
Waiting on your decisions. Next: /decide ^status

# Purpose
Style fixes that need a decision before they can join the [[Style Fixes]] sweep. /decide works through them. Each answer becomes an item in [[Style Fixes]], and its question here is marked Decided. The note is never built itself. Once every question is decided, it's done.

# Open Decisions
1. Which uses of the Mantine `color` prop should be a `variant` instead? This needs an audit of `color` usage first.
    - Known case: CTA buttons are styled two ways, `variant="cta"` (6 files) vs `color="ember"` (`AddMealButton`, `MobileAddMealButton`, `SubmitButton`, `ChangePasswordForm`). Pick one. (Moved from the Roadmap 2026-09-26.)
2. Recipe list: recipe links and bookmark links are styled differently. Which style should both use?
3. Planner settings: a badge shows on planners where the user has read access, but not on planners they own. How should the two be marked so they're consistent? (The original item asked for a UX review.)
4. Planner settings: the leave planner button is styled differently on read-access planners and owned planners. Which style should both use?
5. Sign-in: `src/app/_components/GoogleButton.css` is a global stylesheet, imported at `SignInFlow.tsx:23`, that overrides Mantine's Button with nine `!important` rules. How should the Google button be styled Mantine's way: Styles API `classNames` in a CSS module, or a custom Button variant?
6. Calendar: the week view has no horizontal padding, so its edges touch the edge of the screen. How much padding, and at which screen sizes?

*Questions 1-5 are from the app-wide style fixes list and question 6 is from the calendar style fixes list, both dated 2026-09-08 and not re-checked.*

# Out of Scope
- Calendar focus states need a design, and the off-screen tab stops in the calendar are a bug. Each gets its own Roadmap line.
