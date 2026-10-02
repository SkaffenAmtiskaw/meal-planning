---
type: roundup
status: idea
blocked-by:
  - "decision needed: the questions under Open Decisions"
confirmed: 2026-09-26
---
# Where It Stands
Kicked off. Next: /decide ^status

Kicked off 2026-10-02 from [[Style Decisions]] with the issue that serves [[Calendar Page]].

# Inbox

# Purpose
Style issues anywhere in the app that need a decision before they can be fixed. They're settled together with /decide once the roundup is kicked off, and then their fixes are built together.

## What Belongs Here
Issues on this roundup's topic that still need a decision. An issue on the topic that's already decided can go here too, with its **Decided** line, so the fix is built with the rest. An issue is too big for a roundup, and becomes its own story, if its fix would take more than one implementation step once decided, or if settling it needs a design session in Claude Design, a root-cause investigation or a new convention that code must migrate to.

Visible style anywhere in the app: spacing, alignment, colors, component variants and how Mantine is used to style them. Style fixes that are already decided and stand alone go in [[Style Fixes]]. Code tidy-ups that change nothing visible don't belong here.

# Open Decisions
1. Calendar: the week view has no horizontal padding, so its edges touch the edge of the screen. How much padding, and at which screen sizes? 🎯 [[Calendar Page]]

*This question is from the calendar style fixes list, dated 2026-09-08 and not re-checked.*

# Out of Scope
- Calendar focus states need a design, and the off-screen tab stops in the calendar are a bug. Each gets its own Roadmap line.

# Acceptance Criteria
- [ ] Each decision above is built or explicitly dropped.
- [ ] Every screen a fix touches looks as before, apart from the fix.

# Implementation
