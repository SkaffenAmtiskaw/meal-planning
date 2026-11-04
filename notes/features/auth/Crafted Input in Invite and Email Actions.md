---
type: bug
status: idea
blocked-by: []
confirmed: 2026-11-02
---
# Where It Stands
Next: /investigate ^status

Split from the Roadmap line "security - string validation on inputs". Crafted requests may be able to take over accounts. Not reproduced yet.

# Inbox

# Symptoms
Found by reading code on 2026-11-02. **Not reproduced in the running app.** Mongoose was tested on its own and keeps a `{ "$ne": null }` filter on a string field. That a server action accepts an object in place of a string is an agent's assumption, and hasn't been tested.

**Database operators in place of a token or email.** These actions pass the value to a database query without checking that it's a string, and none of them needs a sign-in:
- `signUpWithInvite`: a filter such as `{ "$ne": null }` matches a pending invite without its token. The action then creates an account for the invited email with the caller's password, marks it verified and adds it to the invite's planner. It fails if that email already has an account.
- `verifyEmailChangeAndSetPassword`: the same filter matches an account with an email change pending. The action then adds the caller's password to that account and completes the change.
- `checkEmailStatus`: a pattern filter can reveal stored emails one character at a time. The caller needs an account's email to sign in after either attack above.
- `verifyEmailChange` has the same gap, but only a server page calls it, so it may not be reachable.

`acceptInvite` has the same query, but it checks the invite's email against the signed-in user's, so it doesn't let anyone take another person's invite.

# Who Can Hit This
Anyone who can reach the app, with no account. The people affected are those with a pending invite or email change.

# Root Cause

# Fix

# Acceptance Criteria

# Implementation
