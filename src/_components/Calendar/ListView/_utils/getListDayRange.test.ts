import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getListDayRange } from './getListDayRange';

describe('getListDayRange', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns 35 days', () => {
		vi.setSystemTime(DateTime.local(2024, 6, 15).toJSDate());
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor);

		expect(result).toHaveLength(35);
	});

	it('centers 14 days before and 20 days after rangeAnchor', () => {
		vi.setSystemTime(DateTime.local(2024, 6, 15).toJSDate());
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor);

		expect(result[0]).toEqual(DateTime.local(2024, 6, 1).startOf('day'));
		expect(result[14]).toEqual(rangeAnchor);
		expect(result[34]).toEqual(DateTime.local(2024, 7, 5).startOf('day'));
	});

	it('includes today when rangeAnchor is in the future', () => {
		vi.setSystemTime(DateTime.local(2024, 6, 15).toJSDate());
		const rangeAnchor = DateTime.local(2024, 7, 15).startOf('day');

		const result = getListDayRange(rangeAnchor);

		expect(result[0]).toEqual(DateTime.local(2024, 6, 15).startOf('day'));
		expect(result[34]).toEqual(DateTime.local(2024, 7, 19).startOf('day'));
		expect(
			result.some((day) =>
				day.equals(DateTime.local(2024, 6, 15).startOf('day')),
			),
		).toBe(true);
	});

	it('includes today when rangeAnchor is in the past', () => {
		vi.setSystemTime(DateTime.local(2024, 7, 15).toJSDate());
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor);

		expect(result[0]).toEqual(DateTime.local(2024, 6, 11).startOf('day'));
		expect(result[34]).toEqual(DateTime.local(2024, 7, 15).startOf('day'));
		expect(
			result.some((day) =>
				day.equals(DateTime.local(2024, 7, 15).startOf('day')),
			),
		).toBe(true);
	});

	it('returns days in chronological order', () => {
		vi.setSystemTime(DateTime.local(2024, 6, 15).toJSDate());
		const rangeAnchor = DateTime.local(2024, 6, 15).startOf('day');

		const result = getListDayRange(rangeAnchor);

		for (let i = 1; i < result.length; i++) {
			expect(result[i].diff(result[i - 1], 'days').days).toBe(1);
		}
	});

	it('sets each day to start of day', () => {
		vi.setSystemTime(DateTime.local(2024, 6, 15, 12, 30, 45).toJSDate());
		const rangeAnchor = DateTime.local(2024, 6, 15, 8, 15, 30);

		const result = getListDayRange(rangeAnchor);

		for (const day of result) {
			expect(day.startOf('day').equals(day)).toBe(true);
		}
	});

	it('does not mutate the input rangeAnchor', () => {
		vi.setSystemTime(DateTime.local(2024, 6, 15).toJSDate());
		const rangeAnchor = DateTime.local(2024, 6, 15, 8, 15, 30);
		const original = rangeAnchor.toISO();

		getListDayRange(rangeAnchor);

		expect(rangeAnchor.toISO()).toBe(original);
	});
});
