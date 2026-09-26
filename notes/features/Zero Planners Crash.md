---
type: bug
status: spec
blocked-by:
  - "decision needed on which fix to use"
confirmed: 2026-09-25
---
A user whose last planner membership is removed ends up with zero planners, and the root page crashes for them. *Found by static reading during [[Stale Data Issues]]; not yet reproduced in the running app.*

## Who Can Hit This
Only users who don't own a planner. Owners can't leave (`leavePlanner` rejects owners), and every normal sign-up creates an owned planner. But users who register through an invite (`signUpWithInvite` → `addUser` with the invited `plannerId`) get **only** the invited planner. That membership can go away two ways:
- the user clicks **Leave Planner** in settings (`leavePlanner`)
- an admin/owner removes them from the planner (`removeMember`)

Once [[Delete Planner]] is implemented, an owner deleting a planner will be a third path for every member of that planner.

## What Happens
1. `removePlannerMembership` `$pull`s the last entry from `user.planners`.
2. `src/app/settings/layout.tsx` sees `planners.length === 0` and redirects to `/`. The leaving user hits this through `router.refresh()`; a removed user hits it on their next settings visit.
3. `src/app/page.tsx` finds an existing `User` document and reads `user.planners[0].planner` on an empty array, which throws a `TypeError`.

Visiting any old `/[planner]/...` URL instead gives a 404 (`checkAuth` → `unauthorized`), so the user has no way back into the app.

## Fix Options (decision needed)
- **Create a fresh planner** for a user with zero planners when they reach `/`, the same way first sign-in does in `app/page.tsx`.
- **Show an empty state** at `/` ("You don't belong to any planners") with a create-planner action.
- **Block the last removal**: `leavePlanner` refuses to remove the user's final membership. This doesn't cover `removeMember` or planner deletion, so it would have to be combined with one of the options above.

Whatever is chosen, `app/page.tsx` and `settings/layout.tsx` should agree on how zero planners is handled, and unit tests should cover the empty `planners` case in both.
