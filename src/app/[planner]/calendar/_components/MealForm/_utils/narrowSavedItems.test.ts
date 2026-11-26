import { describe, expect, it, vi } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';
import { makeTagFilterOption } from '#fixtures/tagFilterOption';

import { filterSavedItems } from './filterSavedItems';
import { narrowSavedItems } from './narrowSavedItems';
import { orderByRecentUse } from './orderByRecentUse';
import { rankTagOptions } from './rankTagOptions';

vi.mock('./orderByRecentUse', () => ({
	orderByRecentUse: vi.fn(() => []),
}));
vi.mock('./filterSavedItems', () => ({
	filterSavedItems: vi.fn(() => []),
}));
vi.mock('./rankTagOptions', () => ({
	rankTagOptions: vi.fn(() => []),
}));

const tacos = makeSavedItem({ name: 'Black Bean Tacos' });
const oats = makeSavedItem({ name: 'Overnight Oats' });

describe('narrowSavedItems', () => {
	it('filters the ordered saved recipes, and ranks the chips over the results', () => {
		const criteria = { search: 'taco', tagIds: ['quick'] };
		const chips = [makeTagFilterOption('quick', true)];
		vi.mocked(orderByRecentUse).mockReturnValueOnce([oats, tacos]);
		vi.mocked(filterSavedItems).mockReturnValueOnce([tacos]);
		vi.mocked(rankTagOptions).mockReturnValueOnce(chips);

		const narrowed = narrowSavedItems([tacos, oats], criteria);

		expect(orderByRecentUse).toHaveBeenCalledWith([tacos, oats]);
		expect(filterSavedItems).toHaveBeenCalledWith([oats, tacos], criteria);
		expect(rankTagOptions).toHaveBeenCalledWith({
			countOver: [tacos],
			savedItems: [tacos, oats],
			selectedIds: ['quick'],
		});
		expect(narrowed).toEqual({ results: [tacos], tagOptions: chips });
	});
});
