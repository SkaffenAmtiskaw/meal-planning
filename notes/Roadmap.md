*Note: These should ALWAYS be planned and implemented individually. They are discrete units of work.*

**AI Instructions** - DO NOT delete this file. You may remove lines, but under no circumstances may you delete the file.

## How this file works
- **Now** - in progress. Keep this to 2-3 items.
- **Next** - the queue, in order. The top item is the next one to plan or build.
- **Blocked** - committed, but waiting on something. The reason matches the note's `blocked-by`.
- **Later** - committed, not ordered, grouped by area.
- **Ideas** - not committed.
- A story's status (`idea` / `spec` / `ready` / `in-progress` / `in-review` / `done`) lives in its note's frontmatter. This file only decides order.
- Each line with a note embeds that note's status line from Where It Stands after the link, e.g. `[[Stale Data Issues]] ![[Stale Data Issues#^status]]`. It shows only what work the story needs next, not what the story is. Edit it in the note, not here.
- **Sweeps** (`type: sweep`) collect small, decided fixes that share a group, such as [[Unit Test Tidy-Ups]]. A small fix with no open decisions goes into the sweep for its group, not onto its own line here. When several related small fixes sit here as separate lines and no sweep covers them, flag to Sarah that they could become a new sweep. Never create one without her.
- *(was high)* etc. is the item's priority under the old High / Medium / Low layout, kept for reference while the queue is being ordered. *(was bugfix)* means it was in the old "Bugfixes/User Issues/Tech Debt" section.

# Hubs
- [[Meal Editing]] - every story that edits, moves, duplicates, deletes or reorders meals, with open decisions. Includes [[Meal Detail Modal & Edit Meals]] (blocked on [[Header Date Picker]] and [[Meal Form Date Picker]]), mobile delete, batch delete, [[DND]], and the mobile agenda Edit / Move to… buttons.
- [[Unified Date Picker Component]] ![[Unified Date Picker Component#^status]] - the date picker design, split 2026-09-25 into [[Mantine Date Picker Setup]], [[Today and Selected Day Markers]], [[Header Date Picker]] and [[Meal Form Date Picker]].
- [[Stale Data Issues]] ![[Stale Data Issues#^status]] - the data refresh pattern (rules, tag model, enforcement), split 2026-09-25 into [[Calendar and Recipes Data Refresh]], [[Settings Data Refresh]], [[Server-Only Creation and Pure Reads]] and [[Data Rules Enforcement]].

# Now
- [[Unit Testing - Clean Up Mocks]] ![[Unit Testing - Clean Up Mocks#^status]]

# Next
1. [[Unchecked Invite Lookup]] ![[Unchecked Invite Lookup#^status]] - spec. ⚠️ Security: anyone who knows an email may fetch that person's invite tokens. Nothing blocks it.
2. [[Calendar and Recipes Data Refresh]] ![[Calendar and Recipes Data Refresh#^status]] - spec. Fixes both stale-data symptoms; unblocks [[Add Meal Changes (Saved Recipes)]] and [[Mobile List View]]. *(was bugfix)*
3. [[Server-Only Creation and Pure Reads]] ![[Server-Only Creation and Pure Reads#^status]] - spec. Closes the unauthenticated `addPlanner` server action; nothing blocks it.
4. [[Schedule-X Data Shapes Audit]] ![[Schedule-X Data Shapes Audit#^status]]
5. [[Mantine Date Picker Setup]] ![[Mantine Date Picker Setup#^status]] - spec. *(was high)*
6. [[Today and Selected Day Markers]] ![[Today and Selected Day Markers#^status]] - spec. Fixes the truncated today circle; unblocks [[Mobile List View]]. *(was high)*
7. [[Shared Types Directory]] - spec, last reviewed April. Unblocks [[Remove Schedule-X]].

# Blocked
- [[Header Date Picker]] ![[Header Date Picker#^status]] - spec. Waiting on [[Mantine Date Picker Setup]] and [[Today and Selected Day Markers]]. *(was high)*
- [[Meal Form Date Picker]] ![[Meal Form Date Picker#^status]] - spec. Waiting on [[Header Date Picker]]. With it, unblocks [[Meal Detail Modal & Edit Meals]]. *(was high)*
- [[Add Meal Changes (Saved Recipes)|User Feedback - Add Meal Changes]] - ready. Waiting on [[Calendar and Recipes Data Refresh]]. *(was bugfix)*
- [[Mobile List View]] - spec (was ready). Needs re-review: Steps 2 and 5, plus the today-marker change moved in from [[Unified Date Picker Component]] (affects Step 3, Tokens and Acceptance criterion 4). Waiting on [[Calendar and Recipes Data Refresh]] and [[Today and Selected Day Markers]]. *(was high)*
- [[Zero Planners Crash|root page crashes for users with zero planners (e.g. invited user leaves or is removed from their only planner)]] - spec. Waiting on your decision on which fix to use (deferred 2026-09-25). *(was bugfix)*
- [[Delete Planner|allow user to delete a planner]] - idea. Waiting on the [[Zero Planners Crash]] decision. *(was high)*
- [[Keyboard Shortcuts|keyboard shortcuts]] - spec. Out of date; re-review once the calendar views are mostly complete. *(was medium)*
- calendar list view keyboard navigation - needs design review once the calendar views are mostly complete (see Step 16 in [[Replace Schedule-X]])
- [[Style Decisions]] ![[Style Decisions#^status]]
- [[Granular Webfetch Permissions|Update OpenCode agents webfetch permissions]] - idea. Waiting on an OpenCode release.
- [[Settings Data Refresh]] ![[Settings Data Refresh#^status]] - spec. Waiting on [[Calendar and Recipes Data Refresh]].
- [[Data Rules Enforcement]] ![[Data Rules Enforcement#^status]] - spec. Waiting on [[Calendar and Recipes Data Refresh]], [[Settings Data Refresh]] and [[Server-Only Creation and Pure Reads]].
- [[Unchecked Planner Reads]] ![[Unchecked Planner Reads#^status]] - spec. ⚠️ Security: any planner's data may be readable by id without a membership check. Waiting on [[Calendar and Recipes Data Refresh]].
- [[Remove Schedule-X]] ![[Remove Schedule-X#^status]] - spec. *(was bugfix)*

# Later
## Calendar
- you should be able to create a meal with just a title and a description (or just a title) *(was bugfix)*
- meal color should be based on hex of title + description *(was bugfix)*
- [[Add Meal from Month Cell]] ![[Add Meal from Month Cell#^status]]- add meals by clicking week day - reuse the interaction decisions from [[Add Meal from Month Cell]]'s design so month and week behave the same *(was high)*
- default to week view on desktop - list view on mobile *(was high)*
- calendar list view infinite scroll *(was high)*
- clicking "+N more" in the month grid switches to list view at that day - approach needs review (see Step 17 in [[Replace Schedule-X]])
- two buttons are off-screen when tabbing from the first tab stop on the calendar page - a bug, needs investigating. Moved from the calendar style fixes list 2026-09-26

## Recipes
- deleting a recipe from the recipe detail page always reports success - `RecipeDetail` ignores the `deleteRecipe` result *(was bugfix)*
- [[Filtering Recipe List|allow filtering in recipe list]] *(was medium)*
- batch delete recipes/bookmarks *(was medium)*
- allow notes in recipe/bookmarks to render basic markdown - assess if other fields should too *(was medium)*
- add images to recipes *(was medium)*
- group ingredients when adding/editing a recipe *(was medium)*
- when adding/editing a recipe, make the instructions expand if you type more than a line *(was medium)*

## Planner Settings
- [[Transfer Ownership of Planner|transfer ownership of planner]] *(was high)*
- [[Tag Management|tag management - edit/delete]] - wishlist; nothing depends on it. Spec last reviewed April - tag creation with palette cycling already exists (`TagCombobox` → `addTag`), so reconcile before planning. *(was medium)*

## Sign In & Account
- add passkey sign in *(was medium)*
- add Apple SSO *(was medium)*
- let user set avatar *(was low)*

## Observability
- Add Sentry for logging *(was high)*
- Add PostHog for analytics *(was high)*
- Add a feedback button *(was high)*

## App-Wide UX & Quality
- [[Style Fixes]] ![[Style Fixes#^status]] *(was high)*
- [[Email Improvements|email improvements]] *(was high)*
- take create planner pattern of button on top right in desktop - FAB in mobile and apply it throughout the app *(was medium)*
- skip to content *(was medium)*
- a11y audit *(was medium)*
- security - string validation on inputs *(was medium)*
- audit app works fully in mobile *(was medium)*
- toggle light/dark mode *(was low)*
- calendar focus states look poor - needs a design, possibly a global focus state (see the `theme.ts` line under Tech Debt, whose focus styles never apply). Moved from the calendar style fixes list 2026-09-26

## Tech Debt
- [[Modal Form Architecture|refactor all modal forms to separate presentation and data concerns]] *(was bugfix)*
- rename "event" to "meal" in calendar code - 🚛 moved to [[Schedule-X Data Shapes Audit]]
- `ConfirmButton` does nothing when `useAsyncStatus` hits an actual exception - seems incorrect?
- `InviteSettings.tsx` - if the user is undefined, shouldn't it render nothing? (shouldn't the user always be defined in settings?)
- `InviteForm.tsx` - uses an email regex instead of a zod type check
- `SignInFlow.tsx` - 350+ lines managing six steps (idle, has-password, new, social-only, email-sent, forgot-password-sent); split into an orchestrating `SignInFlow` holding the shared state plus one component per step, so each step can be tested on its own. Its `useEffect` also has the `continueBtn` object in its dependency array, so it re-runs more than it needs to
- replace the async hook with a native React hook
- replace date utils with luxon - `src/_utils/date.ts` also mixes formatting with time comparisons, and `new Date('YYYY-MM-DD')` parses as UTC, so date-only strings show the previous day in US time zones
- route management - emails create paths & query params the app must consume, but nothing keeps them in sync
- [[Domain-Specific Code Locations|move domain-specific code out of the generic folders]] and spell out in project conventions what goes where - idea, has a starting list of files
- [[Code Tidy-Ups]] ![[Code Tidy-Ups#^status]]
- `src/_components/Calendar/_utils/formatCalendarLabel.ts` - also holds the view display names (`VIEW_LABELS`) and default view order (`DEFAULT_VIEWS`), which its name doesn't describe. Move them into a views config once it's decided where that lives, then it can join [[Code Tidy-Ups]]
- `theme.ts` - the input border `#C8C0C3` has no color token (name one, then it can join [[Code Tidy-Ups]]); input `&:focus` styles in a `styles` object never apply (Mantine drops pseudo-selectors there), so the forest focus ring isn't coming from the theme - see the calendar focus states line under App-Wide UX & Quality
- "today" is computed independently in ~10 calendar places, several with `DateTime.now()` during server render - near midnight the server's time zone can mark the wrong day or cause a hydration mismatch. Consider one source of "today"
- calendar duplication - group-by-date ×4 (`MonthGrid`, `MobileMonthGrid`, `WeekView`, `ListView`), meal color calculation ×2 (`toCalendarMeals`, `MealMonthAgenda`), near-identical adapters `MealCalendar` / `MealWeekView` with identical `MonthGridMeal` / `WeekViewMeal` types, and meal keyboard navigation copied between `useMonthGridKeyboard` and `useWeekViewKeyboard` (the week hook also re-implements `useRovingGridFocus`)
- performance - investigate mongo/mongoose caching - is next doing it already or do we need to implement it? *(was medium)*
- could we get rid of mongoose and use zod + mongodb on its own? what does mongoose get us? *(was medium)*
- audit code for client component surface area - move as much as possible to server components *(was low)*
- [[Unit Test Tidy-Ups]] ![[Unit Test Tidy-Ups#^status]]

## Dev Tooling & Testing
- switch testing library to `vitest-browser-react`
- enable dependabot *(was low)* - npm only (no `.github/` yet); decide how often it runs and whether minor/patch updates are grouped into one PR, then it can join [[Dev Tooling Tidy-Ups]]
- e2e tests *(was low)*
- disable biome a11y checks on unit test mocks *(was low)* - decide whether this covers only `test/mocks/**` or inline mocks in `*.test.tsx` too, then it can join [[Dev Tooling Tidy-Ups]]
- [[Unit Testing - New Centralized Mocks]] ![[Unit Testing - New Centralized Mocks#^status]]
- [[Dev Tooling Tidy-Ups]] ![[Dev Tooling Tidy-Ups#^status]]

## Notes & Agent Workflow
- build the planned note agents (investigate, code review, archive, architect for patterns) - see the Next Step by Note State table in [[Note Conventions]]
- [[Agent Workflow Changes]] - idea.
- [[Skill and Agent Tidy-Ups]] ![[Skill and Agent Tidy-Ups#^status]]
- [[Story Code Review]] ![[Story Code Review#^status]]
- standardize the implementation step format - notes use at least three shapes today ("What we're doing / Acceptance Criteria / Architectural plan" in [[Replace Schedule-X]] and [[Mobile Month View]], "Problem to solve / Suggested Approach / Verification" in [[Mobile List View]], "Scope / Files / Architectural note / Acceptance" in [[Add Meal Changes (Saved Recipes)]])
- reconcile each `spec` note against the code with `/check-drift` when it reaches the top of Next (Stale Data Issues and Unified Date Picker were written this week; Shared Types Directory and Tag Management date from April)
- decide `type` for the untyped notes: [[Email Improvements]], [[Granular Webfetch Permissions]]
- optional: an Obsidian Base listing notes by `type`, `status` and `confirmed`, to spot stale notes at a glance

# Ideas
- [[Grocery List Integration]]
- [[Link SSO Login to Email|Link SSO to Email Login]] *(was undecided)*
- Allow user to change meal color in calendar *(was undecided)*
