---
type: 
status: idea
confirmed: 2026-10-04
---
# Where It Stands
Next: /shape ^status

# Notes
Split from Core Flows E2E Tests on 2026-10-04.

Scope: regression tests for what the auth area already does (`/`, `/reset-password`, `/verify-email` and `/verify-email-change`), such as sign-up, sign-in, reset password and email verification, plus the way E2E tests get the link from an email. Google sign-in and One Tap are out, since they depend on Google.

Sarah decided 2026-10-04 that the app-wide review is split into one story per feature area in `docs/e2e_tests.md` ("Feature Areas"), and that each area's story gets more granular about which flows to test. These tests add protection against regressions in what's already built.

Sarah decided 2026-09-28 that handling email confirmation belongs with the auth flow tests. On 2026-10-04 she decided that the way E2E tests get email links is built in this story, not in a story of its own, since it has nothing to prove it works until a test uses it. [[Settings E2E Tests]] and [[Sharing E2E Tests]] need it too.

How E2E tests get the link from an email is an open decision Sarah left for `/decide` on 2026-10-04. Five flows send a link by email: sign-up verification, reset password, invite, email change and account deletion. The app sends them straight through Resend's API (`src/_auth/emails/*.ts`), which gets a dummy key in E2E runs (`playwright.config.ts`). Approaches found while shaping, not ranked:
- read the token from the database with a factory, since better-auth stores verification tokens
- a test-mode email sink in the app that records emails instead of sending them
- a local mail catcher, such as Mailpit
- a hosted test inbox, such as Mailosaur

Sarah's notes from E2E Testing:
- Part of this will be an app-wide review to determine what needs e2e tests added now.
- the auth workflows will need e2e tests, but we have email confirmation for things like account creation - how the hell will we manage that in e2e tests?

# Questions
