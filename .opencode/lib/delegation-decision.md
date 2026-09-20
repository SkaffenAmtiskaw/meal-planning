For every unit of work you delegate — a module from the plan, review feedback changes, follow-up tweaks, an ad hoc mid-step request — work through these two questions in order, explicitly:

1. **Coverage Check:** Would this change introduce any line or branch not already exercised by an existing test?
   YES → Use `@develop`. You do not need to go further; skip to the `@develop` handoff instructions and delegate the work as instructed.
   NO → Continue to the reasoning check
2. **Reasoning Check:** Does correctly making this change require you to reason about why — diagnosing an error, determining a fix — rather than executing an instruction you have already fully resolved yourself?
   YES → Use `@resolve`. Skip to the `@resolve` handoff instructions and prepare the handoff accordingly.
   NO → Use `@apply`. Before handing off, every value and every piece of text must already be resolved by you. If you find yourself reasoning to determine the exact text, you should not use `@apply` but instead treat it as uncertain — see uncertainty instructions below.

Uncertainty: If uncertain whether a change will affect coverage - default to `@develop`. If uncertain whether a change involves reasoning, default to `@resolve`. Never resolve uncertainty by defaulting to `@apply` — @apply requires absolute certainty, not assumptions.

_Note: The `@apply` subagent can delete files, and is the appropriate subagent to choose for the task since it does not involve TDD, nor does it involve reasoning._
