import { describe, expect, it } from 'vitest';

import { dataIfOpen } from './dataIfOpen';

describe('dataIfOpen', () => {
	it("returns the type's data while that type is open", () => {
		expect(
			dataIfOpen(
				{ type: 'add_meal', data: { initialDate: '2024-01-15' } },
				'add_meal',
			),
		).toEqual({ initialDate: '2024-01-15' });
	});

	it('returns null while no modal is open', () => {
		expect(dataIfOpen({ type: null, data: null }, 'add_meal')).toBeNull();
	});
});
