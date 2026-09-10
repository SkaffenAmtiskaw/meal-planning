import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getWeekDates } from './getWeekDates';

describe('getWeekDates', () => {
	it('returns 7 days starting on Sunday', () => {
		const input = DateTime.local(2024, 9, 18);
		const result = getWeekDates(input);

		expect(result).toHaveLength(7);
		expect(result[0].weekday).toBe(7);
	});

	it('returns the correct week for a midweek date', () => {
		const input = DateTime.local(2024, 9, 18);
		const result = getWeekDates(input);

		expect(result[0]).toEqual(DateTime.local(2024, 9, 15));
		expect(result[6]).toEqual(DateTime.local(2024, 9, 21));
	});

	it('returns the same Sunday when the input is Sunday', () => {
		const input = DateTime.local(2024, 9, 15);
		const result = getWeekDates(input);

		expect(result[0]).toEqual(DateTime.local(2024, 9, 15));
		expect(result[6]).toEqual(DateTime.local(2024, 9, 21));
	});

	it('returns the previous Sunday when the input is Saturday', () => {
		const input = DateTime.local(2024, 9, 21);
		const result = getWeekDates(input);

		expect(result[0]).toEqual(DateTime.local(2024, 9, 15));
		expect(result[6]).toEqual(DateTime.local(2024, 9, 21));
	});

	it('handles a week that spans two years', () => {
		const input = DateTime.local(2024, 12, 31);
		const result = getWeekDates(input);

		expect(result[0]).toEqual(DateTime.local(2024, 12, 29));
		expect(result[6]).toEqual(DateTime.local(2025, 1, 4));
	});

	it('ignores the time component of the input', () => {
		const input = DateTime.local(2024, 9, 18, 14, 30, 45, 123);
		const result = getWeekDates(input);

		expect(result[0]).toEqual(DateTime.local(2024, 9, 15));
		result.forEach((date) => {
			expect(date.hour).toBe(0);
			expect(date.minute).toBe(0);
			expect(date.second).toBe(0);
			expect(date.millisecond).toBe(0);
		});
	});

	it('does not mutate the input DateTime', () => {
		const input = DateTime.local(2024, 9, 18, 12, 0, 0);
		getWeekDates(input);

		expect(input).toEqual(DateTime.local(2024, 9, 18, 12, 0, 0));
	});
});
