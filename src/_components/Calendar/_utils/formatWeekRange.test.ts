import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { formatWeekRange } from './formatWeekRange';

describe('formatWeekRange', () => {
	it('formats a week within the same year', () => {
		// Wednesday, June 12, 2024
		// Luxon week starts on Monday by default
		const date = DateTime.local(2024, 6, 12);
		const result = formatWeekRange(date);
		expect(result).toBe('Jun 10 – Jun 16, 2024');
	});

	it('includes both years when the week spans two years', () => {
		// Wednesday, January 1, 2025
		// Luxon week starts on Monday by default
		const date = DateTime.local(2025, 1, 1);
		const result = formatWeekRange(date);
		expect(result).toBe('Dec 30, 2024 – Jan 5, 2025');
	});
});
