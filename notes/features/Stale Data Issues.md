The following issues currently existing in the app are likely a symptom of a larger issue with stale data in the app. This story needs to create a consistent pattern for refreshing data when mutations occur, and make sure that pattern is followed everywhere in the app.

At the end of this story the following should be fixed:
- [ ] after adding a new recipe, it is not immediately available in the saved dishes dropdown in the create meal modal
- [ ] meals created in month view don't show immediately show up when switching to week view
