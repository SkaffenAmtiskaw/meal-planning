import type { DateTime } from 'luxon';

/**
 * The days today could be while the viewer's time zone isn't known: the UTC
 * day and the day either side, earliest first, because every time zone is
 * within a day of UTC.
 */
export const possibleDaysAround = (utcDay: DateTime): DateTime[] => [
	utcDay.minus({ days: 1 }),
	utcDay,
	utcDay.plus({ days: 1 }),
];
