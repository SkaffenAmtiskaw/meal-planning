Many modals in the app are mixing presentation and data concerns. An attempt to start separating them was made in the Add Meal modal, which now uses the `CalendarModalProvider` as well as a wrapper component around the form.

In this story, we need to standardize this pattern. All modals in the calendar modal (currently only the meal detail modal, but in the future might be more) should use the calendar modal context as well as any wrapper components which need to be created for them.

The recipes page also needs to be evaluated to determine if this pattern is appropriate, or if another pattern would work better.