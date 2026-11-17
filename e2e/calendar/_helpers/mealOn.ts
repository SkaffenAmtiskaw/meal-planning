import type { DateTime } from 'luxon';

import { newId } from '#factories/id';

// A calendar holding one meal with no dishes on the date, for openPlannerCalendar's calendar override.
export const mealOn = (date: DateTime<true>, name: string) => [
	{ date: date.toISODate(), meals: [{ _id: newId(), name, dishes: [] }] },
];
