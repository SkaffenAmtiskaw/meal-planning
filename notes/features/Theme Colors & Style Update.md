**Planned Palette**
1C3144 - dark blue
44633F - dark green
B1BA95 - light green
FF6542 - orange
EFE7E9 - off-white

# Requirements
- go through implementation notes HTML document (see below) and make plan to implement it - prompt user for any decisions that need to be made
- use the SVG assets listed below for favicon, login, and header - they MUST be edited first
- create Tag component wrapping Mantine component which uses tag color palette (listed below) and corresponding text color
- create meal event component for use in calendar which wraps Mantine Card
	- each event should use a tag color and corresponding text
	- define a link styling which complements the tag color/text
	- choose tag color based on a hash of the meal's title - that way all meals with the same name will have the same color
	- make sure this component is used in month, week, list and agenda views
- make sure all schedule-x components are either replaced with Mantine components (preferred if possible for design consistency) or use the agreed upon theme colors - this may require replacing the header entirely

# References
- https://mantine.dev/theming/colors/
- https://mantine.dev/theming/color-schemes/

# Claude Code Design Review Notes
![[mantine_theme_implementation_notes.html]]![[tag_color_palette.html]]

# Assets

These SVGs need some cleanup - the off white circle should be made transparent so it's an orange crescent no matter the background.

We should make an option for displaying against a dark background where the navy changes to off-white instead
![[weeknight-favicon.svg]]

![[weeknight-login.svg]]

![[weeknight-header.svg]]