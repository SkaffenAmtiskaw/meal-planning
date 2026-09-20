import { describe, expect, it } from 'vitest';

import { getAccessLevelColor } from './getAccessLevelColor';

describe('getAccessLevelColor', () => {
	it('returns red for owner', () => {
		expect(getAccessLevelColor('owner')).toBe('red');
	});

	it('returns orange for admin', () => {
		expect(getAccessLevelColor('admin')).toBe('orange');
	});

	it('returns blue for write', () => {
		expect(getAccessLevelColor('write')).toBe('blue');
	});

	it('returns gray for read', () => {
		expect(getAccessLevelColor('read')).toBe('gray');
	});
});
