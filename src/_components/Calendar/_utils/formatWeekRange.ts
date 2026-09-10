import type { DateTime } from 'luxon';

/**
 * Formats a week range label from a given date.
 * Returns a string like "Jun 10 – Jun 16, 2024" or "Dec 30, 2024 – Jan 5, 2025" when the week spans two years.
 */
export function formatWeekRange(date: DateTime): string {
	const start = date.startOf('day').minus({ days: date.weekday % 7 });
	const end = start.plus({ days: 6 });

	const startLabel = start.toFormat('MMM d');
	const endLabel = end.toFormat('MMM d');

	if (start.year === end.year) {
		return `${startLabel} – ${endLabel}, ${start.year}`;
	}

	return `${startLabel}, ${start.year} – ${endLabel}, ${end.year}`;
}
