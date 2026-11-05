---
type: feature
status: spec
blocked-by:
  - "decision needed: how E2E tests get the link from an email"
confirmed: 2026-11-04
---
# Where It Stands
Next: /decide, then /assess ^status

# Inbox

# Purpose
Regression tests for what the auth area already does, plus the way E2E tests get the link from an email. These tests add protection against regressions in what's already built. They cover each flow's main path, and the failures that depend on the server, the database or a real link. Form-level validation stays in unit tests.

Split from Core Flows E2E Tests on 2026-10-04. Sarah decided 2026-10-04 that the app-wide review is split into one story per feature area in `docs/e2e_tests.md` ("Feature Areas"), and that each area's story gets more granular about which flows to test.

Sarah decided 2026-09-28 that handling email confirmation belongs with the auth flow tests. On 2026-10-04 she decided that the way E2E tests get email links is built in this story, not in a story of its own, since it has nothing to prove it works until a test uses it. [[Settings E2E Tests]] and [[Sharing E2E Tests]] need it too.

Sarah's notes from E2E Testing:
- Part of this will be an app-wide review to determine what needs e2e tests added now.
- the auth workflows will need e2e tests, but we have email confirmation for things like account creation - how the hell will we manage that in e2e tests?

# Requirements
Each flow is tested in `e2e/auth/`:
- **Sign-up:** a new email goes to the sign-up step, the account is created, and "check your inbox" shows. Following the verification link signs the user in and lands them on their planner.
- **Sign-in:** an email with a password goes to the password step, and the right password lands the user on their planner.
  - A wrong password shows an error and doesn't sign them in.
  - A user whose email isn't verified can't sign in.
  - An email linked only to Google shows the alert saying so.
- **Reset password:** "Forgot password?" shows "check your inbox". Following the link and setting a new password lets the user sign in with it.
  - The old password no longer works.
  - `/reset-password` with no token shows "Invalid reset link".
  - A bad or already-used token shows an error when the form is submitted.
- **`/verify-email`:** a failed verification shows "Verification link expired", and the form there sends a new link that works. With no error, the page redirects to `/`.
- **`/verify-email-change`:** a valid link shows "Email updated" with the new address. No token shows "Invalid link", and an unknown or expired token shows "Link expired". A user with no password sees "Set a password to continue".
- **Email links:** a test can get the link from any email the app sends: sign-up verification, reset password, invite, email change and account deletion.

# Open Decisions
1. How do E2E tests get the link from an email? Five flows send a link by email: sign-up verification, reset password, invite, email change and account deletion. The app sends them straight through Resend's API (`src/_auth/emails/*.ts`), which gets a dummy key in E2E runs (`playwright.config.ts`). Approaches found while shaping, not ranked:
   - read the token from the database with a factory, since better-auth stores verification tokens
   - a test-mode email sink in the app that records emails instead of sending them
   - a local mail catcher, such as Mailpit
   - a hosted test inbox, such as Mailosaur

# Out of Scope
- Google sign-in and One Tap, since they depend on Google.
- Requesting an email change and deleting an account: [[Settings E2E Tests]].
- Invites: [[Sharing E2E Tests]].
- Running these tests in CI: [[E2E Tests in CI]].
- Fixing a bug these tests turn up: it gets its own note.

# Suggested Approach

# Implementation
