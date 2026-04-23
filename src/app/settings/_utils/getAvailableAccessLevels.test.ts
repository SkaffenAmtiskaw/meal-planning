import { describe, expect, it } from 'vitest';

import { getAvailableAccessLevels } from './getAvailableAccessLevels';

describe('getAvailableAccessLevels', () => {
	it('returns admin, write, read when viewer is owner', () => {
		const result = getAvailableAccessLevels(true);

		expect(result).toEqual(['admin', 'write', 'read']);
	});

	it('returns write, read when viewer is admin', () => {
		const result = getAvailableAccessLevels(false);

		expect(result).toEqual(['write', 'read']);
	});

	it('returns AccessLevel array type', () => {
		const result = getAvailableAccessLevels(true);

		// Verify each item is a valid AccessLevel (not owner)
		result.forEach((level) => {
			expect(['admin', 'write', 'read']).toContain(level);
		});
	});

	it('does not include owner in available levels for owner', () => {
		const result = getAvailableAccessLevels(true);

		expect(result).not.toContain('owner');
	});

	it('does not include admin or owner for non-owner', () => {
		const result = getAvailableAccessLevels(false);

		expect(result).not.toContain('owner');
		expect(result).not.toContain('admin');
	});
});
