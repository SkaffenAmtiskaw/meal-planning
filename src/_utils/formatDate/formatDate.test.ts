import { describe, expect, it } from 'vitest';

import { Settings } from 'luxon';

import { formatDate } from './formatDate';

describe('formatDate', () => {
	it('formats weekdayMonthDay as the full weekday, month and day', () => {
		expect(formatDate('2024-03-15', 'weekdayMonthDay')).toBe(
			'Friday, March 15',
		);
	});

	it('formats shortWeekdayNumericDate as the short weekday and numeric month/day', () => {
		expect(formatDate('2024-10-27', 'shortWeekdayNumericDate')).toBe(
			'Sun 10/27',
		);
	});

	it('formats shortMonthDay as the short month and day', () => {
		expect(formatDate('2024-12-29', 'shortMonthDay')).toBe('Dec 29');
	});

	it('reads the date as a local date rather than UTC', () => {
		/**
		 * A UTC parse of the first of a month shows the last day of the previous
		 * month in time zones behind UTC.
		 */
		const previousZone = Settings.defaultZone;
		Settings.defaultZone = 'America/New_York';

		try {
			expect(formatDate('2025-01-01', 'shortMonthDay')).toBe('Jan 1');
		} finally {
			Settings.defaultZone = previousZone;
		}
	});
});
