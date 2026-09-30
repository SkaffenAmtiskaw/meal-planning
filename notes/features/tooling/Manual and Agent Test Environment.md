---
type: 
status: idea
confirmed: 2026-09-28
---
%% For jotting something down quickly. Leave `type` blank until it's clear what kind of story this is (feature / bug / pattern / cleanup / workflow), then move the content into that template. %%

# Where It Stands

%% The line ending in ` ^status` is the story's status and nothing else: what work it needs next, or what it's waiting on, e.g. "Next: design session in Claude Design, then /assess" or "Blocked until [[Stale Data Issues]] lands". Don't describe the story here; the Roadmap link already names it and Purpose describes it. The Roadmap embeds that line with `![[<note>#^status]]`, so keep the ` ^status` ID on it. Add detail below it only when the story needs it. %%

Next: /shape ^status

# Notes
Split from E2E Test Setup by its decision 4:
> **Decided 2026-09-28:** No shared seed. E2E tests read no seed data (decision 2). Manual and agent testing get their own Dev Foundations story, scoped to Sarah's goals: manual testing of access-level edge cases without tedious setup, and `first-pass` agents never stopping because no user exists for an access level. `/architect` writes the E2E data-creation helpers as plain functions, free of Playwright-specific code, so a dev seed script can reuse them. This follows the practice of tests and seeders sharing one set of factories, and the Single Concern rule.

Sarah's goals for this story:
- Manual testing of edge cases for users with different access levels doesn't take a bunch of tedious manual steps.
- Agents doing `first-pass` work never stop at an edge case because no user is set up for an access level.

Findings from E2E Test Setup's /decide run, 2026-09-28:
- There are four access levels: `owner`, `admin`, `write`, `read`, stored per planner on the `User` doc (`src/_models/user/user.ts`).
- The dev data in `.env.local`'s `DB_URL` (the Atlas database named `test`) doesn't share data with production (Sarah, 2026-09-28). How they're kept apart (a different database, a different cluster or something else) is for [[Services and Environments Audit]] to find out.
- better-auth's `testUtils` plugin creates verified users, but its docs show no password accounts, so users that Sarah and agents sign in as through the UI need passwords some other way.

From E2E Test Setup's /decide run, 2026-09-29:
- The shared data-creation helpers live in `test/`, so a seed script imports them from there. E2E Test Setup's decision 5:
  > **Decided 2026-09-29:** Specs and Playwright-only code (fixtures, globalSetup) go in a root `e2e/` folder. The plain data-creation helpers go in `test/`, apart from Playwright code; /architect names the subfolder, apart from the unit-test builders in `test/fixtures/`.
- That same user helper can give manual test users passwords: it creates the better-auth user through `auth.api.createUser` (`emailVerified: true`, password optional, lowercased email) together with the app's `User` doc, the way `signUpWithInvite.ts` does. This bears on the question below about a better way to give manual test users passwords. E2E Test Setup's decision 6:
  > **Decided 2026-09-29:** Each test signs in with better-auth `testUtils` `getCookies` on a test-only auth instance that also carries `admin()`. The plain user helper in `test/` creates the better-auth user through `auth.api.createUser` (`emailVerified: true`, password optional, lowercased email) together with the app's `User` doc, the way `signUpWithInvite.ts` does.
- `testUtils` `getCookies` signs a session cookie for any user ID, so agents could sign in without a stored password. This is an option to weigh against storing agent credentials; it doesn't settle where the logins Sarah types in are kept. (E2E Test Setup decision 6 research)

# Questions
- What's the standard practice other apps use for storing credentials that only agents and local testing use? Today they're in the gitignored `.opencode/secrets/credentials.md`, which the `running-the-app` skill reads. That was a quick fix, not a convention, and `.opencode/` is going away.
- Is there a better way to give manual test users passwords? If not, Sarah can create them by hand and keep their logins in a credentials file.
