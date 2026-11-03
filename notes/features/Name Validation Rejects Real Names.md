---
type: bug
status: idea
blocked-by: []
confirmed: 2026-11-02
---
# Where It Stands
Next: /investigate ^status

Split from the Roadmap line "security - string validation on inputs". The check on user and planner names rejects names people really use. Tested against the check's pattern, not yet reproduced in the running app.

# Inbox

# Symptoms
Found by reading code on 2026-11-02, and by testing these names against the pattern in `src/_utils/zSafeString/zSafeString.ts`. **Not reproduced in the running app.**

`zSafeString` allows only unaccented letters, digits, spaces and `'.,-`. It rejects:
- José, Zoë and 李明
- O'Brien typed with a curly apostrophe, which phones often insert
- Mom & Dad's, Family (home) and Meals 🍕

Where someone would see "Contains invalid characters":
- signing up, in `SignInFlow.tsx`
- registering from an invite, in `InviteRegistrationFlow.tsx`
- changing their name in Settings, through `updateUserName`
- creating or renaming a planner, through `createPlanner` and `updatePlannerName`

Google sign-in doesn't go through this check, so someone whose Google name is José signs in fine, but can't save that same name in Settings.

`zSafeString` is also what keeps HTML out of the planner name in invite emails, because `sendInviteEmail.ts` doesn't escape it. [[Crafted Input in Invite and Email Actions]] covers that email.

# Who Can Hit This
Anyone whose name, or the name they want for a planner, has a character outside that list.

# Root Cause

# Fix

# Acceptance Criteria

# Implementation
