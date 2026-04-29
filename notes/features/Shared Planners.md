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
- ✅ Step 6 (Invite User UI) - Commit `5ec0db3f92287e4ebc3fd64593c9537e19e1bd04`
- ✅ Step 7 (Add Existing User to Planner) - Commit `111ee4579d80fd356647e6bda53cc30c0c321577`
- ✅ Step 8 (Leave Planner) - In Progress
- 🚧 Step 9 (Add New User to Planner) - In Progress
- ⏳ Steps 10-11: Not started

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
- **Components**: `FormFeedbackAlert` (error display), `SubmitButton` (form submission), `ConfirmModal` (confirmation modal), `ConfirmButton` (button + confirmation modal with async handling)
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
3. ✅ **Verify**: See notification badge on user avatar
4. Go to User Settings
5. ✅ **Verify**: See Invites section with planner name and inviter
6. Click Accept
7. ✅ **Verify**: Invite disappears, planner appears in your planner list
8. Navigate to planner
9. ✅ **Verify**: Can access planner at read-only level
10. Repeat with Decline
11. ✅ **Verify**: Invite disappears, no planner access

**Additional Acceptance Criteria (moved from Step 6):**
- ✅ Test "User is already a member" error: Invite an email that belongs to an existing member of the planner
- ✅ **Re-test Step 5**: Delete a user from the planner to ensure the member list UI still works correctly with the invite system changes

**Security Checklist:**
- Server action must verify invite token is valid and not expired
- Server action must verify invite is for the authenticated user
- Cannot accept invite twice (should return success on duplicate)


---

## Step 8 — Wire Up Leave Planner Button

**Requirements**
- "Leave Planner" button should be visually consistent (same styling) on all planners. Currently the button has different variants for different access levels.
- The "leave planner" button should only be visible for non-owners. Owners will see the [[Delete Planner|"delete planner"]] button instead (in a future story).
- Existing code should be checked to see what can be reused.

**Implementation Details:**

- **New File**: `src/_actions/planner/leavePlanner.ts`
  - Validates: caller is authenticated
  - Validates: caller is a member of the planner (not owner - owners must transfer ownership first)
  - Calls `removePlannerMembership` utility to remove self from planner
  - Returns success/error
- **Modified**: `src/app/settings/_components/PlannerItem.tsx`
  - Add Leave Planner button using `ConfirmButton` component (reusable component that combines button + confirmation modal)
  - Pass `leavePlanner` server action directly to `ConfirmButton`
  - Handle success with `onSuccess` callback (refresh planner list, redirect if needed)
  - Use consistent button styling (subtle variant) for all access levels
  - Hide button for owners (only show for non-owners with read/write/admin access)

**Acceptance Criteria:**
1. Have a second user invited and accepted (from Steps 2-3)
2. As owner, change their access to `read` or `write`
3. Log in as that user
4. Go to Settings → Planner Settings
5. ✅ **Verify**: See "Leave Planner" button in the planner panel (consistent styling regardless of access level)
6. Click "Leave Planner"
7. ✅ **Verify**: Confirmation modal appears with warning message
8. Confirm leaving
9. ✅ **Verify**: User stays on Settings page (not redirected away)
10. ✅ **Verify**: Planner immediately disappears from the list (UI refreshes)
11. Try to access the planner URL directly
12. **Verify**: Get 404 (no access)
13. Log in as owner
14. ✅ **Verify**: The left member no longer appears in member list
15. ✅ **Verify**: Owner does NOT see "Leave Planner" button (hidden, not disabled)

**Security Checklist:**
- Server action must verify user is authenticated
- Server action must verify user is actually a member of the planner
- Owners cannot leave via this action (must use ownership transfer)
- UI should refresh to show updated planner list after leaving

---

## Step 9 — New User Auto-Accept Flow

**Requirements**
- When a user who does not yet have an account accepts an email invite, they should be prompted to create an account.
  	  - They should NOT have to type in their email; that is known from the link/token they followed.
  	  - They should NOT have to verify their email; we know their email is good because they would have had to get the link/token from their email.
  - After the user has created an account, a new planner should NOT be created. Instead, the invitation for the planner should be auto-accepted, and that should be the single planner they belong to.
  	  - If they have multiple pending invitations, only the planner for the link/token should be auto-accepted. Everything else should remain as a pending invite.
  - If a new user who has a pending invite creates an account through the regular new user flow (without following the link) they should have to verify their email and the auto-accept should not happen. A new planner should be created (that they are the owner of) and the pending invites should appear in the badge/pending invites list in settings.
  - If the user follows the link for an invite that is expired, they should receive a error message that the link is expired, and be offered an opportunity to sign up for an account.
  - TODO: If a user joined via an invite link they will not have a planner they are an owner of. Nothing prevents them from leaving the only planner they have. We should make a Step 11 to account for this possibility - when they navigate to '/' they need some sort of empty state which prompts them to create a planner.

**Implementation Details:**

- **New Route**: `src/app/invite/accept/page.tsx`
  - Server component that reads `?token=<token>` query param
  - Calls `validateInviteToken` server action to check token validity
  - If valid: Render `InviteRegistrationForm` with pre-filled email (read-only)
  - If expired: Render `ExpiredInviteView` with option to sign up via regular flow
  - If invalid: Render error message with link to sign in

- **New File**: `src/_actions/planner/validateInviteToken.ts`
  - Finds invite by token
  - Checks if token is expired
  - If expired: Delete the invite immediately and return `{ valid: false, reason: 'expired' }`
  - Returns: `{ valid: true, email: string, plannerName: string }` or `{ valid: false, reason: 'expired' | 'invalid' }`

- **New File**: `src/_components/RegistrationForm.tsx` (SHARED COMPONENT)
  - Extracted from SignIn.tsx registration step to avoid code duplication
  - Email display (read-only text)
  - Optional "Change email" button (controlled via prop)
  - Name input field (optional)
  - Password input with configurable label
  - Error Alert for validation errors
  - Submit button with loading state
  - Props interface:
    ```typescript
    interface RegistrationFormProps {
      email: string;
      onSubmit: (data: { name: string; password: string }) => Promise<void>;
      submitLabel: string;
      passwordLabel: string;
      showChangeEmail?: boolean;
      onChangeEmail?: () => void;
    }
    ```

- **New File**: `src/app/invite/accept/_components/InviteRegistrationForm.tsx`
  - Client component for invite-based registration
  - Uses shared `RegistrationForm` component (no UI duplication)
  - Calls `signUpWithInvite` server action instead of `client.signUp.email()`
  - Passes `inviteToken` through to the server action

- **New File**: `src/app/invite/accept/_components/ExpiredInviteView.tsx`
  - Shows "Invite expired" message
  - Single button "Continue to Sign In" → redirects to `/?email=<email>`
  - From regular SignIn page, user can sign in, create account, or change email

- **Modified**: `src/_actions/user/addUser.ts`
  - Refactor to accept `AddUserOptions` object for extensibility
  - Add `skipPlannerCreation?: boolean` option (default false)
  - Add `accessLevel?: AccessLevel` option (default 'owner' for new planners, 'read' for existing)
  - Add `emailVerified?: boolean` option for Better Auth integration
  - Maintains backward compatibility with existing calls

- **New File**: `src/_actions/planner/signUpWithInvite.ts`
  - Server action for invite-based registration
  - Validates token is valid and not expired (re-validate even though page already checked)
  - If token invalid/expired: Return error (user should retry with fresh link)
  - Creates user via Better Auth Admin API (`auth.api.createUser`) with `emailVerified: true` (bypasses verification)
    - Requires Admin plugin to be added to auth.ts
  - Calls refactored `addUser` with `skipPlannerCreation: true` and invite's `accessLevel`
  - Immediately adds user to planner from token with specified accessLevel
  - Deletes the invite after successful acceptance
  - Returns redirect URL with success params
  - All operations happen atomically in one server action

- **Modified**: `src/_auth/auth.ts`
  - Add Admin plugin: `import { admin } from 'better-auth/plugins'` and add to plugins array
  - Minimal admin config - no custom roles needed for our use case

- **Modified**: `src/app/page.tsx`
  - Check for query params: `?invite_success=true&planner=<id>` (set by post-registration redirect)
  - Show success message: "You've been added to [Planner Name]"
  - If `?expired_invite=true`, show info banner: "Your invite expired, but you can still create an account"
  - Support `?email=<email>` query param to pre-fill email in SignIn component
  - If user has no planners after registration (edge case), redirect to create planner flow (handled in Step 11)

- **Modified**: `src/_auth/emails/sendInviteEmail.ts`
  - Update new_user template URL to `/invite/accept?token=<token>`
  - Existing user template stays as `/` (they handle invite in-app)

- **Modified**: `src/_components/SignIn.tsx`
  - Use shared `RegistrationForm` component instead of inline JSX for "new" step
  - Support `?email=<email>` query param to pre-fill email and skip to registration step
  - Maintains all existing functionality

**Key Differences from Regular Signup:**
- Email is pre-filled and read-only
- No email verification step required
- No new planner created (user joins invited planner)
- Only ONE invite is auto-accepted (the one from the token)
- Other pending invites remain pending and appear in settings

**Acceptance Criteria:**
1. **Happy Path - Valid Invite:** ✅ - Manual Test Confirmed
   - As owner, invite `newuser@example.com` (non-existent user)
   - Open email and click invite link
   - **Verify**: Land on `/invite/accept?token=<token>` with registration form
   - **Verify**: Email field is pre-filled and disabled
   - Enter password and name, click "Create Account"
   - **Verify**: No "verify your email" screen shown
   - **Verify**: Redirected to planner immediately
   - **Verify**: Success message shows "You've been added to [Planner Name]"
   - **Verify**: User can access planner at read-only level
   - Go to Settings → Invites
   - **Verify**: No other pending invites shown (only the one from token was auto-accepted)

2. **Expired Invite Flow:**
   - Create an invite, wait 7+ days (or manually expire in DB)
   - Click expired invite link
   - **Verify**: See "Invite expired" message
   - Click "Continue to Sign In"
   - **Verify**: Redirected to sign-in page with email pre-filled
   - **Verify**: Can sign in or create account from there
   - Complete registration normally
   - **Verify**: Must verify email (since not using invite link)
   - **Verify**: New planner created (user is owner)
   - Go to Settings → Invites
   - **Verify**: Expired invite does NOT appear in pending list (expired invites are not shown)

3. **Regular Signup with Pending Invites:**
   - As owner, invite `another@example.com` (non-existent user)
   - DON'T click invite link - instead go directly to `/`
   - Sign up normally with `another@example.com`
   - **Verify**: Must verify email
   - **Verify**: New planner created (user is owner)
   - After verification, go to Settings → Invites
   - **Verify**: See pending invite from owner
   - Click Accept
   - **Verify**: Now has 2 planners (owned + invited)

1. **Security - Invalid Token:** ✅ - Manual Test Confirmed
   - Navigate to `/invite/accept?token=invalid_token_123`
   - **Verify**: See "Invalid invite" error message
   - **Verify**: Option to sign in or go to home page

5. **Security - Email Mismatch Prevention:** ✅ - Manual Test Confirmed
   - Click valid invite link for `user1@example.com`
   - Try to modify email in form (should be impossible - field is disabled)
   - **Verify**: Cannot submit with different email

6. **Security - Admin API Only:**
   - **Verify**: Cannot call `auth.api.createUser` from client-side
   - **Verify**: Server action validates invite token before creating user
   - **Verify**: No way to bypass email verification without valid invite token

**Regression Tests for Extracted Components:**

7. **SignIn Component Still Works (Regression):**
   - Navigate to `/`
   - Enter new email, click Continue
   - **Verify**: See registration form with "Change email" button visible
   - **Verify**: Can change email and go back
   - **Verify**: Can enter name and password
   - **Verify**: Clicking "Create Account" creates user normally
   - **Verify**: Must verify email before accessing app
   - **Verify**: New planner created as owner
   - Navigate to `/?email=test@example.com`
   - **Verify**: Email pre-filled and skipped to appropriate step

8. **addUser Backward Compatibility (Regression):**
   - Call `addUser('test@example.com')` without options object
   - **Verify**: Still creates user with new planner as owner
   - Call `addUser('test2@example.com', existingPlannerId)`
   - **Verify**: Still creates user added to existing planner with 'read' access
   - Call `addUser('test3@example.com', undefined, 'Test User')`
   - **Verify**: Still creates user with specified name
   - Call with new options object:
     ```typescript
     addUser({
       email: 'test4@example.com',
       skipPlannerCreation: true,
       accessLevel: 'admin',
       emailVerified: true
     })
     ```
   - **Verify**: Creates user without planner, with admin access, email marked verified

9. **RegistrationForm Component (New Shared Component Tests):**
   - Renders email as read-only text
   - Renders name input with correct label
   - Renders password input with configurable label
   - Calls onSubmit with name and password when form submitted
   - Shows loading state on submit button during submission
   - Displays error alert when onSubmit throws
   - Shows "Change email" button when showChangeEmail=true
   - Calls onChangeEmail when "Change email" clicked
   - Hides "Change email" button when showChangeEmail=false
   - Validates password length (reuse existing validation logic)
   - Validates name using zSafeString when provided

**Unit Test Coverage Requirements:**

- **validateInviteToken.ts**:
  - Returns valid=true with email and plannerName for valid token
  - Returns valid=false with reason='expired' for expired token
  - Deletes expired token from database immediately
  - Returns valid=false with reason='invalid' for non-existent token
  - Returns valid=false with reason='invalid' for malformed token
  - Includes planner name in response when valid

- **signUpWithInvite.ts**:
  - Creates user via Better Auth Admin API with emailVerified=true
  - Calls addUser with skipPlannerCreation=true
  - Adds user to planner with invite's accessLevel
  - Deletes invite after successful acceptance
  - Returns redirect URL on success
  - Returns error if token expired (re-validates)
  - Returns error if token invalid (re-validates)
  - Only accepts the specific invite from token (not other pending invites)
  - Rollback: If addUser fails after Better Auth user created, delete Better Auth user
  - Rollback: If invite deletion fails, still return success (user is in planner)

- **ExpiredInviteView.tsx**:
  - Renders expired message
  - Redirects to /?email=<email> when button clicked
  - Properly encodes email in URL

- InviteRegistrationForm.tsx
  - Renders RegistrationForm with correct props (no change email button)
  - Calls signUpWithInvite on submit
  - Redirects on success to URL from server action
  - Passes token to signUpWithInvite
  - Shows error from signUpWithInvite in RegistrationForm
  - Shows planner name in heading

- **addUser.ts (Refactored)**:
  - Creates new planner when skipPlannerCreation=false (default, backward compatible)
  - Does not create new planner when skipPlannerCreation=true
  - Sets accessLevel to 'owner' for new planner (default, backward compatible)
  - Sets accessLevel to provided value when specified
  - Passes emailVerified to User.create
  - Maintains backward compatibility with positional arguments
  - Validates email format
  - Handles name defaulting to 'New User'

- **RegistrationForm.tsx (New Shared Component)**:
  - Renders with provided email displayed
  - Renders name input (optional)
  - Renders password input with custom label
  - Renders submit button with custom label
  - Shows change email button conditionally
  - Handles form submission with loading state
  - Displays errors from onSubmit
  - Validates inputs before calling onSubmit

- **SignIn.tsx (Modified)**:
  - Still works with all existing flows (idle, has-password, social-only, email-sent)
  - Uses RegistrationForm for 'new' step
  - Pre-fills email from query param when present
  - Skips to correct step when email query param present
  - All existing tests still pass

- **auth.ts (Modified)**:
  - Admin plugin added without breaking existing functionality
  - OneTap plugin still works
  - All email flows still work
  - Session configuration unchanged

- **page.tsx (Modified)**:
  - Shows success message with planner name when invite_success param present
  - Shows expired invite banner when expired_invite param present
  - Passes email to SignIn component when email param present
  - Existing redirect logic unchanged
  - Handles edge case: user with no planners (Step 11)

**Security Checklist:**
- Tokens must be validated server-side before showing registration form
- Expired tokens must be rejected with clear messaging
- Email field must be read-only in invite registration form (prevent tampering)
- Only the specific planner from the token should be auto-accepted (not all pending invites)
- Token must be cryptographically random (`crypto.randomUUID()` already used in inviteUser)
- Tokens must expire after 7 days (already enforced in model)
- No email verification bypass possible without valid invite token
- User cannot forge invite token to join arbitrary planners
- Admin API only callable server-side (enforced by Better Auth)
- If invite validation fails during registration, user creation is blocked (not allowed to proceed)
- Token must be single-use (deleted after successful acceptance)
- Atomic operation: User creation, planner membership, and invite deletion happen together
- Rollback handling: If partial failure occurs, orphaned users are cleaned up

---
## Step 10 — Ownership Transfer on Account Deletion

**Requirement** - This should be reworked so that owners can have a way to transfer planner ownership without deleting their accounts. Otherwise the owner of a shared planner would never be able to leave a planner without fully deleting their account.

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
11. Make `/invite` and `/` login pages share the same presentational code
- Message text is center aligned
- Inputs and buttons are full width
- There is no rogue styling ANYWHERE
---

## Key Files

| Area | Files |
|---|---|
| Models | `src/_models/pending-invite.ts`, `src/_models/pending-invite.types.ts`, `src/_models/user.ts` (index) |
| Server Actions | `src/_actions/planner/getPlannerMembers.ts`, `src/_actions/planner/updateMemberAccess.ts`, `src/_actions/planner/removeMember.ts`, `src/_actions/planner/leavePlanner.ts`, `src/_actions/planner/inviteUser.ts`, `src/_actions/planner/cancelInvite.ts`, `src/_actions/planner/getPendingInvites.ts`, `src/_actions/planner/acceptInvite.ts`, `src/_actions/planner/declineInvite.ts`, `src/_actions/planner/getUserInvites.ts`, `src/_actions/planner/transferOwnership.ts`, `src/_actions/planner/acceptPendingInvites.ts`, `src/_actions/planner/getOwnedPlannersWithMembers.ts` |
| Context | `src/app/[planner]/_components/PlannerContext/PlannerContext.ts`, `src/app/[planner]/_components/PlannerContext/PlannerProvider.tsx` |
| Settings Components | `src/app/settings/_components/MemberList.tsx`, `src/app/settings/_components/useMemberList.ts`, `src/app/settings/_components/AccessLevelSelect.tsx`, `src/app/settings/_components/RemoveMemberButton.tsx`, `src/app/settings/_components/InviteForm.tsx`, `src/app/settings/_components/PendingInvitesList.tsx`, `src/app/settings/_components/InvitesSection.tsx`, `src/app/settings/_components/OwnershipTransferModal.tsx` |
| Layout Components | `src/app/[planner]/layout.tsx`, `src/app/settings/_components/PlannerItem.tsx`, `src/app/settings/_components/PlannerList.tsx`, `src/_actions/planner/getPlanners.ts` |
| Calendar/Recipe Controls | `src/app/[planner]/calendar/_components/AddMealButton/AddMealButton.tsx`, `src/app/[planner]/recipes/_components/AddItemDropdown.tsx`, `src/app/[planner]/recipes/_components/DeleteItemButton.tsx`, `src/app/[planner]/recipes/_components/EditRecipeButton.tsx` |
| Header | `src/_components/UserMenu/UserMenu.tsx`, `src/_components/UserMenu/InviteBadge.tsx` |
| Reusable Components | `src/_components/ConfirmModal/ConfirmModal.tsx`, `src/_components/ConfirmButton/ConfirmButton.tsx` |
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
1. User signs off on manual acceptance criteria