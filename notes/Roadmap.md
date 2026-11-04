*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

## How this file works
- **Goals** - ranked epics, each a note in `goals/`, shaped and ranked with `/roadmap`. Only Sarah changes the order. Only one goal is built at a time, so `develop` never holds another goal's unfinished work and a finished goal releases all at once:
	- **The building goal** is the top one, marked `- building`. A story or collecting-note item is built (`/implement`, `/infra-build`, `/tooling`) only when it serves the building goal, serves no ranked goal, or its line has 🚨 or 📌. A line under the Bugs heading isn't built until a release picks it up.
	- **The planning goal** is the second, marked `- planning`. Its stories can be shaped, decided, designed and planned down to steps, but they aren't built until the building goal is released. Collecting notes aren't kicked off for it.
	- **The rest** organize the backlog. Their lines sit under their headings in Later, and their stories can be shaped and decided ahead of their turn.
	- **Standing Goals** - listed under their own subheading below the ranked goals. Each collects work that no ranked goal would take, such as library upgrades, and never ships itself, so it's never ranked, building or planning. When Sarah wants to take on some of that work, `/roadmap` draws a goal from it, named `<standing goal> YYYY-MM-DD`, which takes the work she picks and is ranked like any other goal.
- **What joins every release** - sweeps, collecting workflow notes and bugs rarely fit a goal, so if they waited for one they might wait forever. So when any goal starts building, `/roadmap` kicks off every sweep and collecting workflow note and moves every bug line into Next. A sweep item blocked by a story in this release, meaning its line is in Now or Next, joins the release, and the sweep waits for the story through `blocked-by`. Other blocked work waits for the next release. The goal ships once this work is done too.
- **Now** - in progress. Keep this to 2-3 items.
- **Next** - the building goal's queue, in order. The first line not waiting on anything is the next one to plan or build. A line that's waiting keeps its place, and its status embed says what it waits on. A line that serves both the building and planning goals goes here.
- **Planning** - the planning goal's queue, in order. The first line not waiting on anything is the next one to plan. When the planning goal starts building, its lines move into Next in the same order.
- **Later** - committed, not ordered. One heading per goal, in rank order, then one per standing goal, then **Bugs**, then **Unaffiliated** for other lines that serve no goal and for every collecting note's line. A line that serves more than one goal sits under one of their headings and ends with a `🎯 [[Goal]]` link for each other goal. A re-rank doesn't move it to another heading. Dev tooling and agent work sits under [[Dev Tooling]]'s heading unless Sarah puts it under a ranked goal.
- **Bugs** - the heading in Later where bugs in the shipped app, security issues included, wait for the next release. They belong to no goal, because they're just work that needs doing, and the next goal to start building picks them up. Until then, a bug can be shaped, investigated and planned down to steps, so it's ready when its release starts, but it isn't built. An urgent bug gets 🚨 and moves into Next. A bug in a story still being built belongs to that story, and one in dev tooling or CI belongs to [[Dev Tooling]]. Code that works but needs changing belongs to [[App Health]].
- **Ideas** - not committed. A story's line moves to Later once it's committed: when `/shape` shapes it, or when `/decide` settles that it's worth doing.
- **Markers:** every Now and Next line ends, after its status embed, with a 🎯 link for each goal it serves, one of them the building goal, or with 🚨, 📌 or 🔁. Every Planning line ends with a 🎯 link for each goal it serves, one of them the planning goal:
	- `🎯 [[Goal]]` - serves that goal.
	- `🚨 <reason>` - urgent, such as a security fix or a bug a user reported. Agents may suggest it, but only Sarah adds it.
	- `📌 <reason>` - Sarah scheduled it outside the goals. Only Sarah adds it.
	- `🔁` - joined this release without belonging to a goal: a bug, or a kicked-off sweep or collecting workflow note. `/roadmap` adds it when the line moves into Next.

	A Now, Next or Planning line without its marker is out of place. Raise it with Sarah.
- **Hubs** hold shared design, not priority. A hub has a line only while it has a next step of its own, such as `/brainstorm`, `/decide` or `/close`. Once its `^status` line says `Next: its child stories`, it has none.
- **Archived notes** have no line while an open story still relies on them. Once none does, an archived note gets a line until `/close` deletes it.
- A story's status (`idea` / `spec` / `ready` / `in-progress` / `in-review` / `done`) lives in its note's frontmatter. This file only decides order.
- Each line with a note, except a goal's, embeds that note's status line from Where It Stands after the link, e.g. `[[Stale Data Issues]] ![[Stale Data Issues#^status]]`. It shows only what the story needs next, the next skill or a link to what blocks it, not what the story is. Edit it in the note, not here.
- **Collecting notes** gather items until they're handled together: sweeps (`type: sweep`) for small, decided fixes that share a group, such as [[Unit Test Tidy-Ups]], and collecting workflow notes for tooling and agent changes, such as [[Agent Workflow Changes]]. An item that fits one, and belongs to no story or hub, goes there, not onto its own line here. When several related items sit here as separate lines and none covers them, flag to Sarah that they could become a new one. Never create one without her.
	- **The note's line** carries no 🎯 links and always sits in Unaffiliated in Later. A collecting note keeps getting new items, so it never finishes. A kickoff freezes some of its items into a dated copy, `<note> YYYY-MM-DD`, which can finish, and the note keeps collecting.
	- **Their items** have no goal links, because they join whichever release comes next. The copy's line ends with 🔁 and sits in Next.

# Goals
1. [[Dev Foundations]] - building
2. [[Calendar Page]] - planning
3. [[Recipes Page]]
4. [[Grocery List Creation]]

## Standing Goals
- [[App Health]]
- [[Dev Tooling]]

# Now

# Next
1. [[Large Workflow Changes]] ![[Large Workflow Changes#^status]] 🎯 [[Dev Foundations]]
2. [[Goal Roadmap Review]] ![[Goal Roadmap Review#^status]] 🎯 [[Dev Foundations]]
3. [[Standing Goal Roadmap Review]] ![[Standing Goal Roadmap Review#^status]] 🎯 [[Dev Foundations]]
4. [[CI-Failure Review]] ![[CI-Failure Review#^status]] 🎯 [[Dev Foundations]]
5. [[Dependency-Updates Review]] ![[Dependency-Updates Review#^status]] 🎯 [[Dev Foundations]]
6. [[AGENTS.md Review]] ![[AGENTS.md Review#^status]] 🎯 [[Dev Foundations]]
7. [[Memory Folder Review]] ![[Memory Folder Review#^status]] 🎯 [[Dev Foundations]]
8. [[Note Conventions and Roadmap Header Review]] ![[Note Conventions and Roadmap Header Review#^status]] 🎯 [[Dev Foundations]]
9. [[Conventions Review]] ![[Conventions Review#^status]] 🎯 [[Dev Foundations]]
10. [[Agent Workflow Changes 2026-10-02]] ![[Agent Workflow Changes 2026-10-02#^status]] 🎯 [[Dev Foundations]]
11. [[Dependency Release Analysis]] ![[Dependency Release Analysis#^status]] 🎯 [[Dev Foundations]]
12. [[Notes Vault Repo]] ![[Notes Vault Repo#^status]] 🎯 [[Dev Foundations]]
13. [[Branching and Releases]] ![[Branching and Releases#^status]] 🎯 [[Dev Foundations]]
14. [[Vercel Deploy Errors]] ![[Vercel Deploy Errors#^status]] 🎯 [[Dev Foundations]]
15. [[Services and Environments Audit]] ![[Services and Environments Audit#^status]] 🎯 [[Dev Foundations]]
16. [[Atlas Version Check Script]] ![[Atlas Version Check Script#^status]] 🎯 [[Dev Foundations]]
17. [[Database Backup and Restore]] ![[Database Backup and Restore#^status]] 🎯 [[Dev Foundations]]
18. [[E2E Tests in CI]] ![[E2E Tests in CI#^status]] 🎯 [[Dev Foundations]]
19. [[Sentry Error Reporting]] ![[Sentry Error Reporting#^status]] 🎯 [[Dev Foundations]]
20. [[Sentry Root Cause Analysis]] ![[Sentry Root Cause Analysis#^status]] 🎯 [[Dev Foundations]]
21. [[Auth E2E Tests]] ![[Auth E2E Tests#^status]] 🎯 [[Dev Foundations]]
22. [[Current Calendar E2E Tests]] ![[Current Calendar E2E Tests#^status]] 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
23. [[Recipes E2E Tests]] ![[Recipes E2E Tests#^status]] 🎯 [[Dev Foundations]]
24. [[Settings E2E Tests]] ![[Settings E2E Tests#^status]] 🎯 [[Dev Foundations]]
25. [[Sharing E2E Tests]] ![[Sharing E2E Tests#^status]] 🎯 [[Dev Foundations]]
26. [[When Stories Need E2E Tests]] ![[When Stories Need E2E Tests#^status]] 🎯 [[Dev Foundations]]
27. [[Docs Audit]] ![[Docs Audit#^status]] 🎯 [[Dev Foundations]]
# Planning
1. [[Planner Access Audit]] ![[Planner Access Audit#^status]] 🎯 [[Calendar Page]]
2. [[Calendar and Recipes Data Refresh]] ![[Calendar and Recipes Data Refresh#^status]] 🎯 [[Calendar Page]] 🎯 [[App Health]] 🎯 [[Recipes Page]]
3. [[Server-Only Creation and Pure Reads]] ![[Server-Only Creation and Pure Reads#^status]] 🎯 [[Calendar Page]] 🎯 [[App Health]]
4. [[Shared Types Directory]] ![[Shared Types Directory#^status]] 🎯 [[Calendar Page]] 🎯 [[App Health]]
5. [[Remove Schedule-X]] ![[Remove Schedule-X#^status]] 🎯 [[Calendar Page]]
6. [[Schedule-X Data Shapes Audit]] ![[Schedule-X Data Shapes Audit#^status]] 🎯 [[Calendar Page]] 🎯 [[App Health]]
7. [[Calendar Duplication]] ![[Calendar Duplication#^status]] 🎯 [[Calendar Page]] 🎯 [[App Health]]
8. [[Modal Form Architecture]] ![[Modal Form Architecture#^status]] 🎯 [[Calendar Page]] 🎯 [[App Health]] 🎯 [[Recipes Page]]
9. [[Today and Selected Day Markers]] ![[Today and Selected Day Markers#^status]] 🎯 [[Calendar Page]]
10. [[Named Date Formats]] ![[Named Date Formats#^status]] 🎯 [[Calendar Page]]
11. [[Header Date Picker]] ![[Header Date Picker#^status]] 🎯 [[Calendar Page]]

# Later
## [[Dev Foundations]]

## [[Calendar Page]]
- [[Add Meal Changes (Saved Recipes)]] ![[Add Meal Changes (Saved Recipes)#^status]]
- [[Meal Form Date Picker]] ![[Meal Form Date Picker#^status]]
- [[Mobile List View]] ![[Mobile List View#^status]]
- [[Meal Editing]] ![[Meal Editing#^status]]
- [[Meal Detail Modal & Edit Meals]] ![[Meal Detail Modal & Edit Meals#^status]]
- [[Planning on the Calendar]] ![[Planning on the Calendar#^status]]
- [[Calendar Keyboard and Focus]] ![[Calendar Keyboard and Focus#^status]]
- [[Meal Color from Name and Description]] ![[Meal Color from Name and Description#^status]]
- [[Add Meal from Month Cell]] ![[Add Meal from Month Cell#^status]]
- [[Default To Week View on Desktop]] ![[Default To Week View on Desktop#^status]]
- calendar list view infinite scroll
- a11y audit of the calendar page against WCAG 2.2 AA - the app-wide a11y audit stays in Ideas for the other pages
- audit that the calendar page works fully on phones - the app-wide mobile audit stays in Ideas for the other pages
- [[Calendar E2E Tests]] ![[Calendar E2E Tests#^status]]
- [[Calendar UX and Styles Pass]] ![[Calendar UX and Styles Pass#^status]]
- [[Calendar Week View Padding]] ![[Calendar Week View Padding#^status]]

## [[Recipes Page]]
- [[Recipes Page Redesign]] ![[Recipes Page Redesign#^status]]
- [[Recipes Page Wish List Research]] ![[Recipes Page Wish List Research#^status]]
- [[Recipes Mobile Audit]] ![[Recipes Mobile Audit#^status]]
- [[Recipes Accessibility Audit]] ![[Recipes Accessibility Audit#^status]]
- [[Recipes UX and Styles Pass]] ![[Recipes UX and Styles Pass#^status]]
- [[Filtering Recipe List]] ![[Filtering Recipe List#^status]]
- batch delete recipes/bookmarks
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too
- add images to recipes
- group ingredients when adding/editing a recipe
- when adding/editing a recipe, make the instructions expand if you type more than a line
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app
- [[Recipe and Bookmark Link Styles]] ![[Recipe and Bookmark Link Styles#^status]]

## [[Grocery List Creation]]
- [[Grocery List Integration]] ![[Grocery List Integration#^status]]
- printable meal plan
- [[Grocery List Wish List Research]] ![[Grocery List Wish List Research#^status]]

## [[App Health]]

- [[Unit Testing - New Centralized Mocks]] ![[Unit Testing - New Centralized Mocks#^status]]
- [[Drop Mongoose]] ![[Drop Mongoose#^status]]
- [[Better-Auth Reads Env Directly]] ![[Better-Auth Reads Env Directly#^status]]
- [[Domain-Specific Code Locations|move domain-specific code out of the generic folders]] and spell out in project conventions what goes where - idea, has a starting list of files
- `SignInFlow.tsx` - 350+ lines managing six sign-in steps; split it into one component per step so each can be tested on its own. Its `useEffect` also re-runs too often (`continueBtn` is in its dependencies)
- replace the custom `useAsyncButton` and `useAsyncStatus` hooks with React 19's built-in pending-state hooks - needs research into how they fit `ActionResult` errors
- route management - emails create paths & query params the app must consume, but nothing keeps them in sync
- audit code for client component surface area - move as much as possible to server components
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it? - in light of dropping mongoose this needs to be a broader caching question
- [[What Makes a Good Unit Test]] ![[What Makes a Good Unit Test#^status]]
- [[Server-Only Code Behind Barrels]] ![[Server-Only Code Behind Barrels#^status]]
- [[Settings Data Refresh]] ![[Settings Data Refresh#^status]]
- [[Data Rules Enforcement]] ![[Data Rules Enforcement#^status]]
- [[Move Hook Support Components]] ![[Move Hook Support Components#^status]]
- [[Form Pattern]] ![[Form Pattern#^status]]
- [[Google Button Styling]] ![[Google Button Styling#^status]]
- [[Mantine Color and Variant Usage]] ![[Mantine Color and Variant Usage#^status]]
- `preact` 10.29.0 → 11.1.1: needs a decision, since the Schedule-X packages that use it allow only Preact 10 (`@schedule-x/calendar` has `preact ^10.19.2`), and no file in the app imports `preact` or `@preact/signals`. The v11 upgrade guide's breaking changes (ESM-only, refs as props, `useRef` needs an initial value) aren't hit by app code. [Release notes](https://github.com/preactjs/preact/releases). Found by the dependency-updates routine, 2026-11-04. [Sarah] We're removing `schedule-x` we shouldn't do this unless we have to.
- `temporal-polyfill` 0.3.2 → 1.0.6: needs a decision, since `@schedule-x/calendar@4.9.1` pins `temporal-polyfill` to exactly 0.3.2. The breaking changes (calendars other than ISO and Gregorian need the `/full` entry; `/global` may move to `/full/global`) hit 3 files that import `temporal-polyfill/global`: `src/app/layout.tsx`, `seed/seed.ts` and `src/app/[planner]/calendar/_utils/toScheduleXEvents.ts`. [Release notes](https://github.com/fullcalendar/temporal-polyfill/releases). Found by the dependency-updates routine, 2026-11-04.

## Bugs
- [[Zero Planners Crash]] ![[Zero Planners Crash#^status]]
- [[Recipe Detail Delete Ignores Result]] ![[Recipe Detail Delete Ignores Result#^status]]
- [[Recipe Detail Read-Only Controls]] ![[Recipe Detail Read-Only Controls#^status]]
- [[Account Deletion Deletes Shared Planners]] ![[Account Deletion Deletes Shared Planners#^status]]
- [[Crafted Input in Invite and Email Actions]] ![[Crafted Input in Invite and Email Actions#^status]]
- [[Name Validation Rejects Real Names]] ![[Name Validation Rejects Real Names#^status]]
- [[One Source of Today]] ![[One Source of Today#^status]]
- [[Unchecked Planner Reads]] ![[Unchecked Planner Reads#^status]] ⚠️ Security: any planner's data may be readable by id without a membership check.
- [[Mantine Date Picker Setup]] ![[Mantine Date Picker Setup#^status]]
- [[Long Reference URLs Shrink the Name Input]] ![[Long Reference URLs Shrink the Name Input#^status]]
- [[Blank Dish Row Blocks Saving a Meal]] ![[Blank Dish Row Blocks Saving a Meal#^status]]
- [[Invite Sign-Up Rollback Fails]] ![[Invite Sign-Up Rollback Fails#^status]]
- [[404 Page Has No Way Out]] ![[404 Page Has No Way Out#^status]]
- [[Invite Sign-Up While Signed In as Someone Else]] ![[Invite Sign-Up While Signed In as Someone Else#^status]]

## [[Dev Tooling]]
- [Sarah] investigate replacing unit test environment for performance improvements - happy-dom and/or defaulting to node and only using happy-dom or jsdom in tests that need them. We should benchmark the options as part of researching options.
- a way to load extra seed data that one story's checks need, on top of `pnpm seed`'s generic data (today the `building-code` skill's acceptance checks create it through the app's screens). Found 2026-10-01 while designing the dev seed (`docs/seed.md`) 🎯 [[Grocery List Creation]] 🎯 [[Recipes Page]]
- switch testing library to `vitest-browser-react` - needs research to determine if this is worth doing 🎯 [[App Health]]
- [[Vercel Plugin]]
- I want a way to watch certain libraries and tools to see if they have new releases or features that are worth implementing
- Add PostHog for analytics
- build a Design System from the app (colors, type and components) that design canvases use, in place of following `docs/style_guidelines.md` and `docs/theme.md` - weigh it after a real design or two with `/design-feature`. Found 2026-11-01 while adding that skill
- `typescript` 5.9.3 → 7.0.2: a possible story, since I couldn't read its breaking changes. The 7.0.2 release page only links to devblogs.microsoft.com/typescript/announcing-typescript-7-0/, which isn't reachable from the session, and the only list I found on GitHub was `CHANGES.md` in microsoft/typescript-go, which may not be current. That file calls the JS API and language service not ready, and `next build`'s type check calls `createProgram` from the `typescript` package. [Release notes](https://github.com/microsoft/typescript-go/releases/tag/typescript%2Fv7.0.2). Found by the dependency-updates routine, 2026-11-04.
- `vitest` 4.1.12 → 5.1.0 with `@vitest/coverage-v8` 4.1.2 → 5.1.0 and `@vitejs/plugin-react` 5.1.4 → 6.2.1: looks like a story of its own. `@vitejs/plugin-react` 6 needs Vite 8 and the lockfile has Vite 7.3.7 (`pnpm-workspace.yaml` has a Vite 7 override), so Vite becomes a direct dependency or is bumped. Vitest 5 clears mocks before each test (184 test files call a clear, reset or restore themselves), throws on `vi.hoisted` below the top level (`src/_actions/user/deleteAccount.test.ts`, `verifyEmailChangeAndSetPassword.test.ts`) and applies coverage `include`/`exclude` globs more eagerly (100% thresholds). [Release notes](https://github.com/vitest-dev/vitest/releases/tag/v5.0.0). Found by the dependency-updates routine, 2026-11-04.
- `minimatch` 3.1.5 → 11.0.1: a security fix for advisory 1244012 (moderate, pattern amplification DoS), as an upgrade to plan on its own. It's installed only through `@vitejs/plugin-react>vite>stylus>glob`, and no fix exists below 11. Planning it together with the Vite bump above may clear it. [Release notes](https://github.com/isaacs/minimatch/releases). Found by the dependency-updates routine, 2026-11-04.
- `@biomejs/biome` 2.4.6 → 2.6.4: dropped because it breaks `pnpm lint:ci` (the base passes), and the fix isn't small: it needs `biome.jsonc` migrated (`linter.rules.recommended` is deprecated, use `preset`; `biome migrate`), and `biome ci` reports 9 errors: `lint/correctness/noComponentHookFactories` at 7 sites in 5 test files (`CalendarContext.test.tsx`, `CalendarProvider.test.tsx`, `PlannerProvider.test.tsx`, `ToggleProvider.test.tsx`, `CalendarModalContext.test.tsx`), `lint/complexity/noExtraBooleanCast` in `src/app/[planner]/recipes/[recipeId]/page.tsx:39`, and a format difference in `src/_actions/sharing/leavePlanner.test.ts` and `removeMember.test.ts`. `pnpm check:types`, `pnpm test:coverage` and `pnpm build` passed. [Release notes](https://github.com/biomejs/biome/releases). Found by the dependency-updates routine, 2026-11-04.

## Unaffiliated
- [[Delete Planner|allow user to delete a planner]] ![[Delete Planner#^status]]
- [[Transfer Ownership of Planner|transfer ownership of planner]]
- [[Tag Management|tag management - edit/delete]] - Spec last reviewed April - tag creation with palette cycling already exists (`TagCombobox` → `addTag`), so reconcile before planning.
- [[Unit Test Tidy-Ups]] ![[Unit Test Tidy-Ups#^status]]
- [[Docs Updates]] ![[Docs Updates#^status]]
- [[Code Tidy-Ups]] ![[Code Tidy-Ups#^status]]
- [[Style Fixes]] ![[Style Fixes#^status]]
- [[Dev Tooling Tidy-Ups]] ![[Dev Tooling Tidy-Ups#^status]]
- [[Agent Workflow Changes]] ![[Agent Workflow Changes#^status]]
- [[Notes Vault Changes]] ![[Notes Vault Changes#^status]]
- [[Library Upgrades]] ![[Library Upgrades#^status]]
- [[Dev Tool Upgrades]] ![[Dev Tool Upgrades#^status]]

# Ideas
- [Sarah] a place to jot down what ingredients I have that I need to use up
- [[Link SSO Login to Email|Link SSO to Email Login]]
- Allow user to change meal color in calendar
- [[Keyboard Shortcuts|keyboard shortcuts]] - spec. Out of date; re-review once the calendar views are mostly complete.
- add passkey sign in
- add Apple SSO
- let user set avatar
- Add a feedback button
- [[Email Improvements|email improvements]]
- a11y audit
- audit app works fully in mobile
- toggle light/dark mode
- [[What's Changed Notification]] ![[What's Changed Notification#^status]]
- have a Vercel Deploy Errors session watch Vercel's status page and say when an incident ends, such as with a cron job, if checking it by hand becomes a problem ([[Vercel Deploy Errors]] decision 5)
- [[Replace Schedule-X]] ![[Replace Schedule-X#^status]]
- [[Planner Settings Access Badge]] ![[Planner Settings Access Badge#^status]]
- [[Planner Settings Leave Button]] ![[Planner Settings Leave Button#^status]]
- [[Nicer No Planners Page Design]] ![[Nicer No Planners Page Design#^status]]
- [[Nicer 404 Page Design]] ![[Nicer 404 Page Design#^status]]
- [[Invite Sign-Up Gives No Confirmation]] ![[Invite Sign-Up Gives No Confirmation#^status]]
- the two invite lists on Settings show expiry differently: `InvitesSection.tsx:58-60,73-80` says nothing until an invite is within 24 hours of expiring, then "Expires soon" (or "Expired"), while `PendingInvitesList.tsx:61-71` always says "Expires <date>" (or "Expired"). Found 2026-11-02 during `/investigate` of [[Zero Planners Crash]]. The date-utility item in [[Code Tidy-Ups]] touches the same expiry checks but not the wording.
