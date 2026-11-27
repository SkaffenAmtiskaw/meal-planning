import type { DateTime } from 'luxon';

const DAYS_BEFORE_TODAY = 14;
const DAYS_AFTER_TODAY = 20;

/**
 * The days the calendar's lists hold: a fixed window from two weeks before
 * today to the twentieth day after it, each at the start of its day.
 */
export function getListDayRange(today: DateTime): DateTime[] {
	const start = today.startOf('day').minus({ days: DAYS_BEFORE_TODAY });
	return Array.from(
		{ length: DAYS_BEFORE_TODAY + 1 + DAYS_AFTER_TODAY },
		(_, i) => start.plus({ days: i }),
	);
}
