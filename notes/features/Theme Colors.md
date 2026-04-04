**Planned Palette**
1C3144 - dark blue
44633F - dark green
B1BA95 - light green
FF6542 - orange
EFE7E9 - off-white

# Planning
- Propose how to use these colors for app elements
- Both the mantine theme and the schedule-x calendar should use these colors
- Propose some complementary colors to use as accent colors - they should be used in tags and calendar events
- Propose text colors (one dark and one light) for use with these theme colors

# Requirements
- Ensure Mantine will use theme colors as decided in the plan above
- Create Tag component wrapping Mantine component which uses complementary colors (and corresponding text color)
- Create Event component for use in calendar which wraps Mantine Card and applies complementary colors as background and uses corresponding text color - make sure links colors do not clash with the card background (and also have sufficient contrast) - make sure this component is used in month, week, list and agenda views.
- Make sure all schedule-x components are either replaced with Mantine components (preferred if possible for design consistency) or use the agreed upon theme colors - this may require replacing the header entirely