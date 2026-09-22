![[support 2.js]]

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

1. **The meal fields do not scroll with the dishes (on desktop).** Independent scroll areas, pinned footer.
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


![[Add Meal Modal.dc.html]]![[dish-row-states.png]]

![[add-meal-mobile.png]]

![[add-meal-desktop.png]]![[weeknight-header-dark 2.svg]]

# Suggested Approach

## Architecture summary

The modal shell, not the form, owns the dialog. `AddMealFormModalWrapper` becomes the single component that renders the Mantine `Modal`, sets `title`, `size`, `fullScreen`, and header/footer layout. `AddMealForm` remains a plain form that creates a meal and knows nothing about the modal.

`AddMealButton` renders `AddMealFormModalWrapper` with a `trigger` render prop. `MealListView` uses a new `useAddMealModal` hook to manage `opened` / selected date, passes a `renderEmptyDay` render prop to `ListView`, and renders one controlled `AddMealFormModalWrapper`.

`ListView` is refactored from an `onAddMeal` callback to a `renderEmptyDay` render prop so the caller owns the add-meal trigger UI. `ControlledModal` is deleted because it is only used by `AddMealButton` and the new wrapper replaces it.

`plannerId` is read from `useParams` inside `AddMealFormModalWrapper` instead of being passed down through layers.

## Enumerated behaviors

1. Open the Add Meal modal from the calendar header or from a date in the list view; render it as a large dialog on desktop and a full-screen sheet on mobile.
2. Display and edit the meal fields (Date, Meal name, Description); validate that Date and Meal name are required before submit.
3. Add a dish via the Dishes header button or the “Add another dish” row, and remove a dish row; hide the remove button when only one dish remains.
4. Display each dish as a single collapsed row containing the dish name, source chip, note chip, expand chevron, and optional remove button.
5. Expand a dish row by clicking the chevron or either chip; collapse it the same way; preserve all typed values across expand/collapse.
6. Select a dish source type (None / Saved / Reference); show the matching input and explanatory helper line, and preserve the dish note across source-type changes.
7. When source type is Saved, select a recipe or bookmark from the planner’s saved items; the source chip shows the selected item’s name with a filled dot.
8. When source type is Reference, enter free-text reference text; the source chip shows the stripped/truncated reference with a hollow ring, and the full value remains in the expanded input.
9. Enter a dish note; the note chip shows “Note” when set, and the note text appears truncated below the row.
10. Submit the form; validate, call `addMeal`, close the modal and refresh the calendar on success, or show an error alert on failure.
11. Cancel or close the modal without saving.

## Decision log

| Behavior                           | Component / piece                                | Decision          | Rationale                                                                                                |
| ---------------------------------- | ------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------- |
| 1. Open modal from header          | `AddMealButton`                                  | REUSE WITH REWORK | Becomes a thin wrapper that renders `AddMealFormModalWrapper` with a button `trigger`.                   |
| 1. Open modal from list view       | `MealListView`                                   | REUSE WITH REWORK | Stops setting modal props; uses `useAddMealModal` and passes `renderEmptyDay` to `ListView`.             |
| 1. Open modal (list trigger)       | `ListView` / `DayRow` / `ListViewAddMealTrigger` | REUSE WITH REWORK | Replace `onAddMeal` callback with `renderEmptyDay` render prop so the caller controls the trigger UI.    |
| 1. Open modal state                | `useAddMealModal`                                | BUILD NEW         | No existing hook owns open/close + selected date for this modal.                                         |
| 1. Open modal shell                | `AddMealFormModalWrapper`                        | REUSE WITH REWORK | Becomes the modal wrapper: owns `title`, `size`, `fullScreen`, header/footer, and renders `AddMealForm`. |
| 1. Open modal                      | `ControlledModal`                                | DELETE            | Only used by `AddMealButton`; replaced by `AddMealFormModalWrapper`.                                     |
| 1. Open modal breakpoint           | `useIsMobile`                                    | REUSE AS-IS       | Used inside `AddMealFormModalWrapper`.                                                                   |
| 1. Open modal planner ID           | `useParams` inside wrapper                       | REUSE AS-IS       | Removes `plannerId` prop drilling.                                                                       |
| 2. Meal fields display/validation  | `AddMealForm`                                    | REUSE WITH REWORK | Keeps form state, validation, and submit logic; needs major layout reshape and subcomponents.            |
| 2. Meal fields display/validation  | `MealFields` (new)                               | BUILD NEW         | No existing component isolates the meal-field markup.                                                    |
| 2. Meal fields display/validation  | `DishList` (new)                                 | BUILD NEW         | No existing component isolates the dish-list markup.                                                     |
| 3. Add/remove dishes               | `useDishes`                                      | REUSE WITH REWORK | Keeps array management; renames `noteExpanded` → `expanded` and stops clearing the note on collapse.     |
| 4. Display collapsed dish row      | `DishRow`                                        | REUSE WITH REWORK | File exists, but the collapsed one-line chip UI is a full rewrite of the presentation layer.             |
| 5. Expand/collapse dish row        | `useDishes`                                      | REUSE WITH REWORK | The per-row boolean state is reused; semantics change from note-only to row-expanded.                    |
| 5. Expand/collapse dish row        | `DishRow`                                        | REUSE WITH REWORK | Existing row has no expand/collapse UI; toggle and chevron are added.                                    |
| 6. Select source type              | `DishRow`                                        | REUSE WITH REWORK | `SegmentedControl` stays, but labels become None/Saved/Reference and helper copy is added.               |
| 7. Select saved item               | `DishRow`                                        | REUSE WITH REWORK | Searchable `Select` and `usePlannerSavedItems` stay; selected name now feeds the source chip.            |
| 7. Select saved item               | `usePlannerSavedItems`                           | REUSE AS-IS       | Data mapping is unchanged.                                                                               |
| 8. Reference text / truncated chip | `DishRow`                                        | REUSE WITH REWORK | Reference input stays; new source chip display and truncation logic added.                               |
| 8. Reference text / truncated chip | source-chip formatting utility                   | BUILD NEW         | Protocol stripping/ellipsis is pure text formatting with no existing equivalent.                         |
| 9. Dish note / note chip           | `DishRow`                                        | REUSE WITH REWORK | Note textarea stays; destructive toggle is removed and note chip is added.                               |
| 10. Submit form and handle result  | `AddMealForm`                                    | REUSE AS-IS       | The `useForm` / `useFormFeedback` / `addMeal` / `onSuccess` flow is unchanged.                           |
| 10. Submit form and handle result  | `SubmitButton`, `FormFeedbackAlert`              | REUSE AS-IS       | Already used as-is.                                                                                      |
| 11. Cancel/close modal             | `AddMealForm` `onCancel`                         | REUSE AS-IS       | Existing close callback is unchanged.                                                                    |
| 11. Cancel/close modal             | `AddMealFormModalWrapper`                        | REUSE WITH REWORK | Owns the close affordance in the modal shell.                                                            |

# Implementation

## Phase 1 — Refactors (no visible UX change)

### Step 1 — Move the modal shell into `AddMealFormModalWrapper` and update callers

Refactor `AddMealFormModalWrapper` so it renders the Mantine `Modal` and owns `title`, `size`, and the close behavior. Keep the current `size="lg"` and no `fullScreen` for now; the new sizing comes later. Support two usage modes:
- `trigger` render prop for `AddMealButton`.
- Controlled `opened` / `onClose` props for `MealListView`.

Read `plannerId` from `useParams` inside the wrapper so callers stop passing it. Update `AddMealButton` to render the wrapper with its button trigger, and update `MealListView` to render the wrapper in controlled mode (still using the existing `ListView` `onAddMeal` callback for now). Delete `ControlledModal` and its tests.

**Acceptance:**
- Run the app and click the header “Add Meal” button; the modal opens with no nested dialogs.
- Click a list-view “add meal” trigger; the modal opens with no nested dialogs.
- Submit a meal from each entry point; the meal is created and appears on the calendar.
- The modal otherwise looks and behaves exactly as it does today.


**Revised implementation (as built)**

The original plan called for a dual-mode `AddMealFormModalWrapper` (trigger render prop + controlled `opened`/`onClose`). During review this proved awkward: the wrapper duplicated the modal/form shell and created unused `useDisclosure` state in controlled mode. The implementation was changed to a calendar-level modal manager instead.

What was built:

- **`CalendarModalProvider`** and **`useCalendarModal`** replace `AddMealFormModalWrapper`.
- The provider owns a single active modal state using a discriminated union:
  - `{ type: null; data: null }` when closed.
  - `{ type: 'add_meal'; data: { initialDate?: string } }` when the Add Meal modal is open.
- Type values use `snake_case` (`add_meal`) so future types like `meal_detail` and `edit_meal` fit the same pattern.
- A single generic callback opens any modal: `open(type, data)`.
- The Mantine `Modal` is rendered by the provider whenever `state.type !== null`; its title comes from a `MODAL_TITLES` map and its content from a `MODAL_CONTENT` type-to-component map.
- `CalendarView` wraps `CalendarViewContent` with `<CalendarModalProvider plannerId={plannerId}>`.
- `AddMealButton` calls `open('add_meal', {})`.
- `MealListView` calls `open('add_meal', { initialDate })` from the existing `ListView` `onAddMeal` callback.
- `AddMealFormModalWrapper` and `ControlledModal` were deleted.

This keeps Step 1 behaviorally identical (header button and list-view triggers both open the same Add Meal modal) while giving the calendar a single place to manage all modals and preventing stacked modals later.


**Status:** ✅ Complete

### Step 2 — Refactor `ListView` to `renderEmptyDay` and extract `useAddMealModal`

Replace `ListView`’s `onAddMeal` prop with `renderEmptyDay?: (date: DateTime) => ReactNode`. Update `DayRow` and `ListViewAddMealTrigger` to render the provided node. Create `useAddMealModal` to manage `opened`, `dateForAdd`, `open(date)`, and `close`. Update `MealListView` to use the hook and pass `renderEmptyDay` that calls `open(date)`.

**Acceptance:**
- In the list view, click add-meal triggers on multiple days; the modal opens with the correct date pre-filled.
- The header button still opens the modal.
- The list view otherwise looks and behaves exactly as it does today.

**Status:** ✅ Complete

**As built:**
- Because Step 1 was implemented as `CalendarModalProvider` rather than `AddMealFormModalWrapper`, the `useAddMealModal` hook and `renderEmptyDay` render prop were unnecessary.
- The entire list view was moved from `src/_components/Calendar/ListView/` to `src/app/[planner]/calendar/_components/ListView/` so it can depend on app-specific context without violating the generic `_components/Calendar` boundary.
- `DayRow` now consumes `useCanWrite()` and `useCalendarModal()` directly. It shows/hides the gutter and ghost add-meal triggers based on write access and opens `add_meal` with the day's ISO date on click.
- `ListView` and `MealListView` no longer pass an `onAddMeal` callback. `MealListView` only maps calendar data to events and provides `renderDish`.
- The list view's visual behavior is unchanged.

> **Optional commit point:** After Step 2, the old code is in a clean state. Consider committing here with a message like `refactor: consolidate Add Meal modal shell and ListView trigger API` before starting the UX redesign.

## Phase 2 — New UX

### Step 3 — Apply the new modal sizing and mobile full-screen treatment

Update `AddMealFormModalWrapper` to use a larger desktop size and `fullScreen={isMobile}`. Adjust radius/transition props for the mobile sheet if needed. Keep the default Mantine Modal header/footer for now; the pinned custom header/footer layout is handled in Step 4.

**Acceptance:**
- At desktop width, open the modal and verify it is wide enough for the two-pane layout.
- Shrink to mobile width and verify it becomes a full-screen sheet.

**Status:** ✅ Complete

**As built:**
- `AddMealFormModalWrapper` was deleted in Steps 1–2; the modal shell now lives in `CalendarModalProvider`.
- The desktop width is controlled by the Mantine theme: `src/_theme/theme.ts` sets `--modal-size-xl: 80%`, and `CalendarModalProvider` uses `size="xl"`.
- Mobile still uses `fullScreen={isMobile}` with `radius={0}` and a `fade` transition (`duration: 200`).

### Step 4 — Reshape `AddMealForm` layout

Restructure `AddMealForm` into the new layout: desktop two-pane (fixed left meal pane, scrollable right dishes pane), mobile single-column cards. Add `MealFields` and `DishList` subcomponents. Pin the header and footer so the primary “Add Meal” button and dish count are always visible. Add the “Add another dish” row at the end of the list.

**Acceptance:**
- Open the modal with several dishes added.
- On desktop, scroll the dishes pane and verify the meal pane stays fixed and the footer remains visible.
- On mobile, verify the layout stacks into cards and the primary action remains accessible.

**Status:** ✅ Complete

**As built so far:**
- Added `MealFields` subcomponent (`MealFields.tsx` + test) that renders the tinted meal card with Date, Meal name, and Description.
- Added `DishList` subcomponent (`DishList.tsx` + test) that renders the DISHES header with count and Add dish button, the list of `DishRow`s, and the "Add another dish" row at the bottom.
- Reshaped `AddMealForm` to use a two-pane desktop layout (Grid 4/8 split with `ScrollArea` for dishes) and a stacked mobile layout, with a pinned footer containing dish count, Cancel, and Add Meal.
- Added a date subtitle showing the date in words plus the current meal name (e.g., "Thursday, September 10 · Thai night").
- Added `AddMealForm.module.css` with justification comments for the flex/scroll layout rules that Mantine props cannot express.
- `DishRow` and `useDishes` were intentionally not changed in this step; expand/collapse work is Step 5.

**As built:**
- During verification the modal shell was refactored to Mantine compound components (`Modal.Root`, `Modal.Header`, `Modal.Body`, `Modal.Content`) inside `CalendarModalProvider`, with a custom header rendered by `AddMealModalContent` and the subtitle pushed up from `AddMealForm` via `onSubtitleChange`.
- The desktop modal was made to render at a static full height (`calc(100dvh - var(--modal-y-offset) * 2)`) so it does not shrink when only one empty dish is present; mobile full-screen behavior is preserved via `:not([data-full-screen])`.

**As built (review pass):**

A post-implementation review reworked several pieces. Behavior is unchanged except where noted:

- The header subtitle now updates live while typing. `AddMealForm` computes it in `useForm`'s `onValuesChange` callback (plus a mount-only initial push) instead of reading `form.values` during render — in uncontrolled mode those reads never trigger a re-render, so the subtitle previously only refreshed on unrelated state changes. The centralized `@mocks/@mantine/form` mock now honors `onValuesChange`; the inline controlled-mode mock that masked the bug is gone.
- `AddMealModalContent` was extracted from `CalendarModalProvider` into `AddMealForm/AddMealModal.tsx` as `AddMealModal`, which owns its `Modal.Content`/`Modal.Header`/`Modal.Body` and the subtitle state. The provider is now a pure shell (context, `Modal.Root` + `Modal.Overlay`, content-type map) with no AddMeal-specific styling; the full-height rule moved to `AddMealModal.module.css` and sets Mantine's `--modal-content-height` variable instead of overriding `height`, which drops the `:not([data-full-screen])` guard (Mantine's own full-screen rule wins on specificity). The AddMeal-specific provider tests moved to `AddMealModal.test.tsx`.
- The desktop two-pane layout is Mantine `Flex`, not `Grid` — the Grid version required three `:global()` overrides of Mantine's internal Grid classes. The left pane is `flex="0 0 33.333%"` with `direction="column"` plus a grow-only `> *` rule, so the tinted meal card fills the pane's full width and height (the prototype's full-height tinted column); the right pane takes `miw={0}` (the design's `minmax(0, 1fr)`) so dish content can never squeeze the meal column.
- The footer's `position: sticky`/`z-index`/background CSS was deleted — inert residue from an earlier iteration where the footer lived inside the scroll area. Pinning comes from flex layout (`flex-shrink: 0` sibling after the `flex: 1` content).
- Test cleanup: `MealFields.test.tsx` is a single render test; `AddMealForm.test.tsx` uses a static `DishList` placeholder with captured-prop assertions and renders the real `MealFields`; the shared `makeDish` fixture lives in `test/fixtures/dish.ts` behind a new `@fixtures` alias (added to `tsconfig.json` and `vitest.config.ts`).
- `MealFields` dropped its unneeded `'use client'` directive and its local `MealFormValues` duplicate — the shared type lives in `types.d.ts` and `useForm<MealFormValues>` turns field drift into a compile error. `DishList` lost an inert `Box` wrapper.
- Deferred to Step 5 (pre-existing, not introduced by this step): the remove-dish trash icon is bottom-aligned with the dish-name input in the expanded `DishRow`; Step 5's collapsed one-line row replaces that markup.
- Verified after the pass: full suite green (1,667 tests, 100% coverage), Biome clean, independent dish-pane scroll confirmed working in the running app.

#### Mobile scroll regression and fix

After Step 4 shipped, resizing an open Add Meal modal from desktop to mobile left the mobile sheet unscrollable: no scrollbar appeared and the dish list was simply cut off. This only affected the mobile layout; desktop two-pane scrolling continued to work.

**Root cause.** The mobile branch rendered `MealFields` and `DishList` inside a `Stack` with the `.contentMobile` class (`flex: 1; min-height: 0; overflow: auto`). `DishList` is itself wrapped in a Mantine `Card`, which has `overflow: hidden` by default. Once the Card was taller than the available viewport it clipped its own content instead of overflowing the parent, so `.contentMobile` had nothing to scroll.

**Fix.** Replaced the mobile `Stack`/`.contentMobile` with a Mantine `ScrollArea` (reusing the existing `.scrollArea` flex rule from the desktop right pane) wrapping the same stacked cards. The `ScrollArea` fills the remaining height between the modal header and footer and owns its own viewport, so the tall dish content is reachable on mobile without affecting the desktop layout. The unused `.contentMobile` rule was removed and a regression test was added to `AddMealForm.test.tsx` verifying that the mobile layout renders a `ScrollArea` containing both `MealFields` and `DishList`.

- Files touched: `AddMealForm.tsx`, `AddMealForm.module.css`, `AddMealForm.test.tsx`.

### Step 5 — Add DishRow expand/collapse state and shell

Rename `noteExpanded` to `expanded` and remove the logic that clears the note when collapsing. Rewrite `DishRow` to show a collapsed one-line row with dish name, chevron, and remove button. Expanding reveals the existing Source column and Note textarea. Do not add the source/note chips yet.

**Acceptance:**
- In the running app, add a dish and enter a note.
- Collapse the row and re-expand it; the note is still present.
- Switch source types; the note is still present.
- The chevron toggles expand/collapse.

### Step 6 — Add the source chip with reference truncation

Add the source chip to the collapsed `DishRow`. It reads from the existing source state: dashed “Add source” when empty, saved item name with a filled dot when Saved, and stripped/truncated reference with a hollow ring when Reference. Add the small utility for protocol stripping and ellipsis.

**Acceptance:**
- Add dishes with no source, a saved source, and a reference source.
- Each source chip renders in the collapsed row: dashed “Add source” when empty, saved item name with a filled dot when Saved, truncated reference with a hollow ring when Reference.
- A very long reference URL displays as a single-line chip with an ellipsis.

### Step 7 — Add the note chip

Add the note chip to the collapsed `DishRow`. It reads from the existing note state: dashed “Add note” when empty, solid “Note” when set, with the note text truncated below the row.

**Acceptance:**
- Add a dish without a note and verify the chip reads “Add note”.
- Add a note and verify the chip reads “Note” with the text displayed below the row.
- Enter a long note and verify the text truncates instead of breaking the row layout.