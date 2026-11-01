---
type: feature
status: spec
blocked-by:
  - "[[Meal Editing]]"
  - "[[Today and Selected Day Markers]]"
confirmed: 2026-09-19
---
# Where It Stands
Blocked by [[Meal Editing]]; then /assess. Building waits on [[Today and Selected Day Markers]]. ^status

Sent back from `ready` to `spec`. Its design, with the today-marker update that conflicts with its handoff, moved to [[Meal Editing]] to share one design with the other meal screens, and Check Drift found Steps 2, 3 and 5 out of date.

# Inbox

# Purpose
Replaces the "Coming soon" placeholder that the list view shows on phones with a real mobile list.

![[Meal Editing#Purpose]]

# Design Handoff
🚛 Moved to [[Meal Editing]]'s Inbox, for `/design-feature`.

# Implementation

## Dependencies on in-progress mobile month-view work

| Month-view component | How it is used here | Note |
|---|---|---|
| `MobileCalendarHeader` | Reused as-is for mobile list view | Still in progress; verify before use that it hides prev/next in `list` view and keeps the Month/List switcher. Do not modify it in this story. |
| Base `MealCard` (extracted from `ListView`) | Reused for mobile list-view meal cards | Verify the base card supports no drag handle, no actions, and a configurable dish-list container so the list view can use bullets instead of the desktop left-border stack. |
| `DishListItem` | Reused as-is inside the base `MealCard` | Already renders name/link, external glyph, book ref, and note. Verify it meets mobile list-view needs. |
| `MobileAddMealButton` FAB | Reused for the list-view floating add button | Verify it accepts a target date prop (or can be parameterized) so the list view can default it to today while month view uses the selected day. |

> ⚠️ **Check Drift 2026-09-25:** The mobile month view work is done, so these can now be answered from the code:
> - `MobileCalendarHeader` was never created. The mobile header is `CalendarHeaderMobile` in `src/app/[planner]/calendar/_components/CalendarHeader/CalendarHeader.tsx`, and it already hides prev/next in `list` view and keeps the Month/List switcher.
> - The base `MealCard` (`src/_components/Calendar/MealCard/MealCard.tsx`) has no drag handle and optional `renderActions`, but **no configurable dish-list container**. Step 4 will need to add one.
> - `MobileAddMealButton` has **no target-date prop**; it always prefills the context's `selectedDate`. Step 5 will need to add one to prefill today.

## Step 1: Decouple the list-view scroll shell from the day-row layout

**Problem to solve:** The desktop list view couples its scroll container, day-range building, event grouping, and scroll-to-date behavior to the desktop day-row layout. Mobile needs the same shell but a completely different day section.

**Suggested Approach:** Treat `ListView` as a generic scroll container. Extract the desktop day-row layout behind an injection point so the mobile layout can be supplied without copying scroll logic, range logic, or scroll-sync code.

**Verification:**
- Open the desktop list view and confirm it still looks and behaves exactly as before.
- Inspect the code to confirm the desktop layout is still the default injection but can be replaced.

## Step 2: Expand the loaded day window on explicit navigation

**Problem to solve:** The current day window is fixed around today. If the user picks a far date via the date picker, that day may fall outside the rendered range.

**Suggested Approach:** Update `getListDayRange` to accept an optional `targetDate`. Compute the default window around today, then extend the start/end to include `targetDate` when it falls outside. Pass the context's `selectedDate` (already updated by navigation) as the target from `ListView`.

**Verification:**
- On mobile List view, use the existing header date picker to jump several months into the past or future.
- Confirm the target day renders and the list scrolls to it.

> ⚠️ **Check Drift 2026-09-25:** This step's premise is out of date and it needs re-review before implementation. The window is not fixed around today: `getListDayRange` already takes a `rangeAnchor` from `CalendarContext`, which `navigateToDate` updates. From reading the code (not verified in the running app), the bug still seems to exist for a different reason: `getListDayRange` forces today into the window, so when the anchor is more than ~3 weeks from today the window snaps back to today and the target day is not rendered. The fix is probably changing that rule rather than adding a `targetDate` parameter.

## Step 3: Build and wire the mobile day section

**Problem to solve:** Mobile needs a full-width day section instead of a sticky left gutter.

**Suggested Approach:** Create a `MobileDayRow` component that conforms to the same day-row prop contract as the desktop version. Render it via the `renderDay` injection point from Step 1. Use Mantine `Group`, `Divider`, `Text`, and `Box` for the header row and today tint. Leave the add button slot empty for now. Wire the component through `MobileMealListView` and update `MealListView` to render the mobile branch.

**Verification:**
- On mobile List view, confirm every day in the range appears as its own section, including days with no meals.
- Empty days show “No meals planned”.
- Today’s section is tinted and the date label is ember; the list scrolls so today is near the top on first load.

> ⚠️ **Check Drift 2026-09-25:** The "tinted" and "ember" parts of this check (and the "today tint" in the Suggested Approach above) are superseded by [[#Design Update - Today Marker]]. This step needs re-review before it's built. Found by reading notes, not in the running app.

## Step 4: Reuse the generic meal card and dish row for mobile meal content

**Problem to solve:** Meals need to be readable on a narrow screen with no detail modal.

**Suggested Approach:** Use the base `MealCard` being extracted by the month-view story. Pass no drag handle and no actions. Replace the desktop dish-list container (border-left stack) with a bullet-style container using Mantine `List` or `Group` + `Text`, reusing the existing `DishListItem` for each dish. Keep `DishLink` as the `renderDish` implementation.

**Verification:**
- On mobile List view, confirm meal cards show name, description, every dish, recipe/external links, book references, and multi-line notes.
- Tapping a dish link navigates correctly; tapping the card itself does nothing.
- Confirm there are no drag handles.

## Step 5: Add add-meal affordances

**Problem to solve:** Cooks need a way to add meals from the mobile list view.

**Suggested Approach:**
- **Day-header button:** Extend `MobileDayRow` to accept an `onAddMeal` callback. Render a 28px Mantine `ActionIcon` inside a wrapper that guarantees a ≥44 px touch target. Generate the accessible name from the full date (e.g., `Add meal for ${date.toFormat('MMMM d, yyyy')}`). Only render the button when `onAddMeal` is provided.
- **Floating button:** Reuse the month view’s `MobileAddMealButton`, passing today’s date as its target so it prefills today rather than the month view’s selected day.
- **Modal wiring:** Keep modal state in `MobileMealListView`. Reuse `AddMealFormModalWrapper` inside a Mantine `Modal`. When a day header or the FAB triggers `onAddMeal`, store the date and open the modal. Pass `onMealAdded` from `MealListView` to refresh calendar data and close the modal on success.

**Verification:**
- Each day header has a visible plus button.
- The floating ember plus button appears bottom-right.
- Tapping either button opens the Add Meal modal with the correct date prefilled.
- Submitting the form adds the meal and it appears in the list.
- Scrolling to the bottom shows the last card is not covered by the floating button.

> ⚠️ **Check Drift 2026-09-25:** The modal wiring above describes code that no longer exists, and this step needs re-review before implementation:
> - `AddMealFormModalWrapper` and `onMealAdded` no longer exist. Add Meal now opens through `CalendarModalProvider` / `useCalendarModal` (`src/app/[planner]/calendar/_components/CalendarModal/`), the pattern [[Modal Form Architecture]] standardizes. Mobile list should open the modal the same way rather than keeping its own modal state.
## Step 6: Read-only gating and accessibility polish

**Problem to solve:** Read-only users must not see add affordances, and the view must meet accessibility requirements.

**Suggested Approach:** This is largely a matter of applying the existing permissions hook and design tokens correctly:
- Use `useCanWrite` in `MobileMealListView`. When false, do not render the FAB and do not pass `onAddMeal` into `MobileDayRow`.
- Ensure today sections expose the full date in an `aria-label` or `aria-current="date"` attribute.
- Verify the 28 px day-header add button sits inside a 44 px touch target wrapper.
- Confirm contrast and color roles are enforced by theme tokens: primary content in `navy`, muted `navy.4` only for decorative/redundant labels.

**Verification:**
- Log in as a read-only user and confirm no plus buttons appear anywhere.
- Confirm dish notes are never truncated and primary content is readable.
- Inspect that add-button hit areas are comfortable on touch (≥44 px).
- Verify today’s section is labelled/announced with today’s date.
