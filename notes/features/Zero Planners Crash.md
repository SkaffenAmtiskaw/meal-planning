---
type: bug
status: ready
blocked-by: []
confirmed: 2026-11-02
---
# Where It Stands

Ready. Next: /implement Step 1 ^status

# Inbox

# Symptoms
A user whose last planner membership is removed ends up with zero planners, and the root page crashes for them. They see "This page couldn't load" with a Reload button, which gives the same error. `/settings` redirects to `/`, so it crashes too. No page they can reach has a way to sign out or create a planner, and signing back in lands on the same crash, so they're locked out.

## Repro Steps (2026-11-02)
Desktop. Seeded users each own a planner, so this needs a new user signed up through an invite.

**Leaving:**
1. Sign in as `owner`. In `/settings`, under Planner Settings, expand Seeded Shared Planner and invite `delivered+zero-leave@resend.dev`. Sign out.
2. Read that invite's `token` from the dev database's `pendinginvites` collection, and open `/invite?token=<token>`. Create the account, then sign in with it. See the planner's calendar.
3. In `/settings`, expand Seeded Shared Planner, click **Leave Planner** and confirm.
4. See `/` show "This page couldn't load", and the server log show `TypeError: Cannot read properties of undefined (reading 'planner')` at `src/app/page.tsx:35`.

**Being removed:**
1. Create a second invited user the same way, with `delivered+zero-removed@resend.dev`. Sign out.
2. Sign in as `owner`. In `/settings`, expand Seeded Shared Planner and remove that member. Sign out.
3. Sign in as the removed user. See the same error on `/`.

The 2026-11-02 run created the invites directly in the dev database, rather than through the Settings form in step 1.

# Who Can Hit This
Users who signed up through an invite and haven't created a planner of their own, because `signUpWithInvite` → `addUser` gives them only the invited planner. Everyone else owns a planner: every normal sign-up creates one, and owners can't leave (`leavePlanner` rejects them) or be removed (`removeMember` rejects them).

That last membership can go away two ways:
- the user clicks **Leave Planner** in settings (`leavePlanner`)
- an admin or owner removes them from the planner (`removeMember`)

Once [[Delete Planner]] is built, an owner deleting a planner will be a third way, for every member of that planner. [[Transfer Ownership of Planner]] will be a fourth, since an owner who transfers ownership can then leave.

# Open Decisions

# Root Cause
`src/app/page.tsx` handles a signed-in user with no `User` document, but not one whose document has an empty `planners` list:
- Lines 39-44 are the only check that creates a planner, and they only run when no `User` document exists yet, which is first sign-in.
- Line 35 reads `user.planners[0].planner` with no check for an empty list, so it throws a `TypeError`. A `lastOpenedPlanner` cookie doesn't help, because line 32 only accepts a planner the user still belongs to.

How a user gets there:
1. `removePlannerMembership` (`src/_actions/sharing/_utils/removePlannerMembership.ts`) `$pull`s the last entry from `user.planners`.
2. `src/app/settings/layout.tsx:18` sees no planners and redirects to `/`. A leaving user hits this through the `router.refresh()` in `PlannerItem.tsx`. A removed user reaches `/` the next time they open the app.
3. `src/app/page.tsx:35` throws.

Evidence: seen in the running app, both ways. The fault is in one module.

Tests: `src/app/page.test.tsx` has no case for an empty `planners` list, so nothing covers the crash. `src/app/settings/layout.test.tsx` covers the redirect to `/`.

# Fix
Sarah decided 2026-11-02 that a user with no planners winds up on a plain page with a button to create a planner (Sarah's call). A nicer design is [[Nicer No Planners Page Design]].

The page shows at `/`, with no route of its own, so it needs no redirect and no check for users who shouldn't be on it:
- **`src/app/page.tsx`:** when the user has no planners, return the new prompt, the same way it returns `<SignInPrompt />` for a signed-out user.
- **New `src/app/_components/NoPlannersPrompt.tsx`:** a server component holding the message and `CreatePlannerButton`.
- **New `src/app/_components/CreatePlannerButton.tsx`:** the client component holding the button, which opens `CreatePlannerForm`. It keeps the client boundary small, as `docs/project_conventions.md` asks.
- **`CreatePlannerForm`:** moves from `src/app/settings/_components/` to `src/app/_components/`, since two pages now use it. Its `router.refresh()` re-runs `/`, which sends the user to their new planner. [[Settings Data Refresh]] plans to remove that `router.refresh()`, so whichever story lands second keeps this redirect working.
- **`src/app/settings/layout.tsx`:** keeps redirecting to `/` when the user has no planners.

The create button is the page's only control. Once the user creates a planner they're back in the app, with sign-out, settings and the invite badge. Someone who wants to delete their account has to create a planner first.

`code-critic`'s verdict on `src/app/page.tsx` was refactor first, because it already does more than one job (Single Concern in `docs/project_conventions.md`). So before the prompt goes in:
- Move choosing the last-opened planner into a function that `page.tsx` and `settings/layout.tsx` both use. They duplicate it today.
- Move the user lookup and first-sign-in creation out of `page.tsx`.

Boy Scout fix: remove the unused `searchParams` prop from `page.tsx`.
Boy Scout fix: remove the `zObjectId` parse from `page.tsx`, since the membership check already covers it.
Boy Scout fix: add the leading slash to `page.tsx`'s two redirects.

Sarah chose this over creating a planner automatically at `/`, and over blocking the last removal, which wouldn't cover `removeMember`.

# Acceptance Criteria
Checked in the running app:
- [ ] Follow "Leaving" in the repro steps. After confirming, see the no-planners page at `/` rather than the error.
- [ ] Follow "Being removed" in the repro steps. After signing in, see the no-planners page at `/`.
- [ ] With zero planners, open `/settings`. See the no-planners page at `/`.
- [ ] On the no-planners page, click the button and create a planner. Land on the new planner's calendar. Sign-out and settings work from there.
- [ ] On the no-planners page, submit an invalid planner name. See the form's error, and stay on the page.
- [ ] Sign up with a new account, not through an invite. Land on a new planner's calendar, as before.
- [ ] Sign in as `owner` with `lastOpenedPlanner` set to one of their planners. Land on that planner. Clear the cookie, open `/` and land on their first planner.
- [ ] Open `/` signed out. See the sign-in prompt.
- [ ] As a user with two planners, leave one. Stay in Settings, with the other still listed.

# Implementation
## Step 1: Share choosing the last-opened planner
**Idea:** Choosing the last-opened planner moves into one function both callers share.

**Source:** Fix: "Move choosing the last-opened planner into a function that `page.tsx` and `settings/layout.tsx` both use"; Acceptance Criteria: "Sign in as `owner` with `lastOpenedPlanner` set..."; Boy Scout fix: remove the `zObjectId` parse from `page.tsx`

**Approach:** New `getLastOpenedPlannerId(planners)` in `src/app/_utils/`, the lowest common parent of its two consumers. It reads the `lastOpenedPlanner` cookie and returns that id if the list holds it, otherwise the first planner's id. It has no `zObjectId` parse, because the membership check covers it, so the parse in `settings/layout.tsx` goes too. It expects at least one planner: `settings/layout.tsx` already checks, and `page.tsx` gets its check in Step 4. The cookie test cases move from `page.test.tsx` and `layout.test.tsx` to the new function's test.

**Files:**
- `src/app/_utils/getLastOpenedPlannerId.ts` (new) - the shared choice
- `src/app/_utils/getLastOpenedPlannerId.test.ts` (new) - the cookie cases
- `src/app/page.tsx` - calls it, drops its own copy and the `zObjectId` parse
- `src/app/page.test.tsx` - mocks it, loses the cookie cases and the `zObjectId` mock
- `src/app/settings/layout.tsx` - calls it, drops its own copy
- `src/app/settings/layout.test.tsx` - mocks it, loses the cookie cases and the `zObjectId` mock

**Acceptance:**
- [ ] Desktop. Sign in as `owner` at `http://localhost:3001/owner`. Open owner's personal planner from the navbar's planner switcher, then open `/`. Land on the personal planner's calendar. Proves: `/` still goes to the last-opened planner.
- [ ] Same user. Open `/settings` and click the back button. Land on the personal planner's calendar. Proves: Settings' back button uses the same choice.
- [ ] Same user. In the browser's dev tools, delete the `lastOpenedPlanner` cookie, then open `/`. Land on Seeded Shared Planner's calendar. Proves: with no cookie, `/` falls back to the first planner.

## Step 2: Move the user lookup out of the root page
**Idea:** `page.tsx` gets the signed-in user's document from a new function that finds or creates it.

**Source:** Fix: "Move the user lookup and first-sign-in creation out of `page.tsx`"; Acceptance Criteria: "Sign up with a new account, not through an invite..."; Acceptance Criteria: "Open `/` signed out..."; Boy Scout fix: remove the unused `searchParams` prop from `page.tsx`; Boy Scout fix: add the leading slash to `page.tsx`'s two redirects

**Approach:** New `getOrCreateUser(email, name)` in `src/app/_utils/`, holding the `User.findOne` and the `addUser` call as they are in `page.tsx`. `page.tsx` is left with the session check and one redirect, `/${plannerId}/calendar`, so the two redirects become one with the leading slash. A brand-new user now goes through `getLastOpenedPlannerId`, which gives them their only planner, as before. The new function's test uses the centralized `@/_models/user` mock. When built, correct the `page.tsx` and `page.test.tsx` paths for the `addUser` call in [[Code Tidy-Ups]], [[Server-Only Creation and Pure Reads]], [[Crafted Input in Invite and Email Actions]] and [[Stale Data Issues]], and remove the `page.test.tsx:36` entry from the known files in [[Server-Only Creation and Pure Reads]].

**Files:**
- `src/app/_utils/getOrCreateUser.ts` (new) - the lookup and first-sign-in creation
- `src/app/_utils/getOrCreateUser.test.ts` (new) - found and created cases
- `src/app/page.tsx` - calls it, loses `searchParams`, has one redirect with a leading slash
- `src/app/page.test.tsx` - mocks it, loses the creation case and the `searchParams` argument, expects the leading slash

**Acceptance:**
- [ ] Desktop, signed out. Open `/`. See the sign-in prompt. Proves: the session check still comes first.
- [ ] Desktop, signed out. On the sign-in prompt, sign up with a new email address you can read, not through an invite, and click the link in the verification email. Land on a new planner's calendar. Proves: first sign-in still creates a user and a planner.
- [ ] Desktop. Sign in as `owner` at `http://localhost:3001/owner`, then open `/`. Land on a planner's calendar. Proves: an existing user is still found and redirected.

## Step 3: Move CreatePlannerForm up to the app's shared components
**Idea:** `CreatePlannerForm` moves from `src/app/settings/_components/` to `src/app/_components/`, so the root page can use it.

**Source:** Fix: "`CreatePlannerForm`: moves from `src/app/settings/_components/` to `src/app/_components/`"

**Approach:** A plain move, with its test. `PlannerListActions` and its test import it from the new path. When built, correct the path in [[Settings Data Refresh]] (Migration Checklist F and its draft step) and [[Form Pattern]].

**Files:**
- `src/app/_components/CreatePlannerForm.tsx` (new) - moved from `src/app/settings/_components/CreatePlannerForm.tsx`, its new home
- `src/app/_components/CreatePlannerForm.test.tsx` (new) - moved from `src/app/settings/_components/CreatePlannerForm.test.tsx`, with the form
- `src/app/settings/_components/PlannerListActions.tsx` - new import path
- `src/app/settings/_components/PlannerListActions.test.tsx` - new mock path

**Acceptance:**
- [ ] Desktop. Sign in as `owner` at `http://localhost:3001/owner`. In `/settings`, open the Planner Settings tab, click **New Planner**, enter `Weekend` and click **Create**. See Weekend in the list. Proves: the moved form works as before.

## Step 4: Show a no-planners page at the root
**Idea:** A user with no planners sees a no-planners page at `/` instead of the crash.

**Source:** Symptoms: the crash at `/`, `/settings` redirecting into it, signing back in landing on it; Root Cause; Fix: "a user with no planners winds up on a plain page" (the page); Fix: "The page shows at `/`, with no route of its own"; Fix: "`src/app/page.tsx`: when the user has no planners, return the new prompt"; Fix: "`NoPlannersPrompt`"; Fix: "`src/app/settings/layout.tsx`: keeps redirecting to `/`"; Acceptance Criteria: "Follow 'Leaving'..."; Acceptance Criteria: "Follow 'Being removed'..."; Acceptance Criteria: "With zero planners, open `/settings`..."; Acceptance Criteria: "As a user with two planners, leave one..."

**Approach:** `page.tsx` returns `<NoPlannersPrompt />` when `user.planners` is empty, before it calls `getLastOpenedPlannerId`. `NoPlannersPrompt` is a server component built like `SignInPrompt`, with `AuthLayoutRoot` and `AuthLayoutHeader`, and the message "You don't have any planners yet." `page.test.tsx` gains the empty-list case, which is the coverage the Root Cause says is missing. `settings/layout.tsx` doesn't change. The two emails below are new, since the 2026-11-02 run may have left users behind on the old ones. During the first and third checks, once the user has sent the invite, the implementer reads its `token` from `pendinginvites` and gives `http://localhost:3000/invite?token=<token>` in chat.

**Files:**
- `src/app/_components/NoPlannersPrompt.tsx` (new) - the page
- `src/app/_components/NoPlannersPrompt.test.tsx` (new) - coverage only
- `src/app/page.tsx` - returns it for an empty list
- `src/app/page.test.tsx` - the empty-list case

**Acceptance:**
- [ ] Desktop. Sign in as `owner` at `http://localhost:3001/owner`. In `/settings`, open the Planner Settings tab, expand Seeded Shared Planner and invite `delivered+zero-leave-2@resend.dev`. Sign out. Ask the implementer in chat for the invite link and open it. Create the account, then sign in with it. In `/settings`, open the Planner Settings tab, expand Seeded Shared Planner, click **Leave Planner** and confirm. See the no-planners page at `/`, not "This page couldn't load". Proves: leaving your last planner no longer crashes.
- [ ] Same user. Open `/settings`. See the no-planners page at `/`. Proves: Settings' redirect now lands somewhere that works.
- [ ] Desktop. Sign in as `owner` at `http://localhost:3001/owner`. In `/settings`, open the Planner Settings tab, expand Seeded Shared Planner, invite `delivered+zero-removed-2@resend.dev` and sign out. Ask the implementer in chat for the invite link, open it and create the account. Sign in as `owner` again at `http://localhost:3001/owner`. In `/settings`, open the Planner Settings tab, expand Seeded Shared Planner, remove that member and sign out. Sign in as the removed user. See the no-planners page at `/`. Proves: being removed from your last planner no longer crashes.
- [ ] Desktop. Sign in as `read` at `http://localhost:3001/read`. In `/settings`, open the Planner Settings tab, expand Seeded Shared Planner, click **Leave Planner** and confirm. Stay in Settings, with read's personal planner still listed. Open `/`. Land on read's personal planner's calendar. Run `pnpm seed` afterwards to restore the seeded users. Proves: the page only shows with zero planners.

## Step 5: Let the no-planners page create a planner
**Idea:** The no-planners page gets a button that creates a planner.

**Source:** Fix: "a user with no planners winds up on a plain page with a button to create a planner" (the button); Fix: "`CreatePlannerButton`"; Fix: "`NoPlannersPrompt`" (the button); Fix: "Its `router.refresh()` re-runs `/`"; Fix: "The create button is the page's only control"; Fix: "Once the user creates a planner they're back in the app, with sign-out, settings and the invite badge"; Symptoms: no page they can reach has a way to sign out or create a planner; Acceptance Criteria: "On the no-planners page, click the button..."; Acceptance Criteria: "On the no-planners page, submit an invalid planner name..."

**Approach:** New client component `CreatePlannerButton`, with a `useDisclosure` for the form's `opened` state, as `PlannerListActions` does, and a `variant="cta"` button labeled "Create Planner". It holds no other logic: the form's existing `router.refresh()` re-runs `/`, which now finds a planner and redirects to it. When built, add an Inbox item to [[Settings Data Refresh]]: on the no-planners page, the form's `router.refresh()` is what takes the user to their new planner. Before handing off this step's checks, the implementer creates an invited user, takes them to zero planners and gives their email and password in chat.

**Files:**
- `src/app/_components/CreatePlannerButton.tsx` (new) - the button and the form
- `src/app/_components/CreatePlannerButton.test.tsx` (new) - clicking opens the form, closing closes it
- `src/app/_components/NoPlannersPrompt.tsx` - renders the button below the message
- `src/app/_components/NoPlannersPrompt.test.tsx` - mocks the button

**Acceptance:**
- [ ] Desktop. Sign in with the zero-planner user whose email and password the implementer gives you in chat. On `/`, click **Create Planner**, enter `Bad!Name` and click **Create**. See "Contains invalid characters" in the form, still on `/`. Proves: the form's error shows on this page.
- [ ] Same user. Change the name to `Weekend` and click **Create**. Land on Weekend's calendar. Open the user menu and click **Settings**, see the Settings page. Click the back arrow, land on Weekend's calendar. Open the user menu and click **Log Out**, see the sign-in prompt. Proves: creating a planner brings the user back into the app, with sign-out and settings working.
