*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

## How this file works
- **Goals** - ranked epics, each a note in `goals/`, shaped and ranked with `/roadmap`. The top two are **active**. Only Sarah changes the order.
- **Now** - in progress. Keep this to 2-3 items.
- **Next** - the queue for the active goals, in order. The first line not waiting on anything is the next one to plan or build. A line that's waiting keeps its place, and its status embed says what it waits on.
- **Later** - committed, not ordered. One heading per goal, in rank order, then **Unaffiliated** for lines that serve no goal and for every collecting note's line. A line that serves more than one goal sits under one of their headings and ends with a `🎯 [[Goal]]` link for each other goal. A re-rank doesn't move it to another heading. Dev tooling and agent work stays in Unaffiliated unless Sarah puts it under a goal.
- **Ideas** - not committed. A story's line moves to Later once it's committed: when `/shape` shapes it, or when `/decide` settles that it's worth doing.
- **Markers:** every Now and Next line ends, after its status embed, with a 🎯 link for each goal it serves, at least one of them active, or with 🚨 or 📌:
	- `🎯 [[Goal]]` - serves that goal.
	- `🚨 <reason>` - urgent, such as a security fix or a bug a user reported. Agents may suggest it, but only Sarah adds it.
	- `📌 <reason>` - Sarah scheduled it outside the goals, such as a kicked-off sweep. Only Sarah adds it.

	A Now or Next line with none of these is out of place. Raise it with Sarah.
- **Hubs** hold shared design, not priority. A hub has a line only while it has open decisions for `/decide`, or once its last child story has closed and it needs `/close`.
- A story's status (`idea` / `spec` / `ready` / `in-progress` / `in-review` / `done`) lives in its note's frontmatter. This file only decides order.
- Each line with a note, except a goal's, embeds that note's status line from Where It Stands after the link, e.g. `[[Stale Data Issues]] ![[Stale Data Issues#^status]]`. It shows only what work the story needs next, not what the story is. Edit it in the note, not here.
- **Collecting notes** gather items until they're handled together: sweeps (`type: sweep`) for small, decided fixes that share a group, such as [[Unit Test Tidy-Ups]]; roundups (`type: roundup`) for issues on a broad topic that still need decisions, such as [[Style Decisions]]; and collecting workflow notes for tooling and agent changes, such as [[Agent Workflow Changes]]. An item that fits one goes there, not onto its own line here. When several related items sit here as separate lines and none covers them, flag to Sarah that they could become a new one. Never create one without her.
	- **Goals take items, not notes.** A collecting note keeps getting new items, so it never finishes. A goal holds only the items that serve it, and it can ship once they're done. An item serves a goal only when Sarah says so, and then it ends with that goal's 🎯 link. A new item's goals are checked when it's added, as AGENTS.md describes under "Editing notes".
	- **The note's line** ends with a 🎯 link for each goal that one of its items serves. In Later, it sits in Unaffiliated, never under a goal's heading. When an item is done, moved or dropped, the line loses that item's links unless another item still carries them. If that leaves a line in Next with no 🎯 link to an active goal and no 🚨 or 📌, move it to Unaffiliated in Later.
- *(was high)* etc. is the item's priority under the old High / Medium / Low layout, kept for reference while the queue is being ordered. *(was bugfix)* means it was in the old "Bugfixes/User Issues/Tech Debt" section.

# Goals
1. [[Dev Foundations]] - active
2. [[Calendar Page]] - active

# Now

# Next
1. [[Agent Workflow Changes]] ![[Agent Workflow Changes#^status]] 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
2. [[E2E Test Setup]] ![[E2E Test Setup#^status]] 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
3. [[Finish OpenCode Migration]] ![[Finish OpenCode Migration#^status]] 🎯 [[Dev Foundations]]
4. [[Dev Tooling Tidy-Ups]] ![[Dev Tooling Tidy-Ups#^status]] 🎯 [[Dev Foundations]]
5. [[CI Checks]] ![[CI Checks#^status]] 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
6. [[E2E Tests in CI]] ![[E2E Tests in CI#^status]] 🎯 [[Dev Foundations]]
7. [[Docs Audit]] ![[Docs Audit#^status]] 🎯 [[Dev Foundations]]
8. [[Manual and Agent Test Environment]] ![[Manual and Agent Test Environment#^status]] 🎯 [[Dev Foundations]] 🎯 [[Calendar Page]]
9. [[Calendar and Recipes Data Refresh]] ![[Calendar and Recipes Data Refresh#^status]] - ready. Fixes both stale-data symptoms; unblocks [[Add Meal Changes (Saved Recipes)]] and [[Mobile List View]]. *(was bugfix)* 🎯 [[Calendar Page]]
10. [[Settings Data Refresh]] ![[Settings Data Refresh#^status]] - spec. Waiting on [[Calendar and Recipes Data Refresh]]. 🎯 [[Calendar Page]]
11. [[Server-Only Code Behind Barrels]] ![[Server-Only Code Behind Barrels#^status]] 🎯 [[Calendar Page]]
12. [[Server-Only Creation and Pure Reads]] ![[Server-Only Creation and Pure Reads#^status]] - spec. Waiting on [[Server-Only Code Behind Barrels]]. 🎯 [[Calendar Page]]
13. [[Data Rules Enforcement]] ![[Data Rules Enforcement#^status]] - spec. Waiting on [[Calendar and Recipes Data Refresh]], [[Settings Data Refresh]] and [[Server-Only Creation and Pure Reads]]. 🎯 [[Calendar Page]]
14. [[Today and Selected Day Markers]] ![[Today and Selected Day Markers#^status]] - spec. Fixes the truncated today circle; unblocks [[Mobile List View]]. *(was high)* 🎯 [[Calendar Page]]
15. [[Mantine Date Picker Setup]] ![[Mantine Date Picker Setup#^status]] - spec. *(was high)* 🎯 [[Calendar Page]]
16. [[Header Date Picker]] ![[Header Date Picker#^status]] - spec. Waiting on [[Mantine Date Picker Setup]] and [[Today and Selected Day Markers]]. *(was high)* 🎯 [[Calendar Page]]

# Later
## [[Dev Foundations]]
- [[Release Process]] ![[Release Process#^status]]
- Add Sentry for logging *(was high)*
- Add PostHog for analytics *(was high)*
- I want a way to watch certain libraries and tools to see if they have new releases or features that are worth implementing
- [[Vercel Plugin]]
- switch testing library to `vitest-browser-react` - needs research to determine if this is worth doing
- [[Services and Environments Audit]] ![[Services and Environments Audit#^status]]
- [[Automatic Root Cause Analysis]] ![[Automatic Root Cause Analysis#^status]]
- [[Local Dependency Update Alerts]] ![[Local Dependency Update Alerts#^status]]
- [[Database Backup and Restore]] ![[Database Backup and Restore#^status]]
- [[Core Flows E2E Tests]] ![[Core Flows E2E Tests#^status]] 🎯 [[Calendar Page]]

## [[Calendar Page]]
- [[Remove Schedule-X]] ![[Remove Schedule-X#^status]] - spec. *(was bugfix)*
- [[Shared Types Directory]] - spec, last reviewed April. Unblocks [[Remove Schedule-X]].
- [[Schedule-X Data Shapes Audit]] ![[Schedule-X Data Shapes Audit#^status]]
- [[Unchecked Planner Reads]] ![[Unchecked Planner Reads#^status]] - spec. ⚠️ Security: any planner's data may be readable by id without a membership check. Waiting on [[Calendar and Recipes Data Refresh]] and [[Server-Only Code Behind Barrels]].
- [[Add Meal Changes (Saved Recipes)|User Feedback - Add Meal Changes]] - ready. Waiting on [[Calendar and Recipes Data Refresh]]. *(was bugfix)*
- [[Meal Form Date Picker]] ![[Meal Form Date Picker#^status]] - spec. Waiting on [[Header Date Picker]]. With it, unblocks [[Meal Detail Modal & Edit Meals]]. *(was high)*
- [[Mobile List View]] - spec (was ready). Needs re-review: Steps 2 and 5, plus the today-marker change moved in from [[Unified Date Picker Component]] (affects Step 3, Tokens and Acceptance criterion 4). Waiting on [[Calendar and Recipes Data Refresh]] and [[Today and Selected Day Markers]]. *(was high)*
- [[Meal Editing]] ![[Meal Editing#^status]]
- [[Meal Detail Modal & Edit Meals]]
- [[DND]]
- you should be able to create a meal with just a title and a description (or just a title) *(was bugfix)*
- meal color should be based on hex of title + description *(was bugfix)*
- [[Modal Form Architecture|refactor all modal forms to separate presentation and data concerns]] *(was bugfix)*
- [[Add Meal from Month Cell]] ![[Add Meal from Month Cell#^status]]- add meals by clicking week day - reuse the interaction decisions from [[Add Meal from Month Cell]]'s design so month and week behave the same *(was high)*
- default to week view on desktop - list view on mobile *(was high)*
- calendar list view infinite scroll *(was high)*
- clicking "+N more" in the month grid switches to list view at that day - approach needs review (see Step 17 in [[Replace Schedule-X]])
- two buttons are off-screen when tabbing from the first tab stop on the calendar page - a bug, needs investigating. Moved from the calendar style fixes list 2026-09-26
- calendar focus states look poor - needs a design, possibly a global focus state (see the `theme.ts` line in Later, whose focus styles never apply). Moved from the calendar style fixes list 2026-09-26
- `theme.ts` - the input border `#C8C0C3` has no color token (name one, then it can join [[Code Tidy-Ups]]); input `&:focus` styles in a `styles` object never apply (Mantine drops pseudo-selectors there), so the forest focus ring isn't coming from the theme - see the calendar focus states line
- calendar list view keyboard navigation - needs design review once the calendar views are mostly complete (see Step 16 in [[Replace Schedule-X]])
- skip to content *(was medium)*
- a11y audit of the calendar page against WCAG 2.2 AA - the app-wide a11y audit stays in Ideas for the other pages
- audit that the calendar page works fully on phones - the app-wide mobile audit stays in Ideas for the other pages
- "today" is computed independently in ~10 calendar places, several with `DateTime.now()` during server render - near midnight the server's time zone can mark the wrong day or cause a hydration mismatch. Consider one source of "today"
- replace date utils with luxon - `src/_utils/date.ts` also mixes formatting with time comparisons, and `new Date('YYYY-MM-DD')` parses as UTC, so date-only strings show the previous day in US time zones
- calendar duplication - group-by-date ×4 (`MonthGrid`, `MobileMonthGrid`, `WeekView`, `ListView`), meal color calculation ×2 (`toCalendarMeals`, `MealMonthAgenda`), near-identical adapters `MealCalendar` / `MealWeekView` with identical `MonthGridMeal` / `WeekViewMeal` types, and meal keyboard navigation copied between `useMonthGridKeyboard` and `useWeekViewKeyboard` (the week hook also re-implements `useRovingGridFocus`)
- `src/_components/Calendar/_utils/formatCalendarLabel.ts` - also holds the view display names (`VIEW_LABELS`) and default view order (`DEFAULT_VIEWS`), which its name doesn't describe. Move them into a views config once it's decided where that lives, then it can join [[Code Tidy-Ups]]
- [[Code Tidy-Ups]] ![[Code Tidy-Ups#^status]]
- [[Style Fixes]] ![[Style Fixes#^status]] *(was high)*
- [[Style Decisions]] ![[Style Decisions#^status]]
- [[Planner Access Audit]] ![[Planner Access Audit#^status]]
- [[Calendar E2E Tests]] ![[Calendar E2E Tests#^status]]
- [[Calendar UX and Styles Pass]] ![[Calendar UX and Styles Pass#^status]]

## Unaffiliated
- [[Zero Planners Crash|root page crashes for users with zero planners (e.g. invited user leaves or is removed from their only planner)]] - spec. Waiting on your decision on which fix to use (deferred 2026-09-25). *(was bugfix)*
- [[Delete Planner|allow user to delete a planner]] - idea. Waiting on the [[Zero Planners Crash]] decision. *(was high)*
- [[Recipe Detail Delete Ignores Result]] ![[Recipe Detail Delete Ignores Result#^status]] *(was bugfix)*
- [[Recipe Detail Read-Only Controls]] ![[Recipe Detail Read-Only Controls#^status]]
- [[Filtering Recipe List|allow filtering in recipe list]] *(was medium)*
- [[Transfer Ownership of Planner|transfer ownership of planner]] *(was high)*
- [[Tag Management|tag management - edit/delete]] - Spec last reviewed April - tag creation with palette cycling already exists (`TagCombobox` → `addTag`), so reconcile before planning. *(was medium)*
- `ConfirmButton` calls `onError` when the action returns `ok: false`, but not when it throws. No caller passes `onError` yet, so either call it on exceptions too or remove the prop
- `SignInFlow.tsx` - 350+ lines managing six steps (idle, has-password, new, social-only, email-sent, forgot-password-sent); split into an orchestrating `SignInFlow` holding the shared state plus one component per step, so each step can be tested on its own. Its `useEffect` also has the `continueBtn` object in its dependency array, so it re-runs more than it needs to
- replace the custom `useAsyncButton` and `useAsyncStatus` hooks with React 19's built-in pending-state hooks - needs research into how they fit `ActionResult` errors
- route management - emails create paths & query params the app must consume, but nothing keeps them in sync
- [[Domain-Specific Code Locations|move domain-specific code out of the generic folders]] and spell out in project conventions what goes where - idea, has a starting list of files
- could we get rid of mongoose and use zod + mongodb on its own? what does mongoose get us? *(was medium)*
- audit code for client component surface area - move as much as possible to server components *(was low)*
- [[Unit Test Tidy-Ups]] ![[Unit Test Tidy-Ups#^status]]
- [[Unit Testing - New Centralized Mocks]] ![[Unit Testing - New Centralized Mocks#^status]]
- [[Docs Updates]] ![[Docs Updates#^status]]

# Ideas
- [[Grocery List Integration]]
- [[Link SSO Login to Email|Link SSO to Email Login]] *(was undecided)*
- Allow user to change meal color in calendar *(was undecided)*
- [[Keyboard Shortcuts|keyboard shortcuts]] - spec. Out of date; re-review once the calendar views are mostly complete. *(was medium)*
- batch delete recipes/bookmarks *(was medium)*
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too *(was medium)*
- add images to recipes *(was medium)*
- group ingredients when adding/editing a recipe *(was medium)*
- when adding/editing a recipe, make the instructions expand if you type more than a line *(was medium)*
- add passkey sign in *(was medium)*
- add Apple SSO *(was medium)*
- let user set avatar *(was low)*
- Add a feedback button *(was high)*
- [[Email Improvements|email improvements]] *(was high)*
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app *(was medium)*
- a11y audit *(was medium)*
- security - string validation on inputs *(was medium)*
- audit app works fully in mobile *(was medium)*
- toggle light/dark mode *(was low)*
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it? *(was medium)*
