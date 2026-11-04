---
type: 
status: idea
confirmed: 2026-11-02
---
# Where It Stands
Next: /shape ^status

# Notes
Found 2026-11-02 during `/investigate` of [[Zero Planners Crash]], in the running app. The browser was signed in as a seeded owner when the invite form was submitted for a different email. The account was created, but the user landed on the owner's calendar still signed in as the owner, with nothing saying what had happened. Related files: `src/app/invite/_components/InviteRegistrationFlow.tsx`, `src/_actions/sharing/signUpWithInvite.ts`. `src/app/invite/page.tsx` doesn't look at the session either.

# Questions
