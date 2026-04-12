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

## Step 1: Force Light Mode Globally

**File:** `src/app/layout.tsx`
- Change `defaultColorScheme="auto"` to `defaultColorScheme="light"` on MantineProvider

**Acceptance Criteria:**
- Open the app in a browser with dark mode enabled at the OS level
- Verify the app renders in light mode regardless of OS preference

---

## Step 2: Fix Input Text Contrast

**File:** `src/_theme/theme.ts`

Add explicit text color using theme reference. For Input, we use the `styles` approach because we need to target the nested input element:

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

## Step 3: Fix Global Text Contrast

**File:** `src/_theme/theme.ts`

Configure the Text component globally. Unlike Input, Text accepts a color prop directly, so we use `defaultProps`:

```typescript
Text: {
  defaultProps: {
    c: 'navy.5',
  },
},
```

**File:** `src/app/_components/SignInPrompt.tsx`
- Remove hard-coded hex `c="#1C3144"` from the Text component (line 33)

**Acceptance Criteria:**
- Navigate to the login page
- Verify the sign-in prompt text has proper contrast without hard-coded hex
- Navigate to other pages with Text components
- Verify all text maintains proper contrast on various backgrounds

---

## Step 4: Create CTA Button Variant and Fix Login Page Styles

**File:** `src/_theme/theme.ts`

Add a CTA variant to the Button component:

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

**File:** `src/_components/SignIn.tsx`

1. **Email display text** (lines 154, 203): Remove any hard-coded color - the global Text theme (Step 3) will handle contrast
2. **Change email button** (lines 157-163, 206-212): Add `c="forest"` to make the subtle button visible
3. **Sign In button** (lines 177-183): Change to `variant="cta"`
4. **Create Account button** (lines 233-239): Change to `variant="cta"`

**Acceptance Criteria:**
- Enter an email on login page and click Continue
- Verify email text has sufficient contrast (addressed by Step 3's global Text theme)
- Verify "Change email" button is clearly visible
- Verify "Sign In" and "Create Account" buttons are orange (ember) using the CTA variant
- Verify all text on the sign-in page now has proper contrast (completing verification of Steps 2 & 3)

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
| Light mode | `layout.tsx` | `defaultColorScheme="light"` |
| Input contrast | `theme.ts` | Add `styles` with `color: theme.colors.navy[5]` for Input |
| Global text contrast | `theme.ts`, `SignInPrompt.tsx` | Configure Text default color via `defaultProps`, remove hard-coded hex |
| CTA variant | `theme.ts` | Add `cta` variant to Button component |
| Login email display | `SignIn.tsx` | Remove hard-coded color, use global Text theme |
| Login change email button | `SignIn.tsx` | Add `c="forest"` to subtle buttons |
| Login CTA buttons | `SignIn.tsx` | Use `variant="cta"` for Sign In/Create Account |
| New Planner button | `PlannerListActions.tsx` | Use `variant="cta"` |
| Create button | `CreatePlannerForm.tsx` | Use `variant="cta"` |
| Recipe list tags | `SavedList.tsx` | Use `<Tag>` component instead of Badge |
| Recipe list spacing | `SavedList.tsx` | Add spacing and dividers |
| Tag input colors | `TagCombobox.tsx` | Use TAG_COLORS palette |

### Note on Color Configuration Approaches

Steps 2 and 3 use different approaches to configure colors because the components work differently:

- **Input (Step 2)**: Uses the `styles` approach with a theme callback because we need to target the nested `input` element. The Input component's `color` prop controls border/focus states, not the text inside the field.

- **Text (Step 3)**: Uses `defaultProps` because the Text component accepts a `c` (color) prop that directly controls text color. This is the more idiomatic Mantine approach when a component has a direct color prop.

Both approaches use theme references (`theme.colors.navy[5]` and `'navy.5'`) rather than hard-coded hex codes.