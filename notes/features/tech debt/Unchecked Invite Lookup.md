---
type: bug
status: spec
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands

Next: /plan-steps. ^status

# ⚠️ Security Concern
**Anyone who knows a person's email may be able to fetch all of that person's pending invites, including the invite tokens, by calling a server action. No session check stops them.** Invite tokens are what the accept and sign-up-with-invite flows use to join a planner, so a leaked token may let someone else take the invite. This is an authorization hole, not a code-tidiness issue.

**If the planned fix changes or is delayed, the hole must still be closed some other way**, for example by ignoring the passed-in email and using the signed-in user's email from the session. Don't close or archive this note until no `'use server'` export returns invite tokens for an email the caller hasn't proven they own.

Found while planning [[Stale Data Issues]] on 2026-09-25.

# Symptoms
Found by reading code on 2026-09-25. **Not reproduced in the running app.**
- `getUserInvites(email)` in `src/_actions/sharing/getUserInvites.ts` is exported from a `'use server'` file, which makes it a server action the browser can call.
- It returns every pending invite for the given email: planner name, inviter, access level, dates and `token`. The only check is that `email` isn't empty.
- Not yet verified: what a caller can actually do with a leaked token, i.e. whether `acceptInvite` or `signUpWithInvite` also require the caller's email to match the invite.

# Who Can Hit This
- Anyone who knows or guesses the email of someone with a pending invite.
- Possibly signed-out users: nothing in the function checks for a session.
- To verify: no client component imports `getUserInvites` today, so its action id may not ship in client JavaScript, which may make it harder to call from a browser. Nothing guarantees that stays true.

# Root Cause
- `src/_actions/sharing/getUserInvites.ts` starts with `'use server'` and trusts the `email` argument.
- Both callers are server code that already has the signed-in user:
  - `src/_components/UserMenu/InviteBadge.tsx` (`server-only`)
  - `src/app/settings/_components/InvitesSettings.tsx` (server component)
- So it doesn't need to be a server action.

# Fix
Move `getUserInvites` out of `'use server'` into a server-only utility, as [[Server-Only Creation and Pure Reads]] does for `addPlanner` / `addUser`. The browser then can't call it at all. Nothing blocks this: no client code calls it.

**Tests and shared mocks:** *Added 2026-09-26: hand-off from [[Unit Testing - Clean Up Mocks]], decided by Sarah on 2026-09-25.* This story owns the mock clean-up for the test files it changes:
- Every test file it rewrites or moves uses the centralized mock in `test/mocks/` for any module that has one (`vi.mock('<module>', async () => await import('@mocks/...'))`), not an ad-hoc factory, per `.opencode/docs/unit_tests.md`.
- When it moves, renames or reshapes an export of `@/_actions` or `@/_models`, it updates the matching `test/mocks/@/_actions/*.ts` or `test/mocks/@/_models/*.ts` in the same step.
- If another story already did this for a file, there's nothing more to do.

Known files as of 2026-09-25 (found by reading code; re-check when planning):
- `src/_actions/sharing/getUserInvites.test.ts` (`@/_models/user`, `@/_models/planner`, `@/_models/sharing` line 16)
- add `find` to `PendingInvite` in `test/mocks/@/_models/sharing.ts`
- `test/mocks/@/_actions/sharing.ts` stops exporting `getUserInvites`; `InviteBadge` and `InvitesSettings` tests mock the new path

# Acceptance Criteria
- [ ] `getUserInvites` is no longer exported from any `'use server'` file.
- [ ] These are unchanged:
  - the user menu invite indicator for a user with pending invites
  - the Pending Invites list in User Settings
  - accepting and declining an invite from that list

# Implementation
%% A small bug may need only one step, but it still goes here so it can be reviewed. Once it exists, set status to `ready`. %%
