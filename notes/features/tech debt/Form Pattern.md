---
type: pattern
status: idea
blocked-by: []
confirmed: 2026-11-02
---
# Where It Stands
Next: /architect ^status

Direction: set one way to write a form, using a `<form>` element and Mantine Form, then migrate every form that doesn't follow it.

# Inbox

# Purpose
Every form in the app is written the same way: a `<form>` element for submitting, and Mantine Form for its state and validation. Today forms are written several different ways and no doc says which to use, so each new form makes the choice again. Sarah sees Enter not submitting as one symptom of this larger issue.

# Symptoms
On the sign-in page, pressing Enter in the email, password or sign-up inputs doesn't submit; only clicking the button does. `SignInFlow.tsx` has no `<form>` or `onSubmit`.

Found by reading the code on 2026-11-02, not by running the app:
- **`<form>` and Mantine Form:** `AddMealForm`, `BookmarkForm`, `RecipeForm`
- **`<form>`, with `useState`:** `src/app/invite/_components/InviteRegistrationFlow.tsx`
- **No `<form>`, and a hand-written key handler for Enter, with `useState`:** `src/app/settings/_components/InviteForm.tsx`
- **No `<form>` or Mantine Form, and submitting only on a button click, so Enter probably does nothing:**
  - `src/app/_components/SignInFlow.tsx`
  - `src/app/settings/_components/`: `ChangeNameForm`, `ChangeEmailForm`, `ChangePasswordForm`, `DeleteAccountForm`, `CreatePlannerForm`, and the rename in `PlannerItem`
  - `src/app/verify-email/_components/ResendVerificationForm.tsx`
  - `src/app/reset-password/_components/ResetPasswordForm.tsx`
  - `src/app/verify-email-change/_components/SetPasswordForm.tsx`

# Rules
Sarah decided 2026-11-02 that every form uses both a `<form>` element and Mantine Form. (Sarah's call)

For /architect:
- The original idea for the sign-in page was to wrap each step in a form.
- In `DeleteAccountForm`, Enter would trigger a destructive action, so weigh how the rule applies there.

# Enforcement

# Migration Checklist

# Out of Scope
Splitting `SignInFlow.tsx` into one component per step, which is its own line under App Health. The two overlap, so they could be planned together.

# Implementation
