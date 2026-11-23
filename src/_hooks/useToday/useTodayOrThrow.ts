'use client';

import type { DateTime } from 'luxon';

import { useToday } from './useToday';

/**
 * Today, for code that only renders once the viewer's day is known. Throws
 * while the zone isn't known, so a caller sits below a component that waits
 * for `useToday()` to give a day.
 */
export const useTodayOrThrow = (): DateTime => {
	const { today } = useToday();
	if (!today) {
		throw new Error(
			'Coding error: useTodayOrThrow() was called before the time zone is known. Call it only below a component that waits for useToday() to give a day, such as by showing a skeleton until then.',
		);
	}
	return today;
};
