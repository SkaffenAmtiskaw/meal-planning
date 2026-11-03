---
type: tweak
status: idea
blocked-by: ["decision needed: how the Google button is styled Mantine's way"]
confirmed: 2026-09-26
---
# Where It Stands
Next: /decide ^status

# Inbox

# Purpose
On the sign-in page, `src/app/_components/GoogleButton.css` is a global stylesheet, imported at `SignInFlow.tsx:23`, that overrides Mantine's Button with nine `!important` rules. From the app-wide style fixes list dated 2026-09-08, not re-checked.

# Open Decisions
1. How should the Google button be styled Mantine's way: Styles API `classNames` in a CSS module, or a custom Button variant?

# Acceptance Criteria
