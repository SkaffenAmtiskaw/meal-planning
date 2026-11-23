import type { DateTime } from 'luxon';

export interface ViewerDay {
	/** The start of today in the viewer's time zone, or null while the zone isn't known. */
	today: DateTime | null;
	/**
	 * The days today could be, earliest first. Once the zone is known that's
	 * today alone. Until then it's the UTC day and the day either side, because
	 * every time zone is within a day of UTC.
	 */
	possibleDays: readonly DateTime[];
}
