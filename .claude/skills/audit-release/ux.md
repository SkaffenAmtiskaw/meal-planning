# The UX Audit
Walk the release's screens in the running app with the user, at desktop and phone size, looking for anything awkward to use and for styles that don't match.

The steps, in order:
1. **The screens:** from the note's scope, list the screens and flows the release adds or changes. Work them out from the pages, components and actions in the range's diff. Check that each page, layout and component the diff adds or changes is reached by a screen on the list.
2. **What to check against:** read `docs/style_guidelines.md` and `docs/theme.md`.
3. **The app:** start it and sign in as the `running-the-app` skill describes.
4. **The walk:** go through each screen and flow, first at desktop size, then with the `mobile` preset. On each, take a screenshot, and note anything awkward to use or off-style, such as a step that's hard to find or undo, controls that crowd or overflow on a phone, or styles that differ from the docs or from the release's other screens. Show the user each screen with what you noted, and ask what they'd add. Keep what you noted and what they add as findings for step 3, and don't ask yet whether to keep each one.
5. **Stop:** stop the servers as `running-the-app` describes.
