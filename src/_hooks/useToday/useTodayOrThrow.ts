'use client';

import type { DateTime } from 'luxon';

import { useToday } from './useToday';

/**
 * Today, for code that only renders once the viewer's day is known. Throws
 * while the day isn't known, so call it only below a component that shows
 * its skeleton while `useToday().isKnown('day')` is false.
 */
export const useTodayOrThrow = (): DateTime => {
	const { today } = useToday();
	if (!today) {
		throw new Error(
			`Coding error: useTodayOrThrow() was called before the viewer's day is known. Call it only below a component that shows its skeleton while useToday().isKnown('day') is false.`,
		);
	}
	return today;
};
