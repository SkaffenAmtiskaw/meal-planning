---
type: 
status: idea
confirmed: 2026-11-02
---
# Where It Stands
Next: /shape ^status

# Notes
Found 2026-11-02 during `/investigate` of [[Zero Planners Crash]], in the running app. After an invitee creates an account, `signUpWithInvite` (`src/_actions/sharing/signUpWithInvite.ts:98`) redirects to `/?invite_success=true&planner=<id>`. No code in `src` outside the tests reads either param. The new invitee lands on the plain sign-in page, with no message saying the account was created or that they joined a planner.

# Questions
