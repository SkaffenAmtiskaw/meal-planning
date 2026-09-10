import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { formatWeekRange } from './formatWeekRange';

describe('formatWeekRange', () => {
	it('formats a week within the same year', () => {
		// Wednesday, June 12, 2024
		const date = DateTime.local(2024, 6, 12);
		const result = formatWeekRange(date);
		expect(result).toBe('Jun 9 – Jun 15, 2024');
	});

	it('includes both years when the week spans two years', () => {
		// Wednesday, January 1, 2025
		const date = DateTime.local(2025, 1, 1);
		const result = formatWeekRange(date);
		expect(result).toBe('Dec 29, 2024 – Jan 4, 2025');
	});

	it('starts the week on Sunday', () => {
		// Monday, June 10, 2024
		const date = DateTime.local(2024, 6, 10);
		const result = formatWeekRange(date);
		expect(result).toBe('Jun 9 – Jun 15, 2024');
	});
});
