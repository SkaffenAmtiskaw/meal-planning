import type { DateTime } from 'luxon';

import type { ViewerDay } from '@/_hooks/useToday';

/** What `useToday()` gives once the viewer's day is known. */
export const makeKnownDay = (today: DateTime): ViewerDay => ({
	today,
	possibleDays: [today],
});

/** What `useToday()` gives while the viewer's time zone is unknown, for that UTC day. */
export const makeUnknownDay = (utcDay: DateTime): ViewerDay => ({
	today: null,
	possibleDays: [utcDay.minus({ days: 1 }), utcDay, utcDay.plus({ days: 1 })],
});
