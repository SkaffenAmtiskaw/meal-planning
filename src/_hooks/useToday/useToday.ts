'use client';

import { useMemo } from 'react';

import { DateTime } from 'luxon';

import { useTimeZone } from './useTimeZone';
import type { ViewerDay } from './types';

/**
 * The viewer's day, and the days it could be while their time zone isn't
 * known. The same object is returned for the whole day, so effects that
 * depend on it don't re-run on each render.
 */
export const useToday = (): ViewerDay => {
	const timeZone = useTimeZone();
	const zone = timeZone ?? 'UTC';
	const isoDate = DateTime.now().setZone(zone).toISODate() as string;

	return useMemo(() => {
		const day = DateTime.fromISO(isoDate, { zone });
		if (timeZone) {
			return { today: day, possibleDays: [day] };
		}
		return {
			today: null,
			possibleDays: [day.minus({ days: 1 }), day, day.plus({ days: 1 })],
		};
	}, [isoDate, zone, timeZone]);
};
