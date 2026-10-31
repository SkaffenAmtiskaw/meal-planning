---
type: bug
status: spec
blocked-by: []
confirmed: 2026-10-31
---
# Where It Stands
Next: /plan-steps ^status

# Inbox

# Symptoms
[Sarah] - Bug - When adding a URL as a reference, the dish title input can shrink too small to read the text (this was observed in the deployed production app but not confirmed in develop yet)

The input is the dish-name input in the Add Meal form's dish row. The long URL is on the dish's source chip, beside it.

**Repro steps (2026-10-31):**
1. Sign in as the seeded `owner` user, with the window at 1280×800 (a full laptop window, where Sarah saw it).
2. On the planner's calendar page, click Add Meal.
3. In the first dish row, type `Chicken tikka masala` as the dish name.
4. Click the "Add source" chip, choose Reference, and type `https://www.bbcgoodfood.com/recipes/chicken-tikka-masala-with-homemade-garlic-naan-and-cucumber-raita`.
5. Click the chevron to collapse the row.
6. The dish-name input is 26px wide and the name can't be read. It's the same at 1440×900.

# Who Can Hit This
Anyone adding a meal on a desktop-width window (769px and up) whose dish source label is longer than the chip can show. On phones, the input sits on its own line above the chips, so it isn't squeezed. A saved item with a long name goes through the same chip and cap, so it should squeeze the input too, but that was reasoned from the code, not checked in the app.

# Root Cause
The source chip's cap, `max-width: min(240px, 50%)` in `src/app/[planner]/calendar/_components/AddMealForm/DishSourceChip.module.css`, doesn't hold while the row is being laid out. The `50%` is a percentage of the chip group, the second child of `DishRowLayout` in `DishRow.tsx`, but the group gets its width from its content. While the browser works out the group's width, it can't resolve a percentage of that width, so it ignores the cap and counts the chip at the full label's width. The cap only takes effect once the group's width is set. The dish-name input has `flex: 1` (a flex basis of 0) in `DishRow.module.css`, so the group takes nearly the whole row and the input is left with almost nothing. The code should cap the chip with a length that doesn't depend on the group's width.

Seen in the running app at 1280×800, with the long reference and the row collapsed:

| | Name input | Chip group | Source chip | Chip label (scrollWidth) |
|---|---|---|---|---|
| As built | 26px | 543px | 240px | 656px |
| Chip cap set inline to `240px` | 165px | 378px | 240px | 656px |

At 1440×900 the input was also 26px, in a 630px row. With the plain `240px` cap, the group shrinks to its content (240 + 82 note chip + 36 chevron + gaps), and the input gets the rest. The fault is in one module, `DishSourceChip.module.css`.

No test covers this. The unit tests run in jsdom, which doesn't lay out the page (`DishSourceChip.test.tsx`'s long-label test only checks the text), and no E2E test opens Add Meal.

# Fix
Replace the chip's `min(240px, 50%)` cap in `DishSourceChip.module.css` with a plain length that doesn't depend on the chip group's width. The cap's size can change with the window width, so it's set and checked at several desktop widths when it's built. Sarah picked this over also letting the row wrap the chips onto a second line, which would keep the input wide at every desktop width but makes dish rows two lines tall in narrow windows.

Near the phone breakpoint the dish row is only about 308px wide (estimated from the 1280 and 1440 rows, not measured), and the note chip, chevron and gaps take about 138px of that, so even a small cap leaves the input narrow there. [[Add Meal Changes (Saved Recipes)]] adds a Saved recipes column on desktop that makes the dish column narrower, and its Step 6b also reworks this chip and `formatSourceChip`.

Also delete `src/app/[planner]/calendar/_components/AddMealForm/BaseDishChip.module.css`. Nothing imports it, since `BaseDishChip` renders `PillButton`, which has its own styles. Sarah pulled this into the fix.

# Acceptance Criteria
Checked in the running app, signed in as `owner`:
- Follow the repro steps at 1440×900, 1280×800, 1024×768 and 800×900. At each width, the dish-name input is wide enough to read the dish name, and the chip shows the reference without `https://`, cut off with an ellipsis.
- Hover the source chip and the full reference shows.
- With no source ("Add source") and with a short reference, the chip shows its whole label.
- Choose Saved and pick a saved item; the chip shows its name.
- The Add note chip, chevron and, with two dishes, the remove button still sit on the same line and work.
- At the `mobile` preset, the dish-name input is on its own line above the chips, as before.

# Implementation
