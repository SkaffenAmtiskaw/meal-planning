import type { DateTime } from 'luxon';

import { getWeekStart } from '@/_utils/weekStart';

/** Six weeks, so every month's grid has the same number of rows. */
const GRID_DAYS = 42;

/**
 * Returns the 42 days to display in a month grid, starting on the week start
 * on or before the 1st, including overflow days from the previous and next months.
 */
export function getMonthGridDates(selectedDate: DateTime): DateTime[] {
	const start = getWeekStart(selectedDate.startOf('month'));

	return Array.from({ length: GRID_DAYS }, (_, index) =>
		start.plus({ days: index }),
	);
}
