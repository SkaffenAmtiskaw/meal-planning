'use client';

import { useCallback } from 'react';

import { DateTime } from 'luxon';

import { type DateStyle, formatDate } from '@/_utils/formatDate';

import { useTimeZone } from './useTimeZone';

/**
 * Formats a moment, such as an ISO timestamp, as a date in the viewer's time
 * zone. While the zone is unknown, `isKnown` is false and `format` uses UTC, so
 * a skeleton around the text is drawn at the date's width.
 */
export const useViewerZoneFormat = () => {
	const timeZone = useTimeZone();
	const zone = timeZone ?? 'UTC';
	const format = useCallback(
		(isoDateTime: string, style: DateStyle) =>
			formatDate(DateTime.fromISO(isoDateTime, { zone }), style),
		[zone],
	);

	return { isKnown: timeZone !== null, format };
};
