import { describe, expect, it } from 'vitest';

import { formatDishCount } from './formatDishCount';

describe('formatDishCount', () => {
	it.each([
		{ count: 0, text: '0 dishes' },
		{ count: 1, text: '1 dish' },
		{ count: 3, text: '3 dishes' },
	])('reads "$text" for $count', ({ count, text }) => {
		expect(formatDishCount(count)).toBe(text);
	});
});
