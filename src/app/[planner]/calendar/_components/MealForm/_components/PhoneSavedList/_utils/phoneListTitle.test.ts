import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { hasBeenUsed } from './hasBeenUsed';
import { phoneListTitle } from './phoneListTitle';

vi.mock('./hasBeenUsed', () => ({
	hasBeenUsed: vi.fn(() => false),
}));

const oats = makeSavedItem({ name: 'Overnight Oats' });
const tacos = makeSavedItem({ name: 'Black Bean Tacos' });

describe('phoneListTitle', () => {
	beforeEach(() => {
		vi.mocked(hasBeenUsed).mockReset();
	});

	it('titles the list as recently used with nothing typed, no tag selected and a used row', () => {
		vi.mocked(hasBeenUsed).mockImplementation((item) => item === oats);

		expect(
			phoneListTitle({
				search: ' ',
				selectedTagNames: [],
				rows: [tacos, oats],
			}),
		).toBe('Recently used');
	});

	it.each([
		{ when: 'no row has been used', search: '', used: false },
		{ when: 'something is typed', search: 'oa', used: true },
	])('titles the list from the saved recipes when $when', ({
		search,
		used,
	}) => {
		vi.mocked(hasBeenUsed).mockReturnValue(used);

		expect(phoneListTitle({ search, selectedTagNames: [], rows: [oats] })).toBe(
			'From your saved recipes',
		);
	});

	it('names the selected tags, in pick order, even when a row has been used', () => {
		vi.mocked(hasBeenUsed).mockReturnValue(true);

		expect(
			phoneListTitle({
				search: '',
				selectedTagNames: ['Thai', 'Quick'],
				rows: [oats],
			}),
		).toBe('Saved · Thai + Quick');
	});
});
