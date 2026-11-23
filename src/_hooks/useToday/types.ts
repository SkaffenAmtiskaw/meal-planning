import type { DateTime } from 'luxon';

/** A stretch of time today falls in. A week starts on `WEEK_START`. */
export type TodayPeriod = 'day' | 'week' | 'month';

export interface ViewerDay {
	/** The start of today in the viewer's time zone, or null while the zone isn't known. */
	today: DateTime | null;
	/**
	 * The days today could be, earliest first. Once the zone is known that's
	 * today alone. Until then it's the UTC day and the day either side, because
	 * every time zone is within a day of UTC.
	 */
	possibleDays: readonly DateTime[];
	/**
	 * Whether the day, week or month today falls in is known. The day is known
	 * once the zone is. The week or month can be known before then, when every
	 * possible day falls in the same one, so a part that shows only that week
	 * or month can draw right away.
	 */
	isKnown: (period: TodayPeriod) => boolean;
}
