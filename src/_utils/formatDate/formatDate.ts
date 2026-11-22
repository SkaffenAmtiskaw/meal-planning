import { DateTime } from 'luxon';

/**
 * Each named style's luxon format. A style is named for its format, not for
 * the label that uses it, so any label with the same format can share it.
 */
const DATE_STYLES = {
	// "Friday, March 15"
	weekdayMonthDay: 'EEEE, MMMM d',
	// "Sun 10/27"
	shortWeekdayNumericDate: 'ccc M/d',
	// "Dec 29"
	shortMonthDay: 'MMM d',
	// "October 27"
	monthDay: 'MMMM d',
	// "November 2026"
	monthYear: 'MMMM yyyy',
	// "Sat"
	shortWeekday: 'ccc',
	// "Jun"
	shortMonth: 'MMM',
} as const;

type DateStyle = keyof typeof DATE_STYLES;

/**
 * Formats a luxon `DateTime` or an ISO date string (`yyyy-MM-dd`) in a named
 * style. An ISO string is read as a date in the local time zone. Text such as
 * month names follows luxon's default locale, which is the browser's.
 */
export function formatDate(date: DateTime | string, style: DateStyle): string {
	const dateTime = typeof date === 'string' ? DateTime.fromISO(date) : date;

	return dateTime.toFormat(DATE_STYLES[style]);
}
