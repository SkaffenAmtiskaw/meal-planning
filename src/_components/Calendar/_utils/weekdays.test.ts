import { describe, expect, it } from 'vitest';

import { WEEKDAY_LABELS } from './weekdays';

describe('WEEKDAY_LABELS', () => {
	it('has 7 labels', () => {
		expect(WEEKDAY_LABELS).toHaveLength(7);
	});

	it('starts on Sunday', () => {
		expect(WEEKDAY_LABELS[0]).toBe('Sun');
	});

	it('lists days in Sunday-to-Saturday order', () => {
		expect(WEEKDAY_LABELS).toEqual([
			'Sun',
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
			'Sat',
		]);
	});

	it('is readonly', () => {
		expect(Object.isFrozen(WEEKDAY_LABELS)).toBe(true);
	});
});
