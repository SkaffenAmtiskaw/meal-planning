import type { DateTime } from 'luxon';

import type { ViewerDay } from '@/_hooks/useToday';
import { makeIsKnown } from '@/_hooks/useToday/makeIsKnown';

/** What `useToday()` gives once the viewer's day is known. */
export const makeKnownDay = (today: DateTime): ViewerDay => {
	const possibleDays = [today];
	return { today, possibleDays, isKnown: makeIsKnown(possibleDays) };
};

/** What `useToday()` gives while the viewer's time zone is unknown, for that UTC day. */
export const makeUnknownDay = (utcDay: DateTime): ViewerDay => {
	const possibleDays = [
		utcDay.minus({ days: 1 }),
		utcDay,
		utcDay.plus({ days: 1 }),
	];
	return { today: null, possibleDays, isKnown: makeIsKnown(possibleDays) };
};
