---
type: hub
reviewed: 2026-09-25
---
# Purpose
Meal editing (edit, move, duplicate, delete, reorder) is spread across several stories, and was designed mostly around the desktop meal detail modal. Views without that modal - desktop list, mobile month, mobile list - were each deferred to "a future story", so most view × device combinations have no plan.

This note is the single place to see what is planned where, what is missing, and which decisions are still open. It is not a story and is not implemented directly.

## Meta-Instructions
Before planning or implementing any story linked from this note, read this note first. If a child story conflicts with a decision recorded here, or depends on a question that is still open, stop and ask the user.

# Coverage Today

| | Desktop month / week | Desktop list | Mobile month | Mobile list |
|---|---|---|---|---|
| **View meal details** | click opens meal detail modal | on the card (no modal - Step 13 of [[Replace Schedule-X]] was dropped) | on the agenda card | on the card (not a modal trigger) |
| **Edit meal** | [[Meal Detail Modal & Edit Meals]] edit mode | ❓ | **Edit** card button - designed, not built (see Deferred Work) | ❓ |
| **Edit dish notes** | [[Meal Detail Modal & Edit Meals]] inline edit | ❓ | ❓ | ❓ |
| **Move to another day** | modal **Move to…** + [[DND]] | [[DND]] (drag handle is rendered but not functional yet) | **Move to…** card button + Undo toast - designed, not built (see Deferred Work) | ❓ - drag is explicitly out of scope in [[Mobile List View]] |
| **Duplicate** | modal **Duplicate…** | ❓ | design says "Duplicate lives in the meal detail" - no mobile meal detail exists yet | ❓ |
| **Delete** | modal edit mode | ❓ | ❓ | ❓ - tracked below, no design |
| **Reorder within a day** | [[DND]] | [[DND]] | ❓ | ❓ |

❓ = no note plans this combination.

# Child Stories

| Story | Status | Meal editing scope | Blocked by |
|---|---|---|---|
| [[Header Date Picker]] | spec | the shared picker, its popover and bottom sheet, and meal dots, which Move to and Duplicate open | [[Mantine Date Picker Setup]], [[Today and Selected Day Markers]] |
| [[Meal Form Date Picker]] | spec | the meal form Date field that edit mode reuses | [[Header Date Picker]] |
| [[Add Meal Changes (Saved Recipes)]] | ready | the Add Meal layout that edit mode reuses | [[Stale Data Issues]] |
| [[Meal Detail Modal & Edit Meals]] | spec | desktop read view, inline notes, Move to / Duplicate, edit mode, delete. Phone version not designed. | [[Header Date Picker]], [[Meal Form Date Picker]] |
| Date picker options for Move / Duplicate (Deferred Work below) | not a story yet | the picker's label, relative shortcuts, custom shortcut items and hint, which Move to / Duplicate open | [[Header Date Picker]]; open decision 10 below |
| Mobile agenda card actions (Deferred Work below) | not a story yet | Edit / Move to… buttons on mobile month agenda cards | open decisions 1, 2 and 9 below |
| [[Mobile List View]] | ready | none - cards have no actions | re-review of Steps 2 and 5; [[Stale Data Issues]] |
| [[DND]] | idea | move between days and reorder within a day, desktop only | - |

**Related, not child stories:**
- [[Unified Date Picker Component]] - hub holding the date picker design; split 2026-09-25 into the date picker stories above plus [[Mantine Date Picker Setup]] and [[Today and Selected Day Markers]]
- [[Stale Data Issues]] - edit, move, duplicate and delete are all mutations and should follow its pattern
- [[Modal Form Architecture]] - the meal detail modal is meant to follow its presentation/data split and use `CalendarModalContext`
- [[Keyboard Shortcuts]] - `E` edits and `Delete` deletes the focused meal
- Roadmap: "create a meal with just a title and a description" - changes validation that edit mode shares with Add Meal
- Roadmap: "meal color should be based on hex of title + description" - editing a description would change a meal's color

# Moved from the Roadmap
These were separate Roadmap lines before 2026-09-25. The Roadmap now links to this hub instead. The priority each had there is kept for reference.
- [[Meal Detail Modal & Edit Meals|Edit Meals & Update Meal Detail Modal]] - was High
- delete meals on mobile - was High. Desktop delete is covered by [[Meal Detail Modal & Edit Meals]]; the phone design is not done.
- batch delete meals - was Medium
- [[DND|move meals to different days (drag and drop) & reorder meals within days]] - was Medium

# Build Order Implied by the Notes
*[[Stale Data Issues]] is #1 in the Roadmap's Next queue and blocks [[Add Meal Changes (Saved Recipes)]] (decided 2026-09-25). The date picker stories ([[Unified Date Picker Component]] hub) don't depend on it.*
1. [[Header Date Picker]], then [[Meal Form Date Picker]] (after [[Mantine Date Picker Setup]] and [[Today and Selected Day Markers]]; see the [[Unified Date Picker Component]] hub)
2. [[Add Meal Changes (Saved Recipes)]] - after [[Stale Data Issues]] - so edit mode is not built on the old Add Meal layout (not stated in either note; see open decision 7)
3. [[Meal Detail Modal & Edit Meals]]. The date picker options for Move / Duplicate come before it or with it (open decision 10).
4. Wiring the mobile card actions (currently Step 8 stubs) to the edit flow

# Open Decisions
*These are questions for the user, not proposals. Constraints are noted where existing notes already impose them.*

1. **Editing without a modal.** How does a user edit a meal from desktop list, mobile month and mobile list?
   - Constraint: desktop list deliberately dropped the modal (Step 13), and [[Mobile List View]] says the card is not a modal trigger.
2. **Phone version of the meal detail / edit flow.** [[Meal Detail Modal & Edit Meals]] says the phone design isn't done. Does it follow the Add Meal mobile full-screen variant?
   - Constraint: the mobile agenda design says "Duplicate lives in the meal detail", which implies a mobile meal detail view exists.
3. **Mobile card actions.** Mobile month agenda cards get **Edit + Move to…** (user decision; design option 2a, see Deferred Work). Should [[Mobile List View]] cards match? They currently have no actions.
4. **Moving meals on mobile.** Drag is out of scope on touch. Is **Move to…** with the date picker's bottom sheet the only way?
5. **Delete outside the desktop modal.** Where does delete live on mobile and in desktop list?
6. **Inline note editing.** Desktop modal only, or anywhere a note is shown?
7. **Build order.** Should [[Add Meal Changes (Saved Recipes)]] land before edit mode? Should [[Stale Data Issues]] land before any new meal mutations?
   - Partly answered 2026-09-25: [[Stale Data Issues]] is first in the Next queue, and [[Add Meal Changes (Saved Recipes)]] and [[Mobile List View]] are blocked on it. Whether edit mode waits for Add Meal Changes is still open.
8. **Reorder on mobile.** Is reordering meals within a day needed on phones at all?
9. **Disabled stubs.** Should the mobile agenda's Edit / Move to… buttons ship as disabled stubs before the edit flow exists (the original Step 8 plan), or wait until they can be wired up?
10. **Date picker options for Move / Duplicate.** The picker's `label`, relative shortcuts, custom `shortcutItems` and `hint` were never built. They moved here from [[Unified Date Picker Component]] when it was split (see Deferred Work). Should they be their own story, or part of [[Meal Detail Modal & Edit Meals]]?
    - Constraint: only Move to / Duplicate uses them. As a separate story, they'd need a temporary demo page to be checked in the app.
    - No placement uses `shortcutItems` ("override, if ever needed"). Decide whether to build it at all.

# Deferred Work
Unfinished pieces moved here from stories that are otherwise done. Each keeps its full design references so whoever builds it does not have to go back to the archived note.

## Mobile agenda card actions
*Moved from [[Mobile Month View]] Step 8 on 2026-09-25. The rest of that story is done.*

![[agenda_view_updated_meal_card.png]]

### Design
- Chosen layout is option **2a: "Edit + Move to (Duplicate lives in the meal detail)"**. The original handoff had **Edit + Add dish**; the user changed **Add dish** to **Move to…**.
- Two pill buttons at the bottom of each meal card in the mobile month view's selected-day agenda: **Edit** and **Move to…**. They replace desktop's hover affordances, since there is no hover on touch.
- After a move, a dark toast confirms it with an **Undo** action ("Moved to Fri, Sep 11 · Undo"). This matches the desktop Move to toast in [[Meal Detail Modal & Edit Meals]] (`03-moved-with-undo.png`).
- Tapping the card itself does **not** open a modal. Everything is already on screen; editing happens through the buttons.
- Read-only users (no write permission) see no Edit / Move to… buttons.
- Touch targets ≥ 44px, including these buttons.
- The interactive prototype for the surrounding screen is `Mobile Month View.dc.html`, embedded at the top of [[Mobile Month View]].

### Original Step 8 (not started)
**What we're doing:** Adding the stub actions to the meal card. The "Add Dish" button from the original design has been changed (as per user instruction) to be "Move to..."

**Acceptance Criteria**
- [ ] Each meal card has disabled **Edit** and **Move to...** pill buttons.

**Architectural plan:**
- [ ] Use the pre-existing PillButton component.

### Implementation context
- The base `MealCard` (`src/_components/Calendar/MealCard/MealCard.tsx`) already takes `renderActions` for these buttons.
- `PillButton` is in `src/_components/PillButton/`.
- `MealMonthAgenda` already uses `useCanWrite` to hide write affordances.
- Whether these ship as disabled stubs first is open decision 9.

## Date picker options for Move / Duplicate
*Moved from [[Unified Date Picker Component]] on 2026-09-25, when it was split. Sarah had approved building these early and checking them on a temporary demo page. The demo page was dropped in the split, and the options wait for the placement that uses them. Which story builds them is open decision 10.*

The design lives in [[Unified Date Picker Component]]. The sections embedded below are part of this work.

**Anatomy** (the Label, Shortcuts and Hint rows):
![[Unified Date Picker Component#^anatomy-parts]]

**Shortcut labels (`shortcuts="relative"`):**
![[Unified Date Picker Component#^shortcut-labels]]

![[Unified Date Picker Component#Recommended Configuration]]

![[Unified Date Picker Component#Behavior (all placements)]]

![[Unified Date Picker Component#Phones Bottom Sheet]]

![[Unified Date Picker Component#Planned meal detail Move / Duplicate (not in this change)]]

### Behaviors
From the original story's Suggested Approach, word for word. The demo page it mentions was dropped in the split.

21. `label`, `shortcuts="relative"`, custom `shortcutItems` and `hint` are built now, so Move/Duplicate needs no API changes later. A temporary in-app page exercises them:
    - a label
    - relative shortcuts for a meal dated today, a later day and a past day, with shortcuts that land before today hidden
    - custom shortcut items
    - a hint

    Once Sarah confirms they work, deleting the page is part of the story's cleanup.

From Behavior 13: on phones, the placement's `label` becomes the bottom sheet's title, and the panel doesn't repeat it.

### Pieces
| # | Piece | Job | Decision | Existing code | Why |
|---|---|---|---|---|---|
| 5 | Shortcut cards | Show shortcut cards that each pick their date | Build new | — | |
| 6 | Relative shortcuts | Build the Tomorrow / Next week (or Next day / Week later) shortcuts that land today or later | Build new, next to the picker | — | |

Both live next to the shared picker in `src/_components/CalendarDatePicker/`, which [[Header Date Picker]] builds. The short weekday date style the cards use ("Wed, Sep 30") is added by [[Meal Form Date Picker]].

### Draft steps (reference only)
The original Steps 27-30 (label, hint, shortcut cards, relative shortcuts) are in `.opencode/scratch/Meal Editing - date picker option steps.md`. They were written against the dropped demo page, so re-plan them against Move to / Duplicate.
