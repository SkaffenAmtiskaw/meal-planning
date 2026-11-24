import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { SavedRecipesColumn } from './SavedRecipesColumn';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { filterSavedItems } from '../../_utils/filterSavedItems';
import { orderSavedItems } from '../../_utils/orderSavedItems';
import { SavedResultList } from '../SavedResultList/SavedResultList';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
vi.mock('../../_utils/orderSavedItems', () => ({
	orderSavedItems: vi.fn(() => []),
}));
vi.mock('../../_utils/filterSavedItems', () => ({
	filterSavedItems: vi.fn(() => []),
}));
vi.mock('../SectionLabel/SectionLabel', () => ({
	SectionLabel: vi.fn(() => <div data-testid="label" />),
}));
vi.mock('../SavedSearchInput/SavedSearchInput', () => ({
	SavedSearchInput: vi.fn(() => <div data-testid="search" />),
}));
vi.mock('../SavedResultList/SavedResultList', () => ({
	SavedResultList: vi.fn(() => <div data-testid="results" />),
}));

const tacos: SavedItem = {
	_id: 'tacos',
	name: 'Black Bean Tacos',
	kind: 'recipe',
	tags: [],
};

const renderColumn = (search = '') =>
	render(
		<SavedRecipesColumn
			search={search}
			onSearchChange={vi.fn()}
			linkedIds={new Set()}
			onAdd={vi.fn()}
		/>,
	);

describe('SavedRecipesColumn', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// The DOM order is the Tab order, so the search comes before the results.
	it('orders the column its label, the search, then the results', () => {
		renderColumn();

		const nodes = ['label', 'search', 'results'].map((id) =>
			screen.getByTestId(id),
		);
		for (let i = 1; i < nodes.length; i++) {
			expect(
				nodes[i - 1].compareDocumentPosition(nodes[i]) &
					Node.DOCUMENT_POSITION_FOLLOWING,
			).toBeTruthy();
		}
	});

	it("lists the planner's saved recipes in order, narrowed by the search", () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		vi.mocked(orderSavedItems).mockReturnValueOnce([tacos]);
		vi.mocked(filterSavedItems).mockReturnValueOnce([tacos]);

		renderColumn('taco');

		expect(orderSavedItems).toHaveBeenCalledWith([tacos]);
		expect(filterSavedItems).toHaveBeenCalledWith([tacos], { search: 'taco' });
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0]).toMatchObject({
			results: [tacos],
			hasSavedItems: true,
		});
	});

	it('tells the list when the planner has no saved recipes at all', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([]);

		renderColumn();

		expect(vi.mocked(SavedResultList).mock.lastCall?.[0].hasSavedItems).toBe(
			false,
		);
	});
});
