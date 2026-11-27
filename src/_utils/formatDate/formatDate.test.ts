import { describe, expect, it } from 'vitest';

import { DateTime, Settings } from 'luxon';

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

	it('formats shortWeekdayMonthDay as the short weekday, short month and day', () => {
		expect(formatDate('2026-11-27', 'shortWeekdayMonthDay')).toBe(
			'Fri, Nov 27',
		);
	});

	it('formats shortWeekdayDayMonth as the short weekday, day and short month', () => {
		expect(formatDate('2026-11-21', 'shortWeekdayDayMonth')).toBe('Sat 21 Nov');
	});

	it('formats monthDay as the full month and day', () => {
		expect(formatDate('2024-10-27', 'monthDay')).toBe('October 27');
	});

	it('formats monthYear as the full month and year', () => {
		expect(formatDate('2026-11-22', 'monthYear')).toBe('November 2026');
	});

	it('formats shortWeekday as the short weekday', () => {
		expect(formatDate('2024-06-15', 'shortWeekday')).toBe('Sat');
	});

	it('formats shortMonth as the short month', () => {
		expect(formatDate('2024-06-01', 'shortMonth')).toBe('Jun');
	});

	it('formats numericDate as the numeric month, day and year', () => {
		expect(formatDate('2026-09-04', 'numericDate')).toBe('9/4/2026');
	});

	it('formats shortMonthDayYear as the short month, day and year', () => {
		expect(formatDate('2024-01-05', 'shortMonthDayYear')).toBe('Jan 5, 2024');
	});

	it('formats a luxon DateTime as well as an ISO date', () => {
		expect(formatDate(DateTime.local(2024, 10, 27), 'monthDay')).toBe(
			'October 27',
		);
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
