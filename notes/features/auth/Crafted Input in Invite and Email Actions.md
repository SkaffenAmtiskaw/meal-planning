---
type: bug
status: idea
blocked-by: []
confirmed: 2026-11-02
---
# Where It Stands
Next: /investigate ^status

Split from the Roadmap line "security - string validation on inputs". Crafted requests may be able to take over accounts and send HTML in invite emails. Neither is reproduced yet.

# Inbox

# Symptoms
Found by reading code on 2026-11-02. **Not reproduced in the running app.** Mongoose was tested on its own and keeps a `{ "$ne": null }` filter on a string field. That a server action accepts an object in place of a string is an agent's assumption, and hasn't been tested.

**Database operators in place of a token or email.** These actions pass the value to a database query without checking that it's a string, and none of them needs a sign-in:
- `signUpWithInvite`: a filter such as `{ "$ne": null }` matches a pending invite without its token. The action then creates an account for the invited email with the caller's password, marks it verified and adds it to the invite's planner. It fails if that email already has an account.
- `verifyEmailChangeAndSetPassword`: the same filter matches an account with an email change pending. The action then adds the caller's password to that account and completes the change.
- `checkEmailStatus`: a pattern filter can reveal stored emails one character at a time. The caller needs an account's email to sign in after either attack above.
- `verifyEmailChange` has the same gap, but only a server page calls it, so it may not be reachable.

`acceptInvite` has the same query, but it checks the invite's email against the signed-in user's, so it doesn't let anyone take another person's invite.

**HTML in invite emails.** `src/_auth/emails/sendInviteEmail.ts` puts the inviter's name into the email's HTML unescaped. The name isn't checked on the server:
- At sign-up, only `SignInFlow.tsx` checks it, in the browser. `src/app/page.tsx:39` then copies it into the app's user record.
- `signUpWithInvite` stores its `name` unchecked.

So someone could sign up with HTML as their name and invite any address. The recipient would get an email from the app's domain containing that HTML, such as a link to another site.

# Who Can Hit This
Anyone who can reach the app, with no account for the database operator problems and a new account for the invite emails. The people affected are those with a pending invite or email change, and anyone a crafted invite email is sent to.

# Root Cause

# Fix

# Acceptance Criteria

# Implementation
