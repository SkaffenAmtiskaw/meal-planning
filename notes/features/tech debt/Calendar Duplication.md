---
type: 
status: idea
confirmed: 2026-11-01
---
# Where It Stands
Next: /shape ^status

# Notes
The calendar repeats the same logic in several places. Found by reading code on 2026-11-01:
- **Group meals by date (×4):** `MonthGrid.tsx:52`, `MobileMonthGrid.tsx:48`, `WeekView.tsx:48` (all in `src/_components/Calendar/`) and `ListView.tsx:43` (in `src/app/[planner]/calendar/_components/ListView/`).
- **Meal color:** `MealEventCard.tsx:27-28` and `MealWeekView/WeekMealCard.tsx:26-27` both look up `bg`, `text` and `border` with `TAG_COLORS[getMealColor(event.title)]`. `toCalendarMeals.ts:12` and `MealMonthAgenda.tsx:44` look up only the border the same way.
- **Adapters:** `MealCalendar` and `MealWeekView` are near-identical, and differ mainly in the card they render. Their types, `MonthGridMeal` and `WeekViewMeal`, have the same fields.
- **Keyboard navigation:** `useMonthGridKeyboard` and `useWeekViewKeyboard` copy the same meal navigation. The month hook moved its day focus into `useRovingGridFocus`, and the week hook still has its own.

This stays in the [[Calendar Page]] goal because three stories change this code: [[Meal Color from Name and Description]], [[Calendar Keyboard and Focus]] and [[Planning on the Calendar]]. Merging it first means each of those changes is made once.

# Questions
