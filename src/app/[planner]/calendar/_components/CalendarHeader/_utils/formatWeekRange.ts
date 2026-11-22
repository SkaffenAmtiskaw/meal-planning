import type { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';
import { getWeekStart } from '@/_utils/weekStart';

/**
 * Formats a week range label from a given date.
 * Returns a string like "Jun 10 – Jun 16, 2024" or "Dec 30, 2024 – Jan 5, 2025" when the week spans two years.
 */
export function formatWeekRange(date: DateTime): string {
	const start = getWeekStart(date);
	const end = start.plus({ days: 6 });

	const startLabel = formatDate(start.toISODate() as string, 'shortMonthDay');
	const endLabel = formatDate(end.toISODate() as string, 'shortMonthDay');

	if (start.year === end.year) {
		return `${startLabel} – ${endLabel}, ${start.year}`;
	}

	return `${startLabel}, ${start.year} – ${endLabel}, ${end.year}`;
}
