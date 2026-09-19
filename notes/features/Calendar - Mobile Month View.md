![[01-month-today.png]]![[Mobile Month View.dc.html]]![[support.js]]
![[weeknight-header-dark 1.svg]]

# Handoff: Mobile — Month view

## Overview
On a phone, the month view should stop trying to be the desktop month grid. Instead of seven
columns of 100px cells with truncated meal cards inside them, mobile gets a **compact month grid
with colored dots** plus an **inline agenda for the selected day** underneath it. The grid answers
"what does the month look like"; the agenda answers "what are we eating", with full dish names,
recipe links and prep notes readable at rest.

This story covers the **month view on mobile only**. The mobile list view is a separate story and a
separate handoff.

## Fidelity — Mantine first, pixels second
**Build this out of Mantine components and props. That matters more than matching the prototype
pixel for pixel.** The sizes, spacings and colors below are design intent, not a contract. Where a
Mantine component, prop, theme token, or spacing step gets you close, take the Mantine version —
`SimpleGrid`/`Stack`/`Group` over styled `<div>`s, `Card`/`Paper` over hand-rolled borders,
`SegmentedControl`, `ActionIcon`, `Badge`, `Indicator`, `Affix` over custom equivalents, `c="navy"`
over a hex literal, `size="sm"` over a `fontSize`. Something a few pixels off but built from real
Mantine primitives and theme tokens is the **correct** outcome; a pixel-exact version built from
inline styles and hardcoded hexes is not. Reach for custom styling only where Mantine genuinely has
no answer.

Two things are not negotiable to taste, because they are the reasons for the change:
2. the selected day's meals are fully readable inline — no truncation, no modal required;
3. all primary content clears 4.5:1 contrast (notes included, in full navy ink) — the muted ramp is
   only for the labels named in the Accessibility section.

The prototype (`Mobile Month View.dc.html`) is a look-and-behavior reference built outside the app.
Do not port its markup, inline styles, or fixture data.

---

## What's wrong today
- The desktop month grid renders on phones as-is: cells are tall, meal cards inside them are
  clipped, and two meals plus a "+N more" barely fit.
- Everything about a meal is behind a tap into the meal detail modal — on the smallest screen, the
  most information is the hardest to reach.
- The header is desktop-shaped: Today button, prev/next, month label, segmented control, and a date
  picker input all on one row.

## Screen anatomy (top to bottom)

### 1. App header
Unchanged. Shown in the prototype only for context.

### 2. Calendar header — compact, two rows
- **Row 1:** prev chevron · month + year (tappable, opens a date picker) · next chevron · **Today**.
  - The month label carries a small chevron to signal it opens a date picker. Tapping it lets the
    user jump to any month/date; on confirm the grid moves there and the agenda shows that day.
  - Prev/next move by one month.
  - **Today** returns to the current month and selects today.
- **Row 2:** Month / List switcher, full width, two segments only (Week is already excluded on
  mobile). Minimum 44px tall touch targets on everything in this header.
- The desktop date-picker *input* and the desktop "Add Meal" button do **not** appear here — the
  label is the date picker, and adding a meal is the floating action button (see 5).

### 3. Weekday header
Single-letter labels, centered, muted, uppercase, above the grid.

### 4. Month grid — dots, not cards
Seven columns, whole month plus leading/trailing days to fill the weeks. Each cell is a compact
tap target (~52px tall, comfortably over 44px) containing:
- **Day number**, centered in a ~30px circle.
  - Days outside the displayed month are muted.
  - **Today** is an ember filled circle with white text.
  - **Selected** day gets a tinted cell background (ember tint when it is also today, neutral chalk
    tint otherwise) and a heavier day number. Today and selected must be distinguishable when they
    are different days.
- **Meal dots** beneath the number: one small dot per meal, in the meal's tag color, **max 3**. No
  "+N" affordance and no text in the cell — the agenda below carries the detail. A day with no
  meals shows no dot but keeps its height, so rows stay aligned.
- Dot color comes from the same meal-name → tag-color mapping used by the month and list views, so
  "Dinner - Fun Friday" is the same color everywhere.

### 5. Selected-day agenda
Directly below the grid, in its own scroll region on a subtly tinted background so it reads as a
distinct panel from the grid.

- **Panel header:** the selected day, long form ("Thursday, September 10"), prefixed "Today · " when
  it is today. On the right, a muted meal count ("2 MEALS").
- **Meal card** per meal, stacked:
  - Left rail in the meal's tag color (4px), otherwise a plain bordered card.
  - Meal name, prominent. Optional description beneath it, muted.
  - **Dish list** — one line per dish with a small bullet:
    - plain dish name; or a link when the dish has a saved recipe or an external URL (external
      links open in a new tab and get an external-link glyph);
    - an optional book/page reference after the name, small and italic, muted;
    - the dish's **note on its own line beneath the name**, full-strength navy ink, wrapping to as
      many lines as it needs. Never truncated, never clamped, never behind a tooltip. Author line
      breaks are preserved; render as plain text (no markdown, no autolinking).
  - **Quick actions** at the bottom of the card: **Edit** and **Add dish**, as pill buttons.
    These replace desktop's hover affordances (there is no hover on touch). For this story both
    buttons are rendered as **disabled stubs**; they will be wired to the existing add/edit meal
    flow (once the edit flow exists) in a future story.
- **Empty day:** a single dashed placeholder card — "Nothing planned yet" plus a prominent
  **Add meal** button that opens the add flow with that date prefilled. Do not leave the panel blank.

### 6. Floating "Add Meal" button
Persistent, bottom-right, ember, above the agenda scroll. Adds a meal to the **currently selected
day** — not always today. It must not cover the last card: the agenda's scroll region needs bottom
padding roughly the height of the button plus its margin.

---

## Interactions & behavior
- **Tap a day** → selects it and swaps the agenda. The grid does not move; the agenda scroll resets
  to top. No navigation, no modal.
- **Initial state:** current month, today selected, agenda showing today.
- **Prev / next month:** the grid changes month; selection moves to the same relative position or
  the 1st, and the agenda follows. Keep whichever rule is simplest — but the agenda must always
  match the highlighted day.
- **Today:** returns to the current month and selects today, even from three months away.
- **Swipe** between months is a nice-to-have, not required for this story.
- **Tapping a meal card** does not open a read-only modal. Everything is already on screen; editing
  happens through Edit / Add dish.
- **Tapping a dish link** navigates to the recipe or the external source and must not also select
  or toggle anything behind it.
- **Read-only users** (no write permission): no floating button, no Edit / Add dish, no add-meal
  affordance in the empty state — the empty day just says nothing is planned.
- **Loading:** skeletons for the grid cells and one or two agenda cards. Do not collapse the layout
  height while loading.

## Breakpoint
This treatment applies at the existing mobile breakpoint for the calendar. Above it, the desktop
month grid is unchanged. The two implementations should not both mount.

## Accessibility
- Every day cell is a real, focusable control with an accessible name including the date and the
  meal count ("September 10, 2 meals"), and it exposes its selected state.
- Dots are decorative — color alone never carries meaning; the meal count in the accessible name
  and the agenda below are the real information.
- Touch targets ≥44px: day cells, header controls, segmented control, quick actions, floating
  button.
- The agenda panel announces its change when the selected day changes.
- **Contrast, scoped:** all primary content — meal names, dish names, dish notes, the agenda's day
  title — clears 4.5:1. Dish notes in particular use **full navy ink**, not the muted `navy.4`
  grey: at this size, on white, `navy.4` is ≈2.8:1, and notes are load-bearing content, not
  decoration. Notes read as secondary through size and weight, not through fading.
- The theme's muted ramp is used **only** for labels that are decorative or redundant with content
  available elsewhere: the weekday letters above the grid, the meal description, the book/page
  reference, the meal count (also in each day cell's accessible name), and out-of-month day
  numbers. These sit below 4.5:1 by design. If one of them turns out to be the only place a piece
  of information appears, it moves to full navy rather than staying muted.

## Tokens
Everything below already exists in the theme — use the tokens, do not re-declare colors.

| Use | Token |
|---|---|
| Body text, day numbers, dish names, dish notes | `navy` |
| Muted labels (weekday letters, description, book ref, meal count) | `navy.4` / `navy.3` — decorative/redundant only, see Accessibility |
| Out-of-month day numbers | `navy.2` |
| Dish bullet | `navy.1` |
| Links, secondary actions, chevrons | `forest` (hover `forest.6`, underline `forest.4`, border `forest.2`, tint `forest.0`) |
| Today badge, floating button, today accents | `ember` |
| Today / selected cell tint | `ember.0` |
| Agenda panel background | `chalk.0` |
| Dividers, card borders | `chalk.3` / `chalk.2` |
| Meal rail + grid dots | the meal's tag color (name → tag-color mapping) |

Icons come from the app's existing icon set (plus, chevrons, external link) — the prototype draws
them by hand only so it runs standalone. No new assets.

## Acceptance criteria
1. On a phone, the month view shows a compact 7-column grid with tag-colored meal dots (max 3 per
   day) and no meal cards inside cells.
2. Today is visually distinct from the selected day, and both are visible at once.
3. Tapping any day updates an inline agenda below the grid without navigating or opening a modal.
4. The agenda shows, for each meal: name, optional description, every dish, each dish's recipe or
   external link, book reference where present, and its full note on its own line; **Edit** and
   **Add dish** pill buttons appear at the bottom of each card as disabled stubs.
5. Dish notes are never truncated or clamped and clear 4.5:1 contrast, as does all other primary
   content; the muted ramp appears only on the decorative/redundant labels named above.
6. Empty days show an add-meal affordance; read-only users see no write affordances anywhere.
7. Header fits two rows with 44px+ targets: month navigation + Today, and a two-segment
   Month/List switcher. No desktop date-picker input.
8. A floating Add Meal button adds to the selected day and never overlaps the last card's content.
9. The view is built from Mantine components and theme tokens, with custom styling only where
   Mantine has no equivalent.

# Implementation

## Reuse decisions

- `CalendarProvider` / `useCalendarContext` — REUSE AS-IS for selected date, view type, and
  navigation.
- `getMonthGridDates` + `WEEKDAY_LABELS` — REUSE AS-IS for the mobile grid.
- `useMediaQuery` breakpoints — CREATE SHARED HOOK: introduce `useIsMobile` in `src/_hooks/` so the
  calendar has one mobile breakpoint. Phone = mobile, tablet/desktop = desktop, so the breakpoint
  should be `sm`/`48em`.
- `MealCard` (ListView) — GENERICIZE NOW: extract the card itself (rail, name, description, dishes,
  optional actions) into a base `MealCard` with no drag-handle knowledge. List view keeps a
  `MealCardWithDragHandle` wrapper that composes the base card with its DND grip. Mobile agenda uses
  the base `MealCard` directly with `renderActions` for the stub buttons.
- `DishListItem` (ListView) — REUSE AS-IS inside the base `MealCard` for dish name/link, external
  glyph, book ref, and note rendering.
- `CalendarHeader` — GENERICIZE NOW: add a mobile layout branch (two rows, month label as
  date-picker trigger, no desktop date input).
- `useCanWrite` — REUSE AS-IS to gate the FAB and write affordances.
- `AddMealForm` / `ControlledModal` — REUSE AS-IS for the mobile FAB; build a small
  mobile-specific trigger wrapper.

## Step 1: Establish a shared mobile breakpoint hook
**Status**: ✅ Complete

**What we're doing:** Define a single source of truth for the mobile breakpoint so calendar views do
not each pick their own width, which would create inconsistent desktop/mobile behavior.

**Acceptance criteria:**
- [x] A `useIsMobile` hook exists in `src/_hooks/` and is exported from `src/_hooks/index.ts`.
- [x] `CalendarView.tsx` uses `useIsMobile` instead of its inline `useMediaQuery('(max-width: 62em)')`.
- [x] `MealListView.tsx` uses `useIsMobile` instead of its inline `useMediaQuery('(max-width: 48em)')`.
- [x] At widths below `sm`/`48em` (phones), the calendar renders mobile layouts; at widths at or
  above `sm`/`48em` (tablets and desktops), it renders desktop layouts.
- [x] Existing tests for `CalendarView` and `MealListView` are updated to mock `useIsMobile` and still
  pass.

**Architectural plan:**
- Create `src/_hooks/useIsMobile.ts` that returns `useMediaQuery('(max-width: 48em)')` (`sm`).
- Export it from `src/_hooks/index.ts`.
- Replace inline `useMediaQuery` calls in `CalendarView.tsx` and `MealListView.tsx` with `useIsMobile`.
- Note: this aligns the calendar on `48em`/`sm`. `CalendarView` previously switched at `62em`/`md`,
  so this step narrows the mobile range for the month view so tablets use the desktop grid.

## Step 2: Wire a mobile month-view shell into the calendar page

**Status**: ✅ Complete

**What we're doing:** Add the responsive switch so the calendar page renders a mobile-specific
component on small screens. The component starts as a placeholder so we can validate the wiring
before the grid/agenda are built.

**Acceptance criteria:**
- [x] Open the calendar page on a desktop width — the existing desktop month grid still renders.
- [x] Resize to a mobile viewport — the page shows a placeholder mobile month view (e.g.,
  "Mobile month view — selected date: [date]").
- [x] On mobile, the Month/List switcher in the header still works and switches views.
- [x] Today, prev/next, and the existing date picker still update the placeholder's selected date.
- [x] The two implementations do not mount at the same time.

**Architectural plan:**
- Create `src/app/[planner]/calendar/_components/MealMonthAgenda/MealMonthAgenda.tsx` as a thin shell
  that reads `selectedDate` from `CalendarContext` and renders placeholder text.
- Modify `src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx` (or
  `MealCalendar/MealCalendar.tsx`) to render `MealMonthAgenda` on mobile and `MealCalendar` on
  desktop, using `useIsMobile`.
- Pass `plannerId`, calendar data, saved items, and `onMealAdded` into the shell so later steps can
  use them without changing the wiring.

## Step 3: Responsive `CalendarHeader` for mobile

**Status**: ✅ Complete

**What we're doing:** Add a mobile-specific calendar header and wire it in place of the desktop
header on small screens.

**Acceptance criteria:**
- [x] Open the calendar page on a mobile viewport.
- [x] The header shows Row 1: prev chevron · month/year label with a chevron · next chevron · Today.
- [x] Tapping the month/year label opens a date picker.
- [x] Row 2 shows a full-width Month/List `SegmentedControl`.
- [x] The desktop date-picker input is hidden on mobile.
- [x] All header controls are ≥ 44px tall.
- [x] Today, prev/next, and date picker still work and update the selected date shown in the
  placeholder.
- [x] The desktop header is unchanged at desktop widths.

**Architectural plan:**
- Create `src/_components/Calendar/MobileCalendarHeader.tsx` for the two-row mobile layout.
- Extract reusable `CalendarNavButtons` and a `formatCalendarLabel` utility so both headers share
  the same navigation actions and label formatting.
- Keep the existing `src/_components/Calendar/CalendarHeader.tsx` as the desktop header.
- In `src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx`, use `useIsMobile` to
  render `MobileCalendarHeader` on mobile and `CalendarHeader` on desktop.
- Use Mantine `Group`, `Button`, `SegmentedControl`, `Stack`, `Popover`, and `DatePicker` for the
  mobile layout, with `size="lg"` to meet the 44px touch-target minimum.
- Read navigation state from `CalendarContext`.

## Step 4: Split `MealCard` into a base card and a drag-handle wrapper

**What we're doing:** Make the meal card reusable by both the list view and the mobile agenda by
moving the drag handle out of the card itself.

**Acceptance criteria:**
- [ ] Open the calendar page and switch to List view — meal cards still render with drag handles.
- [ ] Meal cards still show name, description, dishes, notes, and links exactly as before.
- [ ] The base `MealCard` (used later by the mobile agenda) contains no drag-handle markup or props.
- [ ] Existing list view tests still pass (after updating imports).

**Architectural plan:**
- Move the card body into a new shared base component at
  `src/_components/Calendar/MealCard/MealCard.tsx`.
- Add `renderActions?: ReactNode` to the base `MealCard` props.
- Keep `DishListItem` usage inside the base card.
- Create `src/_components/Calendar/ListView/_components/MealCardWithDragHandle.tsx` that wraps the
  base card with the drag-handle rail.
- Update `src/_components/Calendar/ListView/_components/DayRow.tsx` to import and render
  `MealCardWithDragHandle` instead of the old `MealCard`.

## Step 5: `MobileMonthGrid` component with real dot data

**What we're doing:** Build the compact dot-grid, convert real planner data into colored dot events
in `MealMonthAgenda`, and swap the grid into the shell while keeping a placeholder agenda below it.

**Acceptance criteria:**
- [ ] On the calendar page at mobile width, see a compact 7-column grid for the current month plus
  leading/trailing days.
- [ ] Day numbers are centered; out-of-month days are muted.
- [ ] Today is shown as an ember filled circle with white text.
- [ ] The selected day has a tinted cell background; today and a different selected day are
  distinguishable.
- [ ] Days that have real meals in the planner show up to 3 small colored dots.
- [ ] Dot colors match the tag-color mapping used elsewhere (same meal title → same color).
- [ ] Days without meals keep their height but show no dots.
- [ ] Tapping a day updates the placeholder agenda text below to show the selected date.
- [ ] Each day cell is focusable and has an accessible name like "September 10, 2 meals".

**Architectural plan:**
- Create `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx`.
- Reuse `getMonthGridDates` and `WEEKDAY_LABELS`.
- Consume `selectedDate` and `setSelectedDate` from `CalendarContext`.
- Accept `events: { id: string; date: string; color: string }[]`.
- Use Mantine `SimpleGrid`, `Paper`, `Center`, `Text`.
- Add keyboard navigation (arrow keys between days, roving tabindex) via a new
  `useMobileMonthGridKeyboard` hook or by simplifying `useMonthGridKeyboard`.
- In `MealMonthAgenda`, map `SerializedDay[]` + `SavedItem[]` through `toCalendarEvents`,
  `getMealColor`, and `TAG_COLORS` to produce dot-colored events for `MobileMonthGrid`.
- Update `MealMonthAgenda` to render `MobileMonthGrid` plus a small placeholder for the agenda.

## Step 6: `MobileAgenda` component with real meal data

**What we're doing:** Build the selected-day agenda panel, convert real planner data into full meal
events in `MealMonthAgenda`, and replace the placeholder agenda with it.

**Acceptance criteria:**
- [ ] On the calendar page at mobile width, tap a day in the grid — the agenda below updates with
  that day's real meals.
- [ ] The agenda header shows the long-form date ("Thursday, September 10") prefixed with "Today · "
  when applicable, and a muted meal count ("2 MEALS").
- [ ] Meal cards show real meal names, descriptions, dishes, notes, and links.
- [ ] Empty days show a dashed placeholder card reading "Nothing planned yet".
- [ ] The agenda panel scrolls independently and has bottom padding for the future FAB.
- [ ] Changing the selected day updates the agenda and announces the change to screen readers.

**Architectural plan:**
- Create `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx`.
- Consume `selectedDate` from `CalendarContext`.
- Accept events matching `ListViewEvent` (or a new `MobileAgendaEvent` type) and an optional
  `renderDish` function.
- Reuse the base `MealCard`.
- Use Mantine `Paper`, `Stack`, `ScrollArea`, `Text`.
- Add `aria-live="polite"` to the panel header.
- In `MealMonthAgenda`, also compute full meal events from `SerializedDay[]` + `SavedItem[]` and pass
  them to `MobileAgenda` with a `renderDish` that uses `DishLink`.
- Update `MealMonthAgenda` to render `MobileAgenda` instead of the placeholder.

## Step 7: FAB, stub actions, permissions, and skeletons

**What we're doing:** Add the Add Meal FAB, disabled Edit/Add dish stubs, permission gating, and
loading skeletons to the mobile month view.

**Acceptance criteria:**
- [ ] Each meal card has disabled **Edit** and **Add dish** pill buttons.
- [ ] Empty days show "Nothing planned yet" and an enabled **Add meal** button.
- [ ] A floating ember **Add Meal** button adds a meal for the currently selected day.
- [ ] The FAB and empty-state Add meal button are hidden for read-only users.
- [ ] While data is loading, skeleton placeholders for grid cells and agenda cards are shown without
  collapsing layout.
- [ ] Adding a meal via the FAB updates the calendar data and the agenda.

**Architectural plan:**
- In `src/app/[planner]/calendar/_components/MealMonthAgenda/MealMonthAgenda.tsx`, use `useCanWrite`
  to hide write affordances for read-only users.
- Build a small `MobileAddMealButton` FAB using Mantine `Affix` + `Button` (ember color) and the
  existing `AddMealForm`/`ControlledModal`, prefilling `selectedDate`.
- Render disabled stub `Button` components for Edit and Add dish actions.
- Add skeleton states using Mantine `Skeleton` for the grid and agenda during loading.

## Out of scope
- Week view on mobile (already excluded on small screens).
- The mobile list view (separate story / handoff).
- Drag to reschedule, multi-month infinite scroll, swipe gestures.
- Any change to the add/edit meal flow itself.

## Files in this bundle
- `Mobile Month View.dc.html` — interactive design reference; open in a browser and tap days.
- `screenshots/01-month-today.png` — today selected, two meals with notes.
- `assets/weeknight-header-dark.svg` — existing app logo, included only so the prototype renders
  standalone.
