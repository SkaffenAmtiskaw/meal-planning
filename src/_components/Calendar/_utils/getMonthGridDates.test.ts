import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getMonthGridDates } from './getMonthGridDates';

describe('getMonthGridDates', () => {
	it('returns complete weeks for a standard month', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result.length % 7).toBe(0);
	});

	it('starts the grid on Monday', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result[0].weekday).toBe(1);
	});

	it('includes overflow days from the previous month', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result[0].month).toBe(8);
		expect(result[0].day).toBe(26);
	});

	it('includes overflow days from the next month', () => {
		const september2024 = DateTime.local(2024, 9, 15);
		const result = getMonthGridDates(september2024);

		expect(result[result.length - 1].month).toBe(10);
		expect(result[result.length - 1].day).toBe(6);
	});

	it('handles a month that starts on Monday', () => {
		const july2024 = DateTime.local(2024, 7, 15);
		const result = getMonthGridDates(july2024);

		expect(result[0].month).toBe(7);
		expect(result[0].day).toBe(1);
	});

	it('handles a month that ends on Sunday', () => {
		const june2024 = DateTime.local(2024, 6, 15);
		const result = getMonthGridDates(june2024);

		expect(result[result.length - 1].month).toBe(6);
		expect(result[result.length - 1].day).toBe(30);
	});
});
