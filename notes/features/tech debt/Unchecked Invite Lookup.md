---
type: bug
status: done
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands

Reviewed. Next: /close ^status

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
Drop `'use server'` from `getUserInvites` and add `import 'server-only'` instead. It reads and shapes sharing-domain data the same way `getPendingInvites` and `getPlannerMembers` already do, so it's grouped with them and stays at `src/_actions/sharing/getUserInvites.ts` rather than moving to a `_utils/` folder the way [[Server-Only Creation and Pure Reads]] moves `addPlanner`/`addUser` - that pattern is for helpers consumed only by sibling action files, not a first-class read like this one. `'use server'` is what makes a file's exports callable Server Actions, so dropping it (with nothing else needing to change) already satisfies "no longer exported from any `'use server'` file." The browser then can't call it at all, and `server-only` turns any future client import into a build error instead of a silent hole. Nothing blocks this: no client code calls it.

The open "not yet verified" / "to verify" items above (Symptoms, Who Can Hit This) don't change this fix - removing the server action closes the hole no matter how those turn out. Sarah's OK treating them as background noise; `/plan-steps` doesn't need them resolved first.

**Tests and shared mocks:** This story owns the mock clean-up for the test files it changes:
- Every test file it rewrites or moves uses the centralized mock in `test/mocks/` for any module that has one (`vi.mock('<module>', async () => await import('@mocks/...'))`), not an ad-hoc factory, per `.opencode/docs/unit_tests.md`.
- When it moves, renames or reshapes an export of `@/_actions` or `@/_models`, it updates the matching `test/mocks/@/_actions/*.ts` or `test/mocks/@/_models/*.ts` in the same step.
- If another story already did this for a file, there's nothing more to do.

Known files as of 2026-09-26 (re-checked while planning): `getUserInvites` stays at its current path and in the barrel, so only its own test needs the mock swap - no other file changes.
- `src/_actions/sharing/getUserInvites.test.ts` (`@/_models/user`, `@/_models/planner`, `@/_models/sharing` line 16)
- add `find` to `PendingInvite` in `test/mocks/@/_models/sharing.ts`

# Acceptance Criteria
- [ ] `getUserInvites` is no longer exported from any `'use server'` file.
- [ ] These are unchanged:
  - the user menu invite indicator for a user with pending invites
  - the Pending Invites list in User Settings
  - accepting and declining an invite from that list

# Implementation

## Step 1: `getUserInvites` stops being a server action
**Idea:** `getUserInvites` drops `'use server'` and gets a `'server-only'` guard instead, so the browser can no longer call it and a build error catches any future client import.

**Source:** Fix; Acceptance Criteria (both bullets); Tests and shared mocks

**Approach:** `getUserInvites` reads and shapes sharing-domain data (invites, planner names, inviter names) the same way `getPendingInvites` and `getPlannerMembers` already do in this folder, so it's logically grouped with the sharing actions and stays put - it doesn't need the `_utils/` treatment `removePlannerMembership` gets, since that's for helpers consumed only by sibling action files, not a first-class read like this one. `'use server'` is what turns every export in a file into a callable Server Action; removing it and nothing else already satisfies "no longer exported from any `'use server'` file." Adding `import 'server-only'` closes the hole for good - the build fails if anything, now or later, pulls it into a client bundle - instead of relying on "no client code happens to import it today." Both callers (`InviteBadge.tsx`, `InvitesSettings.tsx`) already call it exactly as before; nothing about them changes. While in `getUserInvites.test.ts`, its mocks are also brought up to the centralized-mock convention (Boy Scout rule - leave a touched file a little cleaner than you found it), which is why the `PendingInvite` mock needs `find` added.

**Files:**
- `src/_actions/sharing/getUserInvites.ts` - drop `'use server'`; add `import 'server-only';`
- `src/_actions/sharing/getUserInvites.test.ts` - Boy Scouting while in this file: swap its ad-hoc `@/_models/user`, `@/_models/planner` and `@/_models/sharing` mocks for the centralized ones (`@mocks/@/_models/...`), per `.opencode/docs/unit_tests.md`. `@/_utils/serialize` has no centralized mock, so its ad-hoc mock stays.
- `test/mocks/@/_models/sharing.ts` - Boy Scouting: add `find: vi.fn()` to `PendingInvite` (only `findOne`, `create`, `deleteOne` exist today), needed by the mock swap above

**Acceptance (all "same as before"):**
- [x] Sign in as a user with at least one pending invite. The user menu shows the invite badge with the same count as before.
- [x] Go to Settings, on a phone and on desktop. The Pending Invites list shows the same invites as before.
- [x] Accept one invite. It disappears from the Pending Invites list with no error shown, same as before.
- [x] Decline another invite. It disappears from the list too, same as before.

**Status:** ✅ Complete

**As built:**
- **Out of the barrel (temporary fix):** `getUserInvites` was taken out of the `@/_actions/sharing` barrel (`index.ts`). Eight client components import that barrel, so with the `server-only` guard in place `pnpm build` failed ("'server-only' cannot be imported from a Client Component module"). The barrel was also pulling the file's mongoose models into client bundles. `InviteBadge.tsx` and `InvitesSettings.tsx` now import `@/_actions/sharing/getUserInvites` directly. This is meant to be temporary until a reusable fix for server-only code reached through a barrel is decided.
- **Types:** `UserInvite` and `GetUserInvitesResult` moved into `invite.types.ts`, which stays in the barrel, so the client `InvitesSection` still imports `UserInvite` from `@/_actions/sharing`.
- **Mocks:** the `getUserInvites` stub moved from `test/mocks/@/_actions/sharing.ts` to `test/mocks/@/_actions/sharing/getUserInvites.ts`, to match the new import path. `InviteBadge.test.tsx` and `InvitesSettings.test.tsx` use it.
- **Cleanup:** the `@/_utils/serialize` mock, identical in six sharing action tests, was centralized as `test/mocks/@/_utils/serialize.ts`.
