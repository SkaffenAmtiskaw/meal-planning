# Theme
This doc is for anyone building or changing the app's UI. It describes the app's colors and what each one is for, so a new screen looks like the rest of the app. It assumes you know Mantine's theme. How a component gets its look, such as when custom CSS is fine, is in `docs/style_guidelines.md`.

The theme lives in `src/_theme/`. `colors.ts` holds the color values, including the tag palette. `theme.ts` builds the Mantine theme from them and sets most component defaults. Where the rest live is in `docs/project_structure.md`.

# The Main Colors
The app has five main colors, each kept for the uses below. Navy is the primary color, so a component that names no color is navy. White isn't one of the main colors: a design uses it for surfaces, and for text on a dark fill (see "Content on Fills"). The tag palette is separate (see "Tag Colors"), and so are the colors for deleting and for messages (see "Status Colors").

| Color | What it's for |
|---|---|
| Navy | Every control that isn't a main action or one that deletes or removes something (see "Status Colors"), such as links, tabs, selected controls and focus rings. Also the header's background, and text, such as body text and headings |
| Ember | Main actions only |
| Forest green | The navbar, and small marks that describe a piece of content but aren't controls |
| Sage | The navbar's background, and a soft fill behind a selected or current piece of content |
| Chalk | Light surfaces that need a tint, such as the sign-in card, and icons on a dark fill |

# Links Are Always Underlined
Every link is navy and underlined, which the theme's `Anchor` default sets. A link has to be told apart from the text around it by more than color, or people who can't see the difference, such as those with color blindness or low vision, can't find it. Navy is also the text color, so here the underline is the only thing that marks a link for anyone.

# Focus Rings
The focus ring is navy on every control, ember buttons included. If a component sits so close to its neighbors that they'd hide part of an outer outline, it draws the focus ring inside its edge, with `src/_theme/focus.module.css`. The calendar's day cells and meal cards do, because the cells sit 1px apart. Otherwise, a component uses Mantine's outer outline.

# Ember Is for Main Actions
Ember marks only a button that creates or commits something, such as adding a meal or saving a new password. The theme's `cta` button variant applies it. Nothing else uses ember, including links, tabs, badges, focus rings and the calendar's day marks. It's the brightest of the main colors, so keeping it for main actions gives each screen one obvious next step.

# Status Colors
Mantine's red, green and blue are status colors, kept apart from the main colors. Red marks an error message. It also marks a control that deletes or removes something, even when it's the screen's main action, such as a recipe's Delete button or the confirm button in a delete dialog. Green marks a success message, such as the one saying a reset link was sent, and blue marks an information message. Mantine's green is brighter than forest green. It never marks the navbar or content.

Every other control is navy, or ember if it's a main action, even where red or green would look natural, such as a pair of ✓ and ✗ buttons. That way each status color always means the same thing, and a screen with nothing to delete or report shows none of them.

# Green Is for the Navbar and Content
Forest green and sage mark the navbar and content, and controls take navy. In the navbar, the items are forest green, and the active item has a forest green fill. Elsewhere, a small mark that describes a piece of content is forest green, such as the dots that show where a dish came from. A selected or current piece of content in a set, such as a day on the calendar or a row in a list, gets a soft sage fill behind it. The one exception is the ring that marks today on the calendar. It's navy so it stands apart from the selected day's sage fill, which can sit on the same date.

> [!NOTE]
> The today ring is already drawn for you, so every today ring matches. The theme's `ring` badge variant draws it around a label, such as the week view's today pill, and the `NumberMark` component draws it around a day number. Both take their width from the theme's `--ring-width` CSS variable.

Controls stay navy even where green would look natural, such as a selected tab, switch, checkbox or segmented option, or navigation within a page. Forest green next to the ember buttons reads as red and green, so a screen where green does more than mark the navbar and content starts to look like a holiday card.

# Content on Fills
Content takes a tone that contrasts with its fill, so it can be read. On a dark fill, such as the navy header or the active navbar item, text is white and icons are chalk, because the primary color would disappear there. A badge or button on a dark fill takes Mantine's `white` variant: a white background with its number or label in the component's color, which is navy unless it sets one.

> [!NOTE]
> Mantine's `Indicator`, the count badge that sits on an icon, has no `white` variant, so the theme adds one in `src/_theme/components/Indicator/`.

Content on sage is dark. Sage is a mid-tone, so light text on it is hard to read. Text on the navbar that isn't an item, such as the planner name, is navy like the rest of the app's text.

# Tag Colors
Tags, and meals on the calendar, use the tag palette of ten tinted colors, `TAG_COLORS` in `colors.ts`. Each color has a light background, dark text from the same family, and a border. Meals on the calendar use the border, because they sit on a white cell and need an edge.

# Light Mode Only
The app has only a light mode. Its colors are chosen for light surfaces, so dark mode would need its own version of each one.
