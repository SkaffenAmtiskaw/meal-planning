
>The sidebar navigation has two issues to fix: hierarchy and contrast.
>
> **Hierarchy:** Planners are a context switcher, not navigation items. Restructure the sidebar so the top section shows the currently active planner name with a small switch/chevron affordance (styled as a selector, not a nav link). Below that, show Calendar and Recipes as the nav items for that planner. Other planners (e.g. Planner 2) should not appear inline between nav items — they belong in the planner switcher at the top, revealed on click.
>
> **Contrast:** Inactive nav items (Recipes icon + text) are too faint on the sage background. Set inactive nav item text and icons to forest green (`#44633F`) at full opacity — do not reduce opacity. The sage background is light enough that ghost/faded text fails contrast requirements. Planner name label should be navy (`#1C3144`) at `font-weight: 600`.