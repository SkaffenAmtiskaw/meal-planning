**This work must be planned out so each step can be verified.**

## Status

- ✅ **Step 1** (PlannerContext + Write Controls) - Committed
- ✅ **Step 2** (PendingInvite Model) - Committed as `4aa9a5d`
- ✅ **Step 3** (Member List UI) - Commit `687a0a0c078c52eb92ba1bf92813aa6dd8b6de71`
  - ✅ `MemberList.tsx` component
  - ✅ `getPlannerMembers.ts` server action
  - ✅ `PlannerItem.tsx` with expandable Collapse
  - ✅ All tests passing (983 tests)
  - ✅ Build passing
- ✅ **Step 4** (Change User Access Level) - Commit `9c9db2af146bec8ea41d98379a1ed289400966b0`
- ✅ **Step 5** (Remove Member from Planner) - Commit `636c3e5e7fb6f5dab5a9bbd0067fcd7d9f10ea82`
- ⏳ Steps 6-8: Not started

## Requirements

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

## Existing Code to Reuse

- **Hooks**: `useEditMode` (settings page patterns), `useFormFeedback` (form state), `useAsyncButton` (async button states)
- **Components**: `FormFeedbackAlert` (error display), `SubmitButton` (form submission), `DeleteConfirmModal` (confirmation patterns)
- **Email patterns**: `_auth/emails/sendVerificationEmail.ts` - Resend email pattern
- **Modal patterns**: `src/app/[planner]/recipes/_components/Modal/ModalWrapper.tsx` - Modal state management

## Mantine Components to Use

- `Collapse` - Expandable sections in PlannerItem
- `Table` or `Stack` - Member list display
- `Select` - Access level dropdowns
- `TextInput` + `Button` - Invite form
- `ActionIcon` + `Modal` - Remove member with confirmation
- `Badge` - Access level indicators

---

# Implementation

## Step 1 — Extend PlannerContext with accessLevel + Hide Write Controls

**Implementation Details:**

- **File**: `src/app/[planner]/_components/PlannerContext/PlannerContext.ts`
  - Add `accessLevel: AccessLevel` to context type
- **File**: `src/app/[planner]/layout.tsx`
  - Modify `checkAuth` call to return access level, pass to `PlannerProvider`
- **File**: `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx`
  - Accept `accessLevel` prop, include in context value
- **Files to modify for hiding controls**:
  - `src/app/[planner]/calendar/_components/AddMealButton/AddMealButton.tsx`
  - `src/app/[planner]/recipes/_components/AddItemDropdown.tsx`
  - `src/app/[planner]/recipes/_components/DeleteItemButton.tsx`
  - `src/app/[planner]/recipes/_components/EditRecipeButton.tsx`

**Acceptance Criteria:**
1. Create a test planner with a second user who has `read` access (modify DB directly)
2. Log in as the read-only user
3. Navigate to the planner
4. **Verify**: Add Meal button is NOT visible
5. Navigate to recipes page
6. **Verify**: Add Item dropdown and all Edit/Delete buttons are NOT visible
7. **Verify**: Read-only user can still view recipes and calendar

**Security Checklist:**
- Server action `checkAuth` already verifies authentication and authorization
- Verify context only exposes access level, not other user data

---

## Step 2 — Create PendingInvite Model + MongoDB Index

**Implementation Details:**

- **New File**: `src/_models/pending-invite.ts`
  - Mongoose schema: `{ email, planner: ObjectId, invitedBy: ObjectId, accessLevel, token, expiresAt, createdAt }`
- **New File**: `src/_models/pending-invite.types.ts`
  - Zod schemas for runtime validation
- **File**: `src/_models/index.ts`
  - Export new model and types
- **File**: `src/_models/user.ts`
  - Add index on `planners.planner` field

**Acceptance Criteria:**
1. Run `pnpm build` - verify no TypeScript errors
2. Run `pnpm test` - verify 100% coverage on new model files
3. **Verify**: Can create/read/update/delete PendingInvite records via MongoDB shell

**Security Checklist:**
- Token field should use `crypto.randomUUID()` for generation
- `expiresAt` should be validated before any invite operations

---

## Step 3 — Add Member List UI (Owners/Admins Only)

**Implementation Details:**

- **New File**: `src/app/settings/_components/MemberList.tsx`
  - Uses Mantine `Stack` with `Group` to display members
  - Shows: Name, Email, Access Level badge
- **New File**: `src/app/settings/_components/useMemberList.ts`
  - Hook for member list state and operations
- **New File**: `src/_actions/planner/getPlannerMembers.ts`
  - Server action: queries `User.find({ 'planners.planner': id })`
  - Returns sanitized member data (name, email, accessLevel only)
- **Modified**: `src/_actions/planner/getPlanners.ts`
  - Return `{ planner, accessLevel }[]` instead of just planners
- **Modified**: `src/app/settings/_components/PlannerItem.tsx`
  - Add expand/collapse using Mantine `Collapse`
  - Show member list for owner/admin
  - Show "Leave Planner" button for non-owners

**Acceptance Criteria:**
1. Log in as planner owner
2. Go to Settings → Planner Settings
3. **Verify**: Can expand planner item to see member list
4. **Verify**: See yourself listed as "owner"
5. Add a second user to DB with `admin` access
6. **Verify**: Second user appears in list with "admin" badge
7. Log in as non-owner member
8. **Verify**: See "Leave Planner" button instead of expand toggle

**Security Checklist:**
- `getPlannerMembers` must verify caller has owner/admin access
- Never expose user IDs or internal MongoDB fields in response

---

## Step 4 — Change Member Access Level

**Implementation Details:**

- **New File**: `src/_actions/planner/updateMemberAccess.ts`
  - Validates: caller is owner/admin
  - Validates: target user is not owner
  - Validates: at least one owner remains in planner
  - Updates `User.planners.$.accessLevel`
- **New File**: `src/app/settings/_components/AccessLevelSelect.tsx`
  - Uses Mantine `Select` with options: owner, admin, write, read
  - Disabled for owner entries
  - Help text/tooltip explaining each access level
- **Modified**: `src/app/settings/_components/MemberList.tsx`
  - Add access level select to each member row (except current user)

**Acceptance Criteria:**
1. As owner, expand planner in settings
2. Change second user's access from "admin" to "write"
3. **Verify**: Change persists after page refresh
4. Log in as that user
5. **Verify**: User can still access planner but cannot access member management
6. Attempt to change owner's access level
7. **Verify**: Action is disabled/prevented with error message

**Security Checklist:**
- Server action must check caller is owner/admin
- Cannot promote someone to owner (only owner can transfer ownership)
- Cannot demote the last owner

---

## Step 5 — Remove Member from Planner

**Implementation Details:**

- **New File**: `src/_actions/planner/removeMember.ts`
  - Validates: caller is owner/admin
  - Validates: cannot remove owner via this action
  - Pulls membership from `User.planners` array
- **New File**: `src/app/settings/_components/RemoveMemberButton.tsx`
  - Uses Mantine `ActionIcon` with trash icon
  - Confirmation modal using existing `DeleteConfirmModal` pattern
- **Modified**: `src/app/settings/_components/MemberList.tsx`
  - Add remove button to each row

**Acceptance Criteria:**
1. As owner, add test user to planner (via DB)
2. In settings, click remove button on test user
3. Confirm removal in modal
4. ✅ **Verified**: User disappears from member list
5. ✅ **Verified**: Test user gets 404 when navigating to planner URL
6. Try to remove yourself (owner)
7. ✅ **Verified**: Button is disabled or shows error (hidden for owner)

**Security Checklist:**
- Server action must verify caller is owner/admin
- Owner cannot remove themselves (must use transfer ownership)
- Target user loses all access immediately upon removal

---

## Step 6 — Invite User UI + Send Invites

**Implementation Details:**

- **New File**: `src/_actions/planner/inviteUser.ts`
  - Checks: email not already member
  - Checks: no pending invite for this email/planner combination
  - Creates `PendingInvite` with secure token (use `crypto.randomUUID()`)
  - Token expires in 7 days
  - Sends invite email via Resend
- **New File**: `src/_actions/planner/cancelInvite.ts`
  - Deletes pending invite
  - Validates: caller is owner/admin
- **New File**: `src/_actions/planner/getPendingInvites.ts`
  - Returns pending invites for a planner (email, accessLevel, invitedAt)
- **New File**: `src/_auth/emails/sendInviteEmail.ts`
  - Email template with accept link containing token
  - Different template for existing users vs new users
- **New File**: `src/app/settings/_components/InviteForm.tsx`
  - Email input + "Invite" button
  - Uses Mantine `TextInput`, `Button`, `Stack`
  - Error display using `FormFeedbackAlert`
- **New File**: `src/app/settings/_components/PendingInvitesList.tsx`
  - Shows pending invites with cancel button
- **Modified**: `src/app/settings/_components/PlannerItem.tsx`
  - Add invite form and pending list below member list

**Acceptance Criteria:**
1. As owner, expand planner in settings
2. Enter an email that already has a pending invite for this planner
3. Click Invite
4. ✅ **Verify**: See error "Pending invite already exists"
5. Enter a new email address (no existing account)
6. Click Invite
7. ✅ **Verify**: Invite appears in pending list
8. ✅ **Verify**: Receive email with accept link (for new user signup)
9. Click Cancel on the invite
10. ✅ **Verify**: Invite disappears from list immediately (optimistic update)

**Security Checklist:**
- Server action must verify caller is owner/admin
- Rate limiting: max 10 invites per email per day
- Tokens are cryptographically random and unguessable
- Tokens expire after 7 days

---
## Step 7 — Accept/Decline Invites (In-App)

**Implementation Details:**

- **New File**: `src/_actions/planner/getUserInvites.ts`
  - Query `PendingInvite.find({ email: userEmail })`
  - Populate planner name and inviter name
  - Return sanitized data
- **New File**: `src/_actions/planner/acceptInvite.ts`
  - Validate invite not expired
  - Validate token matches
  - Add to `User.planners` with specified accessLevel
  - Delete invite
- **New File**: `src/_actions/planner/declineInvite.ts`
  - Delete invite without adding to planner
- **New File**: `src/app/settings/_components/InvitesSection.tsx`
  - Lists pending invites with Accept/Decline buttons
  - Shows: Planner name, invited by, access level
- **New File**: `src/_components/UserMenu/InviteBadge.tsx`
  - Client component showing badge count
  - Fetches invite count on mount
- **Modified**: `src/_components/UserMenu/UserMenu.tsx`
  - Add badge indicator using `InviteBadge`
- **Modified**: `src/app/settings/page.tsx`
  - Add Invites section

**Acceptance Criteria:**
1. Have a pending invite for your user (from Step 6)
2. Log in as invited user
3. **Verify**: See notification badge on user avatar
4. Go to User Settings
5. **Verify**: See Invites section with planner name and inviter
6. Click Accept
7. **Verify**: Invite disappears, planner appears in your planner list
8. Navigate to planner
9. **Verify**: Can access planner at read-only level
10. Repeat with Decline
11. **Verify**: Invite disappears, no planner access

**Additional Acceptance Criteria (moved from Step 6):**
- Test "User is already a member" error: Invite an email that belongs to an existing member of the planner
- **Re-test Step 5**: Delete a user from the planner to ensure the member list UI still works correctly with the invite system changes

**Security Checklist:**
- Server action must verify invite token is valid and not expired
- Server action must verify invite is for the authenticated user
- Cannot accept invite twice (should return success on duplicate)


---

## Step 8 — Wire Up Leave Planner Button

**Implementation Details:**

- **New File**: `src/_actions/planner/leavePlanner.ts`
  - Validates: caller is authenticated
  - Validates: caller is a member of the planner (not owner - owners must transfer ownership first)
  - Calls `removePlannerMembership` utility to remove self from planner
  - Returns success/error
- **New File**: `src/app/settings/_components/useLeavePlanner.ts`
  - Hook for leave planner state and operations
  - Calls `leavePlanner` server action
  - Handles success (refresh planner list, redirect if needed)
  - Handles errors
- **Modified**: `src/app/settings/_components/PlannerItem.tsx`
  - Add `onClick` handler to Leave Planner button
  - Show confirmation modal before leaving (use existing `DeleteConfirmModal` pattern)
  - Disable/hide button for owners (show tooltip: "Owners must transfer ownership before leaving")

**Acceptance Criteria:**
1. Have a second user invited and accepted (from Steps 2-3)
2. As owner, change their access to `read` or `write` (from Step 8)
3. Log in as that user
4. Go to Settings → Planner Settings
5. **Verify**: See "Leave Planner" button in the planner panel
6. Click "Leave Planner"
7. **Verify**: Confirmation modal appears with warning message
8. Confirm leaving
9. **Verify**: User is redirected away from that planner
10. **Verify**: Planner no longer appears in user's planner list
11. Try to access the planner URL directly
12. **Verify**: Get 404 (no access)
13. Log in as owner
14. **Verify**: The left member no longer appears in member list
15. **Verify**: Owner sees tooltip on disabled "Leave Planner" button explaining they must transfer ownership first

**Security Checklist:**
- Server action must verify user is authenticated
- Server action must verify user is actually a member of the planner
- Owners cannot leave via this action (must use ownership transfer)
- User should be redirected away from planner after leaving

---

## Step 9 — New User Auto-Accept Flow

**Implementation Details:**

- **Modified**: `src/_auth/emails/sendInviteEmail.ts`
  - Different email template for non-users (includes signup link with token)
  - Registration link includes `?invite_token=<token>`
- **New File**: `src/_actions/planner/acceptPendingInvites.ts`
  - Called after email verification
  - Finds all pending invites for user's email
  - Adds each to `User.planners` and deletes invite
- **Modified**: `src/app/page.tsx` (or relevant post-registration page)
  - After successful registration, call `acceptPendingInvites`
  - Show success message listing accepted planners

**Acceptance Criteria:**
1. Invite an email that has no account
2. Click signup link in email
3. Complete registration and verify email
4. **Verify**: After first login, see message "You've been added to X planner(s)"
5. **Verify**: Planner appears in planner list immediately
6. Navigate to planner
7. **Verify**: Can access planner at read-only level

**Security Checklist:**
- Tokens must be validated before auto-accepting
- Must check invite hasn't expired
- New user gets only the access level specified in invite (read-only by default)

---

## Step 10 — Ownership Transfer on Account Deletion

**Implementation Details:**

- **New File**: `src/_actions/planner/transferOwnership.ts`
  - Validates: caller is current owner
  - Validates: target user is member of planner
  - Sets old owner to `admin`, new owner to `owner`
- **New File**: `src/_actions/planner/getOwnedPlannersWithMembers.ts`
  - Returns planners where user is owner AND has other members
- **New File**: `src/app/settings/_components/OwnershipTransferModal.tsx`
  - Lists planners that need ownership transfer
  - Dropdown per planner to select new owner from member list
- **Modified**: `src/app/settings/_components/DeleteAccountForm.tsx`
  - On initial render, check for owned planners with other members
  - Show ownership transfer step if any found
  - Only enable delete after all planners transferred
  - Owners cannot leave a planner without transferring ownership first

**Acceptance Criteria:**
1. As owner with another member, go to delete account
2. **Verify**: See intermediate step listing planner with member dropdown
3. Select the other member as new owner
4. Click Transfer
5. **Verify**: Can now proceed with account deletion
6. Complete deletion
7. Log in as new owner
8. **Verify**: Access level is now "owner"
9. Verify former owner no longer has access to planner

**Security Checklist:**
- Server action must verify caller is the current owner
- Cannot transfer to yourself
- Cannot transfer if no other members exist (must delete planner instead)
- Account deletion only proceeds after all ownership transfers complete

---

## Key Files

| Area | Files |
|---|---|
| Models | `src/_models/pending-invite.ts`, `src/_models/pending-invite.types.ts`, `src/_models/user.ts` (index) |
| Server Actions | `src/_actions/planner/getPlannerMembers.ts`, `src/_actions/planner/updateMemberAccess.ts`, `src/_actions/planner/removeMember.ts`, `src/_actions/planner/leavePlanner.ts`, `src/_actions/planner/inviteUser.ts`, `src/_actions/planner/cancelInvite.ts`, `src/_actions/planner/getPendingInvites.ts`, `src/_actions/planner/acceptInvite.ts`, `src/_actions/planner/declineInvite.ts`, `src/_actions/planner/getUserInvites.ts`, `src/_actions/planner/transferOwnership.ts`, `src/_actions/planner/acceptPendingInvites.ts`, `src/_actions/planner/getOwnedPlannersWithMembers.ts` |
| Context | `src/app/[planner]/_components/PlannerContext/PlannerContext.ts`, `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` |
| Settings Components | `src/app/settings/_components/MemberList.tsx`, `src/app/settings/_components/useMemberList.ts`, `src/app/settings/_components/AccessLevelSelect.tsx`, `src/app/settings/_components/RemoveMemberButton.tsx`, `src/app/settings/_components/useLeavePlanner.ts`, `src/app/settings/_components/InviteForm.tsx`, `src/app/settings/_components/PendingInvitesList.tsx`, `src/app/settings/_components/InvitesSection.tsx`, `src/app/settings/_components/OwnershipTransferModal.tsx` |
| Layout Components | `src/app/[planner]/layout.tsx`, `src/app/settings/_components/PlannerItem.tsx`, `src/app/settings/_components/PlannerList.tsx`, `src/_actions/planner/getPlanners.ts` |
| Calendar/Recipe Controls | `src/app/[planner]/calendar/_components/AddMealButton/AddMealButton.tsx`, `src/app/[planner]/recipes/_components/AddItemDropdown.tsx`, `src/app/[planner]/recipes/_components/DeleteItemButton.tsx`, `src/app/[planner]/recipes/_components/EditRecipeButton.tsx` |
| Header | `src/_components/UserMenu/UserMenu.tsx`, `src/_components/UserMenu/InviteBadge.tsx` |
| Emails | `src/_auth/emails/sendInviteEmail.ts` |
| Account Deletion | `src/app/settings/_components/DeleteAccountForm.tsx` |

---

## Completion Criteria Per Step

After each step:
1. `pnpm lint` passes
2. `pnpm test` passes (100% coverage)
3. **Security Review Checklist:**
   - All server actions verify authentication
   - All server actions verify authorization (access level check)
   - No sensitive data exposed in API responses
   - Tokens are cryptographically secure (`crypto.randomUUID()`)
   - Token expiration enforced
   - Rate limiting considered for invite endpoints
4. User signs off on manual acceptance criteria
