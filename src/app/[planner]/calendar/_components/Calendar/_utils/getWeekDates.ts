import type { DateTime } from 'luxon';

/**
 * Returns the 7 DateTime instances representing the Sunday-through-Saturday week
 * that contains the given date. Each returned DateTime is set to the start of its day.
 */
export function getWeekDates(date: DateTime): DateTime[] {
	const startOfDay = date.startOf('day');
	const sunday = startOfDay.minus({ days: startOfDay.weekday % 7 });

	return Array.from({ length: 7 }, (_, index) => sunday.plus({ days: index }));
}
