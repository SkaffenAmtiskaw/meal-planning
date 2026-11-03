---
type: 
status: idea
confirmed: 2026-11-02
---
# Where It Stands
Next: /shape ^status

# Notes
`signUpWithInvite`'s rollback (`src/_actions/sharing/signUpWithInvite.ts:81`) looks like it never works: `auth.api.removeUser` requires a session, the action calls it with none, and `catchify` swallows the error. If `addUser` fails after the better-auth user is created, that user stays behind, the invitee's retry fails with "user already exists", and signing in would land them on a new planner rather than the one they were invited to.

Found 2026-11-02 by reading better-auth 1.7.13's code while shaping a Roadmap line; not reproduced.

# Questions
