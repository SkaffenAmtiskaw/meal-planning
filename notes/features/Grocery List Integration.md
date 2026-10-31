---
type: feature
status: idea
confirmed: 2026-09-25
---
# Where It Stands
Next: /shape ^status

# Inbox

# Notes
We need to allow users to export their meals from a range of dates to a grocery list app or a grocery shopping app. These will be slightly different, but there are similar problems involved in both in figuring out products based on recipes.

[Sarah] - We should also provide a printable grocery list

Targeted Apps:
- Listonic

Targeted Grocery Stores
- Wal-Mart??
- Target??

## Wish List
Brainstormed 2026-10-31. Everything here builds on the core work.

### Core: turning a date range into a list
Recipe ingredients are free-text strings (`ingredients: z.array(z.string())` in `src/_models/library/recipe.types.ts`), such as `'1 1/2 cups arborio rice'`, so the core work also has to:
- parse each line into quantity, unit and item
- combine duplicates, converting units where needed ("1 tbsp butter" + "½ cup butter")
- scale a recipe planned for a different number of servings than its `servings`
- handle bookmarked meals, which have no ingredients: import them from the bookmarked page, or let the user add items by hand

Structured ingredient entry (quantity, unit and item as separate fields) would make parsing easier. It relates to the Ideas line "group ingredients when adding/editing a recipe".

### In the app
- an in-app grocery list: edit it, add extras like paper towels, and check items off on a phone in the store. Planners have members, so a household can share one list. Exports can start from it.
- staples to leave off (salt, oil), and ticking off what's already on hand before shopping
- grouping by aisle
- a printable list with checkboxes, grouped by aisle. It could print with the week's plan (the Ideas line "printable meal plan").
- a prep list for the week ("chop 3 onions, cook 2 cups rice")
- less waste: suggest recipes that use up an ingredient already on the list, or recipes that use what's on hand
- a cost estimate, from store prices such as Kroger's API returns

### Exporting to list apps
As of 2026-10-31, Listonic, AnyList, Bring! and OurGroceries have no official import API. AnyList has only an unofficial, reverse-engineered one.
- copy as text, or share through the phone's share sheet: reaches any list app, including Listonic, Apple Reminders and Google Keep. Many list apps split pasted lines into separate items; check each app.
- Todoist, Microsoft To Do and Google Tasks have public APIs
- a CSV or text download, for apps that import files

### Store ordering
Matching an ingredient to a product is the hard part ("2 cloves garlic" means buying one head).
- [Instacart Developer Platform](https://docs.instacart.com/developer_platform_api/): open to app developers. Send line items (name, quantity, unit) and get back a link to a shopping list page where the shopper picks a store. Instacart matches products itself.
- Kroger's public API adds items to a signed-in shopper's cart, but each ingredient has to be matched to a specific Kroger product.
- Walmart's cart APIs appear to be partner-only. No Target API turned up.
