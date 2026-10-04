---
type: 
status: in-progress
confirmed: 2026-10-04
---
# Where It Stands

Built and checked on `fix/better-auth-security-upgrade`. Next: commit and PR to main, then /close ^status

better-auth is upgraded from 1.5.6 to 1.6.33, and the lockfile's `defu` from 6.1.4 to 6.1.7. `pnpm audit` no longer lists better-auth, defu or kysely. Types, lint, unit tests, the build and the E2E test pass, and signing in and out through the form works against the dev database. What remains is committing, the PR to main and closing the note.

# Inbox

# Notes
Found 2026-10-02 by `pnpm audit` during `/infra-design` on [[Local Dependency Update Alerts]]. Sarah routed it to Next with 🚨, since better-auth ships in the app's build. Sarah had the upgrade done directly on 2026-10-04, without `/shape` and the steps after it.

- **The advisories:** `better-auth` 1.5.6 has a critical advisory fixed in 1.6.11, and several high ones, the latest fixed in 1.6.22. Its transitive `defu` (fixed in 6.1.5) and `kysely` (fixed in 0.28.17) have high advisories too, and both fixes are inside the ranges better-auth asks for. So the upgrade is to 1.6.22 or later. The latest is 1.7.7.
- **A breaking change in 1.6** ([release post](https://better-auth.com/blog/1-6)): session freshness now uses the session's `createdAt` instead of `updatedAt`. It doesn't reach the app: in 1.6.33 only `/unlink-account` and `/delete-user` check freshness, and the app calls neither. Change password and reset password only need a valid session. The other 1.6 breaking change, SAML `InResponseTo` validation, doesn't apply, since the app has no SAML.
- **1.6 or 1.7:** Sarah decided 2026-10-04 to stay on the 1.6 line (1.6.33), the smallest upgrade that fixes every advisory, and to upgrade to 1.7 separately. What 1.7 means for the app ([upgrade guide](https://better-auth.com/docs/guides/1-7-upgrade-guide)):
  - One Tap binds accounts to the verified Google subject instead of matching by email. The guide doesn't say what happens when an existing email/password user signs in with One Tap for the first time, so that needs a click-through.
  - 1.7.7 asks for `zod` `^4.5.4`. The app has 4.4.3, so it should be bumped with it, or pnpm installs a second copy.
  - No schema or data migration for email/password or Google accounts with the built-in MongoDB adapter. The account APIs whose selectors changed (`listAccounts`, `unlinkAccount`, account token calls) aren't used. One Tap's new `clientId` requirement is met by the Google provider's client ID.
  - The rest (OAuth provider and OIDC, SCIM, SAML, MCP, Expo, device authorization, custom adapters) doesn't apply.
