# The Accessibility Audit
Check the release's screens in the running app against WCAG 2.2 AA.

The steps, in order:
1. **The screens:** from the note's scope, list the screens and flows the release adds or changes. Work them out from the pages, components and actions in the range's diff. Check that each page, layout and component the diff adds or changes is reached by a screen on the list.
2. **The app:** start it and sign in as the `running-the-app` skill describes.
3. **Your checks:** on each screen, at desktop size and with the `mobile` preset, check each WCAG 2.2 AA success criterion the browser tools can show, such as keyboard reach and order with visible focus, accessible names, and contrast from computed styles. Record each failure with the success criterion it breaks.
4. **The user's checks:** for anything the tools can't show, such as how a flow sounds in a screen reader, walk the user through it one screen at a time, saying what they should hear or see.
5. **Stop:** stop the servers as `running-the-app` describes.
