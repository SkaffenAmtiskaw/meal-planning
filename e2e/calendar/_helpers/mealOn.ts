import type { DateTime } from 'luxon';

// A calendar holding one meal with no dishes on the date, for openPlannerCalendar's calendar override.
export const mealOn = (date: DateTime<true>, name: string) => [
	{ date: date.toISODate(), meals: [{ name, dishes: [] }] },
];
