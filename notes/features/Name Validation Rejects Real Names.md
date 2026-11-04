---
type: bug
status: spec
blocked-by: []
confirmed: 2026-11-03
---
# Where It Stands
Next: /plan-steps ^status

Split from the Roadmap line "security - string validation on inputs". The fix removes the character check and escapes names in the invite email. Reproduced in a unit test, not run in the app.

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

`zSafeString` is also what keeps HTML out of the planner name in invite emails, because `sendInviteEmail.ts` doesn't escape it.

**Repro steps (2026-11-03):**
Settings, signed in as the seeded `owner`:
1. Open `/settings`, select **Change name**, enter `José` in **New name** and select **Save name**.
2. A red alert says "Contains invalid characters", and the name doesn't change. O’Brien with a curly apostrophe does the same.
3. Select **New Planner**, enter `Mom & Dad's` in **Planner name** and select **Create**. The same alert shows, and no planner is created. `Family (home)` and `Meals 🍕` do the same.
4. Open a planner the user owns, select **Rename**, enter `Zoë` in **Planner name** and select **Save**. The same alert shows, and the name doesn't change.

Signing up, as a new user:
1. Signed out, open `/`, enter a new email and select **Continue**.
2. Enter `李明` in **Name (optional)**, enter a password of at least 8 characters and select **Create Account**. The same error shows, and no account is created.

Registering from an invite:
1. Signed in as `owner`, invite `delivered+name-check@resend.dev` to a planner from `/settings`.
2. Signed out, open the link from that invite email, which is in the Resend dashboard.
3. Enter `José` in **Name**, enter a password of at least 8 characters and select **Create Account**. An error says "Name Contains invalid characters", and no account is created.

# Who Can Hit This
Anyone whose name, or the name they want for a planner, has a character outside that list, when they sign up, register from an invite, change their name in Settings, or create or rename a planner. Someone who signs in with Google gets their Google name without the check, and hits it only on changing that name or naming a planner.

# Root Cause
The fault starts in one module, `src/_utils/zSafeString/zSafeString.ts`. Its regex, `/^[a-zA-Z0-9 '.,-]+$/`, is an allow-list of unaccented characters, so any name with another character fails. It should accept any name people really use. `SignInFlow.tsx`, `InviteRegistrationFlow.tsx`, `updateUserName`, `createPlanner` and `updatePlannerName` all call it. `zUserInterface` in `src/_models/user/user.types.ts` also uses it, but only to infer a type, so it never checks anything at runtime.

Evidence, reproduced in a unit test: `zSafeString().safeParse(name).success` is `false` for José, Zoë, 李明, O’Brien with a curly apostrophe, Mom & Dad's, Family (home) and Meals 🍕. The test is removed.

What the character check protects:
- **Invite email HTML:** `src/_auth/emails/sendInviteEmail.ts` puts `plannerName` and `inviterName` into its HTML unescaped, so the check is what keeps HTML out of names that go through it.
- **Database:** nothing. `z.string()` already rejects objects, and names are only stored as values, never used in a query filter.
- **Pages:** nothing. React escapes names, and nothing in `src` uses `dangerouslySetInnerHTML`.
- **Other emails:** nothing. None of them use names.

Test coverage: no test tries a name outside the allow-list. `zSafeString.test.ts` only accepts unaccented names, and rejects `$`, `{`, `<` and `\`. `updateUserName.test.ts` and `updatePlannerName.test.ts` use the real check, with `$evil` and `Name <script>` as their invalid names. `SignInFlow.test.tsx`, `InviteRegistrationFlow.test.tsx` and `createPlanner.test.ts` mock it. There are no E2E tests for names.

# Fix
Remove the character check, and escape names where they go into HTML:
- **`zSafeString`:** remove the regex, leaving the minimum and maximum length. It no longer checks safety, so rename it `zName` and rename its folder, its five callers, `user.types.ts` and the three test mocks to match.
- **`sendInviteEmail.ts`:** escape `plannerName` and `inviterName` in the HTML, through a new `escapeHtml` helper in `src/_auth/emails/` that escapes `&`, `<`, `>`, `"` and `'`. The subject stays unescaped, because it's plain text and `Mom & Dad's` would otherwise show as `Mom &amp; Dad's`.
- **Tests:** drop the character rejection tests from `zSafeString.test.ts` and the "invalid characters" tests from `updateUserName.test.ts` and `updatePlannerName.test.ts`. Add tests that the seven names above are accepted and that `sendInviteEmail` escapes both names in the HTML and leaves the subject alone.

Both changes go in together, so names with HTML in them are never accepted while the email is still unescaped.

This won over rejecting only `<` and `>`, which still turns away names such as `Family <3`, and over a wider Unicode allow-list, which still rejects names such as `Family #1` and `Meals!`, so the same bug would come back.

# Acceptance Criteria
- [ ] Following the Settings repro steps as the seeded `owner`, `José` saves as the name, `Mom & Dad's` creates a planner and `Zoë` renames one, each showing as typed, with no alert.
- [ ] Following the sign-up repro steps, `李明` creates the account, and after verifying the email it shows as the name in Settings.
- [ ] Following the invite repro steps, `José` creates the account and joins the planner.
- [ ] A name of `<b>Bold</b>` saves in Settings and shows as those literal characters, not bold, in Settings and the navbar. A planner named the same does too.
- [ ] From a planner named `Mom & Dad's <b>Meals</b>`, with the inviter's name `<b>José</b>`, invite `delivered+name-check@resend.dev`. In the Resend dashboard, the email shows both names as literal text with nothing bold, and the subject reads `You've been invited to join Mom & Dad's <b>Meals</b> on Meal Planner`.
- [ ] An empty name still shows "Must be at least 1 character", and a name of 51 characters still shows "Must be 50 characters or fewer", in Settings and when creating a planner.
- [ ] Nearby flows still work: sign up with no name gives "New User", and accept an invite as an existing user from Settings.

# Implementation
