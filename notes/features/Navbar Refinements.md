
>The sidebar navigation has two issues to fix: hierarchy and contrast.
>
> **Hierarchy:** Planners are a context switcher, not navigation items. Restructure the sidebar so the top section shows the currently active planner name with a small switch/chevron affordance (styled as a selector, not a nav link). Below that, show Calendar and Recipes as the nav items for that planner. Other planners (e.g. Planner 2) should not appear inline between nav items — they belong in the planner switcher at the top, revealed on click.
>
> **Contrast:** Inactive nav items (Recipes icon + text) are too faint on the sage background. Set inactive nav item text and icons to forest green (`#44633F`) at full opacity — do not reduce opacity. The sage background is light enough that ghost/faded text fails contrast requirements. Planner name label should be navy (`#1C3144`) at `font-weight: 600`.

# High-Level Overview

## Problem Statement

The current sidebar navigation mixes **context switching** (changing which planner you're viewing) with **navigation** (moving between Calendar and Recipes views within a planner). This creates visual hierarchy confusion and puts too many interactive elements at the same level. Additionally, the inactive nav items have insufficient contrast against the sage background.

## Proposed Solution

### Visual Hierarchy Redesign

Transform the sidebar into a clear two-tier structure. The top section adapts based on whether the user has one planner (static label) or multiple planners (interactive selector):

**Multiple Planners (Interactive Selector):**
```
┌─────────────────────────────┐
│  [Planner Name]        ▼    │  ← Context Switcher (clickable dropdown)
├─────────────────────────────┤
│  📅 Calendar                 │  ← Navigation items
│  📖 Recipes                  │
└─────────────────────────────┘
```

**Single Planner (Static Label):**
```
┌─────────────────────────────┐
│  [Planner Name]              │  ← Static context label (no interaction)
├─────────────────────────────┤
│  📅 Calendar                 │  ← Navigation items
│  📖 Recipes                  │
└─────────────────────────────┘
```

### Component Structure

**1. Planner Context Section (Top Section)**

The top section has two modes depending on the number of planners the user has:

**Multiple Planners Mode (Interactive Selector):**
- Displays the currently active planner's name prominently
- Uses a selector pattern with a chevron/arrow icon (e.g., `IconChevronDown` from Tabler)
- Styled as a clickable button/area, NOT as a nav link
- On click: opens a dropdown/popover menu listing all available planners
- Each planner in the dropdown is clickable to switch context
- Visual style:
  - Background: transparent or subtle hover state (`rgba(68, 99, 63, 0.12)`)
  - Text: Navy (`#1C3144`) at `font-weight: 600`
  - Chevron: Forest green (`#44633F`)
  - Padding: comfortable touch target (at least 44px height)

**Single Planner Mode (Static Label):**
- Displays the planner name as non-interactive text
- No chevron icon, no hover state, no click handler
- Serves purely as a context indicator showing which planner is active
- Visual style:
  - Background: transparent (no hover effect)
  - Text: Navy (`#1C3144`) at `font-weight: 600`
  - No cursor pointer
  - Same padding as the interactive version for visual consistency

**2. Navigation Items (Bottom Section)**
- Always shows Calendar and Recipes links for the CURRENT planner
- Uses standard `NavLink` components with icons
- Active state: Forest green background (`#44633F`) with white text
- Inactive state: Forest green text/icon (`#44633F`) at **full opacity** (no transparency)
- Hover state: `rgba(68, 99, 63, 0.12)` background
- Icons: `IconCalendarWeek` for Calendar, `IconBook` for Recipes

### Interaction Flow

**Desktop:**
1. User sees the planner switcher at the top of the sidebar
2. User clicks the switcher → dropdown appears with all planners
3. User selects a different planner → page navigates to that planner's calendar
4. The switcher updates to show the new planner's name

**Mobile:**
1. Same interaction pattern, but within the collapsible drawer
2. The switcher remains at the top when the drawer is open
3. Touch targets must be at least 44px for easy tapping

### Accessibility Considerations

**Multi-Planner Mode (Interactive):**
- The planner switcher must be a `<button>` element (not a div) with proper `aria-expanded` state
- Dropdown menu should use `role="menu"` with `role="menuitem"` for each planner
- Keyboard navigation: Arrow keys to navigate planners, Enter/Space to select, Escape to close
- Focus trap within the dropdown when open
- Screen reader announcement when switching planners ("Now viewing [Planner Name]")

**Single-Planner Mode (Static):**
- Render as a `<div>` or `<span>` (not a button, since it's not interactive)
- No `aria-expanded` or other interactive ARIA attributes needed
- Screen reader should simply announce the planner name as context

**General:**
- High contrast mode support: ensure the navy text on sage background meets WCAG AA
- Touch targets in multi-planner mode must be at least 44×44px

### Color & Typography Specifications

| Element | Color | Font Weight | Notes |
|---------|-------|-------------|-------|
| Planner context text (both modes) | Navy (`#1C3144`) | 600 (semibold) | Current planner name |
| Planner selector chevron | Forest green (`#44633F`) | - | Only in multi-planner mode |
| Planner selector hover bg | `rgba(68, 99, 63, 0.12)` | - | Only in multi-planner mode |
| Nav item inactive | Forest green (`#44633F`) | 500 | Full opacity, no transparency |
| Nav item active | White (`#FFFFFF`) | 500 | On forest green background |
| Nav item hover bg | `rgba(68, 99, 63, 0.12)` | - | Subtle highlight |

### Technical Implementation Notes

- Replace `PlannerSwitcher` component with new `PlannerContextSection` component
- The component accepts the `planners` array and determines which mode to render:
  - If `planners.length <= 1`: Render static label mode (no interactivity)
  - If `planners.length > 1`: Render interactive selector mode with dropdown
- Use Mantine's `Popover` or `Menu` component for the dropdown (only in multi-planner mode)
- Maintain existing `NavLink` component for Calendar and Recipes
- Remove the `Divider` between planner switcher and nav items (no longer needed with clear visual hierarchy)
- Update CSS to ensure no opacity reduction on inactive nav items
- Ensure the switcher dropdown closes when clicking outside or selecting a planner
- Consider adding a "Create New Planner" option at the bottom of the dropdown (future enhancement)

### Mobile Considerations

- The planner switcher should remain visible and accessible in the mobile drawer
- Touch targets must be generous (minimum 44×44px)
- Dropdown should be full-width within the drawer
- Consider using Mantine's `Drawer` or `Modal` for planner selection on very small screens if dropdown feels cramped

### Edge Cases

- **Long planner names**: Truncate with ellipsis, show full name on hover via tooltip (applies to both static label and selector modes)
- **Loading state**: Show a skeleton while planner list loads
- **Single planner with long name**: Same truncation rules apply to the static label mode

# Implementation

## Overview

This implementation replaces the current `PlannerSwitcher` (which lists all planners as navigation items) with a new `PlannerContextSection` component that displays the current planner as a context indicator at the top of the sidebar. The component adapts its behavior based on the number of planners: static label for single planner, interactive dropdown for multiple planners.

## Files to Modify

### New Files
- `src/_components/Navbar/PlannerContextSection.tsx` - New context section component (with tests via TDD)

### Modified Files
- `src/_components/Navbar/Navbar.tsx` - Update to use `PlannerContextSection` (with tests via TDD)
- `src/_components/NavLink/NavLink.module.css` - Ensure full opacity on inactive items

### Deleted Files
- `src/_components/Navbar/PlannerSwitcher.tsx` - Replaced by PlannerContextSection
- `src/_components/Navbar/PlannerSwitcher.test.tsx` - Tests no longer applicable

## Implementation Steps

### Step 1: Create PlannerContextSection Component and Integrate into Navbar (TDD)

**Purpose**: Build the new planner context section with dropdown functionality and integrate it into the Navbar, replacing the old PlannerSwitcher. This delivers the complete new sidebar structure.

**Approach**: TDD - write failing tests first, then implementation.

**Files** (in order):
1. `src/_components/Navbar/PlannerContextSection.test.tsx` - Unit tests for the new component
2. `src/_components/Navbar/PlannerContextSection.tsx` - Component implementation
3. `src/_components/Navbar/Navbar.test.tsx` - Update tests for new Navbar structure
4. `src/_components/Navbar/Navbar.tsx` - Update Navbar to use PlannerContextSection, remove Divider

**Acceptance Criteria** (User-verifiable):
1. **Visual Structure**: The sidebar shows the planner name at the top, with Calendar and Recipes links below it, and no divider line between them
2. **Single Planner Mode**: When a user has only one planner:
   - The planner name appears as static text (not clickable)
   - Text is navy (#1C3144) color and semi-bold
   - No chevron icon next to the name
   - No hover effect on the text
3. **Multi-Planner Mode**: When a user has multiple planners:
   - The current planner name appears with a chevron (▼) icon
   - Clicking it opens a dropdown showing all available planners
   - Clicking outside closes the dropdown
   - Selecting a different planner navigates to that planner's calendar
   - The URL updates to show the new planner ID
4. **Navigation Still Works**: Calendar and Recipes links still navigate correctly
5. **Active State**: The currently active page (Calendar or Recipes) is visually highlighted
6. **Mobile**: The same structure appears in the mobile drawer

**User Validation - Desktop**:
1. Log in as a user with only one planner
2. Open the sidebar and verify:
   - Planner name is at the top, static text, no chevron
   - Calendar and Recipes appear below with no divider
   - Both links navigate correctly
3. Log in as a user with 2+ planners
4. Verify the current planner name has a chevron icon
5. Click the planner name - verify a dropdown opens with all planners listed
6. Select a different planner from the dropdown
7. Verify the page navigates to that planner's calendar
8. Verify the URL changed to the new planner ID

**User Validation - Mobile**:
1. Using browser dev tools mobile view (or actual mobile device), resize to 375px width
2. Tap the hamburger menu to open the sidebar drawer
3. Verify:
   - Planner name appears at the top of the drawer
   - Calendar and Recipes appear below with no divider
   - Touch targets are easy to tap (minimum 44px height)
4. If user has multiple planners:
   - Tap the planner name - verify dropdown opens
   - Tap a different planner - verify navigation works
   - Verify dropdown closes properly
5. Tap Calendar and Recipes - verify navigation works
6. Close the drawer by tapping outside or the X button

---

### Step 2: Fix NavLink Contrast

**Purpose**: Ensure inactive nav items have proper contrast on the sage background.

**File**: `src/_components/NavLink/NavLink.module.css`

**Acceptance Criteria** (User-verifiable):
1. Inactive nav items (text and icon) are clearly visible at full opacity (not faint/transparent)
2. Inactive items use forest green (#44633F) color
3. Active items have white text on forest green background
4. Hovering over inactive items shows a subtle highlight (rgba(68, 99, 63, 0.12))

**User Validation**:
1. Navigate to the Calendar page
2. Look at the Recipes link in the sidebar - verify it's clearly readable, not faint
3. Verify the text and icon are forest green color
4. Hover over the Recipes link - verify a subtle background highlight appears
5. Click on Recipes to make it active
6. Verify the Recipes link now has white text on dark green background
7. Look at the Calendar link - verify it's now inactive but clearly readable (not faint)

---

### Step 3: Remove Old PlannerSwitcher Files

**Purpose**: Clean up obsolete code that is no longer used.

**Files to Delete**:
- `src/_components/Navbar/PlannerSwitcher.tsx`
- `src/_components/Navbar/PlannerSwitcher.test.tsx`

**Acceptance Criteria** (User-verifiable):
1. The app still builds and runs correctly after deletion
2. No console errors about missing imports
3. All functionality (switching planners, navigating) still works

**User Validation**:
1. Run `pnpm build` - verify it completes successfully
2. Run `pnpm dev` - verify the app starts without errors
3. Navigate through the app:
   - Switch between planners using the dropdown
   - Navigate between Calendar and Recipes
4. Verify all functionality still works as expected

---

### Step 4: Final Verification

**Purpose**: Complete validation of all requirements.

**Acceptance Criteria** (User-verifiable):
1. **All Tests Pass**: Unit tests pass with 100% coverage
2. **Build Succeeds**: Production build completes without errors
3. **Lint Clean**: No linting errors
4. **Visual Hierarchy**: Planners clearly separated from navigation items
5. **Contrast**: All text clearly readable on sage background
6. **Accessibility**: Keyboard navigation works throughout

**User Validation**:
1. **Test Suite**: Run `pnpm test` - verify all tests pass
2. **Coverage**: Run `pnpm test:coverage` - verify 100% coverage
3. **Build**: Run `pnpm build` - verify successful build
4. **Lint**: Run `pnpm lint` - verify no errors
5. **Hierarchy & Contrast**:
   - Log in with multiple planners
   - Verify sidebar shows planner selector at top, Calendar/Recipes below, no divider
   - Verify inactive nav items are clearly visible (not faint), forest green color
6. **Functionality**:
   - Switch between planners using dropdown
   - Navigate between Calendar and Recipes
   - Verify URL updates correctly
7. **Accessibility**:
   - Tab through sidebar elements
   - Use Enter/Space to activate buttons
   - Use arrow keys in dropdowns
   - Use Escape to close dropdowns
8. **Mobile (Final Check)**:
   - Open on mobile or use dev tools mobile view
   - Open sidebar drawer
   - Verify layout is correct and touch targets work
   - (Note: Mobile was already tested in Step 1, this is a final regression check)

## Implementation Order

Steps must be completed in this order:

1. **Step 1**: Create PlannerContextSection and integrate into Navbar (delivers working feature)
2. **Step 2**: Fix NavLink contrast (independent improvement)
3. **Step 3**: Remove old files (cleanup after Step 1)
4. **Step 4**: Final verification (always last)

## TDD Approach per Step

For each step:
1. Write/update the test file first (tests should fail)
2. Write/update the implementation (tests should pass)
3. Run tests to confirm pass and coverage
4. Do manual user validation
5. Only then move to next step

## Notes

- The `PlannerContextSection` component should use Mantine's `Menu` component for the dropdown (not Popover) to get proper accessibility features like focus management and ARIA roles
- The component must be a client component ('use client') since it uses client-side interactivity
- Touch targets should be verified on actual mobile devices or with precise browser dev tools measurement (minimum 44×44px)