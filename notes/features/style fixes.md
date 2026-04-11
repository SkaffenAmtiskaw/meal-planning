# Global
- Force Mantine to always use light mode (for now) regardless of user settings
- Inputs throughout the app have a light text color when filled in - there is insufficient contrast with the background (placeholders are fine)

# Login Page
- After entering email:
	- the text showing the entered email is too light - insufficient contrast with the background
	- the change email button is almost invisible until hovered
	- the sign in button uses forest green rather than orange - it should be a CTA button

# Settings Page
## Planner Settings
- New Planner should be a CTA button
- On the create planner modal, create should be a CTA

# Recipes Page
- Tags on recipe page (and recipe input) do not use tag colors
- Recipe/bookmarks should have more space between them - add a divider as well

---

# Implementation

## Step 1: Create CTA Button Variant

**File:** `src/_theme/theme.ts`

Add a CTA variant to the Button component that uses the ember color:

```typescript
Button: {
  defaultProps: { radius: 'md' },
  variants: {
    cta: (theme) => ({
      root: {
        backgroundColor: theme.colors.ember[5],
        color: theme.white,
        '&:hover': {
          backgroundColor: theme.colors.ember[6],
        },
      },
    }),
  },
},
```

**Acceptance Criteria:**
- The Button component now supports `variant="cta"` 
- Buttons with this variant use ember color with proper hover state

---

## Step 2: Force Light Mode Globally

**File:** `src/app/layout.tsx`
- Change `defaultColorScheme="auto"` to `defaultColorScheme="light"` on MantineProvider

**Acceptance Criteria:**
- Open the app in a browser with dark mode enabled at the OS level
- Verify the app renders in light mode regardless of OS preference

---

## Step 3: Fix Input Text Contrast

**File:** `src/_theme/theme.ts`

Add explicit text color using theme reference:

```typescript
Input: {
  styles: (theme) => ({
    input: {
      color: theme.colors.navy[5],
      // ... existing styles
    },
  }),
},
```

**Acceptance Criteria:**
- Navigate to any form with inputs
- Type text and verify entered text has sufficient contrast (dark text on white background)

---

## Step 4: Fix Login Page Styles

**File:** `src/_components/SignIn.tsx`

1. **Email display text** (lines 154, 203): Add `c="navy"` to the `<Text>` components
2. **Change email button** (lines 157-163, 206-212): Add `c="forest"` to make the subtle button visible
3. **Sign In button** (lines 177-183): Change to `variant="cta"`
4. **Create Account button** (lines 233-239): Change to `variant="cta"`

**Acceptance Criteria:**
- Enter an email on login page and click Continue
- Verify email text has sufficient contrast
- Verify "Change email" button is clearly visible
- Verify "Sign In" and "Create Account" buttons are orange (ember) using the CTA variant

---

## Step 5: Fix Settings Page - New Planner Button

**File:** `src/app/settings/_components/PlannerListActions.tsx`
- Change "New Planner" Button to use `variant="cta"`

**Acceptance Criteria:**
- Navigate to Settings → Planner Settings
- Verify "New Planner" button is orange (ember)

---

## Step 6: Fix Settings Page - Create Planner Modal

**File:** `src/app/settings/_components/CreatePlannerForm.tsx`
- Change "Create" Button to use `variant="cta"`

**Acceptance Criteria:**
- Click "New Planner" button
- In the modal, verify "Create" button is orange (ember)

---

## Step 7: Fix Recipe Page - Tag Colors

**File:** `src/app/[planner]/recipes/_components/SavedList.tsx`
- Replace `<Badge color={tag.color} variant="light">` with the `<Tag>` component from `@/_components`
- Import: `import { Tag } from '@/_components'`
- Import TagColor type: `import { TagColor } from '@/_theme/colors'`

**Acceptance Criteria:**
- Navigate to Recipes page
- Verify tags display with full color palette (background, text, border)

---

## Step 8: Fix Recipe Page - Item Spacing and Dividers

**File:** `src/app/[planner]/recipes/_components/SavedList.tsx`
- Add `spacing="md"` to the List component
- Add `Divider` between list items

**Acceptance Criteria:**
- Navigate to Recipes page with multiple items
- Verify clear visual separation between items with divider lines

---

## Step 9: Fix Tag Input Colors (Recipe Form)

**File:** `src/_components/TagCombobox.tsx`
- Update `getPillStyle` function to use `TAG_COLORS` palette
- Import: `import { TAG_COLORS, type TagColor } from '@/_theme/colors'`
- Replace theme-based color lookup with TAG_COLORS lookup

**Acceptance Criteria:**
- Go to Recipes → Add Recipe
- Add tags and verify pills use correct tag color palette

---

## Summary of Changes

| Issue | File | Change |
|-------|------|--------|
| CTA variant | `theme.ts` | Add `cta` variant to Button component |
| Light mode | `layout.tsx` | `defaultColorScheme="light"` |
| Input contrast | `theme.ts` | Add `color: theme.colors.navy[5]` to Input styles |
| Login email display | `SignIn.tsx` | Add `c="navy"` to Text |
| Login change email button | `SignIn.tsx` | Add `c="forest"` to subtle buttons |
| Login CTA buttons | `SignIn.tsx` | Use `variant="cta"` for Sign In/Create Account |
| New Planner button | `PlannerListActions.tsx` | Use `variant="cta"` |
| Create button | `CreatePlannerForm.tsx` | Use `variant="cta"` |
| Recipe list tags | `SavedList.tsx` | Use `<Tag>` component instead of Badge |
| Recipe list spacing | `SavedList.tsx` | Add spacing and dividers |
| Tag input colors | `TagCombobox.tsx` | Use TAG_COLORS palette |