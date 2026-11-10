# The Hotfix Rule
A bug's Roadmap line gets `🔥 Hotfix: <reason>` when the error makes the production app unusable, so its fix ships from `main` before the next release (`docs/branching.md`, "A Hotfix"). The session adds it with nobody watching, so the rule is narrow: it covers only an error that every user meets on the way in.

## When It Gets 🔥
The line gets 🔥 when both hold:
- The error is in one of the app's entry points.
- The analyst's verdict isn't that an outside service failed, such as the database or Resend, since then there's no code for a hotfix to fix.

The entry points are the files every user goes through to get in:
- any `layout.tsx` under `src/app/`
- `src/app/page.tsx`
- the page that sign-in lands on, `src/app/[planner]/calendar/page.tsx`
- the auth check and user lookup: `checkAuth` (`src/_actions/auth/checkAuth.ts`), `getUser` and `addUser` (`src/_actions/user/getUser.ts` and `src/_actions/user/addUser.ts`), and `getPlannerClient` (`src/_actions/planner/getPlannerClient.ts`)
- sign-in: `src/_auth/` and `src/app/api/auth/[...all]/route.ts`

Any one of these pieces of evidence puts the error in an entry point:
- an in-app frame in one of these files
- the test that reproduces it, failing in one of these files
- when the exceptions have no frames: the page's URL is `/` or `/<planner ID>/calendar`, and the exception is Next's generic production error, which starts `An error occurred in the Server Components render`

The reason names the file and what users can't do, such as `🔥 Hotfix: src/app/[planner]/layout.tsx throws, so no planner page loads`.

## When It Doesn't
The cases that get no 🔥:
- **An outside service failed:** no 🔥, and nothing to suggest, since there's no code for a hotfix to fix.
- **A core flow inside a page breaks,** such as saving a meal or opening the grocery list: the summary suggests 🔥 for the user to add, with the reason. Only the user judges how much a broken flow inside a page matters.
- **Anything else,** such as an error the evidence doesn't place in an entry point: no 🔥, and nothing to suggest.
