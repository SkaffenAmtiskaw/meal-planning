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
| [[Unified Date Picker Component]] | spec | the picker used by Move to, Duplicate and the edit-mode date field | - |
| [[Add Meal Changes (Saved Recipes)]] | ready | the Add Meal layout that edit mode reuses | - |
| [[Meal Detail Modal & Edit Meals]] | spec | desktop read view, inline notes, Move to / Duplicate, edit mode, delete. Phone version not designed. | [[Unified Date Picker Component]] |
| Mobile agenda card actions (Deferred Work below) | not a story yet | Edit / Move to… buttons on mobile month agenda cards | open decisions 1, 2 and 9 below |
| [[Mobile List View]] | ready | none - cards have no actions | - |
| [[DND]] | idea | move between days and reorder within a day, desktop only | - |

**Related, not child stories:**
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
1. [[Unified Date Picker Component]]
2. [[Add Meal Changes (Saved Recipes)]] - so edit mode is not built on the old Add Meal layout (not stated in either note; see open decision 7)
3. [[Meal Detail Modal & Edit Meals]]
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
8. **Reorder on mobile.** Is reordering meals within a day needed on phones at all?
9. **Disabled stubs.** Should the mobile agenda's Edit / Move to… buttons ship as disabled stubs before the edit flow exists (the original Step 8 plan), or wait until they can be wired up?

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
