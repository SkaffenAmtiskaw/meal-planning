import { describe, expect, it } from 'vitest';

import { DateTime } from 'luxon';

import { getListDayRange } from './getListDayRange';

describe('getListDayRange', () => {
	it('returns 35 days', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor, today);

		expect(result).toHaveLength(35);
	});

	it('centers 14 days before and 20 days after rangeAnchor', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor, today);

		expect(result[0]).toEqual(DateTime.local(2024, 6, 1).startOf('day'));
		expect(result[14]).toEqual(rangeAnchor);
		expect(result[34]).toEqual(DateTime.local(2024, 7, 5).startOf('day'));
	});

	it('includes today when rangeAnchor is in the future', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 7, 15).startOf('day');

		const result = getListDayRange(rangeAnchor, today);

		expect(result[0]).toEqual(DateTime.local(2024, 6, 15).startOf('day'));
		expect(result[34]).toEqual(DateTime.local(2024, 7, 19).startOf('day'));
		expect(
			result.some((day) =>
				day.equals(DateTime.local(2024, 6, 15).startOf('day')),
			),
		).toBe(true);
	});

	it('includes today when rangeAnchor is in the past', () => {
		const today = DateTime.local(2024, 7, 15);
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor, today);

		expect(result[0]).toEqual(DateTime.local(2024, 6, 11).startOf('day'));
		expect(result[34]).toEqual(DateTime.local(2024, 7, 15).startOf('day'));
		expect(
			result.some((day) =>
				day.equals(DateTime.local(2024, 7, 15).startOf('day')),
			),
		).toBe(true);
	});

	it('returns days in chronological order', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor, today);

		for (let i = 1; i < result.length; i++) {
			expect(result[i].diff(result[i - 1], 'days').days).toBe(1);
		}
	});

	it('sets each day to start of day', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 6, 15, 8, 15, 30);

		const result = getListDayRange(rangeAnchor, today);

		for (const day of result) {
			expect(day.startOf('day').equals(day)).toBe(true);
		}
	});

	it('does not mutate the input rangeAnchor', () => {
		const today = DateTime.local(2024, 6, 15);
		const rangeAnchor = DateTime.local(2024, 6, 15, 8, 15, 30);
		const original = rangeAnchor.toISO();

		getListDayRange(rangeAnchor, today);

		expect(rangeAnchor.toISO()).toBe(original);
	});
});
