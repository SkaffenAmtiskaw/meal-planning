---
type: cleanup
status: spec
blocked-by: []
confirmed: 2026-09-25
---
# Where It Stands

Next: /plan-steps ^status

Split from [[Header Date Picker]] 2026-10-31, with its draft steps in From the Split.

# Inbox

# Purpose
The calendar's date labels each hold their own luxon format string, and several are copied between components: the mobile agenda heading's `EEEE, MMMM d`, the week range's `MMM d`, and the `MMMM d` in both month grids' day aria-labels. This story adds a `formatDate(iso, style)` utility with one named style per format and moves those labels onto it, so each format is defined once. Every label reads exactly as before. [[Header Date Picker]] adds the Date field's `M/d/yyyy` style to it, and [[Meal Form Date Picker]] moves the meal form's subtitle onto the agenda heading's style.

# Current State
*Found by grepping `src` for `toFormat(` and reading `WeekView.tsx` on 2026-10-31.*
- `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx:46-47` - the agenda heading formats `EEEE, MMMM d` twice, once after "Today · ".
- `src/_components/Calendar/WeekView/WeekView.tsx:73` - each day column's label is built by hand from `WEEKDAY_LABELS` and the month and day ("Sun 10/25").
- `src/_components/Calendar/_utils/formatWeekRange.ts:11-12` - both ends of the week range use `MMM d`.
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx:93` and `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx:97` - each day's aria-label uses `MMMM d`.
- `src/_utils/date.ts` - parses date-only strings as UTC, so it shows the previous day in US time zones.

# Open Decisions
How should the calendar format its date labels?
- **Decided 2026-09-25:** With a new `formatDate(iso, style)` in `src/_utils`, built on luxon, that names each format as a style. The duplicated format strings move onto named styles. Approved by Sarah via `/assess` as Piece 12 of [[Unified Date Picker Component]]. Sarah added the month grids' aria-labels 2026-10-31 while planning [[Header Date Picker]].
  - Rejected: building on `src/_utils/date.ts` - it parses date-only strings as UTC and shows the previous day in US time zones, so it's left alone.

# Out of Scope
- `AddMealForm.tsx:40`'s format moves onto a named style in [[Meal Form Date Picker]], which rewrites the meal modal's subtitle.
- The Date field's `M/d/yyyy` style is added by [[Header Date Picker]], with the field.
- Replacing `src/_utils/date.ts` with luxon is the "replace date utils with luxon" line on the Roadmap.

# Acceptance Criteria
- [ ] The mobile agenda heading, the week view's day labels and week range, and both month grids' day aria-labels get their formats from `formatDate`.
- [ ] Each reads exactly as before, including a week range across two years.

# From the Split

## Step 1: Named date formats
**Idea:** The calendar's date labels get their formats from one `formatDate` utility by style name.

**Source:** Open Decisions (`formatDate` with named styles); Current State (`MobileAgenda`, `WeekView`, `formatWeekRange`); Acceptance Criteria

**Approach:** `formatDate(iso, style)` in `src/_utils/formatDate/`, with luxon. It reads the ISO date as a local date, unlike `src/_utils/date.ts`, which parses date-only strings as UTC and stays as it is. It starts with one named style per format these callers use: the agenda heading's `EEEE, MMMM d`, the week view's day label `ccc M/d` and the week range's `MMM d`. Callers that hold a luxon `DateTime` pass its `toISODate()`. A refactor: every label reads exactly as before.

**Files:**
- `src/_utils/formatDate/formatDate.ts` (new) - the named styles and the formatter
- `src/_utils/formatDate/index.ts` (new) - barrel
- `src/_components/Calendar/MobileAgenda/MobileAgenda.tsx` - the agenda heading uses a named style
- `src/_components/Calendar/WeekView/WeekView.tsx` - the day labels use a named style
- `src/_components/Calendar/_utils/formatWeekRange.ts` - the range's two ends use a named style

**Acceptance:**
- [ ] On a phone, signed in as `write`, open the Seeded Shared Planner's calendar in Month view and tap a day other than today in the grid. See the agenda heading read like "Thursday, October 15". Tap today, and see "Today · " in front of the date. Proves: the agenda heading's format moved without changing.
- [ ] On desktop, signed in as `write`, open the calendar in Week view. See the header label read like "Oct 25 – Oct 31, 2026", and each day column labeled like "Sun 10/25". Use the Date field to jump to December 31, 2026, and see "Dec 27, 2026 – Jan 2, 2027". Proves: the week view's formats moved without changing, including a week across two years.

## Step 2: Named format for the month grids' day labels
**Idea:** The two month grids' day aria-labels get their date format from `formatDate`.

**Source:** Pulled in by Sarah 2026-10-31: `MonthGrid.tsx:93` and `MobileMonthGrid.tsx:97` build their day aria-labels with the same `MMMM d` format, which Piece 12's list of duplicated format strings didn't name. Sarah decided: pull them in only if they aren't leftovers from the calendar migration. Both are live: `MealCalendar` renders `MonthGrid` and `MealMonthAgenda` renders `MobileMonthGrid`. Current State (`MonthGrid`, `MobileMonthGrid`); Acceptance Criteria

**Approach:** A named `MMMM d` style in `formatDate` (Step 1), used by both aria-labels. [[Today and Selected Day Markers]] also reworks both grids (Pieces 9 and 9a), and either story can land first. If it lands first, a label may have moved, such as into the month grid day cell it extracts, so change each label wherever it is then. A refactor: the labels read exactly as before.

**Files:**
- `src/_utils/formatDate/formatDate.ts` - the month-and-day style
- `src/_components/Calendar/MonthGrid/MonthGrid.tsx`, or the day cell [[Today and Selected Day Markers]] extracts from it if that story lands first - the day aria-label uses the style
- `src/_components/Calendar/MobileMonthGrid/MobileMonthGrid.tsx` - the day aria-label uses the style

**Acceptance:**
- [ ] On desktop, signed in as `write`, open the Seeded Shared Planner's calendar in Month view. In Chrome DevTools, inspect a day cell that has meals, and see its `aria-label` read like "October 27, 2 meals". Proves: the desktop month grid's label format moved without changing.
- [ ] On a phone, signed in as `write`, open the calendar in Month view. In Chrome DevTools, inspect a day cell in the grid, and see its `aria-label` read like "October 27, 2 meals". Proves: the phone month grid's label format moved without changing.

# Implementation
