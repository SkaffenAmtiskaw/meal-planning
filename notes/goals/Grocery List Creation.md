---
type: goal
confirmed: 2026-10-31
---

# Purpose
Let users turn the meals they've planned for a range of dates into a grocery list they can take to a grocery list app or a grocery shopping app. The wish list in [[Grocery List Integration]] goes beyond the list itself, and this goal decides which of those pieces are worth doing and which belong in this release.

# Done When
- The meals planned for a range of dates turn into a grocery list. Recipe ingredients, which are free text today, are parsed into quantity, unit and item. Duplicates are combined, converting units where needed. Recipes planned for a different number of servings are scaled, and bookmarked meals, which have no ingredients, are handled.
- The list can be shared as text, by copying it or through the phone's share sheet, into any list app.
- A research story has weighed every other piece of the wish list in [[Grocery List Integration]] and decided two things for each: whether it's worth doing, and whether it's in this release.
- Every piece the research story puts in this release is built.

# Out of Scope
- Grouping ingredients when adding or editing a recipe (Ideas): it's more about the recipe view. This goal's changes might affect it, but it doesn't belong in the release (2026-10-31).
- The [[Bugs]] line on Planner's mongoose schemas not matching their zod types (recipe `time`, the `saved` union and the dish `source` union): Sarah expects cleanup to fix it before this goal is built. If a story here is ever blocked by it, it can be pulled in then (2026-10-31).

# Roadmap Instructions
