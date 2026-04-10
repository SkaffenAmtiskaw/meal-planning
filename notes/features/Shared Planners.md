**This work must be planned out so each step can be verified.**

1. A user should invite a user (by email) from the planner settings page/modal.
2. They should also be able to view a list of pending invites, and cancel them.
3. Once accepted, the user should able to view a list of users on the planner, and change their permissions. _Note: There should be some sort of help text for the user indicating what permissions each access level gives a user. Maybe a tooltip?_
4. Invited users will be added at the lowest access level (read-only) - the owner can then change it.
5. When the email belongs to a pre-existing user, that user should get an email, but also see a notification of some sort when they log into the app. The notification should have a link to the settings page. They should have a list of pending invites in their user settings where they can confirm or reject the invite.
6. When the email belongs to someone who is not a pre-existing user, they should receive an email inviting them to create an account. Once they have done so they will be automatically added to the planner.
7. If the owner of a shared planner deletes their email, ownership should be transferred to the user with the next highest access.

## Decisions

- **Member management UI**: Expandable planner items in the "Planner Settings" tab of `/settings`. Expandable only for `owner` and `admin`. Non-owner members see a "Leave planner" option instead.
- **In-app notifications**: Badge/dot on the user avatar (in the header `UserMenu`) + dedicated "Invites" section in User Settings.
- **Data model**: `User.planners` is the single source of truth — no `Planner.members` added. Add a MongoDB index on `planners.planner` for efficient member queries. `PendingInvite` is a standalone model.
- **Ownership transfer on deletion**: Warn the owner, let them pick a recipient before confirming account deletion. Owners cannot leave a planner — they must transfer ownership (or delete the planner if sole member) before leaving.
- **Settings access**: All users retain access to `/settings` regardless of planner role — needed for user management and to leave planners.

## Completion Criteria Per Step

After each step, before moving on:
1. `pnpm lint` passes
2. `pnpm test` passes (with 100% coverage)
3. Security review — verify no new attack surfaces: auth checks on all server actions, no unauthorized data exposure, tokens are unguessable and expiry-enforced, invite acceptance validates ownership
4. User signs off on manual review

## Implementation Plan

### Step 1 — Pass `accessLevel` through `PlannerContext`
The layout already fetches auth via `checkAuth`. Extend `PlannerContext` to include the current user's `accessLevel` for the active planner. The layout fetches the user's membership and passes `accessLevel` through `PlannerProvider`.

**Verify:** Add a temporary `console.log` in a client component (e.g. `AddMealButton`) to confirm access level logs correctly.

---

### Step 2 — Hide write controls for `read` users
Using `accessLevel` from context, conditionally hide:
- Add Meal button
- Add/Edit/Delete Recipe and Bookmark controls

**Verify:** Manually set your own access level to `read` in MongoDB, navigate to the planner, confirm all write controls disappear.

---

### Step 3 — `getPlannerMembers` server action + index
- Add a Mongoose index on `planners.planner` in the `User` schema
- Create `getPlannerMembers(plannerId)` — queries `User.find({ 'planners.planner': id })` and returns `{ userId, name, email, accessLevel }[]`

**Verify:** Call `getPlannerMembers` from the settings page and log the result. Confirm you see yourself listed as `owner`.

---

### Step 4 — Expandable `PlannerItem` with member list + Leave planner
Update `getPlanners()` to return `{ planner, accessLevel }[]`. Pass `accessLevel` to `PlannerItem`.
- `owner` / `admin`: show an expand toggle. When expanded, render a `PlannerMembers` list (names + access levels).
- Non-owner members (`write` / `read`): show a "Leave planner" button. Triggers `removeMember` for the current user. (No expansion.)

**Verify:** Open Planner Settings. Expand an owned planner — confirm you see yourself as `owner`. Confirm non-owner planners have no expand toggle but show a Leave button.

---

### Step 5 — Change a member's access level
In the expanded member list, each member row has a dropdown to change `accessLevel`. Owners cannot be downgraded; there must always be at least one `owner`.

Server action: `updateMemberAccess(plannerId, memberId, newLevel)` — updates `User.planners` for the target user.

**Verify:** Add a second test account with `write` access (directly in DB). Open settings, expand the planner, change their access to `read`, verify it persists and they can no longer add meals.

---

### Step 6 — Remove a member
Each member row gets a remove button (for `owner`/`admin`). Owners cannot remove themselves via this flow.

Server action: `removeMember(plannerId, memberId)` — pulls the membership from `User.planners`.

**Verify:** Add a second test user in DB, remove them from the planner, verify they get a 404 when navigating to the planner URL.

---

### Step 7 — `PendingInvite` model
New Mongoose model + Zod types:
`{ email, planner: ObjectId, accessLevel, token, expiresAt }`

No UI yet — just the model and types.

**Verify:** The model imports without errors and `pnpm build` passes.

---

### Step 8 — Invite UI + send invite to existing user
- In the expanded `PlannerItem`, below the member list: email input + "Invite" button + list of pending invites with cancel
- Server action: `inviteUser(plannerId, email)` — checks that the email isn't already a member or has a pending invite, creates `PendingInvite`, sends invite email via Resend with an accept link
- Server action: `cancelInvite(inviteId)` — deletes the pending invite

**Verify:** Invite a real email address you control. Confirm the invite appears in the pending list. Confirm you receive the email. Cancel the invite, confirm it disappears.

---

### Step 9 — In-app notification badge + Invites section in User Settings
- On page load, fetch count of pending invites for the current user by their email
- Show a badge/dot on the user avatar in `UserMenu` if count > 0
- Add an "Invites" section in User Settings listing pending invites (`{ plannerName, invitedBy, accessLevel }`)

**Verify:** Log in as the invited user. Confirm the badge appears on the avatar. Navigate to User Settings, confirm the invite is listed there.

---

### Step 10 — Accept / decline invite
- Accept and decline buttons on each invite in the Invites section
- Server action: `acceptInvite(inviteId)` — validates invite (not expired), adds `{ planner, accessLevel }` to `User.planners`, deletes the invite
- Server action: `declineInvite(inviteId)` — deletes invite without adding to planner

**Verify:** Accept the invite as the invited user. Navigate to the planner URL, confirm access works. Verify the planner now appears in their settings.

---

### Step 11 — Invite flow for new users
When `inviteUser` is called with an email that has no app account, send a different email: a sign-up invite that includes the `PendingInvite` token as a query param in the registration link.

After a new user's account is confirmed (post email verification), check if their email has any pending invites. If so, automatically accept them (add to `User.planners`, delete invites).

**Verify:** Invite an email with no existing account. Register via the link. Confirm the planner appears in the new user's planner list immediately after first login.

---

### Step 12 — Ownership transfer on account deletion
In `DeleteAccountForm`, before proceeding:
- Check if the current user is the `owner` of any planner that has other members
- If yes: show an intermediate step listing those planners with a dropdown per planner to pick a new owner
- Server action: `transferOwnership(plannerId, newOwnerId)` — sets old owner's `accessLevel` to `admin`, sets new owner's `accessLevel` to `owner`
- Proceed with deletion only after all shared planners have transferred ownership

**Verify:** As a planner owner with a second member, attempt account deletion. Confirm the transfer step appears. Transfer ownership. Confirm deletion succeeds. Log in as the new owner and confirm their access level is `owner`.

---

## Key Files

| Area | Files |
|---|---|
| Context | `PlannerContext.ts`, `PlannerProvider.tsx`, `usePlannerContext.ts` |
| Layout | `[planner]/layout.tsx` |
| Write controls | `AddMealButton`, `AddItemDropdown`, recipe/bookmark delete/edit buttons |
| Settings | `PlannerList.tsx`, `PlannerItem.tsx` + new member management components |
| Header | `UserMenu.tsx` (invite badge) |
| Server actions | `getPlanners.ts`, new: `getPlannerMembers`, `updateMemberAccess`, `removeMember`, `inviteUser`, `cancelInvite`, `acceptInvite`, `declineInvite`, `transferOwnership` |
| Models | `user.ts` (index), new: `PendingInvite` model |
| Account deletion | `DeleteAccountForm.tsx` (ownership transfer step) |
