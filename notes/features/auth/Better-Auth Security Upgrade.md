---
type: 
status: idea
confirmed: 2026-10-04
---
# Where It Stands

Next: /shape ^status

# Notes
Found 2026-10-02 by `pnpm audit` during `/infra-design` on [[Local Dependency Update Alerts]]. Sarah routed it to Next with 🚨, since better-auth ships in the app's build.

- **The advisories:** `better-auth` 1.5.6 has a critical advisory fixed in 1.6.11, and several high ones, the latest fixed in 1.6.22. Its transitive `defu` (fixed in 6.1.5) and `kysely` (fixed in 0.28.17) have high advisories too, and both fixes are inside the ranges better-auth asks for. So the upgrade is to 1.6.22 or later. The latest is 1.7.7.
- **A breaking change in 1.6** ([release post](https://better-auth.com/blog/1-6)): session freshness now uses the session's `createdAt` instead of `updatedAt`, so sensitive actions may ask the user to sign in again more often. Flows that may count as sensitive: `src/app/settings/_components/ChangePasswordForm.tsx`, `src/app/verify-email-change/_components/SetPasswordForm.tsx` and the reset-password flow in `src/app/reset-password/`. The other 1.6 breaking change, SAML `InResponseTo` validation, doesn't apply, since the app has no SAML.
- 1.7's changes haven't been checked yet.

# Questions

