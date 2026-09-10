import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getMonthGridDates } from './getMonthGridDates';

describe('getMonthGridDates', () => {
	it('returns complete weeks for a standard month', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result.length % 7).toBe(0);
	});

	it('starts the grid on Sunday', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result[0].weekday).toBe(7);
	});

	it('includes overflow days from the previous month', () => {
		const july2024 = DateTime.local(2024, 7, 15);
		const result = getMonthGridDates(july2024);

		expect(result[0].month).toBe(6);
		expect(result[0].day).toBe(30);
	});

	it('includes overflow days from the next month', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result[result.length - 1].month).toBe(10);
		expect(result[result.length - 1].day).toBe(5);
	});

	it('handles a month that starts on Sunday', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result[0].month).toBe(9);
		expect(result[0].day).toBe(1);
	});

	it('handles a month that ends on Saturday', () => {
		const august2024 = DateTime.local(2024, 8, 15);
		const result = getMonthGridDates(august2024);

		expect(result[result.length - 1].month).toBe(8);
		expect(result[result.length - 1].day).toBe(31);
	});

	it('does not mutate input', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const originalDay = september2024.day;
		const originalMonth = september2024.month;
		const originalYear = september2024.year;

		getMonthGridDates(september2024);

		expect(september2024.day).toBe(originalDay);
		expect(september2024.month).toBe(originalMonth);
		expect(september2024.year).toBe(originalYear);
	});
});
