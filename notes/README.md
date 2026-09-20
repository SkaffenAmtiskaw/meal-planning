# Handoff: Calendar → **Add Meal** — wider modal, new dish row, mobile sheet

Rework of the existing Add Meal flow. Same data, same fields, same submit behavior — the problem
is the shape of the form, not what it collects.

## What's wrong today
- The modal is narrow, so every field is a full-width stack and the form is taller than the
  viewport the moment a second dish exists. Adding three dishes means scrolling past the meal
  fields you already filled in to reach the button that adds the next one.
- Each dish is a tall fieldset that is **always fully expanded**, even for the common case —
  a dish that is just a name. Three fields and a segmented control are on screen for
  "Rice Pilaf".
- "Add note" / "Remove note" is a button that destroys typed content when clicked a second time.
- "Reference" as a segmented label doesn't say what it is versus "Saved".
- There is no mobile treatment at all — the same modal narrows until it's unusable.

## The change, in three parts

### 1. The modal gets wider and splits in two
Two panes side by side instead of one column:

- **Left (fixed, ~a third of the width):** the meal itself — Date, Meal name, Description.
  Tinted a step off white so it reads as a separate, settled group. It does not scroll.
- **Right (fills the rest):** Dishes. This is the only part that scrolls, and it scrolls
  independently — the meal fields stay put no matter how many dishes are added.

Header (title + the date in words) and footer (dish count, Cancel, Add Meal) are pinned. The
primary action is always visible; it never scrolls away. Target the modal at the large end of the
available sizes — roughly the width where two panes read comfortably, not the current narrow one.

**Meal name is a plain free-text field.** An earlier draft offered quick-pick chips
("Dinner", "Lunch"); they're gone — people name meals things like "Thai night".

### 2. The dish row collapses by default
A dish is one line unless you ask for more. The row is:

`[ dish name ] [ source chip ] [ note chip ] [ collapse chevron ] [ delete ]`

**Source chip** — dashed outline reading "Add source" when empty. Once set, solid outline showing
the source itself, preceded by a small dot:
- **filled dot** — the dish points at something saved in the app (a recipe or a bookmark). Saved
  items show their own name; the dot alone carries "this is saved" — don't append "(recipe)" or
  "(bookmark)".
- **hollow ring** — a reference: a URL, or a book and page.

**Note chip** — dashed "Add note" when empty, solid "Note" when set, with the note text on a
second line beneath the row (one line, ellipsis if long).

**Expanding.** Clicking either chip, or the chevron, expands the row **in place** — the list
doesn't jump and nothing else moves. Expanded, the row shows two columns: Source on the left
(segmented control + the field for the chosen type + one line of explanatory text), Note on the
right. Clicking the chevron, or the chip you opened it with, collapses it again. The chevron
points down when collapsed, up when expanded — that's the collapse affordance, and it must be
present; an expanded row with no visible way to close it is the thing to avoid.

**Add dish** exists twice: a button in the Dishes header, and a dashed "Add another dish" row at
the end of the list, so it's reachable whether you're at the top or the bottom.

### 3. Source: three options, said plainly
`None` · `Saved` · `Reference` — and each one carries a line of explanation under its field,
because the distinction is not self-evident:

| Option | Field | Explanatory line |
|---|---|---|
| None | — | "Just a dish name — no recipe attached." |
| Saved | searchable picker over the planner's saved recipes and bookmarks | "Search your saved recipes and bookmarks." |
| Reference | free text | "A URL, or a book and page — “Dinner in French, p. 88”." |

Keep the word **Reference** — it covers both a URL and a non-URL citation, which "Link" doesn't.
Those three helper lines are load-bearing copy; keep them.

**Note** is not a source option — it's an independent field available in every expanded row,
always a textarea, never a button that deletes what you typed.

### Long source values
A source can be a very long URL. The chip strips the protocol, holds to a single line, and
truncates with an ellipsis — the row never grows or wraps. The full string is available on hover
and always shown in full in the expanded field. Never wrap a chip onto a second line.

## Mobile
Below the desktop breakpoint the modal becomes a **full-screen sheet**, not a shrunken dialog:

- Sticky top bar: Cancel · "Add Meal" · (balanced spacer). Sticky bottom bar with the primary
  Add Meal button and the dish count beneath it.
- Meal fields sit in one card, dishes as one card each — one column, no side-by-side panes.
- Same dish row, restacked: name on its own line, the two chips and chevron on the line below it
  so all three stay tappable.
- Expanded rows stack Source above Note.
- **Touch targets:** the segmented control, source picker and inputs go to a comfortable touch
  height (~46px), chips and the chevron no smaller than 38px, delete 44px. Input text at 16px
  so mobile browsers don't zoom on focus.

## Non-negotiables
Everything above is design intent, and most of it can bend to what the component library gives
you. These four are the reasons for the change:

1. **The meal fields do not scroll with the dishes.** Independent scroll areas, pinned footer.
2. **A dish with nothing attached is one line.** Collapsed by default; expansion is opt-in.
3. **Every expanded row has a visible way to collapse it.**
4. **Interactive labels and helper copy clear 4.5:1 contrast.** The pale navy used for decorative
   labels is too light for chip labels, inactive segmented options, and the explanatory lines —
   those take forest green or a darker navy. Never the lightest ramp step.

## Implementation priority — Mantine first, pixels second
**Use Mantine components, props and theme tokens. That matters more than matching this design
pixel for pixel.** The prototype's spacing, radii and hex values are intent, not a contract.

Where Mantine has the thing — `Modal` sizing and `fullScreen`, `Grid`/`Group`/`Stack`,
`SegmentedControl`, `Select` with `searchable`, `Badge`/`Chip` for the source and note chips,
`ActionIcon` for chevron and delete, `Collapse` for the expanding panel, `Textarea`, `Card`,
`Fieldset`, the `useMediaQuery` breakpoint hook — **take the Mantine version**, and take theme
tokens (`forest`, `navy`, `ember`, `chalk`) over hex literals. A chip built from a Mantine
component that sits 2px off the prototype is the correct outcome; a pixel-exact one hand-built
from inline styles is not. Reach for a CSS module only where props can't express it
(truncation rules, independent scroll panes, the dashed empty-chip outline).

If a Mantine pattern conflicts with a layout detail here, follow Mantine — except for the four
non-negotiables above, which are the point of the work.

The prototype is a look-and-behavior reference built outside the app. Don't port its markup,
inline styles, or fixture data.

## Files
- `screenshots/add-meal-desktop.png` — the modal, one dish expanded
- `screenshots/dish-row-states.png` — every dish-row state: empty, saved, reference + note, the
  three expanded variants, and a very long reference truncating
- `screenshots/add-meal-mobile.png` — the mobile sheet
- `Add Meal Modal.dc.html` — full interactive prototype (open in a browser; add, remove, expand
  and collapse dishes, switch source types)
- Repo files this touches:
  - `src/app/[planner]/calendar/_components/AddMealForm/AddMealForm.tsx` — two-pane layout,
    pinned header/footer, meal fields
  - `src/app/[planner]/calendar/_components/AddMealForm/DishRow.tsx` — collapsed/expanded row,
    chips, chevron, source options
  - `src/app/[planner]/calendar/_components/AddMealForm/useDishes.ts` — per-row expanded state;
    the note is no longer toggled on and off
  - `src/app/[planner]/calendar/_components/AddMealButton/AddMealButton.tsx` and
    `MealListView/MealListView.tsx` — modal size, and full-screen on mobile
  - `src/_theme/theme.ts`, `src/_theme/colors.ts` — existing tokens; the segmented-control label
    color is already set here

No data-model change: the fields collected are exactly the ones the form collects today.

Follow the repo conventions in `AGENTS.md` / `CLAUDE.md`: colocated Vitest tests, Biome
formatting, CSS modules for anything not expressible with Mantine props. Worth covering in tests:
a row collapses and re-expands without losing typed values, switching source type doesn't clear
the note, and a long reference doesn't break the row layout.
