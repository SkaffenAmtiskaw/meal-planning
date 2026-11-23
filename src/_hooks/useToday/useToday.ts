'use client';

import { useMemo } from 'react';

import { DateTime } from 'luxon';

import { useTimeZone } from './useTimeZone';

/**
 * The start of today in the viewer's time zone. The same object is returned
 * for the whole day, so effects that depend on it don't re-run on each render.
 * Throws while the zone isn't known, so a caller waits for `useTimeZone()`.
 */
export const useToday = (): DateTime => {
	const timeZone = useTimeZone();
	if (!timeZone) {
		throw new Error(
			'Coding error: useToday() was called before the time zone is known. Call it only below a component that renders nothing until useTimeZone() returns a zone.',
		);
	}

	const isoDate = DateTime.now().setZone(timeZone).toISODate() as string;

	return useMemo(
		() => DateTime.fromISO(isoDate, { zone: timeZone }),
		[isoDate, timeZone],
	);
};
