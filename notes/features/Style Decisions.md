---
type: roundup
status: idea
blocked-by: []
confirmed: 2026-09-26
---
# Where It Stands
Collecting issues. Next: /kickoff when you schedule it ^status

# Inbox

# Purpose
Style issues anywhere in the app that need a decision before they can be fixed. They're settled together with /decide once the roundup is kicked off, and then their fixes are built together.

## What Belongs Here
Issues on this roundup's topic that still need a decision. An issue on the topic that's already decided can go here too, with its **Decided** line, so the fix is built with the rest. An issue is too big for a roundup, and becomes its own story, if its fix would take more than one implementation step once decided, or if settling it needs a design session in Claude Design, a root-cause investigation or a new convention that code must migrate to.

Visible style anywhere in the app: spacing, alignment, colors, component variants and how Mantine is used to style them. Style fixes that are already decided and stand alone go in [[Style Fixes]]. Code tidy-ups that change nothing visible don't belong here.

# Open Decisions
1. Which uses of the Mantine `color` prop should be a `variant` instead? This needs an audit of `color` usage first.
    - Known case: CTA buttons are styled two ways, `variant="cta"` (6 files) vs `color="ember"` (`AddMealButton`, `MobileAddMealButton`, `SubmitButton`, `ChangePasswordForm`). Pick one. (Moved from the Roadmap 2026-09-26.)
2. Recipe list: recipe links and bookmark links are styled differently. Which style should both use?
3. Planner settings: a badge shows on planners where the user has read access, but not on planners they own. How should the two be marked so they're consistent? (The original item asked for a UX review.)
4. Planner settings: the leave planner button is styled differently on read-access planners and owned planners. Which style should both use?
5. Sign-in: `src/app/_components/GoogleButton.css` is a global stylesheet, imported at `SignInFlow.tsx:23`, that overrides Mantine's Button with nine `!important` rules. How should the Google button be styled Mantine's way: Styles API `classNames` in a CSS module, or a custom Button variant?

*These questions are from the app-wide style fixes list, dated 2026-09-08 and not re-checked.*

# Out of Scope
- Calendar focus states need a design, and the off-screen tab stops in the calendar are a bug. Each gets its own Roadmap line.

# Acceptance Criteria
- [ ] Each decision above is built or explicitly dropped.
- [ ] Every screen a fix touches looks as before, apart from the fix.

# Implementation
