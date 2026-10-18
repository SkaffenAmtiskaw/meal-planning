# Comparing With the Design
For each Design Handoff section and image the plan cites, screenshot the same view at the same screen size and compare. Designs aren't pixel perfect, but the build should mostly match them. Sort each difference:
- **Too small to notice at a glance,** like a few pixels of spacing that come from a Mantine theme value: don't chase it or report it.
- **From the Mantine component or theme value used,** where the element looks clearly different from the design, or matching it would take custom CSS or using a component differently from how its docs intend, and neither the note nor the user has settled it: ask the user.
- **Where the Design Handoff and something the user said in this session disagree:** ask the user.
- **Anything else must match,** because the design is a written source, so fix it without asking: what's on screen and in what order, the layout (row or column, grouping, alignment), wording, which states exist, which kind of control it is (button or link), and color roles from `docs/theme.md`.
