# Theme
This doc is for anyone building or changing the app's UI. It describes the app's colors and what each one is for, so a new screen looks like the rest of the app. It assumes you know Mantine's theme. How a component gets its look, such as when custom CSS is fine, is in `docs/style_guidelines.md`.

The theme lives in `src/_theme/`. `colors.ts` holds the color values, including the tag palette, and `theme.ts` builds the Mantine theme from them and sets each component's defaults.

# The Main Colors
The app has five main colors, each kept for the uses below. The tag palette is separate (see "Tag Colors").

| Color | What it's for |
|---|---|
| Navy | The header's background, dark text such as headings, and the ring that marks today on the calendar |
| Forest green | The primary color: links, tabs, selected controls, focus rings and everything else interactive that isn't a main action |
| Sage | The navbar's background, and the circle that marks a selected day on the calendar |
| Ember | Main actions only |
| Chalk | Light surfaces that need a tint, such as the sign-in card |

# Ember Is for Main Actions
Ember marks only a button that creates or commits something, such as adding a meal or saving a new password. The theme's `cta` button variant applies it. Nothing else uses ember, including links, tabs, badges, focus rings and the calendar's day marks. It's the brightest of the main colors, so keeping it for main actions gives each screen one obvious next step.

# Text on Sage
Text and icons on the sage navbar are dark, in forest green or navy, except on the active nav item, whose forest green background takes white text. Sage is a mid-tone, so light text on it is hard to read.

# Tag Colors
Tags, and meals on the calendar, use the tag palette of ten tinted colors, `TAG_COLORS` in `colors.ts`. Each color has a light background, dark text from the same family, and a border. Meals on the calendar use the border, because they sit on a white cell and need an edge.

# Light Mode Only
The app has only a light mode. Its colors are chosen for light surfaces, so dark mode would need its own version of each one.
