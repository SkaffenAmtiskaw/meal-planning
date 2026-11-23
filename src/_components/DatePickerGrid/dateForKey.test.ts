import { describe, expect, it } from 'vitest';

import { dateForKey } from './dateForKey';

describe('dateForKey', () => {
	it('moves to the same day next month on PageDown', () => {
		expect(dateForKey('2024-06-15', 'PageDown')).toBe('2024-07-15');
	});

	it('moves to the same day last month on PageUp', () => {
		expect(dateForKey('2024-06-15', 'PageUp')).toBe('2024-05-15');
	});

	it('clamps to the last day of a shorter month', () => {
		expect(dateForKey('2025-01-31', 'PageDown')).toBe('2025-02-28');
	});

	it('moves to the Sunday the week starts on, on Home', () => {
		// 2024-06-12 is a Wednesday.
		expect(dateForKey('2024-06-12', 'Home')).toBe('2024-06-09');
	});

	it('moves to the Saturday the week ends on, on End', () => {
		expect(dateForKey('2024-06-12', 'End')).toBe('2024-06-15');
	});

	it('crosses into the next month when the week does', () => {
		// 2024-06-30 is a Sunday, so its week ends on 6 July.
		expect(dateForKey('2024-06-30', 'End')).toBe('2024-07-06');
	});

	it('crosses into the previous month when the week does', () => {
		// 2024-07-02 is a Tuesday, so its week starts on 30 June.
		expect(dateForKey('2024-07-02', 'Home')).toBe('2024-06-30');
	});

	it('gives no date for other keys', () => {
		expect(dateForKey('2024-06-12', 'ArrowDown')).toBeNull();
	});
});
