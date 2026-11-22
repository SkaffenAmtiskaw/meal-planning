# Style Guidelines
This doc is for anyone building or changing the app's UI. It explains how a component gets its look, and assumes you know Mantine. The colors, and what each one is for, are in `docs/theme.md`.

The UI is built from Mantine components and hooks, used the way Mantine's docs describe, and custom styling is kept to a minimum. A Mantine component already handles theming, accessibility and its states. Custom code that works around one has to copy that work, and can break when Mantine changes.

# Changing How a Component Looks
A style change goes in the first of these places that can make it:
1. **The Mantine theme,** in `src/_theme/`, if the change applies everywhere the component appears.
2. **A custom variant** registered in the theme, if only some uses need it.
3. **A CSS module,** if neither of those can make the change.

A Mantine `Button` or `ActionIcon` gets its hover colors from its variant and color. A CSS module that styles one leaves the hover colors to them. A hover color set in the module, even one taken from a theme variable, stays fixed when the theme's colors or the variant change, so the button drifts from every other button with the same variant and color.

Custom CSS, whether a rule in a CSS module or an inline style, gets a one-line comment directly above it saying why Mantine didn't fit. Without the comment, the next reader can't tell a deliberate workaround from one that a theme setting would now replace.

# Theme Styling Stays in the Theme
Everything the theme sets lives in `src/_theme/`: color values and ramps, component defaults and the CSS modules those defaults use. It stays there even when only one area of the app uses it. Custom styling is kept to a minimum, and with the theme's styling all in one place, anyone can see how much the app changes Mantine's look and notice when that grows. The `SAGE` constant, for example, is used only by the navbar's default in `theme.ts`, and it stays in `src/_theme/colors.ts` with the other colors. A component's own CSS module isn't part of the theme, so it stays beside its component, as `DayRow.module.css` does.

# Colors Come From the Theme
A component or CSS module takes each color from the theme: a theme color by name, or its CSS variable, such as `var(--mantine-color-navy-5)`. A hex code written into a component doesn't change when the palette does, so the screen drifts away from the rest of the app. The hex values belong only in `src/_theme/colors.ts`. For a tint or shade of a theme color, Mantine provides color functions.
