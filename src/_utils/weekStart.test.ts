import { describe, expect, it } from 'vitest';

import { DateTime } from 'luxon';

import { getWeekStart } from './weekStart';

describe('getWeekStart', () => {
	it('returns the same day when the date is a Sunday', () => {
		const result = getWeekStart(DateTime.local(2026, 11, 15));

		expect(result).toEqual(DateTime.local(2026, 11, 15));
	});

	it('returns the Sunday six days before when the date is a Saturday', () => {
		const result = getWeekStart(DateTime.local(2026, 11, 21));

		expect(result).toEqual(DateTime.local(2026, 11, 15));
	});

	it('crosses a month and year boundary', () => {
		const result = getWeekStart(DateTime.local(2027, 1, 1));

		expect(result).toEqual(DateTime.local(2026, 12, 27));
	});

	it('drops the time of day', () => {
		const result = getWeekStart(DateTime.local(2026, 11, 18, 15, 30, 45));

		expect(result).toEqual(DateTime.local(2026, 11, 15));
	});
});
