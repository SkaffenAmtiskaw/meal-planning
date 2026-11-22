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
} as const;

type DateStyle = keyof typeof DATE_STYLES;

/**
 * Formats an ISO date string (`yyyy-MM-dd`) in a named style, reading it as a
 * date in the local time zone. Text such as month names follows luxon's
 * default locale, which is the browser's.
 */
export function formatDate(iso: string, style: DateStyle): string {
	return DateTime.fromISO(iso).toFormat(DATE_STYLES[style]);
}
