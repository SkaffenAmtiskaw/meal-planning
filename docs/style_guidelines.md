# Style Guidelines
This doc is for anyone building or changing the app's UI. It explains how a component gets its look, and assumes you know Mantine. The colors, and what each one is for, are in `docs/theme.md`.

The UI is built from Mantine components and hooks, used the way Mantine's docs describe. A Mantine component already handles theming, accessibility and its states. Custom code that works around one has to copy that work, and can break when Mantine changes.

# Changing How a Component Looks
A style change goes in the first of these places that can make it:
1. **The Mantine theme,** in `src/_theme/theme.ts`, if the change applies everywhere the component appears.
2. **A custom variant** registered in the theme, if only some uses need it.
3. **A CSS module,** if neither of those can make the change.

Custom CSS, whether a rule in a CSS module or an inline style, gets a one-line comment directly above it saying why Mantine didn't fit. Without the comment, the next reader can't tell a deliberate workaround from one that a theme setting would now replace.

# Colors Come From the Theme
A component or CSS module takes each color from the theme: a theme color by name, or its CSS variable, such as `var(--mantine-color-forest-5)`. A hex code written into a component doesn't change when the palette does, so the screen drifts away from the rest of the app. The hex values belong only in `src/_theme/colors.ts`. For a tint or shade of a theme color, Mantine provides color functions.
