![[01-list-top.png]]

![[Mobile List View.dc 1.html]]
![[support 1.js]]
![[weeknight-header-dark.svg]]

# Handoff: Mobile — List view

## Overview
The list view currently renders a **"Coming soon" placeholder** on phones. This story replaces it
with a real mobile list: one continuous vertical scroll of days, each day a section header followed
by its meal cards. It is the same idea as the desktop list view, re-laid-out for a narrow screen —
the desktop's fixed left date gutter and hover-revealed controls do not survive on touch.

Like the desktop list view, **there is no meal detail modal here.** Everything a cook needs — meal
name, description, every dish, its recipe link or book reference, and its prep note — is on the row.

This story covers the **list view on mobile only**. The mobile month view is a separate story and a
separate handoff.

## Fidelity — Mantine first, pixels second
**Build this out of Mantine components and props. That matters more than matching the prototype
pixel for pixel.** The sizes, spacings and colors below are design intent, not a contract. Where a
Mantine component, prop, theme token, or spacing step gets you close, take the Mantine version —
`Stack`/`Group`/`Divider` over styled `<div>`s, `Card`/`Paper` over hand-rolled borders,
`ActionIcon`, `SegmentedControl`, `Affix` over custom equivalents, `c="navy"` over a hex literal,
`size="sm"` over a `fontSize`, `gap="xs"` over raw margins. Something a few pixels off but built
from real Mantine primitives and theme tokens is the **correct** outcome; a pixel-exact version
built from inline styles and hardcoded hexes is not. Reach for custom styling only where Mantine
genuinely has no answer.

Two things are not negotiable to taste:
2. dish notes sit on their own line, are never truncated, and carry full-strength ink;
3. all primary content clears 4.5:1 contrast — the muted ramp is only for the labels named in the
   Accessibility section.

The prototype (`Mobile List View.dc.html`) is a look-and-behavior reference built outside the app.
Do not port its markup, inline styles, or fixture data.

---

## What's wrong today
- Mobile list view is a placeholder. There is no way to scan the plan as a list on a phone.
- The desktop list layout can't simply be shown: an 82px date gutter eats a quarter of the width,
  the add-meal button only appears on hover, and drag handles are meaningless on touch.

## Screen anatomy (top to bottom)

### 1. App header
Unchanged. Shown in the prototype only for context.

### 2. Calendar header — compact, two rows
- **Row 1:** the **month + year of the topmost visible day** (not a fixed selected date), tappable
  to open a date picker, plus a **Today** button on the right.
  - The label updates as the user scrolls — it is a position indicator.
  - Prev/next chevrons are **not** shown in list view; scrolling replaces them (same rule as
    desktop).
  - Picking a date from the label's picker scrolls that day into view.
- **Row 2:** Month / List switcher, full width, two segments.
- Minimum 44px touch targets. No desktop date-picker input, no header Add Meal button.

### 3. Day list — the scroll region
One section per calendar day **in the loaded range, including days with no meals** — an unbroken
run of dates is what makes the list scannable.

**Day section header** — a full-width row, not a gutter:
- Left: weekday + day number + month, compact and uppercase ("THU 10 · SEP"), muted. On **today**
  it is ember and the whole section gets a soft ember tint background.
- A hairline rule fills the space between the label and the action on the right.
- Right: a **28px circular add button** with a plus glyph. Always visible — there is no hover on
  touch. It opens the add-meal flow with that day's date prefilled, and needs an accessible name
  including the date.

**Meal card** — one per meal, stacked under the day header:
- Left rail in the meal's tag color (4px), otherwise a plain bordered card on white.
- Meal name; optional description beneath it, muted.
- **Dish list** — one line per dish with a small bullet:
  - plain dish name; or a link when the dish has a saved recipe or an external URL (external links
    open in a new tab and get an external-link glyph);
  - an optional book/page reference after the name, small and italic, muted;
  - the dish's **note on its own line beneath the name**, full-strength navy ink, wrapping to as
    many lines as it needs. Never truncated, never clamped, never behind a tooltip. Author line
    breaks are preserved; render as plain text (no markdown, no autolinking).
- The card is **not** a modal trigger and not a whole-card tap target.
- Desktop's drag handle is **dropped** on mobile.

**Empty day:** the day header stays, followed by a single quiet line — "No meals planned", in the
muted ink at a smaller size (this is real information, so it must not drop below the muted ramp's
`navy.4` — do not go lighter). The day's add button in the header is the affordance; no second
large empty-state block per day. Empty days must keep their height so the scroll rhythm is even.

### 4. Floating "Add Meal" button
Persistent, bottom-right, ember, above the scroll. Defaults to today's date (or the topmost visible
day — pick one and be consistent). The scroll region needs bottom padding roughly the height of the
button plus its margin so it never covers the last card.

---

## Interactions & behavior
- **Initial position:** on open, the list is scrolled so **today's section is at the top** of the
  scroll region, with a small offset above it. No animation on first paint.
- **Today:** smooth-scrolls back to that same position.
- **Scroll → header label:** the month/year label reflects the topmost visible day section and
  updates as the user scrolls.
- **Date picker:** choosing a date scrolls that day's section into view (extending the loaded range
  if the date falls outside it).
- **Day add button / floating button:** open the existing add-meal flow with the date prefilled.
- **Dish link tap** navigates to the recipe or external source and must not trigger anything behind
  it.
- **Range:** a fixed window around today (roughly two weeks back, three weeks forward) is enough
  for this story. Infinite scroll in both directions is a follow-up, not part of this design.
- **Read-only users** (no write permission): no floating button and no per-day add buttons; empty
  days simply read "No meals planned".
- **Loading:** skeleton day sections — header line plus one card-height block. Do not collapse the
  scroll height.
- **Empty range:** if nothing loads at all, the standard empty state. Individual empty days are
  normal and are not an error.

## Breakpoint
This treatment applies at the existing mobile breakpoint for the list view (the one currently
gating the placeholder). Above it, the desktop list view with its date gutter is unchanged. The two
implementations should not both mount.

## Accessibility
- The list is a semantic list of days; each day section is labelled with its full date.
- Per-day add buttons and the floating button have accessible names that include the date.
- Touch targets ≥44px (the 28px circular add glyph needs a larger hit area than its visual size).
- Today is identified by more than color — its date label reads as today's date and should be
  announced as such, not left to the tint alone.
- **Contrast, scoped:** all primary content — meal names, dish names, dish notes, "No meals
  planned" — clears 4.5:1. Dish notes in particular use **full navy ink**, not the muted `navy.4`
  grey (≈2.8:1 at this size): with no detail modal the note is primary content, and it reads as
  secondary through size and weight, not through fading.
- The theme's muted ramp is used **only** for labels that are decorative or redundant with content
  available elsewhere: the day section label (the full date is in each day's accessible name), the
  meal description, and the book/page reference. These sit below 4.5:1 by design. If one of them
  turns out to be the only place a piece of information appears, it moves to full navy rather than
  staying muted.

## Tokens
Everything below already exists in the theme — use the tokens, do not re-declare colors.

| Use | Token |
|---|---|
| Body text, dish names, dish notes | `navy` |
| Muted text (day label, description, book ref) | `navy.4` |
| "No meals planned" | `navy.4` (do not go lighter) |
| Dish bullet | `navy.1` |
| Links and add affordances | `forest` (hover `forest.6`, underline `forest.4`, border `forest.1`/`forest.2`, tint `forest.0`) |
| Today label + floating button | `ember` |
| Today section tint | `ember.0` (light) |
| Scroll region background | `chalk.0` |
| Section dividers, card borders | `chalk.2` |
| Meal rail | the meal's tag color (name → tag-color mapping) |

Icons come from the app's existing icon set (plus, chevron, external link) — the prototype draws
them by hand only so it runs standalone. No new assets.

## Acceptance criteria
1. On a phone, the list view shows real content — the "Coming soon" placeholder is gone.
2. Days render as full-width sections with a date header and an always-visible add button; there is
   no left date gutter and no drag handle.
3. Every day in the loaded range appears, including days with no meals.
4. Today's section is tinted, labelled in ember, and is where the list is scrolled on open.
5. Each meal card shows name, optional description, every dish, each dish's recipe or external
   link, book reference where present, and its full note on its own line.
6. Dish notes are never truncated or clamped and clear 4.5:1 contrast, as does all other primary
   content; the muted ramp appears only on the decorative/redundant labels named above.
7. The header shows the month of the topmost visible day and updates while scrolling; no prev/next
   chevrons; a two-segment Month/List switcher.
8. Tapping a meal card opens nothing; dish links navigate correctly.
9. Read-only users see no add affordances.
10. The view is built from Mantine components and theme tokens, with custom styling only where
    Mantine has no equivalent.

## Out of scope
- The mobile month view (separate story / handoff).
- Infinite scroll, drag to reschedule, swipe actions on cards.
- Any change to the desktop list view or the add/edit meal flow.

## Files in this bundle
- `Mobile List View.dc.html` — interactive design reference; open in a browser and scroll the phone.
- `screenshots/01-list-top.png` — empty days, a dish with a book reference, today's tinted section.
- `assets/weeknight-header-dark.svg` — existing app logo, included only so the prototype renders
  standalone.
