*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

## How this file works
- **Goals** - ranked epics, each a note in `goals/`, shaped and ranked with `/roadmap`. Only Sarah changes the order. Only one goal is built at a time, so `develop` never holds another goal's unfinished work and a finished goal releases all at once:
	- **The building goal** is the top one, marked `- building`. A story or collecting-note item is built (`/implement`, `/tooling`) only when it serves the building goal, serves no ranked goal, or its line has 🚨 or 📌.
	- **The planning goal** is the second, marked `- planning`. Its stories can be shaped, decided, designed and planned down to steps, but they aren't built until the building goal is released. Collecting notes aren't kicked off for it.
	- **The rest** organize the backlog. Their lines sit under their headings in Later, and their stories can be shaped and decided ahead of their turn.
	- **Standing Goals** - listed under their own subheading below the ranked goals. Each collects work that no ranked goal would take, such as library upgrades, and never ships itself, so it's never ranked, building or planning. When Sarah wants to take on some of that work, `/roadmap` draws a goal from it, named `<standing goal> YYYY-MM-DD`, which takes the work she picks and is ranked like any other goal.
- **Now** - in progress. Keep this to 2-3 items.
- **Next** - the building goal's queue, in order. The first line not waiting on anything is the next one to plan or build. A line that's waiting keeps its place, and its status embed says what it waits on. A line that serves both the building and planning goals goes here.
- **Planning** - the planning goal's queue, in order. The first line not waiting on anything is the next one to plan. When the planning goal starts building, its lines move into Next in the same order.
- **Later** - committed, not ordered. One heading per goal, in rank order, then one per standing goal, then **Unaffiliated** for lines that serve no goal and for every collecting note's line. A line that serves more than one goal sits under one of their headings and ends with a `🎯 [[Goal]]` link for each other goal. A re-rank doesn't move it to another heading. Dev tooling and agent work sits under [[Dev Tooling]]'s heading unless Sarah puts it under a ranked goal.
- **Ideas** - not committed. A story's line moves to Later once it's committed: when `/shape` shapes it, or when `/decide` settles that it's worth doing.
- **Markers:** every Now and Next line ends, after its status embed, with a 🎯 link for each goal it serves, one of them the building goal, or with 🚨 or 📌. Every Planning line ends with a 🎯 link for each goal it serves, one of them the planning goal:
	- `🎯 [[Goal]]` - serves that goal.
	- `🚨 <reason>` - urgent, such as a security fix or a bug a user reported. Agents may suggest it, but only Sarah adds it.
	- `📌 <reason>` - Sarah scheduled it outside the goals, such as a kicked-off sweep. Only Sarah adds it.

	A Now, Next or Planning line without its marker is out of place. Raise it with Sarah.
- **Hubs** hold shared design, not priority. A hub has a line only while it has open decisions for `/decide`, or once its last child story has closed and it needs `/close`.
- **Archived notes** have no line while an open story still relies on them. Once none does, an archived note gets a line until `/close` deletes it.
- A story's status (`idea` / `spec` / `ready` / `in-progress` / `in-review` / `done`) lives in its note's frontmatter. This file only decides order.
- Each line with a note, except a goal's, embeds that note's status line from Where It Stands after the link, e.g. `[[Stale Data Issues]] ![[Stale Data Issues#^status]]`. It shows only what the story needs next, the next skill or a link to what blocks it, not what the story is. Edit it in the note, not here.
- **Collecting notes** gather items until they're handled together: sweeps (`type: sweep`) for small, decided fixes that share a group, such as [[Unit Test Tidy-Ups]]; roundups (`type: roundup`) for issues on a broad topic that still need decisions, such as [[Style Decisions]]; and collecting workflow notes for tooling and agent changes, such as [[Agent Workflow Changes]]. An item that fits one goes there, not onto its own line here. When several related items sit here as separate lines and none covers them, flag to Sarah that they could become a new one. Never create one without her.
	- **Goals take items, not notes.** A collecting note keeps getting new items, so it never finishes. A goal holds only the items that serve it, and it can ship once they're done. An item serves a goal only when Sarah says so, and then it ends with that goal's 🎯 link. A new item's goals are checked when it's added, as AGENTS.md describes under "Editing notes".
	- **The note's line** carries no 🎯 links and always sits in Unaffiliated in Later. Once a goal is building, `/roadmap` kicks off the items that serve it into a dated copy, `<note> YYYY-MM-DD`. The copy's line carries its items' 🎯 links and sits under one of their goals' headings in Later, or in Next once Sarah moves it there.

# Goals
1. [[Dev Foundations]] - building
2. [[Calendar Page]] - planning
3. [[Recipes Page]]
4. [[Grocery List Creation]]

## Standing Goals
- [[App Health]]
- [[Bugs]]
- [[Dev Tooling]]

# Now

# Next
1. [[Pattern Plan-Steps Review]] ![[Pattern Plan-Steps Review#^status]] 🎯 [[Dev Foundations]]
2. [[Pattern Implement Review]] ![[Pattern Implement Review#^status]] 🎯 [[Dev Foundations]]
3. [[Pattern Final-Review Review]] ![[Pattern Final-Review Review#^status]] 🎯 [[Dev Foundations]]
4. [[Pattern Close Review]] ![[Pattern Close Review#^status]] 🎯 [[Dev Foundations]]
5. [[Infra Shape Review]] ![[Infra Shape Review#^status]] 🎯 [[Dev Foundations]]
6. [[Infra Decide Review]] ![[Infra Decide Review#^status]] 🎯 [[Dev Foundations]]
7. [[Infra Infra-Design Review]] ![[Infra Infra-Design Review#^status]] 🎯 [[Dev Foundations]]
8. [[Infra Check-Drift Review]] ![[Infra Check-Drift Review#^status]] 🎯 [[Dev Foundations]]
9. [[Infra Implement Review]] ![[Infra Implement Review#^status]] 🎯 [[Dev Foundations]]
10. [[Infra Final-Review Review]] ![[Infra Final-Review Review#^status]] 🎯 [[Dev Foundations]]
11. [[Infra Close Review]] ![[Infra Close Review#^status]] 🎯 [[Dev Foundations]]
12. [[Cleanup Shape Review]] ![[Cleanup Shape Review#^status]] 🎯 [[Dev Foundations]]
13. [[Cleanup Decide Review]] ![[Cleanup Decide Review#^status]] 🎯 [[Dev Foundations]]
14. [[Cleanup Investigate Review]] ![[Cleanup Investigate Review#^status]] 🎯 [[Dev Foundations]]
15. [[Cleanup Check-Drift Review]] ![[Cleanup Check-Drift Review#^status]] 🎯 [[Dev Foundations]]
16. [[Cleanup Plan-Steps Review]] ![[Cleanup Plan-Steps Review#^status]] 🎯 [[Dev Foundations]]
17. [[Cleanup Implement Review]] ![[Cleanup Implement Review#^status]] 🎯 [[Dev Foundations]]
18. [[Cleanup Final-Review Review]] ![[Cleanup Final-Review Review#^status]] 🎯 [[Dev Foundations]]
19. [[Cleanup Close Review]] ![[Cleanup Close Review#^status]] 🎯 [[Dev Foundations]]
20. [[Sweep Kickoff Review]] ![[Sweep Kickoff Review#^status]] 🎯 [[Dev Foundations]]
21. [[Sweep Check-Drift Review]] ![[Sweep Check-Drift Review#^status]] 🎯 [[Dev Foundations]]
22. [[Sweep Plan-Steps Review]] ![[Sweep Plan-Steps Review#^status]] 🎯 [[Dev Foundations]]
23. [[Sweep Implement Review]] ![[Sweep Implement Review#^status]] 🎯 [[Dev Foundations]]
24. [[Sweep Final-Review Review]] ![[Sweep Final-Review Review#^status]] 🎯 [[Dev Foundations]]
25. [[Sweep Close Review]] ![[Sweep Close Review#^status]] 🎯 [[Dev Foundations]]
26. [[Roundup Kickoff Review]] ![[Roundup Kickoff Review#^status]] 🎯 [[Dev Foundations]]
27. [[Roundup Decide Review]] ![[Roundup Decide Review#^status]] 🎯 [[Dev Foundations]]
28. [[Roundup Check-Drift Review]] ![[Roundup Check-Drift Review#^status]] 🎯 [[Dev Foundations]]
29. [[Roundup Plan-Steps Review]] ![[Roundup Plan-Steps Review#^status]] 🎯 [[Dev Foundations]]
30. [[Roundup Implement Review]] ![[Roundup Implement Review#^status]] 🎯 [[Dev Foundations]]
31. [[Roundup Final-Review Review]] ![[Roundup Final-Review Review#^status]] 🎯 [[Dev Foundations]]
32. [[Roundup Close Review]] ![[Roundup Close Review#^status]] 🎯 [[Dev Foundations]]
33. [[Hub Shape Review]] ![[Hub Shape Review#^status]] 🎯 [[Dev Foundations]]
34. [[Hub Decide Review]] ![[Hub Decide Review#^status]] 🎯 [[Dev Foundations]]
35. [[Hub Close Review]] ![[Hub Close Review#^status]] 🎯 [[Dev Foundations]]
36. [[Workflow Tooling Review]] ![[Workflow Tooling Review#^status]] 🎯 [[Dev Foundations]]
37. [[Large Workflow Changes]] ![[Large Workflow Changes#^status]] 🎯 [[Dev Foundations]]
38. [[Goal Roadmap Review]] ![[Goal Roadmap Review#^status]] 🎯 [[Dev Foundations]]
39. [[Standing Goal Roadmap Review]] ![[Standing Goal Roadmap Review#^status]] 🎯 [[Dev Foundations]]
40. [[CI-Failure Review]] ![[CI-Failure Review#^status]] 🎯 [[Dev Foundations]]
41. [[Dependency-Updates Review]] ![[Dependency-Updates Review#^status]] 🎯 [[Dev Foundations]]
42. [[AGENTS.md Review]] ![[AGENTS.md Review#^status]] 🎯 [[Dev Foundations]]
43. [[Memory Folder Review]] ![[Memory Folder Review#^status]] 🎯 [[Dev Foundations]]
44. [[Note Conventions and Roadmap Header Review]] ![[Note Conventions and Roadmap Header Review#^status]] 🎯 [[Dev Foundations]]
45. [[Conventions Review]] ![[Conventions Review#^status]] 🎯 [[Dev Foundations]]
46. [[Agent Workflow Changes 2026-10-02]] ![[Agent Workflow Changes 2026-10-02#^status]] 🎯 [[Dev Foundations]]
47. [[Major Upgrade Sweeps]] ![[Major Upgrade Sweeps#^status]] 🎯 [[Dev Foundations]]
48. [[Dependency Release Analysis]] ![[Dependency Release Analysis#^status]] 🎯 [[Dev Foundations]]
49. [[Notes Vault Repo]] ![[Notes Vault Repo#^status]] 🎯 [[Dev Foundations]]
50. [[Branching and Releases]] ![[Branching and Releases#^status]] 🎯 [[Dev Foundations]]
51. [[Vercel Deploy Errors]] ![[Vercel Deploy Errors#^status]] 🎯 [[Dev Foundations]]
52. [[Services and Environments Audit]] ![[Services and Environments Audit#^status]] 🎯 [[Dev Foundations]]
53. [[Atlas Version Check Script]] ![[Atlas Version Check Script#^status]] 🎯 [[Dev Foundations]]
54. [[Database Backup and Restore]] ![[Database Backup and Restore#^status]] 🎯 [[Dev Foundations]]
55. [[E2E Tests in CI]] ![[E2E Tests in CI#^status]] 🎯 [[Dev Foundations]]
56. [[Sentry Error Reporting]] ![[Sentry Error Reporting#^status]] 🎯 [[Dev Foundations]]
57. [[Sentry Root Cause Analysis]] ![[Sentry Root Cause Analysis#^status]] 🎯 [[Dev Foundations]]
58. [[Auth E2E Tests]] ![[Auth E2E Tests#^status]] 🎯 [[Dev Foundations]]
59. [[Current Calendar E2E Tests]] ![[Current Calendar E2E Tests#^status]] 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
60. [[Recipes E2E Tests]] ![[Recipes E2E Tests#^status]] 🎯 [[Dev Foundations]]
61. [[Settings E2E Tests]] ![[Settings E2E Tests#^status]] 🎯 [[Dev Foundations]]
62. [[Sharing E2E Tests]] ![[Sharing E2E Tests#^status]] 🎯 [[Dev Foundations]]
63. [[When Stories Need E2E Tests]] ![[When Stories Need E2E Tests#^status]] 🎯 [[Dev Foundations]]
64. [[Docs Audit]] ![[Docs Audit#^status]] 🎯 [[Dev Foundations]]
# Planning
1. [[Calendar and Recipes Data Refresh]] ![[Calendar and Recipes Data Refresh#^status]] - ready. Fixes both stale-data symptoms; unblocks [[Add Meal Changes (Saved Recipes)]] and [[Mobile List View]]. 🎯 [[Calendar Page]] 🎯 [[App Health]] 🎯 [[Recipes Page]]
2. [[Settings Data Refresh]] ![[Settings Data Refresh#^status]] - spec. Waiting on [[Calendar and Recipes Data Refresh]]. 🎯 [[Calendar Page]] 🎯 [[App Health]]
3. [[Server-Only Creation and Pure Reads]] ![[Server-Only Creation and Pure Reads#^status]] - spec. 🎯 [[Calendar Page]] 🎯 [[App Health]] 🎯 [[Bugs]]
4. [[Data Rules Enforcement]] ![[Data Rules Enforcement#^status]] - spec. Waiting on [[Calendar and Recipes Data Refresh]], [[Settings Data Refresh]] and [[Server-Only Creation and Pure Reads]]. 🎯 [[Calendar Page]] 🎯 [[App Health]]
5. [[Today and Selected Day Markers]] ![[Today and Selected Day Markers#^status]] - spec. Fixes the truncated today circle; unblocks [[Mobile List View]]. 🎯 [[Calendar Page]]
6. [[Mantine Date Picker Setup]] ![[Mantine Date Picker Setup#^status]] - spec. 🎯 [[Calendar Page]]
7. [[Named Date Formats]] ![[Named Date Formats#^status]] 🎯 [[Calendar Page]]
8. [[Header Date Picker]] ![[Header Date Picker#^status]] - ready. Waiting on [[Named Date Formats]], [[Mantine Date Picker Setup]] and [[Today and Selected Day Markers]]. 🎯 [[Calendar Page]]
9. [[Long Reference URLs Shrink the Name Input]] ![[Long Reference URLs Shrink the Name Input#^status]] 🎯 [[Calendar Page]]

# Later
## [[Dev Foundations]]

## [[Calendar Page]]
- [[Remove Schedule-X]] ![[Remove Schedule-X#^status]] - spec.
- [[Shared Types Directory]] - spec, last reviewed April. Unblocks [[Remove Schedule-X]]. 🎯 [[App Health]]
- [[Schedule-X Data Shapes Audit]] ![[Schedule-X Data Shapes Audit#^status]] 🎯 [[App Health]]
- [[Unchecked Planner Reads]] ![[Unchecked Planner Reads#^status]] - spec. ⚠️ Security: any planner's data may be readable by id without a membership check. Waiting on [[Calendar and Recipes Data Refresh]]. 🎯 [[Bugs]]
- [[Add Meal Changes (Saved Recipes)|User Feedback - Add Meal Changes]] - ready. Waiting on [[Calendar and Recipes Data Refresh]].
- [[Meal Form Date Picker]] ![[Meal Form Date Picker#^status]] - spec. Waiting on [[Named Date Formats]] and [[Header Date Picker]]. With it, unblocks [[Meal Detail Modal & Edit Meals]].
- [[Mobile List View]] ![[Mobile List View#^status]]
- [[Meal Editing]] ![[Meal Editing#^status]]
- [[Meal Detail Modal & Edit Meals]]
- [[DND]]
- [[Blank Dish Row Blocks Saving a Meal]] ![[Blank Dish Row Blocks Saving a Meal#^status]]
- meal color should be based on hex of title + description
- [[Modal Form Architecture|refactor all modal forms to separate presentation and data concerns]] 🎯 [[App Health]] 🎯 [[Recipes Page]]
- [[Add Meal from Month Cell]] ![[Add Meal from Month Cell#^status]]- add meals by clicking week day - reuse the interaction decisions from [[Add Meal from Month Cell]]'s design so month and week behave the same
- default to week view on desktop - list view on mobile
- calendar list view infinite scroll
- clicking "+N more" in the month grid switches to list view at that day - approach needs review (see Step 17 in [[Replace Schedule-X]])
- two buttons are off-screen when tabbing from the first tab stop on the calendar page - a bug, needs investigating. Moved from the calendar style fixes list 2026-09-26
- calendar focus states look poor - needs a design, possibly a global focus state (see the `theme.ts` line in Later, whose focus styles never apply). Moved from the calendar style fixes list 2026-09-26
- `theme.ts` - the input border `#C8C0C3` has no color token, and the input `&:focus` styles never apply (Mantine drops pseudo-selectors in `styles`) - see the calendar focus states line 🎯 [[App Health]]
- calendar list view keyboard navigation - needs design review once the calendar views are mostly complete (see Step 16 in [[Replace Schedule-X]])
- skip to content
- a11y audit of the calendar page against WCAG 2.2 AA - the app-wide a11y audit stays in Ideas for the other pages
- audit that the calendar page works fully on phones - the app-wide mobile audit stays in Ideas for the other pages
- "today" is computed independently in ~10 calendar places, several with `DateTime.now()` during server render - near midnight the server's time zone can mark the wrong day or cause a hydration mismatch. Consider one source of "today"
- calendar duplication - group-by-date (×4), meal color calculation (×2), the near-identical `MealCalendar` / `MealWeekView` adapters and their types, and meal keyboard navigation copied between the month and week hooks 🎯 [[App Health]]
- `formatCalendarLabel.ts` - also holds the view names and default view order, which its name doesn't describe; move them into a views config once it's decided where that lives 🎯 [[App Health]]
- [[Planner Access Audit]] ![[Planner Access Audit#^status]] 🎯 [[Bugs]]
- [[Calendar E2E Tests]] ![[Calendar E2E Tests#^status]]
- [[Calendar UX and Styles Pass]] ![[Calendar UX and Styles Pass#^status]]

## [[Recipes Page]]
- [[Recipes Page Redesign]] ![[Recipes Page Redesign#^status]]
- [[Recipes Page Wish List Research]] ![[Recipes Page Wish List Research#^status]]
- [[Recipes Mobile Audit]] ![[Recipes Mobile Audit#^status]]
- [[Recipes Accessibility Audit]] ![[Recipes Accessibility Audit#^status]]
- [[Recipes UX and Styles Pass]] ![[Recipes UX and Styles Pass#^status]]
- [[Filtering Recipe List|allow filtering in recipe list]]
- batch delete recipes/bookmarks
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too
- add images to recipes
- group ingredients when adding/editing a recipe
- when adding/editing a recipe, make the instructions expand if you type more than a line
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app

## [[Grocery List Creation]]
- [[Grocery List Integration]] ![[Grocery List Integration#^status]]
- printable meal plan
- [[Grocery List Wish List Research]] ![[Grocery List Wish List Research#^status]]

## [[App Health]]
- [Sarah] investigate replacing unit test environment for performance improvements - happy-dom and/or defaulting to node and only using happy-dom or jsdom in tests that need them. We should benchmark the options as part of researching options.
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

## [[Bugs]]
- [[Zero Planners Crash|root page crashes for users with zero planners (e.g. invited user leaves or is removed from their only planner)]] ![[Zero Planners Crash#^status]]
- [[Recipe Detail Delete Ignores Result]] ![[Recipe Detail Delete Ignores Result#^status]] 🎯 [[Recipes Page]]
- [[Recipe Detail Read-Only Controls]] ![[Recipe Detail Read-Only Controls#^status]] 🎯 [[Recipes Page]]
- [[Account Deletion Deletes Shared Planners]] ![[Account Deletion Deletes Shared Planners#^status]]
- security - check whether any production user has the better-auth role `admin`, which the `admin()` plugin (`src/_auth/auth.ts:14`) lets impersonate users, and whether `signUpWithInvite` needs the plugin at all
- security - string validation on inputs
- `ConfirmButton` calls `onError` when the action returns `ok: false`, but not when it throws. No caller passes `onError` yet, so either call it on exceptions too or remove the prop
- on the sign-in page, pressing Enter in the email, password or sign-up inputs doesn't submit; only clicking the button does. `SignInFlow.tsx` has no `<form>` or `onSubmit`, so wrap each step in a form. Overlaps the "split `SignInFlow.tsx` into one component per step" line in App Health, so the two could be planned together.
- Planner's mongoose schemas don't match their zod types: recipe `time` is typed as numbers in `src/_models/library/recipe.ts` but saved as strings; the `saved` union in `src/_models/planner/planner.ts` tries `bookmarkSchema` (`strict: false`) first, so `recipeSchema` never validates a recipe; and the dish `source` union in `src/_models/calendar/day.ts` turns linked recipe ObjectIds into strings when saved through mongoose. Found 2026-10-04 while building the dev seed's sample data (`seed/seed.ts`)

## [[Dev Tooling]]
- a way to load extra seed data that one story's checks need, on top of `pnpm seed`'s generic data (today the `building-code` skill's acceptance checks create it through the app's screens). Found 2026-10-01 while designing the dev seed (`docs/seed.md`) 🎯 [[Grocery List Creation]] 🎯 [[Recipes Page]]
- switch testing library to `vitest-browser-react` - needs research to determine if this is worth doing 🎯 [[App Health]]
- [[Vercel Plugin]]
- I want a way to watch certain libraries and tools to see if they have new releases or features that are worth implementing
- Add PostHog for analytics

## Unaffiliated
- [[Delete Planner|allow user to delete a planner]] - idea. Waiting on the [[Zero Planners Crash]] decision.
- [[Transfer Ownership of Planner|transfer ownership of planner]]
- [[Tag Management|tag management - edit/delete]] - Spec last reviewed April - tag creation with palette cycling already exists (`TagCombobox` → `addTag`), so reconcile before planning.
- [[Unit Test Tidy-Ups]] ![[Unit Test Tidy-Ups#^status]]
- [[Docs Updates]] ![[Docs Updates#^status]]
- [[Code Tidy-Ups]] ![[Code Tidy-Ups#^status]]
- [[Style Fixes]] ![[Style Fixes#^status]]
- [[Style Decisions]] ![[Style Decisions#^status]]
- [[Dev Tooling Tidy-Ups]] ![[Dev Tooling Tidy-Ups#^status]]
- [[Agent Workflow Changes]] ![[Agent Workflow Changes#^status]]
- [[Notes Vault Changes]] ![[Notes Vault Changes#^status]]

# Ideas
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
