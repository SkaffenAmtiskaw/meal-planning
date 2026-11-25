import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';
import type { SavedItem } from '@/_actions/library/types';

import { SavedRecipesColumn } from './SavedRecipesColumn';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useSavedItemCriteria } from '../../_hooks/useSavedItemCriteria';
import { filterSavedItems } from '../../_utils/filterSavedItems';
import { orderSavedItems } from '../../_utils/orderSavedItems';
import { rankTagOptions } from '../../_utils/rankTagOptions';
import type { DishDraft } from '../../types';
import { LinkModeBanner } from '../LinkModeBanner/LinkModeBanner';
import { SavedResultList } from '../SavedResultList/SavedResultList';
import { SavedSearchInput } from '../SavedSearchInput/SavedSearchInput';
import { TagFilter } from '../TagFilter/TagFilter';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
vi.mock('../../_hooks/useSavedItemCriteria', () => ({
	useSavedItemCriteria: vi.fn(() => [
		{ search: '', tagIds: [] },
		{ setSearch: vi.fn(), setTagIds: vi.fn() },
	]),
}));
vi.mock('../../_utils/orderSavedItems', () => ({
	orderSavedItems: vi.fn(() => []),
}));
vi.mock('../../_utils/filterSavedItems', () => ({
	filterSavedItems: vi.fn(() => []),
}));
vi.mock('../../_utils/rankTagOptions', () => ({
	rankTagOptions: vi.fn(() => []),
}));
vi.mock('../TagFilter/TagFilter', () => ({
	TagFilter: vi.fn(() => <div data-testid="tags" />),
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
vi.mock('../LinkModeBanner/LinkModeBanner', () => ({
	LinkModeBanner: vi.fn(() => <div data-testid="banner" />),
}));

const tacos: SavedItem = {
	_id: 'tacos',
	name: 'Black Bean Tacos',
	kind: 'recipe',
	tags: [],
};

const soup = makeDishDraft({ key: 'soup', name: 'chicken' });

const renderColumn = (linkingDish: DishDraft | null = null) =>
	render(
		<SavedRecipesColumn
			linkingDish={linkingDish}
			linkedIds={new Set()}
			onCancelLinking={vi.fn()}
			onPick={vi.fn()}
		/>,
	);

const criteriaHandlers = () =>
	vi.mocked(useSavedItemCriteria).mock.results.at(-1)?.value[1];

describe('SavedRecipesColumn', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows no banner, and has its results add, outside link mode', () => {
		renderColumn();

		expect(useSavedItemCriteria).toHaveBeenLastCalledWith(null);
		expect(screen.queryByTestId('banner')).toBeNull();
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0].linking).toBe(false);
	});

	it('follows the dish being linked, naming it in the banner and having its results link, even with no name', () => {
		const nameless = makeDishDraft({ key: 'nameless', name: '' });
		renderColumn(nameless);

		expect(useSavedItemCriteria).toHaveBeenLastCalledWith(nameless);
		expect(vi.mocked(LinkModeBanner).mock.lastCall?.[0].dishName).toBe('');
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0].linking).toBe(true);
	});

	it('shows the search it holds and changes it as the user types', () => {
		vi.mocked(useSavedItemCriteria).mockReturnValueOnce([
			{ search: 'taco', tagIds: [] },
			{ setSearch: vi.fn(), setTagIds: vi.fn() },
		]);
		renderColumn();

		expect(vi.mocked(SavedSearchInput).mock.lastCall?.[0]).toMatchObject({
			value: 'taco',
			onChange: criteriaHandlers()?.setSearch,
		});
	});

	// The DOM order is the Tab order, so the banner's Cancel, the search and the tags come before the results.
	it('orders the column its label, the banner, the search, the tags, then the results', () => {
		renderColumn(soup);

		const nodes = ['label', 'banner', 'search', 'tags', 'results'].map((id) =>
			screen.getByTestId(id),
		);
		for (let i = 1; i < nodes.length; i++) {
			expect(
				nodes[i - 1].compareDocumentPosition(nodes[i]) &
					Node.DOCUMENT_POSITION_FOLLOWING,
			).toBeTruthy();
		}
	});

	it("lists the planner's saved recipes in order, narrowed by what it holds", () => {
		const criteria = { search: 'taco', tagIds: ['quick'] };
		vi.mocked(useSavedItemCriteria).mockReturnValueOnce([
			criteria,
			{ setSearch: vi.fn(), setTagIds: vi.fn() },
		]);
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		vi.mocked(orderSavedItems).mockReturnValueOnce([tacos]);
		vi.mocked(filterSavedItems).mockReturnValueOnce([tacos]);

		renderColumn();

		expect(orderSavedItems).toHaveBeenCalledWith([tacos]);
		expect(filterSavedItems).toHaveBeenCalledWith([tacos], criteria);
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0]).toMatchObject({
			results: [tacos],
			hasSavedItems: true,
		});
	});

	it("counts the tags over the results, so the filter offers only tags that would return something, and selects with the column's tags", () => {
		const criteria = { search: 'taco', tagIds: ['quick'] };
		const savedItems = [tacos, { ...tacos, _id: 'other' }];
		vi.mocked(useSavedItemCriteria).mockReturnValueOnce([
			criteria,
			{ setSearch: vi.fn(), setTagIds: vi.fn() },
		]);
		vi.mocked(usePlannerSavedItems).mockReturnValue(savedItems);
		vi.mocked(filterSavedItems).mockReturnValueOnce([tacos]);

		renderColumn();

		expect(rankTagOptions).toHaveBeenCalledWith({
			countOver: [tacos],
			savedItems,
			selectedIds: ['quick'],
		});
		expect(vi.mocked(TagFilter).mock.lastCall?.[0]).toMatchObject({
			value: ['quick'],
			onChange: criteriaHandlers()?.setTagIds,
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
