## Scope
- Replace schedule-x's built-in week view with a fully custom `WeekView` component
- View switcher is responsive: desktop shows Month | Week | List; mobile shows Month | List
- Desktop "Month" → schedule-x month grid; Mobile "Month" → schedule-x month agenda
- Week view: 7 columns (Sun–Sat), meals stacked vertically per day
- Each meal card: name, description, dish list with source links (consistent with MonthGridEvent styling)
- Click meal → existing MealDetailModal
- Week navigation: prev/next week + today
- Out of scope: adding meals from the week view

## Plan

### ✅ Step 1 — Replace schedule-x view switcher with responsive custom SegmentedControl 
Add view state to `CalendarView`. Use Mantine's `useMediaQuery` to detect mobile vs desktop. Desktop shows Month/Week/List; mobile shows Month/List. Remove `createViewWeek()` from schedule-x; keep monthGrid, monthAgenda, list. Week tab shows placeholder. Mobile "Month" maps to monthAgenda; desktop "Month" maps to monthGrid.

✅ **Verify:** On desktop — see Month/Week/List tabs; Month and List work, Week shows placeholder. On mobile (resize browser) — see Month/List tabs; Month shows the agenda-style view.

### Step 2 — Build WeekView with day columns and meal data
Create `WeekView.tsx`. Render 7 columns (Sun–Sat) for `currentWeekStart`. Wire meal data from `calendar` prop. Each column: day header + stacked meal cards (name, description, dish names).

**Verify:** Switch to Week tab on desktop — 7 columns appear. Days with meals show them; empty days are empty.

### Step 3 — Add meal click → MealDetailModal
Clicking a meal card in `WeekView` opens the existing `MealDetailModal`.

**Verify:** Click a meal in the week view → modal opens with full dish details, notes, and source links.

### Step 4 — Week navigation (prev/next/today)
Add prev/next/today controls. Manage `currentWeekStart` state in `CalendarView`.

**Verify:** Prev/next shifts the week. Today resets to current week. Meals update correctly.

### Step 5 — Styling pass
Match MonthGridEvent event card style (colored left border, background). Ensure columns don't overflow at normal desktop width.

**Verify:** Week events visually match month view events. Layout is clean.
