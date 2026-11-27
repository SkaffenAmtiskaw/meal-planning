import { describe, expect, it } from 'vitest';

import { DateTime } from 'luxon';

import { getListDayRange } from './getListDayRange';

describe('getListDayRange', () => {
	it('runs from two weeks before today to the twentieth day after it, one day apart', () => {
		const today = DateTime.local(2024, 6, 15);

		const result = getListDayRange(today);

		expect(result.map((day) => day.toISODate())).toEqual(
			Array.from({ length: 35 }, (_, i) =>
				DateTime.local(2024, 6, 1).plus({ days: i }).toISODate(),
			),
		);
	});

	it('starts each day at midnight', () => {
		const today = DateTime.local(2024, 6, 15, 8, 15, 30);

		const result = getListDayRange(today);

		for (const day of result) {
			expect(day.equals(day.startOf('day'))).toBe(true);
		}
	});
});
