---
type: goal
confirmed: 2026-09-28
---
%% A goal is an epic: work Sarah ranks and ships together as one release. `/roadmap` shapes and ranks it. It has no `status` and no Where It Stands, and it's never implemented directly. Its rank lives on the Roadmap. So does the list of stories that serve it: the lines under its heading in Later, and every line elsewhere that ends with its 🎯 link. %%

# Purpose
%% Why this goal matters and what it changes, for the app's users or for how the app is built. %%
Get the calendar page into a polished state that is ready for users. That means wrapping up the partially done schedule-x migration, adjusting screens based on user feedback, wiring up the ability to edit meals, and a final UX and styles pass at the end for polish.

# Done When
%% What has to be true to ship this goal as a release. Each item is something Sarah can check in the running app, or a named piece of work being finished. %%
- The schedule-x migration is wrapped up.
- Screens are adjusted based on user feedback.
- Meals can be edited.
- You can plan right on the calendar: click a day to add a meal there, and drag a meal to another day or to a new spot within its day.
- Any change a user makes shows up on screen right away, without a reload.
- The calendar is fully usable on a phone: every workflow you can do on desktop is possible on a phone, and it doesn't suck.
- The calendar is accessible: it works fully with a keyboard and a screen reader, and passes an accessibility audit against WCAG 2.2 AA.
- People can only see the planners they belong to, and can only change the planners they have permission to change. The goal checks this rather than assuming it.
- Every calendar screen matches its approved design.
- E2E tests cover the calendar's major flows, including the ones this goal adds.
- A final UX and styles pass is done. It starts only once everything else here is done.

# Out of Scope
%% Work that was considered for this goal and left out, with Sarah's reason, so `/roadmap` doesn't offer it again. %%
- Letting users change a meal's color (Ideas): if Sarah decides on it, it belongs to a later calendar v2 (2026-09-28).
- [[Keyboard Shortcuts]] (Ideas): not decided yet; if Sarah decides on it, it belongs to a later calendar v2 (2026-09-28).
- [[Zero Planners Crash]]: it's more of a planner management story than a calendar story, and it affects every page, not just the calendar (2026-09-28).
- The [[Code Tidy-Ups]] item renaming three `.d.ts` files to `*.types.ts`, one of them `AddMealForm/types.d.ts`: it's tech debt (2026-09-28).
- The [[Style Decisions]] decision on which uses of the Mantine `color` prop should be a `variant`, including the calendar's `AddMealButton` and `MobileAddMealButton`: it's tech debt (2026-09-28).
