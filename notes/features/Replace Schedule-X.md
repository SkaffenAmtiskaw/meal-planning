`schedule-x` has given me nothing but problems - we need to create a custom calendar component

_Note_: In this story we will be using Luxon for date management. You should review Luxon doc at https://moment.github.io/luxon/#/ to make sure we do not replicate it's code.

**Technical Requirements**
- use luxon for as much date management as possible - before writing any utils the luxon docs should be consulted to make sure logic is not being recreated
- minimizing client surface area should be a priority in the design - React context should be leveraged to avoid unnecessary client side rendering
- Mantine components should be prioritized for styling - adding the styles prop or writing CSS is a red flag - look at the Mantine docs to determine if there is a component that would suit better
- existing calendar conventions - like using tag colors for events which are based on a hash of the meal title - should be preserved wherever possible

**Requirements**
- should be a generic component that has no domain logic (event state should be maintained externally)
- the header should do the following
	- allow the user to jump to today
	- go backwards and forward to the previous/next month/week/day
	- show the user the selected month/week/day
	- allow the user to switch between views
	- allow the user to select a date from a datepicker
- month view
	- month view will be different on desktop and mobile
	- on desktop events will appear in the month grid cell - when the user clicks an event it will bring up a modal
	- on mobile the month view will display dots for each day that has an event  - when the user taps a day the events in that day will be rendered down below (this is similar to schedule-x's "month agenda" view)
- week view
	- week view is ONLY available on desktop
	- there will be no timeslots in week view - each day will display the planned meals stacked vertically
	- meals will have the dish titles listed - rendered as links if applicable
	- if a meal is clicked, a modal will open giving the user full details (for now this would be  notes)
- list view
	- this is a scrolling list of all meals - prior days and days more than a month out should be lazy loaded
	- each meal should show the full details
	- pressing the back/forward buttons (in the header) in this view should jump the user to the prev/next day

# Implementation

## Overview

Replace the problematic `schedule-x` library with a custom-built calendar component using Luxon for dates and Mantine for UI.

## Key Architectural Decisions

- **Date Management**: Use Luxon directly (no wrappers needed)
- **State Management**: React Context for calendar state (current date, view type, selected date)
- **Keyboard Navigation**: Two-tier system - Grid navigation + Event mode for days with multiple events
- **Component Design**: Domain-agnostic calendar components in `src/_components/Calendar/`, meal-specific wrappers in `src/app/[planner]/calendar/`

## Tag Color Rules (Must Be Preserved)

All meals with the same title must have the same color. Colors are determined by hashing the meal title and using that hash to select from the TAG_COLORS palette.

**Example:**
- All meals titled "Dinner" → Same color (e.g., tangerine)
- All meals titled "Lunch" → Same color (e.g., seafoam)
- All meals titled "Breakfast" → Same color (e.g., lavender)

This consistency helps users quickly identify meal types visually across the calendar.

---

## Step 1: Install Dependencies
**Status**: ✅ Complete - `4a22c6c0d98496654e8c2392c7b7d9a71e39d97d`

**What we're doing:** Add luxon dependency.

**Acceptance Criteria:**
- [ ] Run `pnpm add luxon` and `pnpm add -D @types/luxon`
- [ ] Run `pnpm dev` - app starts without errors
- [ ] Open the calendar page - existing schedule-x calendar still works

**Files Created:**
- None (just dependency updates)

---

## Step 2: Create Calendar Context

**What we're doing:** Create the calendar state management context.

**Acceptance Criteria:**
- [ ] Run `pnpm check:types` - passes
- [ ] Run `pnpm dev` - app starts
- [ ] Open calendar - still shows schedule-x (no visible changes yet)

**Files Created:**
- `src/_components/Calendar/CalendarContext.tsx`
- `src/_components/Calendar/CalendarProvider.tsx`

---

## Step 3: Create Placeholder Views

**What we're doing:** Create placeholder versions of all three views that display which view is active and the current date from context.

**Acceptance Criteria:**
- [ ] Open the calendar page - you see a placeholder that says "Month View - [current date]"
- [ ] Switch to Week view - placeholder changes to "Week View - [current date]"
- [ ] Switch to List view - placeholder changes to "List View - [current date]"
- [ ] Click "Today" button - date updates in the placeholder
- [ ] Click Prev/Next buttons - date updates in the placeholder
- [ ] Use the date picker - select a date, placeholder updates to that date

**Files Created:**
- `src/_components/Calendar/CalendarHeader.tsx`
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx` (placeholder)
- `src/_components/Calendar/WeekView/WeekView.tsx` (placeholder)
- `src/_components/Calendar/ListView/ListView.tsx` (placeholder)
- `src/_components/Calendar/index.ts`

---

## Step 4: Create Month Grid Shell (No Events)

**What we're doing:** Build the basic month grid layout showing days of the month, without any events yet.

**Acceptance Criteria:**
- [ ] Open calendar - see month grid with correct number of days
- [ ] Days are properly aligned (Sunday start or Monday start)
- [ ] Current month name displays correctly in header
- [ ] Navigate to different months - grid updates correctly
- [ ] Previous/next month overflow days shown (faded or disabled style)
- [ ] Today is visually highlighted

**Files Modified:**
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx` - replace placeholder with actual grid

---

## Step 5: Display Events in Month Grid

**What we're doing:** Show meal events in the month grid cells with correct tag colors.

**Acceptance Criteria:**
- [ ] Open calendar - see events displayed in day cells
- [ ] **Tag colors are consistent:** All meals with the same title have the same color
  - [ ] Verify: All "Dinner" meals show the same color
  - [ ] Verify: All "Lunch" meals show the same color
  - [ ] Verify: Different titles have different colors
- [ ] Events don't overflow their day cells (max 2-3 shown, then "+1 more")
- [ ] Events are clickable (will wire up modal in next step)
- [ ] Screen reader announces events in each day

**Files Created:**
- `src/app/[planner]/calendar/_utils/toCalendarEvents.ts` - convert meal data to calendar events with tag colors
- `src/app/[planner]/calendar/_components/MealCalendar/MealCalendar.tsx` - domain wrapper
- `src/app/[planner]/calendar/_components/MealCalendar/MealEventCard.tsx`

**Files Modified:**
- `CalendarView.tsx` - use new MealCalendar for month view

---

## Step 6: Wire Up Event Click to Modal

**What we're doing:** Make clicking an event open the MealDetailModal.

**Acceptance Criteria:**
- [ ] Click on an event in month grid - MealDetailModal opens
- [ ] Modal shows correct meal details (name, description, dishes)
- [ ] Dish links work correctly in modal
- [ ] Close modal - return to calendar view
- [ ] Click on "+1 more" overflow indicator - see all events for that day

**Files Modified:**
- `MealCalendar.tsx` - add onEventClick handler

---

## Step 7: Month View Keyboard Navigation

**What we're doing:** Implement keyboard navigation for month view.

**Acceptance Criteria:**
- [ ] Press Tab to focus calendar - focus lands on today's date
- [ ] Arrow keys (Up/Down/Left/Right) navigate between days
- [ ] Press Tab again - focus exits calendar (not through every day)
- [ ] Day with single event: Press Enter - MealDetailModal opens
- [ ] Day with multiple events:
  - [ ] Press Enter - enters "event mode"
  - [ ] Down Arrow - moves to next event
  - [ ] Up Arrow - moves to previous event
  - [ ] Enter on focused event - opens modal
  - [ ] Escape - exits event mode
- [ ] Screen reader announces day and event count

**Files Modified:**
- `MonthGrid.tsx` - add keyboard handlers and roving tabindex

---

## Step 8: Create Week View Shell

**What we're doing:** Build the basic week view layout (7 columns), no events yet.

**Acceptance Criteria:**
- [ ] Switch to Week view - see 7 columns (Sun-Sat or Mon-Sun)
- [ ] Each day shows day name and date
- [ ] Navigate to different weeks - updates correctly
- [ ] Today is visually highlighted
- [ ] Click Today button - jumps to current week

**Files Modified:**
- `src/_components/Calendar/WeekView/WeekView.tsx` - replace placeholder

---

## Step 9: Display Events in Week View

**What we're doing:** Show meal events in week view columns with correct tag colors.

**Acceptance Criteria:**
- [ ] Week view shows meals stacked vertically in each day
- [ ] **Tag colors are consistent:** Same meal titles have same colors as month view
  - [ ] Verify: All "Dinner" meals match color from month view
  - [ ] Verify: All "Lunch" meals match color from month view
- [ ] Dish titles are displayed
- [ ] Dish links render correctly (green for saved recipes)
- [ ] Events are clickable

**Files Modified:**
- `WeekView.tsx` - add event display
- `CalendarView.tsx` - use new week view

---

## Step 10: Wire Up Week View Event Click

**What we're doing:** Make clicking events in week view open the modal.

**Acceptance Criteria:**
- [ ] Click event in week view - MealDetailModal opens
- [ ] Modal shows correct details
- [ ] Close modal - return to week view

**Files Modified:**
- `MealCalendar.tsx` - ensure click handler works for week view

---

## Step 11: Week View Keyboard Navigation

**What we're doing:** Add keyboard navigation for week view.

**Acceptance Criteria:**
- [ ] Press Tab - focus enters week view
- [ ] Left/Right Arrow - navigate between days
- [ ] Down Arrow - enter event mode for that day
- [ ] Up/Down Arrow in event mode - navigate between events
- [ ] Enter - open focused event modal
- [ ] Escape - exit event mode
- [ ] Tab - exit week view

**Files Modified:**
- `WeekView.tsx` - add keyboard handlers

---

## Step 12: Create List View Shell

**What we're doing:** Build basic list view with date headers, no meals yet.

**Acceptance Criteria:**
- [ ] Switch to List view - see scrolling container
- [ ] Shows dates starting from today
- [ ] Date headers are sticky
- [ ] Scroll down - loads more dates
- [ ] Navigate Prev/Next - jumps to prev/next day
- [ ] Click Today - jumps to today

**Files Modified:**
- `src/_components/Calendar/ListView/ListView.tsx` - replace placeholder

---

## Step 13: Display Meals in List View

**What we're doing:** Show full meal details in list view with correct tag colors.

**Acceptance Criteria:**
- [ ] List view shows meal cards with full details
- [ ] **Tag colors are consistent:** Match month/week views
  - [ ] Verify: All "Dinner" meals match other views
- [ ] Each card shows: meal name, description, all dishes
- [ ] Dish names are links when applicable
- [ ] Cards are clickable
- [ ] Lazy loading works (scroll down loads more)

**Files Modified:**
- `ListView.tsx` - add meal cards
- `CalendarView.tsx` - use new list view

---

## Step 14: Wire Up List View Click

**What we're doing:** Make clicking meal cards in list view open modal.

**Acceptance Criteria:**
- [ ] Click meal card - MealDetailModal opens
- [ ] Modal shows correct details
- [ ] Close modal - focus returns to card

---

## Step 15: List View Keyboard Navigation

**What we're doing:** Add keyboard navigation for list view.

**Acceptance Criteria:**
- [ ] Press Tab - focus enters list view
- [ ] Tab - navigate between meal cards
- [ ] Enter - open focused meal modal
- [ ] Tab past last card - exits list view

**Files Modified:**
- `ListView.tsx` - add keyboard handlers

---

## Step 16: Create Mobile Month Agenda Shell

**What we're doing:** Build mobile-optimized month view (compact grid + agenda).

**Acceptance Criteria:**
- [ ] Resize to mobile viewport (< 768px)
- [ ] See compact month grid (no events shown in grid)
- [ ] Days with meals show dot indicators
- [ ] Tap on day - agenda appears below
- [ ] Agenda shows that day's meals
- [ ] Tap different day - agenda updates

**Files Created:**
- `src/_components/Calendar/MonthAgenda/MonthAgenda.tsx`

---

## Step 17: Add Events to Mobile Agenda

**What we're doing:** Show meals in mobile agenda with correct tag colors.

**Acceptance Criteria:**
- [ ] Mobile agenda shows meal cards
- [ ] **Tag colors are consistent:** Match desktop views
- [ ] Dish titles are links
- [ ] Tap meal - MealDetailModal opens
- [ ] Scroll through month grid independently

**Files Modified:**
- `MonthAgenda.tsx` - add meal display
- `MealCalendar.tsx` - responsive logic (mobile shows MonthAgenda, desktop shows MonthGrid)

---

## Step 18: Mobile Agenda Keyboard Navigation

**What we're doing:** Add keyboard navigation for mobile agenda view.

**Acceptance Criteria:**
- [ ] Press Tab - focus enters month grid
- [ ] Arrow keys navigate between days
- [ ] Enter - agenda expands with that day's meals
- [ ] Tab - moves focus into agenda
- [ ] Tab between meal cards in agenda
- [ ] Enter on meal - opens modal
- [ ] Escape - closes agenda

**Files Modified:**
- `MonthAgenda.tsx` - add keyboard handlers

---

## Step 19: Remove Schedule-X

**What we're doing:** Remove all schedule-x dependencies.

**Acceptance Criteria:**
- [ ] Run `pnpm remove @schedule-x/calendar @schedule-x/events-service @schedule-x/react @schedule-x/theme-default`
- [ ] Delete all schedule-x related files (hooks, utils, components)
- [ ] Remove schedule-x CSS import from layout.tsx
- [ ] Run `pnpm check:types` - no errors
- [ ] Run `pnpm test` - all tests pass
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Open calendar - all views work correctly

**Files Deleted:**
- `src/app/[planner]/calendar/_hooks/useScheduleXSync.ts` + test
- `src/app/[planner]/calendar/_hooks/useCalendarEvents.ts` + test
- `src/app/[planner]/calendar/_utils/toScheduleXEvents.ts` + test
- `src/app/[planner]/calendar/_utils/getScheduleXViewId.ts` + test
- `src/app/[planner]/calendar/_utils/getWeekStart.ts` + test
- `src/app/[planner]/calendar/_components/MonthGridEvent/`
- `src/app/[planner]/calendar/_components/WeekView/` (old version)

---

## Summary Table: What to Validate Each Step

| Step | What You're Validating |
|------|----------------------|
| 1 | App starts, schedule-x still works |
| 2 | No visible changes, types pass |
| 3 | Placeholders show, navigation works |
| 4 | Month grid displays correctly |
| 5 | Events appear, **tag colors consistent** |
| 6 | Click event → modal opens |
| 7 | Keyboard navigation works |
| 8 | Week columns display |
| 9 | Events in week, **colors match month** |
| 10 | Click → modal |
| 11 | Week keyboard nav |
| 12 | List view shell works |
| 13 | Meals in list, **colors match** |
| 14 | Click → modal |
| 15 | List keyboard nav |
| 16 | Mobile agenda shell |
| 17 | Meals in agenda, **colors match** |
| 18 | Mobile keyboard nav |
| 19 | No schedule-x, all works |

---

## Keyboard Navigation Reference

Based on WAI-ARIA Grid Pattern:

**Roving Tabindex Pattern:**
- Only one cell has `tabindex="0"` at a time
- Arrow keys move focus between cells
- Tab enters/exits the grid, doesn't traverse every cell

**Event Mode for Multi-Event Days:**
- Enter/Space enters event mode
- Arrow keys navigate between events
- Escape exits event mode

---

## Future Work

See [[Keyboard Shortcuts]] for Tier 2 global shortcuts.
