import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDishValues } from '#fixtures/dish';
import { makeTagFilterOption } from '#fixtures/tagFilterOption';
import { listHighlightHandlers } from '#mocks/@/_hooks';
import type { SavedItem } from '@/_actions/library/types';
import { useListHighlight } from '@/_hooks';

import { SavedRecipesColumn } from './SavedRecipesColumn';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import type { DishValues } from '../../../_hooks/useMealForm';
import { useSavedItemCriteria } from '../../_hooks/useSavedItemCriteria';
import { narrowSavedItems } from '../../_utils/narrowSavedItems';
import { savedItemAction } from '../../_utils/savedItemAction';
import { LinkModeBanner } from '../LinkModeBanner/LinkModeBanner';
import { SavedKeyHint } from '../SavedKeyHint/SavedKeyHint';
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
vi.mock('../../_utils/narrowSavedItems', () => ({
	narrowSavedItems: vi.fn(() => ({ results: [], tagOptions: [] })),
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
vi.mock('../SavedKeyHint/SavedKeyHint', () => ({
	SavedKeyHint: vi.fn(() => <div data-testid="hint" />),
}));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('../../_utils/savedItemAction', () => ({
	savedItemAction: vi.fn(() => 'add'),
}));

const tacos: SavedItem = {
	_id: 'tacos',
	name: 'Black Bean Tacos',
	kind: 'recipe',
	tags: [],
};

const oats: SavedItem = {
	_id: 'oats',
	name: 'Overnight Oats',
	kind: 'recipe',
	tags: [],
};

const soup = makeDishValues({ key: 'soup', name: 'chicken' });

const renderColumn = (
	linkingDish: DishValues | null = null,
	{
		linkedIds = new Set<string>(),
		onPick = vi.fn(),
	}: { linkedIds?: ReadonlySet<string>; onPick?: () => void } = {},
) =>
	render(
		<SavedRecipesColumn
			linkingDish={linkingDish}
			linkedIds={linkedIds}
			onCancelLinking={vi.fn()}
			onPick={onPick}
		/>,
	);

// Presses Enter in the search, which runs the highlighted result.
const pressEnter = () =>
	act(() => vi.mocked(SavedSearchInput).mock.lastCall?.[0].onRun());

const showResults = (results: SavedItem[]) =>
	vi.mocked(narrowSavedItems).mockReturnValue({ results, tagOptions: [] });

describe('SavedRecipesColumn', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(narrowSavedItems).mockReturnValue({
			results: [],
			tagOptions: [],
		});
	});

	it('shows no banner, and has its results add, outside link mode', () => {
		renderColumn();

		expect(useSavedItemCriteria).toHaveBeenLastCalledWith(null);
		expect(screen.queryByTestId('banner')).toBeNull();
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0].linking).toBe(false);
	});

	it('follows the dish being linked, naming it in the banner and having its results link, even with no name', () => {
		const nameless = makeDishValues({ key: 'nameless', name: '' });
		renderColumn(nameless);

		expect(useSavedItemCriteria).toHaveBeenLastCalledWith(nameless);
		expect(vi.mocked(LinkModeBanner).mock.lastCall?.[0].dishName).toBe('');
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0].linking).toBe(true);
	});

	// The DOM order is the Tab order, so the banner's Cancel, the search and the tags come before the results.
	it('orders the column its label, the banner, the search, the tags, the key hint, then the results', () => {
		renderColumn(soup);

		const nodes = ['label', 'banner', 'search', 'tags', 'hint', 'results'].map(
			(id) => screen.getByTestId(id),
		);
		for (let i = 1; i < nodes.length; i++) {
			expect(
				nodes[i - 1].compareDocumentPosition(nodes[i]) &
					Node.DOCUMENT_POSITION_FOLLOWING,
			).toBeTruthy();
		}
	});

	it("lists the planner's saved recipes narrowed by what it holds, with the chips counted over them", () => {
		const criteria = { search: 'taco', tagIds: ['quick'] };
		const tagOptions = [makeTagFilterOption('quick', true)];
		vi.mocked(useSavedItemCriteria).mockReturnValueOnce([
			criteria,
			{ setSearch: vi.fn(), setTagIds: vi.fn() },
		]);
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		vi.mocked(narrowSavedItems).mockReturnValueOnce({
			results: [tacos],
			tagOptions,
		});

		renderColumn();

		expect(narrowSavedItems).toHaveBeenCalledWith([tacos], criteria);
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0]).toMatchObject({
			results: [tacos],
			hasSavedItems: true,
		});
		expect(vi.mocked(TagFilter).mock.lastCall?.[0].options).toBe(tagOptions);
	});

	it('highlights over the results, and goes back to the first whenever the search or the tags change', () => {
		showResults([tacos, oats]);
		const criteria = (search: string, tagIds: string[]) =>
			vi.mocked(useSavedItemCriteria).mockReturnValueOnce([
				{ search, tagIds },
				{ setSearch: vi.fn(), setTagIds: vi.fn() },
			]);

		criteria('taco', ['quick']);
		const { rerender } = renderColumn();
		const resetKey = () =>
			vi.mocked(useListHighlight).mock.lastCall?.[0].resetKey;
		const first = resetKey();
		expect(vi.mocked(useListHighlight).mock.lastCall?.[0].count).toBe(2);

		criteria('taco', ['quick']);
		rerender(
			<SavedRecipesColumn
				linkingDish={null}
				linkedIds={new Set()}
				onCancelLinking={vi.fn()}
				onPick={vi.fn()}
			/>,
		);
		expect(resetKey()).toBe(first);

		for (const [search, tagIds] of [
			['tacos', ['quick']],
			['taco', ['quick', 'vegetarian']],
		] as const) {
			criteria(search, [...tagIds]);
			rerender(
				<SavedRecipesColumn
					linkingDish={null}
					linkedIds={new Set()}
					onCancelLinking={vi.fn()}
					onPick={vi.fn()}
				/>,
			);
			expect(resetKey()).not.toBe(first);
		}
	});

	it.each([
		['outside link mode', null, false],
		['while linking', soup, true],
	])('tells the key hint whether a dish is being linked, %s', (_, dish, linking) => {
		renderColumn(dish);

		expect(vi.mocked(SavedKeyHint).mock.lastCall?.[0].linking).toBe(linking);
	});

	it("moves the highlight with the search's ↓ and ↑, and shows it on the results", () => {
		const handlers = listHighlightHandlers();
		vi.mocked(useListHighlight).mockReturnValueOnce([1, handlers]);
		renderColumn();

		expect(vi.mocked(SavedSearchInput).mock.lastCall?.[0]).toMatchObject({
			onMoveDown: handlers.moveNext,
			onMoveUp: handlers.movePrevious,
		});
		expect(vi.mocked(SavedResultList).mock.lastCall?.[0]).toMatchObject({
			highlightedIndex: 1,
			onHover: handlers.highlight,
			itemRef: handlers.itemRef,
		});
	});

	it('runs the highlighted result on Enter', () => {
		showResults([tacos, oats]);
		vi.mocked(useListHighlight).mockReturnValueOnce([
			1,
			listHighlightHandlers(),
		]);
		const onPick = vi.fn();
		renderColumn(null, { linkedIds: new Set(['tacos']), onPick });

		pressEnter();

		expect(savedItemAction).toHaveBeenCalledWith({
			added: false,
			linking: false,
		});
		expect(onPick).toHaveBeenCalledWith(oats);
	});

	it('does nothing on Enter when the highlighted result is already on the meal', () => {
		showResults([tacos]);
		vi.mocked(savedItemAction).mockReturnValueOnce('added');
		const onPick = vi.fn();
		renderColumn(soup, { linkedIds: new Set(['tacos']), onPick });

		pressEnter();

		expect(savedItemAction).toHaveBeenCalledWith({
			added: true,
			linking: true,
		});
		expect(onPick).not.toHaveBeenCalled();
	});

	it('does nothing on Enter with nothing highlighted', () => {
		vi.mocked(useListHighlight).mockReturnValueOnce([
			null,
			listHighlightHandlers(),
		]);
		const onPick = vi.fn();
		renderColumn(null, { onPick });

		pressEnter();

		expect(onPick).not.toHaveBeenCalled();
	});

	it('tells the list when the planner has no saved recipes at all', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([]);

		renderColumn();

		expect(vi.mocked(SavedResultList).mock.lastCall?.[0].hasSavedItems).toBe(
			false,
		);
	});
});
