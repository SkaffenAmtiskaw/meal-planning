import type { DateTime } from 'luxon';

import { getWeekStart } from '@/_utils/weekStart';

/**
 * Returns the 7 DateTime instances representing the Sunday-through-Saturday week
 * that contains the given date. Each returned DateTime is set to the start of its day.
 */
export function getWeekDates(date: DateTime): DateTime[] {
	const weekStart = getWeekStart(date);

	return Array.from({ length: 7 }, (_, index) =>
		weekStart.plus({ days: index }),
	);
}
