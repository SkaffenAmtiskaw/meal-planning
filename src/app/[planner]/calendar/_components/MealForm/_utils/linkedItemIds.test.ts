import { describe, expect, it } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';

import { linkedItemIds } from './linkedItemIds';

describe('linkedItemIds', () => {
	it('gives the saved items the dishes link, skipping references and unlinked dishes', () => {
		const ids = linkedItemIds([
			makeDishDraft({ source: { kind: 'saved', savedId: 'saved-1' } }),
			makeDishDraft({ source: { kind: 'reference', text: 'p. 12' } }),
			makeDishDraft(),
		]);

		expect(ids).toEqual(new Set(['saved-1']));
	});
});
