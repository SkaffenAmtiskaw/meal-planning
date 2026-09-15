![[01-month-today.png]]![[Mobile Month View.dc.html]]![[support.js]]
![[weeknight-header-dark 1.svg]]

# Handoff: Mobile — Month view

## Overview
On a phone, the month view should stop trying to be the desktop month grid. Instead of seven
columns of 100px cells with truncated meal cards inside them, mobile gets a **compact month grid
with colored dots** plus an **inline agenda for the selected day** underneath it. The grid answers
"what does the month look like"; the agenda answers "what are we eating", with full dish names,
recipe links and prep notes readable at rest.

This story covers the **month view on mobile only**. The mobile list view is a separate story and a
separate handoff.

## Fidelity — Mantine first, pixels second
**Build this out of Mantine components and props. That matters more than matching the prototype
pixel for pixel.** The sizes, spacings and colors below are design intent, not a contract. Where a
Mantine component, prop, theme token, or spacing step gets you close, take the Mantine version —
`SimpleGrid`/`Stack`/`Group` over styled `<div>`s, `Card`/`Paper` over hand-rolled borders,
`SegmentedControl`, `ActionIcon`, `Badge`, `Indicator`, `Affix` over custom equivalents, `c="navy"`
over a hex literal, `size="sm"` over a `fontSize`. Something a few pixels off but built from real
Mantine primitives and theme tokens is the **correct** outcome; a pixel-exact version built from
inline styles and hardcoded hexes is not. Reach for custom styling only where Mantine genuinely has
no answer.

Two things are not negotiable to taste, because they are the reasons for the change:
2. the selected day's meals are fully readable inline — no truncation, no modal required;
3. all primary content clears 4.5:1 contrast (notes included, in full navy ink) — the muted ramp is
   only for the labels named in the Accessibility section.

The prototype (`Mobile Month View.dc.html`) is a look-and-behavior reference built outside the app.
Do not port its markup, inline styles, or fixture data.

---

## What's wrong today
- The desktop month grid renders on phones as-is: cells are tall, meal cards inside them are
  clipped, and two meals plus a "+N more" barely fit.
- Everything about a meal is behind a tap into the meal detail modal — on the smallest screen, the
  most information is the hardest to reach.
- The header is desktop-shaped: Today button, prev/next, month label, segmented control, and a date
  picker input all on one row.

## Screen anatomy (top to bottom)

### 1. App header
Unchanged. Shown in the prototype only for context.

### 2. Calendar header — compact, two rows
- **Row 1:** prev chevron · month + year (tappable, opens a date picker) · next chevron · **Today**.
  - The month label carries a small chevron to signal it opens a date picker. Tapping it lets the
    user jump to any month/date; on confirm the grid moves there and the agenda shows that day.
  - Prev/next move by one month.
  - **Today** returns to the current month and selects today.
- **Row 2:** Month / List switcher, full width, two segments only (Week is already excluded on
  mobile). Minimum 44px tall touch targets on everything in this header.
- The desktop date-picker *input* and the desktop "Add Meal" button do **not** appear here — the
  label is the date picker, and adding a meal is the floating action button (see 5).

### 3. Weekday header
Single-letter labels, centered, muted, uppercase, above the grid.

### 4. Month grid — dots, not cards
Seven columns, whole month plus leading/trailing days to fill the weeks. Each cell is a compact
tap target (~52px tall, comfortably over 44px) containing:
- **Day number**, centered in a ~30px circle.
  - Days outside the displayed month are muted.
  - **Today** is an ember filled circle with white text.
  - **Selected** day gets a tinted cell background (ember tint when it is also today, neutral chalk
    tint otherwise) and a heavier day number. Today and selected must be distinguishable when they
    are different days.
- **Meal dots** beneath the number: one small dot per meal, in the meal's tag color, **max 3**. No
  "+N" affordance and no text in the cell — the agenda below carries the detail. A day with no
  meals shows no dot but keeps its height, so rows stay aligned.
- Dot color comes from the same meal-name → tag-color mapping used by the month and list views, so
  "Dinner - Fun Friday" is the same color everywhere.

### 5. Selected-day agenda
Directly below the grid, in its own scroll region on a subtly tinted background so it reads as a
distinct panel from the grid.

- **Panel header:** the selected day, long form ("Thursday, September 10"), prefixed "Today · " when
  it is today. On the right, a muted meal count ("2 MEALS").
- **Meal card** per meal, stacked:
  - Left rail in the meal's tag color (4px), otherwise a plain bordered card.
  - Meal name, prominent. Optional description beneath it, muted.
  - **Dish list** — one line per dish with a small bullet:
    - plain dish name; or a link when the dish has a saved recipe or an external URL (external
      links open in a new tab and get an external-link glyph);
    - an optional book/page reference after the name, small and italic, muted;
    - the dish's **note on its own line beneath the name**, full-strength navy ink, wrapping to as
      many lines as it needs. Never truncated, never clamped, never behind a tooltip. Author line
      breaks are preserved; render as plain text (no markdown, no autolinking).
  - **Quick actions** at the bottom of the card: **Edit** and **Add dish**, as pill buttons.
    These replace desktop's hover affordances (there is no hover on touch). Both open the existing
    add/edit meal flow with the meal and date prefilled.
- **Empty day:** a single dashed placeholder card — "Nothing planned yet" plus a prominent
  **Add meal** button that opens the add flow with that date prefilled. Do not leave the panel blank.

### 6. Floating "Add Meal" button
Persistent, bottom-right, ember, above the agenda scroll. Adds a meal to the **currently selected
day** — not always today. It must not cover the last card: the agenda's scroll region needs bottom
padding roughly the height of the button plus its margin.

---

## Interactions & behavior
- **Tap a day** → selects it and swaps the agenda. The grid does not move; the agenda scroll resets
  to top. No navigation, no modal.
- **Initial state:** current month, today selected, agenda showing today.
- **Prev / next month:** the grid changes month; selection moves to the same relative position or
  the 1st, and the agenda follows. Keep whichever rule is simplest — but the agenda must always
  match the highlighted day.
- **Today:** returns to the current month and selects today, even from three months away.
- **Swipe** between months is a nice-to-have, not required for this story.
- **Tapping a meal card** does not open a read-only modal. Everything is already on screen; editing
  happens through Edit / Add dish.
- **Tapping a dish link** navigates to the recipe or the external source and must not also select
  or toggle anything behind it.
- **Read-only users** (no write permission): no floating button, no Edit / Add dish, no add-meal
  affordance in the empty state — the empty day just says nothing is planned.
- **Loading:** skeletons for the grid cells and one or two agenda cards. Do not collapse the layout
  height while loading.

## Breakpoint
This treatment applies at the existing mobile breakpoint for the calendar. Above it, the desktop
month grid is unchanged. The two implementations should not both mount.

## Accessibility
- Every day cell is a real, focusable control with an accessible name including the date and the
  meal count ("September 10, 2 meals"), and it exposes its selected state.
- Dots are decorative — color alone never carries meaning; the meal count in the accessible name
  and the agenda below are the real information.
- Touch targets ≥44px: day cells, header controls, segmented control, quick actions, floating
  button.
- The agenda panel announces its change when the selected day changes.
- **Contrast, scoped:** all primary content — meal names, dish names, dish notes, the agenda's day
  title — clears 4.5:1. Dish notes in particular use **full navy ink**, not the muted `navy.4`
  grey: at this size, on white, `navy.4` is ≈2.8:1, and notes are load-bearing content, not
  decoration. Notes read as secondary through size and weight, not through fading.
- The theme's muted ramp is used **only** for labels that are decorative or redundant with content
  available elsewhere: the weekday letters above the grid, the meal description, the book/page
  reference, the meal count (also in each day cell's accessible name), and out-of-month day
  numbers. These sit below 4.5:1 by design. If one of them turns out to be the only place a piece
  of information appears, it moves to full navy rather than staying muted.

## Tokens
Everything below already exists in the theme — use the tokens, do not re-declare colors.

| Use | Token |
|---|---|
| Body text, day numbers, dish names, dish notes | `navy` |
| Muted labels (weekday letters, description, book ref, meal count) | `navy.4` / `navy.3` — decorative/redundant only, see Accessibility |
| Out-of-month day numbers | `navy.2` |
| Dish bullet | `navy.1` |
| Links, secondary actions, chevrons | `forest` (hover `forest.6`, underline `forest.4`, border `forest.2`, tint `forest.0`) |
| Today badge, floating button, today accents | `ember` |
| Today / selected cell tint | `ember.0` |
| Agenda panel background | `chalk.0` |
| Dividers, card borders | `chalk.3` / `chalk.2` |
| Meal rail + grid dots | the meal's tag color (name → tag-color mapping) |

Icons come from the app's existing icon set (plus, chevrons, external link) — the prototype draws
them by hand only so it runs standalone. No new assets.

## Acceptance criteria
1. On a phone, the month view shows a compact 7-column grid with tag-colored meal dots (max 3 per
   day) and no meal cards inside cells.
2. Today is visually distinct from the selected day, and both are visible at once.
3. Tapping any day updates an inline agenda below the grid without navigating or opening a modal.
4. The agenda shows, for each meal: name, optional description, every dish, each dish's recipe or
   external link, book reference where present, and its full note on its own line.
5. Dish notes are never truncated or clamped and clear 4.5:1 contrast, as does all other primary
   content; the muted ramp appears only on the decorative/redundant labels named above.
6. Empty days show an add-meal affordance; read-only users see no write affordances anywhere.
7. Header fits two rows with 44px+ targets: month navigation + Today, and a two-segment
   Month/List switcher. No desktop date-picker input.
8. A floating Add Meal button adds to the selected day and never overlaps the last card's content.
9. The view is built from Mantine components and theme tokens, with custom styling only where
   Mantine has no equivalent.

## Out of scope
- Week view on mobile (already excluded on small screens).
- The mobile list view (separate story / handoff).
- Drag to reschedule, multi-month infinite scroll, swipe gestures.
- Any change to the add/edit meal flow itself.

## Files in this bundle
- `Mobile Month View.dc.html` — interactive design reference; open in a browser and tap days.
- `screenshots/01-month-today.png` — today selected, two meals with notes.
- `assets/weeknight-header-dark.svg` — existing app logo, included only so the prototype renders
  standalone.
