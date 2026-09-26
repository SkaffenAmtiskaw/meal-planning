---
type: pattern
status: spec
blocked-by:
  - "[[Calendar and Recipes Data Refresh]]"
confirmed: 2026-09-25
---
# Where It Stands

Next: /plan-steps. Building waits on [[Calendar and Recipes Data Refresh]]. ^status

# Purpose
Settings still refreshes with `router.refresh()` after each change. It also loads invites, members and the viewer's membership through client hooks, so they appear after a loading state. This story moves every planner, sharing and user mutation onto `defineMutation`, passes settings data down as server props, and takes the verify-email-change write out of render, so Settings follows the data refresh pattern.

Split from [[Stale Data Issues]] on 2026-09-25.

# Open Decisions
- Verify email change: a Route Handler that writes, invalidates and redirects, or a confirm-button action? (Places H: "decide in story".)
- How `invalidates` gets values the input doesn't carry - open in [[Stale Data Issues#Open Decisions]]. Needed before `cancelInvite` and `deleteAccount` are converted.

# Rules
The design lives in [[Stale Data Issues]]. The sections embedded below are part of this note.

![[Stale Data Issues#Confirmed Approach]]

# Enforcement
![[Stale Data Issues#^type-level]]

The conventions meta-test and lefthook command are built in [[Data Rules Enforcement]], once every action is migrated.

# Migration Checklist
## A. Infrastructure
Already built by [[Calendar and Recipes Data Refresh]]: tag registry, `invalidate()`, `defineMutation` (planner access).
- [ ] `defineMutation` — add `access: 'self'` and `access: 'public'`

## B. Mutating Actions → `defineMutation`
All paths relative to `src/_actions/`.

| Action | Invalidates | Notes |
|---|---|---|
| `planner/createPlanner` | `userTags.planners(self)` | |
| `planner/updatePlannerName` | `details(p)` | |
| `sharing/inviteUser` | `invites(p)`, `userTags.invites(email)` | |
| `sharing/cancelInvite` | `invites(p)`, `userTags.invites(email)` | normalize return to `ActionResult` (`{ ok }`, currently `{ success }`) |
| `sharing/acceptInvite` | `userTags.planners(self)`, `userTags.invites(email)`, `invites(p)`, `members(p)` | |
| `sharing/declineInvite` | `userTags.invites(email)`, `invites(p)` | |
| `sharing/updateMemberAccess` | `members(p)`, `userTags.planners(target)` | |
| `sharing/removeMember` | `members(p)`, `userTags.planners(target)` | |
| `sharing/leavePlanner` | `members(p)`, `userTags.planners(self)` | |
| `sharing/signUpWithInvite` | `invites(p)`, `members(p)` | access `'public'` |
| `user/updateUserName` | `userTags.profile(self)` | |
| `user/requestEmailChange` | `userTags.profile(self)` | |
| `user/verifyEmailChangeAndSetPassword` | `userTags.profile(user)` | access `'public'` (token) |
| `user/deleteAccount` | `userTags.profile(self)`, `userTags.planners(self)`, `members(p)` for each membership | |

## E. Client Fetching → Server Props (Rule 2)
- [ ] `src/app/settings/_hooks/useInvites.ts` — load in `PlannerList` (server) and pass down; cancel-invite optimism via `useOptimistic`
- [ ] `src/app/settings/_hooks/usePlannerMembers.ts` — same
- [ ] `src/app/settings/_hooks/useCurrentUserMembership.ts` — same
- [ ] `src/app/settings/_components/MemberListContainer.tsx` — hook `refresh()` usage goes away

## F. `router.refresh()` Removals (Rule 3)
- [ ] `src/app/settings/_components/CreatePlannerForm.tsx`
- [ ] `src/app/settings/_components/useRenamePlanner.ts`
- [ ] `src/app/settings/_components/InvitesSection.tsx` (×2)
- [ ] `src/app/settings/_components/ChangeNameForm.tsx`
- [ ] `src/app/settings/_components/ChangeEmailForm.tsx`
- [ ] `src/app/settings/_components/PlannerItem.tsx`

## H. Writes Outside Server Actions
`updateTag` only works inside Server Actions, so these need resolving:
- [ ] `src/app/verify-email-change/page.tsx` calls `verifyEmailChange` during render — move to a Route Handler that writes, calls `revalidateTag(tag, 'max')`, and redirects, or to a confirm-button action (*decide in story*)
- Exempt: client better-auth calls (`SignInFlow`, `ChangePasswordForm`, `ResetPasswordForm`, `ResendVerificationForm`, sign-out buttons) — followed by navigation, no planner data displayed

## Tests and Shared Mocks
*Added 2026-09-26: hand-off from [[Unit Testing - Clean Up Mocks]], decided by Sarah on 2026-09-25.* This story owns the mock clean-up for the test files it changes:
- Every test file it rewrites or moves uses the centralized mock in `test/mocks/` for any module that has one (`vi.mock('<module>', async () => await import('@mocks/...'))`), not an ad-hoc factory, per `.opencode/docs/unit_tests.md`.
- When it moves, renames or reshapes an export of `@/_actions` or `@/_models`, it updates the matching `test/mocks/@/_actions/*.ts` or `test/mocks/@/_models/*.ts` in the same step.
- If another story already did this for a file, there's nothing more to do.

Known files as of 2026-09-25 (found by reading code; re-check when planning):
- `src/_actions/planner/updatePlannerName.test.ts:12` (`@/_models/planner`)
- `src/_actions/sharing/acceptInvite.test.ts:19,25` (`@/_models/user`, `@/_models/sharing`)
- `src/_actions/sharing/declineInvite.test.ts:10` (`@/_models/sharing`)
- `src/_actions/sharing/removeMember.test.ts:12` (`@/_models/user`)
- `src/_actions/user/updateUserName.test.ts:18` (`@/_models/user`)
- `src/_actions/user/verifyEmailChangeAndSetPassword.test.ts:31` (`@/_models/user`)
- `src/_actions/sharing/signUpWithInvite.test.ts` (`@/_models/sharing`; also in [[Server-Only Creation and Pure Reads]])
- `test/mocks/@/_actions/sharing.ts`: `cancelInvite` returns `{ ok }`, not `{ success: true }`
- `SignInFlow.test.tsx` stays with [[Unit Testing - Clean Up Mocks]].

# Out of Scope
- `addPlanner` / `addUser`, `getPlanners` and `validateInviteToken` writes - [[Server-Only Creation and Pure Reads]].
- Leaving your only planner - [[Zero Planners Crash]].

# Draft Steps (from the split)
> [!warning] For the agent running /plan-steps
> This section is the draft plan saved when [[Stale Data Issues]] was split on 2026-09-25. It replaces `.opencode/scratch/Settings Data Refresh - plan.md`; start from it as that skill's "draft saved by a split". It has not been through plan-checker. **Once the approved plan is written under Implementation, delete this whole section** (heading included).

Note: `notes/features/tech debt/Settings Data Refresh.md` (type: pattern). Step numbers are the original draft's; renumber when planning. "Places A–H" refers to the Migration Checklist sections as they appeared in [[Stale Data Issues]] before the split; this note carries its share of them.


## Step 7: Creating or renaming a planner refreshes from the server
**Idea:** Planner create and rename actions refresh planner lists from inside the server action.

**Source:** Rule 1; Rule 3; Places B: `planner/createPlanner`, `planner/updatePlannerName`; Places F: `CreatePlannerForm.tsx`, `useRenamePlanner.ts`

**Approach:** `defineMutation` gains `access: 'self'` (first consumer: `createPlanner`).

**Files:**
- `src/_actions/_utils/defineMutation.ts` - add `'self'` access
- `src/_actions/planner/createPlanner.ts` - `defineMutation`, invalidates `userTags.planners(self)`
- `src/_actions/planner/updatePlannerName.ts` - `defineMutation`, invalidates `details(p)`
- `src/app/settings/_components/CreatePlannerForm.tsx` - remove `router.refresh()`
- `src/app/settings/_components/useRenamePlanner.ts` - remove `router.refresh()`
- matching tests

**Acceptance:**
- [ ] Desktop: Settings → Planner Settings → create "Weekend". It appears in the list right away. Open any planner: the navbar planner switcher lists "Weekend".
- [ ] As owner, rename "Weekend" to "Weekends". The accordion header updates right away. The navbar shows the new name after opening a planner.
- [ ] Signed out (session expired or in a private window after sign-out), submitting create shows an error instead of creating a planner.

## Step 10: Settings sharing actions refresh from the server
**Idea:** The invite and member-management actions declare their tags through `defineMutation`.

**Source:** Rule 1; Places B: `sharing/inviteUser`, `sharing/cancelInvite` (normalize return to `ActionResult`), `sharing/updateMemberAccess`, `sharing/removeMember`

**Approach:** Convert the four actions. `cancelInvite` returns `{ ok }` instead of `{ success }`, and `useInvites` reads `ok`. The hooks keep their own refresh until Steps 11–12 replace them. *Open question: `invalidates` needs values the input doesn't carry (the invite's email for `cancelInvite`; the target user for member changes).*

**Files:**
- `src/_actions/sharing/inviteUser.ts` - `defineMutation`, invalidates `invites(p)`, `userTags.invites(email)`
- `src/_actions/sharing/cancelInvite.ts` - same tags; `ActionResult` return
- `src/_actions/sharing/updateMemberAccess.ts` - invalidates `members(p)`, `userTags.planners(target)`
- `src/_actions/sharing/removeMember.ts` - same
- `src/app/settings/_hooks/useInvites.ts` - read `ok` from `cancelInvite`
- matching tests

**Acceptance:**
- [ ] Desktop, owner: invite a new email. It appears under Pending Invites, same as before.
- [ ] Cancel that invite. It disappears, same as before.
- [ ] Two tabs: cancel the same invite in both. The second tab shows "Invite not found" and puts the invite back in its list, same as before.
- [ ] Change a member from read to write. The badge updates. Remove a member. They disappear, same as before.

## Step 11: Pending invites come from server props
**Idea:** `PlannerList` loads each planner's pending invites on the server instead of `useInvites` fetching them in the browser.

**Source:** Rule 2 (incl. `useOptimistic`); Places E: `useInvites.ts`

**Approach:** `PlannerList` (server) loads pending invites for planners the user can manage and passes them to `PlannerItem`. Cancel uses `useOptimistic`. `useInvites.ts` is removed once nothing uses it.

**Files:**
- `src/app/settings/_components/PlannerList.tsx` - load pending invites per manageable planner
- `src/app/settings/_components/PlannerItem.tsx` - take invites as a prop; invite/cancel with `useOptimistic`
- `src/app/settings/_hooks/useInvites.ts` (+ test) - removed
- matching tests

**Acceptance:**
- [ ] Desktop, owner with one pending invite: open the planner's accordion. The invite is listed immediately, with no loading state.
- [ ] Invite another email. It appears in the list.
- [ ] Cancel an invite. It disappears immediately.
- [ ] Two tabs: cancel the same invite in both. The second tab shows the error and the invite reappears there until the page updates.
- [ ] Read or write user: the accordion shows only "You have … access", same as before.

## Step 12: Planner members come from server props
**Idea:** `PlannerList` loads each planner's members and the viewer's membership on the server instead of client hooks.

**Source:** Rule 2; Places E: `usePlannerMembers.ts`, `useCurrentUserMembership.ts`, `MemberListContainer.tsx`

**Files:**
- `src/app/settings/_components/PlannerList.tsx` - load members and the viewer's email/owner flag
- `src/app/settings/_components/PlannerItem.tsx` - pass them down
- `src/app/settings/_components/MemberListContainer.tsx` - props instead of hooks; its `refresh()` goes away
- `src/app/settings/_hooks/usePlannerMembers.ts`, `useCurrentUserMembership.ts` (+ tests) - removed
- matching tests

**Acceptance:**
- [ ] Desktop, owner: open a planner's accordion. Members show immediately, with no "Loading members..." text.
- [ ] Change a member's access. The badge updates. Remove a member. They disappear.
- [ ] Admin (not owner): sees the same member controls as before.

## Step 13: Accepting, declining or leaving a planner refreshes from the server
**Idea:** The current user's own membership actions refresh settings from inside the server action.

**Source:** Rule 1; Rule 3; Places B: `sharing/acceptInvite`, `sharing/declineInvite`, `sharing/leavePlanner`; Places F: `InvitesSection.tsx` (×2), `PlannerItem.tsx`

**Files:**
- `src/_actions/sharing/acceptInvite.ts` - `defineMutation`, invalidates `userTags.planners(self)`, `userTags.invites(email)`, `invites(p)`, `members(p)`
- `src/_actions/sharing/declineInvite.ts` - `userTags.invites(email)`, `invites(p)`
- `src/_actions/sharing/leavePlanner.ts` - `members(p)`, `userTags.planners(self)`
- `src/app/settings/_components/InvitesSection.tsx` - remove both `router.refresh()`
- `src/app/settings/_components/PlannerItem.tsx` - remove `router.refresh()`
- matching tests

**Acceptance:**
- [ ] Desktop, user B with two pending invites (so B also has another planner): the user menu shows the invite indicator. Settings → accept one. It leaves Pending Invites, the planner appears under Planner Settings, and the indicator stays for the remaining invite.
- [ ] Decline the other. It disappears, and the user menu indicator goes away.
- [ ] Leave the planner B just joined (B still has another planner). It disappears from Planner Settings. Don't test leaving your only planner; that's [[Zero Planners Crash]].
- [ ] Owner A reloads Settings in another browser. B is listed after the accept and gone after the leave.

## Step 14: Signing up through an invite is a public mutation
**Idea:** `signUpWithInvite` becomes a `defineMutation` with public access.

**Source:** Rule 1; Places B: `sharing/signUpWithInvite`

**Approach:** `defineMutation` gains `access: 'public'`.

**Files:**
- `src/_actions/_utils/defineMutation.ts` - add `'public'` access
- `src/_actions/sharing/signUpWithInvite.ts` - `defineMutation`, invalidates `invites(p)`, `members(p)`
- matching tests

**Acceptance:**
- [ ] Signed out: open an invite link for a new email and register. You land in the invited planner. The owner reloads Settings: the new member is listed and the invite is gone.
- [ ] Open an invite link whose invite was cancelled. The invalid-link message shows, same as before.

## Step 15: Profile changes refresh from the server
**Idea:** The user's own profile actions invalidate the profile tag from inside the server action.

**Source:** Rule 1; Rule 3; Places B: `user/updateUserName`, `user/requestEmailChange`, `user/verifyEmailChangeAndSetPassword`; Places F: `ChangeNameForm.tsx`, `ChangeEmailForm.tsx`

**Files:**
- `src/_actions/user/updateUserName.ts` - `defineMutation` (`'self'`), invalidates `userTags.profile(self)`
- `src/_actions/user/requestEmailChange.ts` - same
- `src/_actions/user/verifyEmailChangeAndSetPassword.ts` - `defineMutation` (`'public'`), invalidates `userTags.profile(user)`
- `src/app/settings/_components/ChangeNameForm.tsx` - remove `router.refresh()`
- `src/app/settings/_components/ChangeEmailForm.tsx` - remove `router.refresh()`
- matching tests

**Acceptance:**
- [ ] Desktop: Settings → change name. The field shows the new name right away and still does after a reload.
- [ ] Request an email change. The pending-change notice with the new email appears without a reload.
- [ ] Google-only account: open the email-change link → set a password → submit. The success message shows, and signing in with the new email and password works.

## Step 16: Verifying an email change no longer writes during render
**Idea:** The verify-email-change page's write moves out of render into *(decision: a Route Handler, or a confirm-button action)*.

**Source:** Places H: `verify-email-change/page.tsx` calls `verifyEmailChange` during render

**Approach:** *Places H marks this "decide in story", so it's an open question.* Route Handler: writes, calls `revalidateTag(tag, 'max')`, redirects. Confirm button: a `'public'` `defineMutation`.

**Files:** depend on the decision; `src/app/verify-email-change/page.tsx`, `src/_actions/user/verifyEmailChange.ts` (+ tests) either way.

**Acceptance:**
- [ ] Password account: request an email change, open the link *(click Confirm if the button is chosen)*. "Email updated" shows. Settings shows the new email.
- [ ] Open the same link again. The expired message shows.
- [ ] Open an expired link. The expired message shows, and the email is unchanged.

## Step 18: Deleting an account declares what it invalidates
**Idea:** `deleteAccount` becomes a `defineMutation` that invalidates the user's profile, memberships and each planner's member list.

**Source:** Rule 1; Places B: `user/deleteAccount`

**Files:**
- `src/_actions/user/deleteAccount.ts` - `defineMutation` (`'self'`), invalidates `profile`, `planners`, `members(p)` per membership
- `src/app/settings/_components/DeleteAccountForm.tsx` - only if the call shape changes
- matching tests

**Acceptance:**
- [ ] User B (member of A's planner): Settings → Danger Zone → delete. B is signed out and lands on the sign-in page, same as before.
- [ ] Owner A reloads Settings. B is no longer listed.

**Open questions for /plan-steps** (also in Open Decisions):
- Verify email change: Route Handler vs confirm button (Step 16) - note's Open Decisions.
- `invalidates` signature for values the input doesn't carry (Steps 10, 18) - hub [[Stale Data Issues#Open Decisions]].

# Implementation
%% Leave empty until the Rules and Migration Checklist are confirmed. The step plan goes here - then set status to `ready`. Steps should be small enough to review one at a time. %%
