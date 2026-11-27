import { DateTime } from 'luxon';

import type { DateStyle } from './types';

/**
 * Each named style's luxon format. A style is named for its format, not for
 * the label that uses it, so any label with the same format can share it.
 */
export const DATE_STYLES = {
	// "Friday, March 15"
	weekdayMonthDay: 'EEEE, MMMM d',
	// "Sun 10/27"
	shortWeekdayNumericDate: 'ccc M/d',
	// "Dec 29"
	shortMonthDay: 'MMM d',
	// "Fri, Nov 27"
	shortWeekdayMonthDay: 'ccc, MMM d',
	// "Sat 21 Nov"
	shortWeekdayDayMonth: 'ccc d MMM',
	// "October 27"
	monthDay: 'MMMM d',
	// "November 2026"
	monthYear: 'MMMM yyyy',
	// "Sat"
	shortWeekday: 'ccc',
	// "Jun"
	shortMonth: 'MMM',
	// "9/24/2026"
	numericDate: 'M/d/yyyy',
	// "Jan 15, 2024"
	shortMonthDayYear: 'MMM d, yyyy',
} as const;

/**
 * Formats a luxon `DateTime` or an ISO date string (`yyyy-MM-dd`) in a named
 * style. An ISO string is read as a date in the local time zone.
 */
export function formatDate(date: DateTime | string, style: DateStyle): string {
	const dateTime = typeof date === 'string' ? DateTime.fromISO(date) : date;

	return dateTime.toFormat(DATE_STYLES[style]);
}
