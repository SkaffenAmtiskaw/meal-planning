# Calendar List View (Desktop)

## Handoff

Source: `/Users/sarah/Downloads/design_handoff_list_view/`
Prototype: `List View.dc.html`

### Overview
A scrolling, agenda-style list view for the meal planner calendar. It replaces the current placeholder in `src/_components/Calendar/ListView/ListView.tsx` (which today renders a single `<Text>`). The view shows a continuous vertical run of days — every day in range, not just days with meals — each with its meals and dishes, anchored on today. As the user scrolls, `selectedDate` tracks the topmost visible day so the header label and other views stay in sync.

The files in the handoff bundle are **design references created in HTML** — a prototype showing the intended look and behavior. They are **not production code to copy**. The task is to recreate this design inside the existing Next.js + Mantine app using its established patterns (Mantine components, `@/_theme` colors, CSS modules, Luxon `DateTime`, colocated Vitest tests). Do not port the inline styles or the prototype's hand-rolled data layer.

**Fidelity:** High, but not pixel-perfect. Colors, type sizes, spacing and interaction states are taken from the prototype, but express them through Mantine props/theme tokens where an equivalent exists (e.g. `c="navy"`, `size="sm"`, `gap="xs"`) rather than hardcoding exact pixel values. Do not introduce custom CSS solely to match prototype pixel dimensions when a Mantine prop/theme token is close enough.

### Screen: Calendar → List view

**Purpose:** scan upcoming and recent meals in one continuous scroll, jump to a date, add a meal to any day, and click through to a dish's recipe or external source.

#### Page layout (top to bottom)
1. **App header** (existing `Header.tsx` / `PlannerLayout`) — navy `#1C3144`, 40px tall. Unchanged; shown in the prototype only for context.
2. **Calendar header** (existing `CalendarHeader.tsx`) — 16px padding, bottom border `1px solid #EBE8E9`. Left: **Today** button + month label. Right: **Add Meal** button, Month/Week/List `SegmentedControl`, `DatePickerInput`.
3. **Scroll region** — `flex: 1; min-height: 0; overflow-y: auto`. Inner column `max-width: 900px; margin: 0 auto; padding: 8px 24px 64px`.

#### Header changes required for this view
- The month label in list view uses `selectedDate.toFormat('MMMM yyyy')`. `selectedDate` is updated to the topmost visible day after scrolling stops, so the header label tracks scroll position.
- The prev/next `ActionIcon`s are **hidden in list view** (scrolling replaces them).
- **Today** scroll-animates the list to today's row (`behavior: 'smooth'`, target `row.offsetTop - 12`) and updates `selectedDate` to today.

#### Day row
One row per calendar day in the loaded range. Flex row, `gap: 14px`, `border-top: 1px solid #EBE8E9`, `padding: 14px 0`.

- Background: `#ffffff`; **today's row** uses `ember.0` with lowered opacity (e.g. `rgba(var(--mantine-color-ember-0), 0.5)`).
- Row carries `data-iso="YYYY-MM-DD"` — used for scroll targeting and month detection.

**Left gutter — 82px fixed** (`flex: 0 0 82px`), `padding-right: 12px`, `border-right: 1px solid #EBE8E9`. Contents are `position: sticky; top: 8px`, right-aligned, with a small vertical gap and `padding-right: 30px` so the weekday and day number align above one another:
- Weekday: `SUN`…`SAT`, use Mantine `Text` with `size="xs"`, `fw={700}`, `c="navy.4"`, `tt="uppercase"`.
- Day number: use Mantine `Text` with `size="xl"`, `fw={500}`.
  - **Today:** use Mantine `Badge` with `circle` and `color="ember"`.
- **First of month** only: month abbreviation (`SEP`) below the number, use Mantine `Text` with `size="xs"`, `fw={600}`, `c="ember.5"`, `tt="uppercase"`.
- **Add-meal affordance:** 22px circle to the right of the day number, `border: 1px solid #CFDBCE` (`forest.2`), forest `#44633F` plus glyph. Hidden by default (`opacity: 0; transform: translateX(-4px) scale(.9)`), revealed on **row hover** (`opacity: 1; translateX(0) scale(1)`), transition `opacity 130ms ease, transform 130ms ease`. Hover on the button itself: `background #EFF3EF` (`forest.0`), `border-color #44633F`. Hover-out is debounced ~150ms so moving between the number and the button doesn't flicker. It must also be keyboard-reachable — give it a real `ActionIcon`/button with `aria-label="Add meal on {date}"` and the app's `focusClasses.focusRing`; visibility should also trigger on `:focus-within` of the row, not hover alone.

**Right column** — `flex: 1; min-width: 0`, vertical stack, `gap: 6px`.

##### Meal card
Flex row: 16px drag handle column + card.
- **Drag handle:** 2×3 grid of 3px dots, `#D1D7DD` (`navy.1`), `gap: 3px`, `padding-top: 12px`, `cursor: grab`. Present for future drag-to-reschedule; wire it only if reordering is in scope, otherwise render it non-interactive (and skip it entirely on touch).
- **Card:** `flex: 1; padding: 9px 12px 11px; border-radius: 8px;` `border: 1px solid #F0EDEE` (`chalk.2`), **plus `border-left: 4px solid <mealColor>`**. The left rail color is `TAG_COLORS[getMealColor(meal.name)].border` — reuse `getMealColor` from `@/_theme/colors` exactly as `MealEventCard` does, so a meal named "Dinner - Fun Friday" is the same color in month, week and list views. Hover: `background #FAF8F9` (`chalk.0`), `border-color #E1D9DB` (`chalk.7`); `cursor: pointer`.
- **Card header row:** baseline-aligned, `gap: 10px`, wraps. Meal name 15px / 600 / `#1C3144`; optional description 13px / 400 / `#8C9BAA`.
- **Dish list:** shown when the meal has dishes. `margin-top: 7px`, `padding-left: 10px`, `border-left: 1px solid #F0EDEE`, stack `gap: 2px`. Each dish is a baseline flex row, `gap: 8px`, wrapping:
  - plain dish → 13px / 500 / `#1C3144`
  - dish with a saved recipe (`source._id`) → link to `/{plannerId}/recipes/{_id}`
  - dish with an external `source.url` → link, `target="_blank" rel="noreferrer"`, with a 9px external-link glyph after the label
  - links: 13px / 600 / `#44633F`, `text-decoration: underline`, `text-decoration-color: #AFC2AE` (`forest.4`), `thickness 1px`, `underline-offset 3px`; hover `color #3C5736` (`forest.6`), underline color `#44633F`
  - `source.ref` (a book/page string) → 12px italic `#8C9BAA` after the name
  - `dish.note` → 12px `#8C9BAA` after the name
  Reuse `DishLink` (`src/app/[planner]/calendar/_components/DishLink/DishLink.tsx`) for the name; it already branches on `url` / `_id`. It renders `size="xs"` — list view wants 13px (`size="sm"`), so add a size prop or a variant rather than forking the component. `ref` and `note` rendering are new and can live in the list row. Dish sources arriving as plain string ids must be run through `resolveDishSource` with the saved-items map first (same as `toScheduleXEvents`).

##### Empty day
Days with no meals render a single ghost action instead of cards: `margin-left: 22px; padding: 9px 12px; border-radius: 8px`, 13px / 600 / `#44633F`, plus glyph, label "Add meal", hover `background #EFF3EF`. Opens the same add-meal flow as the gutter button with that day's date prefilled.

### Interactions & Behavior
- **Initial scroll:** on mount, jump (no animation) so today's row sits at the top of the scroll region, offset `-12px`. In the prototype this runs after two `requestAnimationFrame`s to wait for layout; in React prefer a layout effect keyed on data-loaded.
- **Today button:** smooth-scrolls to the same position.
- **Scroll → selectedDate:** on scroll, find the last row whose `offsetTop <= scrollTop + 24` and set `selectedDate` to that day; fall back to the first row. Update only after scrolling stops (debounce ~150ms). Throttle detection with `requestAnimationFrame`; an `IntersectionObserver` on the day rows is the cleaner production implementation.
- **Date picker:** choosing a date scrolls that day's row into view (and loads more range if the date falls outside the loaded window).
- **Row hover:** reveals that row's add button only (state is a single "hovered ISO date", not per-row state).
- **Dish link click:** must not bubble to the meal card click.
- **Responsive:** below ~600px, drop the drag handles, reduce the gutter to ~56px and the inner padding to 16px. The prototype is desktop-width; see `Mobile Agenda.dc.html` in the project for the mobile treatment if that is in scope. *(Per product decision, this story uses a placeholder component at phone breakpoint instead.)*
- **Loading:** skeleton rows (gutter + one card-height block) — do not collapse the scroll height.
- **Empty range:** if no days load at all, show the standard empty state; individual empty days are normal and use the ghost "Add meal" row.

### State Management
- `selectedDate`, `viewType` — existing `CalendarContext`.
- **New:** `rangeAnchor` (DateTime) — determines the fixed window of days shown in list view. It updates only on explicit navigation (Today, date picker, prev/next) so scrolling does not shift the list underneath the user.
- **New:** `navigateToDate(date)` — explicit navigation action that updates both `selectedDate` and `rangeAnchor`.
- `selectedDate` becomes the single source of truth for the calendar. The header label, month/week views, and today badge all use it. In list view, scroll updates `selectedDate` (debounced) to the topmost visible day; switching views then shows that same date in the new view.
- **New, local to ListView:** `hoveredDate: string | null` (with the ~150ms leave debounce), a ref to the scroll container, and a map/array of day-row refs keyed by ISO date.
- **Data:** the range of days to render. The prototype hardcodes 35 days starting 2026-08-24 (≈2 weeks back, 3 weeks forward from today). Production derives the range from `rangeAnchor` and fetches `SerializedDay[]` the same way the month view does (`useCalendarEvents` / the calendar page's server fetch), plus `savedItems` for dish resolution. Infinite scroll in both directions is a natural follow-up but is **not** in this design — ship a fixed window first.

### Design Tokens
All already exist in `src/_theme/colors.ts` — use them, don't re-declare.

| Use | Value | Token |
|---|---|---|
| Body text / day number | `#1C3144` | `THEME_COLORS.navy` |
| Muted text (weekday, description, notes) | `#8C9BAA` | `navy.4` |
| Drag handle dots | `#D1D7DD` | `navy.1` |
| Links / forest actions | `#44633F` | `THEME_COLORS.forest` |
| Link hover | `#3C5736` | `forest.6` |
| Link underline | `#AFC2AE` | `forest.4` |
| Add-button border | `#CFDBCE` | `forest.2` |
| Forest hover bg | `#EFF3EF` | `forest.0` |
| Today badge / accent | `#FF6542` | `THEME_COLORS.ember` |
| Today row tint | `ember.0` with lowered opacity | `rgba(var(--mantine-color-ember-0), 0.5)` |
| Row / header divider | `#EBE8E9` | `chalk.3` |
| Card border | `#F0EDEE` | `chalk.2` |
| Card hover bg / border | `#FAF8F9` / `#E1D9DB` | `chalk.0` / `chalk.7` |
| Meal rail | per-meal | `TAG_COLORS[getMealColor(name)].border` |

**Spacing:** use Mantine spacing tokens where possible. **Radii:** use Mantine radius tokens where possible. **Type:** use Mantine `Text` size/font-weight props; do not hardcode exact pixel type sizes. **Content width:** 900px max, centered. **Gutter:** 82px.

### Assets
- `assets/weeknight-header-dark.svg` — already in the repo at `public/weeknight-header-dark.svg`; included here only so the prototype renders standalone. No new assets.
- Icons in the prototype are hand-drawn divs. In the app use `@tabler/icons-react`: `IconPlus` (add), `IconGripVertical` or a dots grid (handle), `IconExternalLink` (external dish).

### Screenshots
- `/Users/sarah/Downloads/design_handoff_list_view/screenshots/01-list-view.png` — top of the list (empty days + first meal rows)
- `/Users/sarah/Downloads/design_handoff_list_view/screenshots/02-list-view.png` — around today (ember day badge, tinted today row, dish links, a book reference note)

---

# Implementation

## Scope Notes
- **Mobile**: At a phone-size breakpoint, render a placeholder component. The full mobile list view is a separate future component/story.
- **Tests**: Colocated with every module, not a separate step.
- **Granularity**: Steps are small and build incrementally.

## Step 1 — CalendarHeader list-view behavior + calendar navigation model
**Status: ✅ Completed**

**Goal:** Prepare the header to behave correctly for list view and establish the single-source-of-truth calendar state.

**Acceptance criteria:**
- Run the app → Calendar → List view.
- Verify **Previous** and **Next** arrow buttons are hidden.
- Verify the month label shows the selected month/year (e.g. “September 2026”), not a day-specific label.
- Verify Month and Week views still work exactly as before.
- Verify switching views preserves the current `selectedDate` so the same date appears in the new view.

**Architectural plan:**
- `selectedDate` remains the single source of truth for the calendar.
- Add `rangeAnchor: DateTime` and `navigateToDate(date)` to `CalendarContext`. `navigateToDate` updates both `selectedDate` and `rangeAnchor`; it is used for all explicit navigation (Today, date picker, prev/next).
- Add `rangeAnchor` state to `CalendarProvider`, defaulting to `initialDate`.
- Update `CalendarHeader`:
  - Hide prev/next `ActionIcon`s when `viewType === 'list'`.
  - In list view, render `selectedDate.toFormat('MMMM yyyy')`.
  - Use `navigateToDate` for the date picker, Today button, and prev/next actions.
  - Add bottom border `1px solid #EBE8E9`.
- Colocated tests: `CalendarContext.test.tsx`, `CalendarHeader.test.tsx`, `CalendarProvider.test.tsx`.

## Step 2 — Empty day list structure
**Status: ✅ Completed**

**Goal:** Render the continuous scrolling list with no meals yet.

**Acceptance criteria:**
- Run the app → List view.
- Verify a continuous vertical run of days is rendered.
- Verify every day in range has a row, even days without meals.
- Verify today’s row has the ember circular badge and `#FFF8F5` tinted background.
- Verify the first of each month shows the month abbreviation below the day number.
- Verify the list is scrollable and the inner content is max-width 900px centered.

**Architectural plan:**
- Create generic `src/_components/Calendar/ListView/ListView.tsx`.
- Create `ListView.module.css` for layout (gutter, scroll region, sticky gutter, row dividers).
- Add `src/_components/Calendar/ListView/_utils/getListDayRange.ts` to generate the fixed window of days around `rangeAnchor`, ensuring today is included.
- Add `src/_components/Calendar/ListView/_components/DayRow.tsx` to render a single empty day (gutter + right column placeholder).
- Create app-specific adapter `src/app/[planner]/calendar/_components/MealListView/MealListView.tsx` (thin wrapper for now).
- Update `CalendarView` to render `MealListView` instead of `ListView` for list view.
- Colocated tests: `ListView.test.tsx`, `MealListView.test.tsx`, `getListDayRange.test.ts`.

## Step 3 — Empty-day “Add meal” ghost + gutter add button (UI only)
**Status: ✅ Completed**

**Goal:** Add the add-meal affordances, but do not wire them yet.

**Acceptance criteria:**
- Run the app → List view.
- Verify every empty day shows a ghost “Add meal” row.
- Verify hovering over a day row reveals a small circular **+** button next to the day number.
- Verify tabbing into a day row also reveals the **+** button (focus-visible).
- Verify clicking the ghost or the **+** button does nothing yet (or logs).

**Architectural plan:**
- Add `src/_components/Calendar/ListView/_hooks/useDebouncedHover.ts` for the ~150ms hover leave debounce.
- Render the gutter add button with CSS hover/focus-visible reveal.
- Render the empty-day ghost “Add meal” row.
- Both accept a render prop / placeholder handler for now.
- Colocated tests: `useDebouncedHover.test.ts`, updated `ListView.test.tsx`.

## Step 4 — Wire day-specific add meal
**Status: ✅ Completed**

**Goal:** Make the add-meal affordances open the modal with the correct date prefilled.

**Acceptance criteria:**
- Run the app → List view.
- Click the gutter **+** on a day → Add Meal modal opens with Date prefilled to that day.
- Click the empty-day “Add meal” ghost → modal opens with Date prefilled to that day.
- Save the meal → modal closes and the new meal appears in the list.

**Architectural plan:**
- Extract `AddMealModal` from `AddMealButton` so it can be reused with a custom trigger.
- Add optional `initialDate?: string` prop to `AddMealForm`.
- `AddMealButton` continues to use `AddMealModal` with the existing header button.
- `MealListView` provides `renderAddMealTrigger(date, variant)` to `ListView`, using `AddMealModal`.
- Colocated tests: `AddMealButton.test.tsx`, `AddMealForm.test.tsx`, `MealListView.test.tsx`.

## Step 5 — Wire meals into the list

**Goal:** Render meal cards inside each day row.

**Acceptance criteria:**
- Run the app → List view.
- Verify days with meals show meal card(s).
- Verify each card has the correct left rail color (matches month/week view for the same meal name).
- Verify meal name and optional description render.
- Verify empty days still show the ghost “Add meal” row.

**Architectural plan:**
- Create `src/_components/Calendar/ListView/_components/MealCard.tsx`.
- Add drag handle (non-interactive, desktop only) and hover state.
- In `MealListView`, convert `SerializedDay[]` + `SavedItem[]` to `ListViewEvent[]` using `getMealColor`, `TAG_COLORS`, `resolveDishSource`.
- Pass events to `ListView`, group by date, render `MealCard`s.
- Meal cards are display-only in list view; do not open `MealDetailModal` on click.
- Colocated tests: `MealCard.test.tsx`, updated `MealListView.test.tsx` and `ListView.test.tsx`.

## Step 6 — Dish list with sources

**Goal:** Render dishes inside each meal card, with links and notes.

**Acceptance criteria:**
- Run the app → List view.
- Verify dishes render under each meal card.
- Verify dishes with saved recipes link to `/{plannerId}/recipes/{_id}`.
- Verify dishes with external URLs link out with `target="_blank" rel="noreferrer"` and an external-link icon.
- Verify dishes with `source.ref` show the italic reference.
- Verify dishes with `note` show the note.
- Verify clicking a dish link does not bubble up to the meal card click.

**Architectural plan:**
- Add optional `size` prop to `DishLink`, default `xs`. List view uses `sm`.
- Create `src/_components/Calendar/ListView/_components/DishListItem.tsx`.
- `MealListView` provides `renderDish` using `DishLink` (size `sm`) and renders ref/note around it.
- Colocated tests: `DishLink.test.tsx`, `DishListItem.test.tsx`, updated `MealListView.test.tsx`.

## Step 7 — Scroll interactions and selected-date tracking (partial)

**Goal:** The list anchors on today and the header month label tracks scroll.

**Status:** Scroll-to-`selectedDate` sync is implemented (ListView debounces scroll events and updates `selectedDate` to the topmost visible day). The remaining pieces are initial scroll-to-today on mount, Today-button smooth scroll, and date-picker scroll.

**Acceptance criteria:**
- Run the app → List view.
- Verify the page loads already scrolled so today’s row is near the top.
- Click **Today** → list smooth-scrolls today’s row to the top.
- Use the **Date** picker → list scrolls to the selected day.
- Scroll and stop → `selectedDate` updates to the topmost visible day, and the header month label updates accordingly.

**Architectural plan:**
- Add `src/_components/Calendar/ListView/_hooks/useScrollToDate.ts`.
- Add `src/_components/Calendar/ListView/_hooks/useScrolledDate.ts` (scroll listener throttled with `requestAnimationFrame`, debounced ~150ms before calling `setSelectedDate`).
- In `ListView`:
  - On mount, jump-scroll to `selectedDate`.
  - When `rangeAnchor` changes (explicit navigation), smooth-scroll to `selectedDate`.
  - Update `selectedDate` in context after scrolling stops; do not auto-scroll when `selectedDate` changes from scroll.
- Colocated tests: `useScrollToDate.test.ts`, `useScrolledDate.test.ts`, updated `ListView.test.tsx`.

## Step 8 — Mobile placeholder

**Goal:** At phone breakpoint, render a placeholder instead of the desktop list.

**Acceptance criteria:**
- Run the app → List view.
- Resize viewport to phone width (or use dev tools).
- Verify a placeholder component renders instead of the desktop list.
- Verify desktop width still shows the full list.

**Architectural plan:**
- Create `src/app/[planner]/calendar/_components/MobileListViewPlaceholder/MobileListViewPlaceholder.tsx`.
- In `MealListView`, use `useMediaQuery('(max-width: 48em)')` to choose placeholder vs. `ListView`.
- Colocated test: `MobileListViewPlaceholder.test.tsx`.

---

## Out of scope / future stories
- Infinite scroll in either direction.
- Drag-and-drop reordering/rescheduling (the drag handle is rendered non-interactive).
- Full mobile agenda redesign (only a placeholder component at phone breakpoint).
