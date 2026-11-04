---
type: tweak
status: ready
blocked-by: []
confirmed: 2026-11-03
---
# Where It Stands
Next: /implement ^status

Change which view the calendar opens on, with no blocker. If this is built before [[Mobile List View]], phones open on its "Coming soon" placeholder on `develop` until it lands. Both stories ship in the [[Calendar Page]] release.

# Inbox

# Purpose
Default to week view on desktop and list view on mobile. Today the calendar opens on Month for everyone.

This covers only the view the calendar opens on. It doesn't remember the last view someone picked, and it doesn't change what each view shows or which views the switcher offers.

# Acceptance Criteria
- [ ] On desktop, the calendar opens on Week.
- [ ] On a phone, the calendar opens on List.
- [ ] A tablet counts as desktop and opens on Week, using the existing `useIsMobile` breakpoint.
- [ ] The view switcher still changes the view on desktop and on phones.
