import { describe, expect, test } from 'vitest';

import { getScheduleXViewId } from './getScheduleXViewId';

describe('getScheduleXViewId', () => {
	test('returns list for list view on desktop', () => {
		expect(getScheduleXViewId('list', false)).toBe('list');
	});

	test('returns list for list view on mobile', () => {
		expect(getScheduleXViewId('list', true)).toBe('list');
	});

	test('returns month-grid for month on desktop', () => {
		expect(getScheduleXViewId('month', false)).toBe('month-grid');
	});

	test('returns month-agenda for month on mobile', () => {
		expect(getScheduleXViewId('month', true)).toBe('month-agenda');
	});

	test('returns month-grid for month when isMobile is undefined', () => {
		expect(getScheduleXViewId('month', undefined)).toBe('month-grid');
	});
});
