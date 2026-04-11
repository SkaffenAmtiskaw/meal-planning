# High-Level Overview

## Architecture Approach

**Replace schedule-x's list view with a custom implementation**, similar to how WeekView works:

- Keep schedule-x for month-grid and month-agenda views
- When `viewType === 'list'`, render a custom `ListView` component instead of `ScheduleXCalendar`
- This allows full control over the layout, date range filtering, and meal detail presentation

## Key Components & Features

### 1. Navigation Header (same pattern as WeekViewHeader)
- **Date Range Selector**: Segmented control with presets: "7 Days" | "30 Days" | "All"
- **Navigation Controls**: Previous / Today / Next buttons
- **Date Range Display**: "January 1 – January 30, 2026" format
- **View Switcher**: Maintained in header right
- **Search Bar**: Filter meals by name, dish, or description (mobile-optimized with expandable input)

### 2. List Layout
- **Minimum height**: `calc(100dvh - header - padding)` to prevent collapse
- **Grouped by date**: Sticky date headers (e.g., "Monday, January 12")
- **Vertical scroll**: Entire list scrolls, not individual day containers
- **Default viewport**: Today onwards (past meals hidden initially)
- **Past meal access**: User can scroll up to load past meals (implement lazy-loading for performance)

### 3. Meal Cards (similar to WeekMealCard but expanded)
Each card displays:
- **Header**: Meal name with tag-colored background badge
- **Description**: Dimmer text below name (if present)
- **Dishes list**:
  - Dish name as link (if from saved recipe/bookmark)
  - Source reference for external recipes
  - Notes in muted text below each dish
- **Mobile optimization**: Dishes are collapsible by default to save space (show count like "3 dishes" with expand chevron)
- **Interactive**: Click opens MealDetailModal (reusing existing component)
- **Colors**: Uses existing `TAG_COLORS` palette based on meal name hash

### 4. Mobile Optimizations
- **Full-width cards**: Edge-to-edge on small screens
- **Collapsible dishes**: Expandable dish details (default collapsed on mobile)
- **Touch targets**: Minimum 44px tap targets for all interactive elements
- **Search UX**: Expandable search input or dedicated search screen

### 5. Empty State
- **Illustration**: Icon or subtle illustration (using Tabler icons)
- **Message**: "No meals planned for this period"
- **CTA**: "+ Add Meal" button (ember color) that opens the AddMeal modal

## Color & Theme Application

Following the theme.md rules:

- **Meal cards**: Use `TAG_COLORS` palette (consistent with WeekView)
- **Date headers**: Navy (#1C3144) text, possibly with chalk background accent
- **Links**: Forest green (#44633F) for recipe/bookmark links
- **Active/hover states**: Forest green hover backgrounds
- **CTA buttons**: Ember (#FF6542) only for "+ Add Meal" action

## Component Structure

```
ListView/
├── ListView.tsx (main container)
├── ListViewHeader.tsx (navigation + range selector + search)
├── DateGroup.tsx (sticky date header + meals)
├── ListMealCard.tsx (expanded meal display with collapsible dishes)
├── EmptyState.tsx (no meals view)
└── ListView.module.css
```

## Data Flow

1. Filter calendar days based on selected date range
2. Group meals by date (chronological order, starting from today)
3. Render date groups with sticky headers
4. Map meals to ListMealCard components
5. Pass click handlers to open MealDetailModal
6. Implement intersection observer or similar for lazy-loading past meals when scrolling up

## Accessibility Considerations

- **Semantic HTML**: Use `<article>` for meal cards, `<time>` for dates
- **Keyboard navigation**: Tab through meals, Enter to open modal
- **Screen reader**: Proper aria-labels on collapsible dish sections
- **Focus management**: Return focus to trigger after modal close
- **Touch-friendly**: Adequate spacing between interactive elements on mobile

# Implementation Plan: Render Calendar List View

## Prerequisites

All components, hooks, and tests should follow existing codebase patterns:
- Components go in `src/app/[planner]/calendar/_components/`
- Hooks go in `src/app/[planner]/calendar/_hooks/`
- Use Mantine components and hooks
- Reuse existing utilities: `TAG_COLORS`, `getMealColor()`, `resolveDishSource()`, `MealDetailModal`, `ViewSwitcher`
- 100% unit test coverage required
- Run `pnpm lint` before marking complete

## Step 1: Create useListNavigation Hook

**Purpose:** Manage date range state (7 days, 30 days, all) and navigation for list view.

**New Files:**
- `src/app/[planner]/calendar/_hooks/useListNavigation.ts`
- `src/app/[planner]/calendar/_hooks/useListNavigation.test.ts`

**Implementation Details:**
- Track current start date (defaults to today)
- Track range preset: `'7' | '30' | 'all'`
- Functions: `handlePrev()`, `handleNext()`, `handleToday()`, `setRangePreset()`
- For 'all' preset:
  - Initially show from today onwards
  - Track loaded date range in state
  - Provide `loadMorePast()` function for lazy-loading
- Returns filtered date range based on preset

**Validation Approach:**
- Write comprehensive unit tests
- Run `pnpm test` - all tests must pass

---

## Step 2: Create ListMealCard Component

**Purpose:** Display meal information in a card format.

**New Files:**
- `src/app/[planner]/calendar/_components/ListMealCard/ListMealCard.tsx`
- `src/app/[planner]/calendar/_components/ListMealCard/ListMealCard.test.tsx`
- `src/app/[planner]/calendar/_components/ListMealCard/ListMealCard.module.css`
- `src/app/[planner]/calendar/_components/ListMealCard/index.ts`

**Implementation Details:**
- Card with meal name as header using `TAG_COLORS` for background
- Description below name (dimmed text)
- Dishes always visible (NOT collapsed on mobile per user preference)
- Dish list with:
  - Name as link if from saved recipe/bookmark (forest green)
  - Source reference text for external recipes
  - Notes in muted text below each dish
- Click on card opens MealDetailModal
- Use `resolveDishSource()` utility for dish source resolution

**Props Interface:**
```typescript
type Props = {
  meal: SerializedMeal;
  plannerId: string;
  savedMap: Map<string, SavedItem>;
  onMealClick: (event: MealEvent) => void;
  isMobile: boolean | undefined;
}
```

**Validation Approach (Option A - Temporary Test Route):**
- Write unit tests (100% coverage)
- Create temporary test route at `src/app/test-list/page.tsx`
- Navigate to `/test-list` and verify card displays correctly
- **MUST DELETE** `src/app/test-list/page.tsx` before moving to next step

---

## Step 3: Create DateGroup Component

**Purpose:** Group meals by date with sticky headers.

**New Files:**
- `src/app/[planner]/calendar/_components/DateGroup/DateGroup.tsx`
- `src/app/[planner]/calendar/_components/DateGroup/DateGroup.test.tsx`
- `src/app/[planner]/calendar/_components/DateGroup/DateGroup.module.css`
- `src/app/[planner]/calendar/_components/DateGroup/index.ts`

**Implementation Details:**
- Sticky date header: "Monday, January 12" format (per user preference)
- Use `<time>` element with datetime attribute for semantic HTML
- Container for ListMealCard components for that date
- Background color to distinguish from cards (subtle chalk tint)

**Validation Approach (Option A - Temporary Test Route):**
- Write unit tests
- Update `src/app/test-list/page.tsx` to test DateGroup
- Navigate to `/test-list` and verify date grouping
- **MUST DELETE** `src/app/test-list/page.tsx` before moving to next step

---

## Step 4: Create ListEmptyState Component

**Purpose:** Show when no meals exist for the selected date range.

**New Files:**
- `src/app/[planner]/calendar/_components/ListEmptyState/ListEmptyState.tsx`
- `src/app/[planner]/calendar/_components/ListEmptyState/ListEmptyState.test.tsx`
- `src/app/[planner]/calendar/_components/ListEmptyState/index.ts`

**Implementation Details:**
- Centered layout with icon (Tabler `IconCalendarOff`)
- Message: "No meals planned for this period"
- CTA button: "+ Add Meal" (ember color per theme rules)
- Button opens AddMeal modal (reuse existing AddMealButton/Form)

**Validation Approach (Option A - Temporary Test Route):**
- Write unit tests
- Update `src/app/test-list/page.tsx` to test empty state
- **MUST DELETE** `src/app/test-list/page.tsx` before moving to next step

---

## Step 5: Create useListSearch Hook

**Purpose:** Filter meals by search query.

**New Files:**
- `src/app/[planner]/calendar/_hooks/useListSearch.ts`
- `src/app/[planner]/calendar/_hooks/useListSearch.test.ts`

**Implementation Details:**
- State: `searchQuery: string`
- Filter function: searches meal name, dish name, description (case-insensitive)
- Debounce input (300ms)
- Returns: `{ searchQuery, setSearchQuery, filteredDays, clearSearch, resultCount }`

**Validation Approach:**
- Write unit tests (test filtering logic, debouncing)
- Run `pnpm test` - all tests must pass

---

## Step 6: Create ListView Component (Integration)

**Purpose:** Main container that orchestrates all list view subcomponents.

**New Files:**
- `src/app/[planner]/calendar/_components/ListView/ListView.tsx`
- `src/app/[planner]/calendar/_components/ListView/ListView.test.tsx`
- `src/app/[planner]/calendar/_components/ListView/ListView.module.css`
- `src/app/[planner]/calendar/_components/ListView/index.ts`

**Implementation Details:**
- Minimum height: `calc(100dvh - header - padding)` to prevent collapse
- Vertical scroll container
- Group calendar days by date
- Map dates to DateGroup components
- Handle empty state
- Use `useListNavigation` hook for date range management
- Use `useListSearch` hook for filtering
- Default viewport: today onwards
- For 'all' preset: lazy-load past meals when scrolling up (implement intersection observer)

**Validation Approach (Option A - Temporary Test Route):**
- Write unit tests
- Update `src/app/test-list/page.tsx` with mock calendar data
- Navigate to `/test-list` and verify list renders correctly
- **MUST DELETE** `src/app/test-list/page.tsx` before moving to next step

---

## Step 7: Create ListViewHeader Component

**Purpose:** Navigation header with date range selector, navigation controls, search, and date display.

**New Files:**
- `src/app/[planner]/calendar/_components/ListViewHeader/ListViewHeader.tsx`
- `src/app/[planner]/calendar/_components/ListViewHeader/ListViewHeader.test.tsx`
- `src/app/[planner]/calendar/_components/ListViewHeader/index.ts`

**Implementation Details:**
- Use `SegmentedControl` for "7 Days" | "30 Days" | "All" presets
- Previous/Today/Next buttons
- Date range display: "January 1 – January 30, 2026" format
- Search input (expandable on mobile)
- ViewSwitcher on the right (shared component)
- Display result count when searching: "3 results for 'pasta'"

**Validation Approach (Option A - Temporary Test Route):**
- Write unit tests
- Update `src/app/test-list/page.tsx` to test header
- **MUST DELETE** `src/app/test-list/page.tsx` before moving to next step

---

## Step 8: Integrate ListView into CalendarView (FINAL STEP)

**Purpose:** Wire up ListView into the main calendar view switching logic.

**Modified Files:**
- `src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx`

**Implementation Details:**
- Add imports for ListView, ListViewHeader, useListNavigation, useListSearch
- Add conditional rendering for `viewType === 'list'` alongside existing 'week' case
- Pass necessary props to ListView and ListViewHeader
- Wire up search functionality

**FINAL VALIDATION - Complete Feature Testing:**
- [ ] Open calendar page `/[planner]/calendar`
- [ ] Switch to List view via ViewSwitcher
- [ ] Verify ListView renders with real planner data
- [ ] Verify ListViewHeader navigation works with real data
- [ ] Test all range presets (7/30/All)
- [ ] Test Prev/Today/Next buttons
- [ ] Test search: type meal name, dish name, description
- [ ] Verify search results update in real-time
- [ ] Verify result count displays
- [ ] Clear search - verify all meals reappear
- [ ] Click meals - verify MealDetailModal opens
- [ ] Test on mobile viewport
- [ ] Switch between all views (Month/Week/List) - verify smooth transitions
- [ ] Add a meal - verify it appears in List view
- [ ] Test empty state: planner with no meals shows correct message and "+ Add Meal" button
- [ ] Click "+ Add Meal" - verify AddMeal modal opens
- [ ] Test lazy-loading: in 'All' preset, scroll up to load past meals
- [ ] Run `pnpm lint` - must pass with no errors
- [ ] Run `pnpm test` - must pass with 100% coverage
- [ ] **Confirm `/test-list` route is DELETED** (cleanup verification)

---

## File Summary

### New Files to Create:

```
src/app/[planner]/calendar/
├── _hooks/
│   ├── useListNavigation.ts
│   ├── useListNavigation.test.ts
│   ├── useListSearch.ts
│   └── useListSearch.test.ts
└── _components/
    ├── ListView/
    │   ├── ListView.tsx
    │   ├── ListView.test.tsx
    │   ├── ListView.module.css
    │   └── index.ts
    ├── ListViewHeader/
    │   ├── ListViewHeader.tsx
    │   ├── ListViewHeader.test.tsx
    │   └── index.ts
    ├── ListMealCard/
    │   ├── ListMealCard.tsx
    │   ├── ListMealCard.test.tsx
    │   ├── ListMealCard.module.css
    │   └── index.ts
    ├── DateGroup/
    │   ├── DateGroup.tsx
    │   ├── DateGroup.test.tsx
    │   ├── DateGroup.module.css
    │   └── index.ts
    └── ListEmptyState/
        ├── ListEmptyState.tsx
        ├── ListEmptyState.test.tsx
        └── index.ts
```

### Files to Modify:
- `src/app/[planner]/calendar/_components/CalendarView/CalendarView.tsx`

### Temporary Files (MUST DELETE after each step):
- `src/app/test-list/page.tsx` (created and deleted multiple times during development)

---

## Acceptance Criteria Summary

**All of these must be true for the feature to be considered complete:**

1. List view renders correctly when selected from ViewSwitcher
2. Date range presets (7 Days, 30 Days, All) work correctly
3. Navigation buttons (Prev/Today/Next) function properly
4. Meals are grouped by date with sticky headers in "Monday, January 12" format
5. Meal cards display with correct TAG_COLORS
6. Dishes are always visible (not collapsed on mobile)
7. Dish links navigate to saved recipes/bookmarks
8. Clicking meals opens MealDetailModal
9. Search filters meals by name, dish, description in real-time
10. Empty state shows with "+ Add Meal" button (ember color)
11. "+ Add Meal" opens the existing AddMeal modal
12. Lazy-loading loads past meals when scrolling up in 'All' preset
13. All unit tests pass with 100% coverage
14. `pnpm lint` passes with no errors
15. **Temporary test route `/test-list` is DELETED**
