# Custom Styling with Mantine

Lessons learned from overriding Mantine component styles, particularly `NavLink` and `Menu` components.

## Overriding Mantine's Default Styles

Mantine components apply their own default styles with high specificity. When you need to override them (e.g., colors, backgrounds, hover states), **CSS variables alone are not sufficient** — Mantine's built-in styles will win over CSS variables set via `classNames`.

### What doesn't work

Setting Mantine's CSS custom properties (like `--nl-color`, `--nl-bg`, `--nl-hover`) via `classNames` does **not** reliably override Mantine's defaults. The component's internal styles take precedence.

### What does work

Use `!important` in your CSS module rules to override Mantine's defaults. This is the only reliable way to win the specificity battle.

```css
/* ✅ Works */
.navLink {
  color: var(--mantine-color-forest-5) !important;
}

/* ❌ Doesn't work — Mantine's defaults override this */
.navLink {
  --nl-color: var(--mantine-color-forest-5);
}
```

## Use Theme CSS Variables, Not Hard-Coded Hex Values

Always reference theme colors via Mantine's CSS variables rather than hard-coding hex codes. This ensures the UI stays consistent if the theme changes.

| Hard-coded (brittle) | Theme variable (resilient) |
|---|---|
| `#44633F` | `var(--mantine-color-forest-5)` |
| `#1C3144` | `var(--mantine-color-navy-5)` |
| `#FFFFFF` | `var(--mantine-color-white)` |
| `#3C5736` | `var(--mantine-color-forest-6)` |

Theme color variables follow the pattern `var(--mantine-color-{name}-{shade})` where shade is 0–9 (light to dark). See `src/_theme/colors.ts` for the defined ramps.

## Semi-Transparent Colors

For hover backgrounds that need transparency, use `color-mix()` with the theme variable instead of `rgba()`:

```css
/* ✅ Theme-aware, adapts if forest color changes */
background-color: color-mix(in srgb, var(--mantine-color-forest-5) 12%, transparent);

/* ❌ Hard-coded, breaks if theme changes */
background-color: rgba(68, 99, 63, 0.12);
```

## Active + Hover States

When an element has an "active" state (e.g., selected nav item), you must explicitly define the `:hover` state for the active variant. Otherwise the generic `:hover` rule will override the active styling on hover, causing contrast failures (e.g., white text on a light background).

```css
/* Inactive state */
.navLink {
  color: var(--mantine-color-forest-5) !important;
}

/* Active state */
.navLink[data-active] {
  background-color: var(--mantine-color-forest-5) !important;
  color: var(--mantine-color-white) !important;
}

/* Inactive hover */
.navLink:hover {
  background-color: color-mix(in srgb, var(--mantine-color-forest-5) 12%, transparent) !important;
}

/* Active hover — MUST be defined, slightly darker than active bg */
.navLink[data-active]:hover {
  background-color: var(--mantine-color-forest-6) !important;
  color: var(--mantine-color-white) !important;
}
```

## Using `classNames` vs `className`

When styling Mantine components, prefer `classNames` (which targets inner elements by selector name) over `className` (which only targets the root). Using `classNames` is more explicit and consistent:

```tsx
// ✅ Preferred — targets root and inner elements explicitly
<MantineNavLink
  classNames={{
    root: styles.navLink,
    label: styles.navLinkLabel,
  }}
/>

// ⚠️ Works but less consistent with other classNames usage
<MantineNavLink
  className={styles.navLink}
  classNames={{ label: styles.navLinkLabel }}
/>
```

## NavLink CSS Variables Reference

Mantine's `NavLink` component exposes these CSS variables for styling:

| Variable | Controls |
|---|---|
| `--nl-bg` | Background color |
| `--nl-color` | Text color |
| `--nl-hover` | Hover background color |

These can be set via inline `styles` prop or CSS modules, but as noted above, `!important` overrides are needed when Mantine's defaults conflict.

## Menu Width on Mobile

When using Mantine's `Menu` component for dropdowns (e.g., planner switcher), set `width="target"` so the dropdown matches the trigger width. Without this, the dropdown will be too narrow on mobile screens.

```tsx
<Menu width="target">
  <Menu.Target>...</Menu.Target>
  <Menu.Dropdown>...</Menu.Dropdown>
</Menu>
```