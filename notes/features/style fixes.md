# Global
- Force Mantine to always use light mode (for now) regardless of user settings
- Inputs throughout the app have a light text color when filled in - there is insufficient contrast with the background (placeholders are fine)

# Login Page
- After entering email:
	- the text showing the entered email is too light - insufficient contrast with the background
	- the change email button is almost invisible until hovered
	- the sign in button uses forest green rather than orange - it should be a CTA button

# Navbar
>The sidebar navigation has two issues to fix: hierarchy and contrast.
>
> **Hierarchy:** Planners are a context switcher, not navigation items. Restructure the sidebar so the top section shows the currently active planner name with a small switch/chevron affordance (styled as a selector, not a nav link). Below that, show Calendar and Recipes as the nav items for that planner. Other planners (e.g. Planner 2) should not appear inline between nav items — they belong in the planner switcher at the top, revealed on click.
>
> **Contrast:** Inactive nav items (Recipes icon + text) are too faint on the sage background. Set inactive nav item text and icons to forest green (`#44633F`) at full opacity — do not reduce opacity. The sage background is light enough that ghost/faded text fails contrast requirements. Planner name label should be navy (`#1C3144`) at `font-weight: 600`.

# Settings Page
## Planner Settings
- New Planner should be a CTA button
- On the create planner modal, create should be a CTA