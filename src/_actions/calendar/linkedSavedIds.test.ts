import { describe, expect, it } from 'vitest';

import { linkedSavedIds } from './linkedSavedIds';

describe('linkedSavedIds', () => {
	it('gives the saved items the dishes link, skipping references and unlinked dishes', () => {
		const ids = linkedSavedIds([
			{ source: { kind: 'saved', savedId: 'saved-1' } },
			{ source: { kind: 'reference', text: 'p. 12' } },
			{ source: null },
			{},
		]);

		expect(ids).toEqual(['saved-1']);
	});

	it('gives an item two dishes link only once', () => {
		const ids = linkedSavedIds([
			{ source: { kind: 'saved', savedId: 'saved-1' } },
			{ source: { kind: 'saved', savedId: 'saved-1' } },
		]);

		expect(ids).toEqual(['saved-1']);
	});
});
