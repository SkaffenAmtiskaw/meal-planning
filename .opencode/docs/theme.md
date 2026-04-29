# Weeknight — UI Theme Reference

## Stack

- **UI components:** `Mantine`
- **Calendar:** `schedule-x` (requires separate CSS variable theming, does not inherit Mantine theme)

---

## Color palette

| Token | Hex | Role |
|---|---|---|
| Navy | `#1C3144` | App header background, today badge, planner name text |
| Forest green | `#44633F` | Sidebar active state, links, tab underlines, segmented controls, input focus rings |
| Sage | `#B1BA95` | Sidebar/navbar background, surface accents |
| Ember | `#FF6542` | CTA buttons only (see below) |
| Chalk | `#EFE7E9` | Login card background, light surface tint |

---

## Color role rules

### Ember is reserved for CTA buttons only

Ember (`#FF6542`) must only appear on buttons that create or commit something:

- "+ Add Meal" button
- "Add Meal" submit button in modal
- "Continue" on login
- "Update password" on settings

Ember must NOT be used for links, tab underlines, segmented controls, focus rings, badges, or any secondary element.

### Forest green is the interactive color

Use forest green (`#44633F`) for all interactive UI that is not a primary CTA:

- All text links (Change name, Change email, Forgot password, Add dish, Add note)
- Settings tab active underline
- SegmentedControl active state (white text on forest green)
- Input focus rings (forest green at 40% opacity)

### Sage background requires dark text

The sidebar background is sage (`#B1BA95`), which is a mid-tone. Always use dark colors on it — never white or light text on sage except inside the active NavLink (which has a forest green background).

- Inactive nav item text + icons: forest green (`#44633F`), full opacity
- Active nav item: forest green background (`#44633F`), white text and icon
- Hover state: `rgba(68, 99, 63, 0.12)`
- Planner name / context label: navy (`#1C3144`), `font-weight: 600`

---

## Mantine theme config

- `primaryColor` should be the registered forest green key
- Ember is registered as a color but only applied manually via `color="ember"` on specific CTA Button components
- `defaultRadius: 'md'`
- Tabs default color: forest green
- Anchor/link default color: forest green

---

## AppShell layout

- **Header:** navy (`#1C3144`) background, chalk/white text and icons
- **Sidebar/navbar:** sage (`#B1BA95`) background

---

## Schedule-x calendar theming

Schedule-x uses its own CSS custom properties and does not inherit Mantine. Override on the calendar wrapper element:

```css
.sx-cal-wrapper {
  --sx-color-primary: #44633F;          /* forest green — selected states */
  --sx-color-primary-container: rgba(68, 99, 63, 0.12);
  --sx-color-surface: #FFFFFF;
  --sx-color-surface-variant: #EFE7E9;  /* chalk */
  --sx-color-on-surface: #1C3144;       /* navy */
  --sx-color-on-surface-variant: #5A6A7A;
  --sx-color-outline: #DDD8DA;
  --sx-color-today-bg: rgba(28, 49, 68, 0.08); /* faint navy tint */
}
```

Confirm variable names against your installed schedule-x version using devtools — names may vary slightly by release.

---

## Tag and calendar event colors

Tags and calendar events use a fixed palette of 10 tinted colors. Each has a background, text, and border value. Store as named tokens, not raw hex, so palette changes propagate easily.

| Name | Background | Text | Border |
|---|---|---|---|
| Tangerine | `#FDEBD6` | `#7A3410` | `#F5B47A` |
| Rosewood | `#FDE8E8` | `#7A1F1F` | `#F0A8A8` |
| Honey | `#FDF3D6` | `#6B4A0D` | `#EAC96A` |
| Fern | `#E4F2E4` | `#1E4D1E` | `#87C287` |
| Seafoam | `#D6EDE8` | `#0E3D32` | `#72C2AF` |
| Steel | `#D9E8F5` | `#0E2E4D` | `#7AAFD4` |
| Lavender | `#E8E0F0` | `#3A1F6B` | `#B09DD4` |
| Mauve | `#F0E0EE` | `#5C1A4A` | `#CE8DC0` |
| Sage mist | `#E8EDE0` | `#2E3D1A` | `#A8BA8A` |
| Slate | `#E0E4ED` | `#1C2744` | `#8D99BE` |

All use a light tinted background with dark same-family text. Use the border value on calendar event chips specifically, as they sit on a white cell and need definition.

---

## Dark mode

Dark mode is not currently supported. Lock to light mode explicitly:

```jsx
<MantineProvider theme={theme} defaultColorScheme="light">
```

Revisit as a deliberate feature later. Key considerations when adding dark mode: chalk (`#EFE7E9`) is a light surface and will need a dark-mode alternative; schedule-x CSS variables will need a separate `[data-mantine-color-scheme="dark"]` block.