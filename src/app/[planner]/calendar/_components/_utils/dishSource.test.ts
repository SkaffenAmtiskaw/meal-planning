import { describe, expect, it } from 'vitest';

import { isRefSource, isSavedSource, isUrlSource } from './dishSource';

describe('dishSource', () => {
	const sources = {
		url: { url: 'https://example.com' },
		ref: { ref: 'Cookbook p. 12' },
		saved: { _id: 'recipe-1' },
		unresolved: 'saved-1',
		none: undefined,
	};

	it.each([
		['isUrlSource', isUrlSource, 'url'],
		['isRefSource', isRefSource, 'ref'],
		['isSavedSource', isSavedSource, 'saved'],
	] as const)('%s matches only its own source shape', (_, guard, match) => {
		for (const [kind, source] of Object.entries(sources)) {
			expect(guard(source)).toBe(kind === match);
		}
	});
});
