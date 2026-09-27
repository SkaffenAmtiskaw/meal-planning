---
type: feature
status: spec
blocked-by:
  - "Steps 2 and 5 need re-review (see Review notes)"
  - "Today marker changed by [[Unified Date Picker Component]] - Step 3, Tokens and Acceptance criterion 4 need re-review (see Design Update - Today Marker)"
  - "[[Calendar and Recipes Data Refresh]]"
  - "[[Today and Selected Day Markers]]"
confirmed: 2026-09-19
---
![[01-list-top.png]]

![[Mobile List View.dc.html]]
![[support.js]]
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

> ⚠️ **Check Drift 2026-09-25:** The today treatment here is superseded by [[#Design Update - Today Marker]] (navy ring around the day number, no section tint, no ember). Found by reading notes, not in the running app.
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

> ⚠️ **Check Drift 2026-09-25:** The "Today label" and "Today section tint" rows are superseded by [[#Design Update - Today Marker]]. Ember stays for the floating button only. Found by reading notes, not in the running app.
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

> ⚠️ **Check Drift 2026-09-25:** Criterion 4's "tinted, labelled in ember" is superseded by [[#Design Update - Today Marker]]. The scroll-on-open part still stands. Found by reading notes, not in the running app.
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
- `assets/mobile-list-view/01-list-top.png` — empty days, a dish with a book reference, today's tinted section.
- `assets/weeknight-header-dark.svg` — existing app logo, included only so the prototype renders
  standalone.

# Design Update - Today Marker
> [!warning] Separate from the handoff above
> This section was moved here on 2026-09-25 from the [[Unified Date Picker Component]] design handoff. It is **not** part of this story's own handoff. It changes how today is marked in the mobile list. Where it conflicts with the handoff above (Day section header, Tokens, Acceptance criterion 4) or with the implementation steps (Step 3), **stop and ask Sarah** which one wins. Don't pick one yourself.
>
> One known conflict to raise with her: this story's day label is a single compact line ("THU 10 · SEP"), while the update below puts a ring "around the day number, same as desktop list".

**App-wide rule (from the Unified Date Picker handoff, "Aligning every today / selected indicator"):**
Target everywhere: **today = navy outline ring**, **selected = soft sage circle**, and they stack. The selected date is only marked where you pick a date: the date picker and the mobile month grid. Everywhere else, only today is marked.

Ember (orange) is kept for actions only. It is no longer used to mark days.

**The rows that apply to this story** (the desktop row is included because the mobile row refers to it):

| Place | Today (now) | Plan |
|---|---|---|
| List view (desktop) | Filled orange circle on the day number, plus an orange-tinted row | Navy ring on the day number; drop the row tint. The date you jump to isn't marked; scrolling there is enough. |
| List view (mobile) | Orange day label, plus an orange-tinted section | Navy ring around the day number, same as desktop list; drop the section tint. The date you jump to isn't marked. |

**Day cell states** (the "Today" treatment is the one to match):

| State | Treatment |
|---|---|
| Today | **Navy outline ring** around the number, bold |
| Selected | **Soft sage circle** behind the number (`sage` at 45% opacity), navy bold text (~11:1) |
| Selected + today | The sage circle sits inside the navy ring |

![[datepicker_anatomy.png]]

**Implementation note:** [[Today and Selected Day Markers]] builds a shared day-marks component for the today ring and uses it in the desktop list's date gutter. Use that component for the mobile day header rather than styling the ring again.

# Implementation

## Dependencies on in-progress mobile month-view work

| Month-view component | How it is used here | Note |
|---|---|---|
| `MobileCalendarHeader` | Reused as-is for mobile list view | Still in progress; verify before use that it hides prev/next in `list` view and keeps the Month/List switcher. Do not modify it in this story. |
| Base `MealCard` (extracted from `ListView`) | Reused for mobile list-view meal cards | Verify the base card supports no drag handle, no actions, and a configurable dish-list container so the list view can use bullets instead of the desktop left-border stack. |
| `DishListItem` | Reused as-is inside the base `MealCard` | Already renders name/link, external glyph, book ref, and note. Verify it meets mobile list-view needs. |
| `MobileAddMealButton` FAB | Reused for the list-view floating add button | Verify it accepts a target date prop (or can be parameterized) so the list view can default it to today while month view uses the selected day. |

> ⚠️ **Check Drift 2026-09-25:** The mobile month view work is done, so these can now be answered from the code:
> - `MobileCalendarHeader` was never created. The mobile header is `CalendarHeaderMobile` in `src/app/[planner]/calendar/_components/CalendarHeader/CalendarHeader.tsx`, and it already hides prev/next in `list` view and keeps the Month/List switcher.
> - The base `MealCard` (`src/_components/Calendar/MealCard/MealCard.tsx`) has no drag handle and optional `renderActions`, but **no configurable dish-list container**. Step 4 will need to add one.
> - `MobileAddMealButton` has **no target-date prop**; it always prefills the context's `selectedDate`. Step 5 will need to add one to prefill today.

## Step 1: Decouple the list-view scroll shell from the day-row layout

**Problem to solve:** The desktop list view couples its scroll container, day-range building, event grouping, and scroll-to-date behavior to the desktop day-row layout. Mobile needs the same shell but a completely different day section.

**Suggested Approach:** Treat `ListView` as a generic scroll container. Extract the desktop day-row layout behind an injection point so the mobile layout can be supplied without copying scroll logic, range logic, or scroll-sync code.

**Verification:**
- Open the desktop list view and confirm it still looks and behaves exactly as before.
- Inspect the code to confirm the desktop layout is still the default injection but can be replaced.

## Step 2: Expand the loaded day window on explicit navigation

**Problem to solve:** The current day window is fixed around today. If the user picks a far date via the date picker, that day may fall outside the rendered range.

**Suggested Approach:** Update `getListDayRange` to accept an optional `targetDate`. Compute the default window around today, then extend the start/end to include `targetDate` when it falls outside. Pass the context's `selectedDate` (already updated by navigation) as the target from `ListView`.

**Verification:**
- On mobile List view, use the existing header date picker to jump several months into the past or future.
- Confirm the target day renders and the list scrolls to it.

> ⚠️ **Check Drift 2026-09-25:** This step's premise is out of date and it needs re-review before implementation. The window is not fixed around today: `getListDayRange` already takes a `rangeAnchor` from `CalendarContext`, which `navigateToDate` updates. From reading the code (not verified in the running app), the bug still seems to exist for a different reason: `getListDayRange` forces today into the window, so when the anchor is more than ~3 weeks from today the window snaps back to today and the target day is not rendered. The fix is probably changing that rule rather than adding a `targetDate` parameter.

## Step 3: Build and wire the mobile day section

**Problem to solve:** Mobile needs a full-width day section instead of a sticky left gutter.

**Suggested Approach:** Create a `MobileDayRow` component that conforms to the same day-row prop contract as the desktop version. Render it via the `renderDay` injection point from Step 1. Use Mantine `Group`, `Divider`, `Text`, and `Box` for the header row and today tint. Leave the add button slot empty for now. Wire the component through `MobileMealListView` and update `MealListView` to render the mobile branch.

**Verification:**
- On mobile List view, confirm every day in the range appears as its own section, including days with no meals.
- Empty days show “No meals planned”.
- Today’s section is tinted and the date label is ember; the list scrolls so today is near the top on first load.

> ⚠️ **Check Drift 2026-09-25:** The "tinted" and "ember" parts of this check (and the "today tint" in the Suggested Approach above) are superseded by [[#Design Update - Today Marker]]. This step needs re-review before it's built. Found by reading notes, not in the running app.

## Step 4: Reuse the generic meal card and dish row for mobile meal content

**Problem to solve:** Meals need to be readable on a narrow screen with no detail modal.

**Suggested Approach:** Use the base `MealCard` being extracted by the month-view story. Pass no drag handle and no actions. Replace the desktop dish-list container (border-left stack) with a bullet-style container using Mantine `List` or `Group` + `Text`, reusing the existing `DishListItem` for each dish. Keep `DishLink` as the `renderDish` implementation.

**Verification:**
- On mobile List view, confirm meal cards show name, description, every dish, recipe/external links, book references, and multi-line notes.
- Tapping a dish link navigates correctly; tapping the card itself does nothing.
- Confirm there are no drag handles.

## Step 5: Add add-meal affordances

**Problem to solve:** Cooks need a way to add meals from the mobile list view.

**Suggested Approach:**
- **Day-header button:** Extend `MobileDayRow` to accept an `onAddMeal` callback. Render a 28px Mantine `ActionIcon` inside a wrapper that guarantees a ≥44 px touch target. Generate the accessible name from the full date (e.g., `Add meal for ${date.toFormat('MMMM d, yyyy')}`). Only render the button when `onAddMeal` is provided.
- **Floating button:** Reuse the month view’s `MobileAddMealButton`, passing today’s date as its target so it prefills today rather than the month view’s selected day.
- **Modal wiring:** Keep modal state in `MobileMealListView`. Reuse `AddMealFormModalWrapper` inside a Mantine `Modal`. When a day header or the FAB triggers `onAddMeal`, store the date and open the modal. Pass `onMealAdded` from `MealListView` to refresh calendar data and close the modal on success.

**Verification:**
- Each day header has a visible plus button.
- The floating ember plus button appears bottom-right.
- Tapping either button opens the Add Meal modal with the correct date prefilled.
- Submitting the form adds the meal and it appears in the list.
- Scrolling to the bottom shows the last card is not covered by the floating button.

> ⚠️ **Check Drift 2026-09-25:** The modal wiring above describes code that no longer exists, and this step needs re-review before implementation:
> - `AddMealFormModalWrapper` and `onMealAdded` no longer exist. Add Meal now opens through `CalendarModalProvider` / `useCalendarModal` (`src/app/[planner]/calendar/_components/CalendarModal/`), the pattern [[Modal Form Architecture]] standardizes. Mobile list should open the modal the same way rather than keeping its own modal state.
> - Refreshing via `onMealAdded` conflicts with [[Calendar and Recipes Data Refresh]], which moves invalidation to the server and removes `router.refresh()`. This step should be built after that story lands.

## Step 6: Read-only gating and accessibility polish

**Problem to solve:** Read-only users must not see add affordances, and the view must meet accessibility requirements.

**Suggested Approach:** This is largely a matter of applying the existing permissions hook and design tokens correctly:
- Use `useCanWrite` in `MobileMealListView`. When false, do not render the FAB and do not pass `onAddMeal` into `MobileDayRow`.
- Ensure today sections expose the full date in an `aria-label` or `aria-current="date"` attribute.
- Verify the 28 px day-header add button sits inside a 44 px touch target wrapper.
- Confirm contrast and color roles are enforced by theme tokens: primary content in `navy`, muted `navy.4` only for decorative/redundant labels.

**Verification:**
- Log in as a read-only user and confirm no plus buttons appear anywhere.
- Confirm dish notes are never truncated and primary content is readable.
- Inspect that add-button hit areas are comfortable on touch (≥44 px).
- Verify today’s section is labelled/announced with today’s date.
