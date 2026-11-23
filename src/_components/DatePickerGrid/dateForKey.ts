import { DateTime } from 'luxon';

import { getWeekStart } from '@/_utils/weekStart';

/**
 * The ISO date a picker key moves focus to from `date`, or null for a key the
 * picker leaves to Mantine. PageUp and PageDown keep the day of the month,
 * clamped to a shorter month's last day. Home and End go to the start and end
 * of the app's week, so they can't drift from the picker's week start.
 */
export function dateForKey(date: string, key: string): string | null {
	const day = DateTime.fromISO(date);
	switch (key) {
		case 'PageUp':
			return day.minus({ months: 1 }).toISODate();
		case 'PageDown':
			return day.plus({ months: 1 }).toISODate();
		case 'Home':
			return getWeekStart(day).toISODate();
		case 'End':
			return getWeekStart(day).plus({ days: 6 }).toISODate();
		default:
			return null;
	}
}
