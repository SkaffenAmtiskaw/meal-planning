import type { DayOfWeek } from '@mantine/dates';

import type { DateTime } from 'luxon';

/** The day every week in the app starts on, in the form Mantine's `firstDayOfWeek` takes: 0 is Sunday. */
export const WEEK_START: DayOfWeek = 0;

/**
 * Returns the start of the day on or before `date` that falls on `WEEK_START`.
 * Luxon's `startOf('week')` always starts on Monday, so it can't be used for this.
 */
export function getWeekStart(date: DateTime): DateTime {
	const day = date.startOf('day');
	// Luxon numbers Monday 1 to Sunday 7, and mod 7 its Sunday matches Mantine's 0.
	const daysSinceWeekStart = (day.weekday - WEEK_START + 7) % 7;

	return day.minus({ days: daysSinceWeekStart });
}
