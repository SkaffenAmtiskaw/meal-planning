# Guidelines
- Mantine components should ALWAYS be preferred when available
- Reference: https://mantine.dev/llms.txt
- Customization
  - If a Mantine component needs style adjustments, the preferred method is to change the styling via the Mantine theme.
  - If the custom styling should not be applied globally, the next best approach is to create a custom variant
  - Only if both above approaches do not work should CSS modules be used.
- RULE: Hard-coded hex codes should _never_ be used. Theme colors and theme CSS variables should be used instead. Mantine provides utilities for theme color manipulation.