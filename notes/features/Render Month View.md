- **Clarification** - meals will be treated as `schedule-x` events - they will need to be rendered differently in each view
- the `schedule-x` grid cells need to have a minimum height - currently if there are no events (meals) they render only the number of the date and the calendar looks strange
- meals should be display in the month view as the title + description only - when the user clicks a meal it should bring up a modal with the details
- if the title or description is too long truncate it with `...` - the user can see the full title/description when clicking the modal
- when the user adds a new meal (in the current month) the calendar should update to display it
- make sure the user can navigate to the event by keyboard
- when mapping meals to schedule-x events, use the meal's `_id` string as the event ID

_Note_: `schedule-x` doc can be found [here](https://schedule-x.dev/docs/calendar)

## Scope

- Map existing `Day[]` planner calendar data → schedule-x events; render them on page load
- After `addMeal` succeeds, add the new event(s) to the calendar live (no refresh needed)
- Clicking a meal event opens a detail modal showing meal name, description, and dishes
- Month grid cells have a minimum height so empty days don't look odd
- Long titles/descriptions are truncated with `...` in the event tile
- Keyboard navigation to events (schedule-x native — verify it works; add tabIndex/onKeyDown to custom event component only if needed)
- Out of scope: editing or removing meals from the calendar view

## Plan

### ✅ Step 1: Render existing meals on page load

- Create `toScheduleXEvents.ts` — maps `DayInterface[]` → schedule-x events (id = meal `_id`, start/end = date, title = meal name; store description + dishes as custom fields)
- Update `CalendarPage` to serialize `planner.calendar` and pass it to `CalendarView`
- Update `CalendarView` to accept a `calendar` prop and initialize `eventsService` with it
- Add minimum cell height CSS + truncation CSS for event tiles

**Verify:** Navigate to the calendar — existing meals appear as events; empty days have reasonable height; long titles are cut off with `...`

### ✅ Step 2: Live-update after adding a meal

- Thread an `onMealAdded(calendar)` callback: `CalendarView` → `AddMealButton` → `AddMealForm`
- In `AddMealForm` success handler, replace the TODO `console.log` with `onMealAdded(data.calendar)`
- In `CalendarView`, diff the new calendar against existing events and call `eventsService.add()` for each new event

**Verify:** Add a meal — it appears on the calendar immediately without refreshing the page

### ✅ Step 3: Meal detail modal

- ✅ Create `MealDetailModal.tsx` — Mantine Modal showing meal name, description, and dishes list
- ✅ Add `onEventClick` to the schedule-x calendar config; store clicked event in state
- ✅ Render `MealDetailModal` when an event is clicked
- ✅ Keyboard navigation works (Tab to event, Enter opens modal)
- ✅ Modal is vertically centered (`centered` prop on Mantine Modal)
- ✅ Dishes with bookmark sources resolve to a clickable link (name + url)
- ✅ Dishes with recipe sources resolve to the recipe name as plain text (no link)
- ✅ Fixed `daySchema` meals subdocument — was accidentally using day-like structure; corrected to `{name, description, dishes}`; was causing Mongoose validation errors on `planner.save()` calls (e.g. `addRecipe`)

**Still needed before Step 3 is complete:**
- ✅ Rework how dish sources are displayed in the modal — dish name is now the link for URL/saved sources; plain-text references (`{ ref }`) appear below the dish name. Model updated: `{ name, url }` replaced by `{ url }` and `{ ref }`; add meal form uses a single "URL or reference" field; `addMeal` auto-detects URL vs plain string.
- ✅ Verify recipes in the modal link to the recipe page — fixed by threading `_id` through the resolved source in `toScheduleXEvents`; modal now links to `/[plannerId]/recipes/[_id]`
- ✅ calendar jumps on page when opening the modal — fixed by memoizing `customComponents` passed to `ScheduleXCalendar`; its internal `useEffect` calls `calendarApp.render()` when the reference changes

**Verify:** Click a meal event — modal opens with full details; dismiss it; Tab to an event and press Enter — modal opens

## Files

| File | Action |
|---|---|
| `calendar/_utils/toScheduleXEvents.ts` | Create |
| `calendar/_utils/toScheduleXEvents.test.ts` | Create |
| `calendar/_components/MealDetailModal.tsx` | Create |
| `calendar/_components/MealDetailModal.test.tsx` | Create |
| `calendar/_components/CalendarView.tsx` | Modify |
| `calendar/_components/CalendarView.test.tsx` | Modify |
| `calendar/_components/AddMealButton.tsx` | Modify |
| `calendar/_components/AddMealButton.test.tsx` | Modify |
| `calendar/_components/AddMealForm.tsx` | Modify |
| `calendar/_components/AddMealForm.test.tsx` | Modify |
| `calendar/page.tsx` | Modify |
| `calendar/page.test.tsx` | Modify |
