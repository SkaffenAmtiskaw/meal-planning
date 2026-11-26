import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDish, makeDishDraft } from '#fixtures/dish';
import { makeSavedItem } from '#fixtures/savedItem';
import { makeTagFilterOption as option } from '#fixtures/tagFilterOption';

import { PhoneSavedList } from './PhoneSavedList';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import type { Dish } from '../../_hooks/useDish';
import { useDish } from '../../_hooks/useDish';
import { narrowSavedItems } from '../../_utils/narrowSavedItems';
import { AddAsNewDishRow } from '../AddAsNewDishRow/AddAsNewDishRow';
import { PhoneSavedResultRow } from '../PhoneSavedResultRow/PhoneSavedResultRow';
import { PhoneSavedListHeader } from './_components/PhoneSavedListHeader/PhoneSavedListHeader';
import { PhoneTagRow } from './_components/PhoneTagRow/PhoneTagRow';
import { phoneListRows } from './_utils/phoneListRows';
import { phoneListTitle } from './_utils/phoneListTitle';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
vi.mock(
	'../../_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);
vi.mock('../../_utils/narrowSavedItems', () => ({
	narrowSavedItems: vi.fn(() => ({ results: [], tagOptions: [] })),
}));
vi.mock('./_utils/phoneListRows', () => ({
	phoneListRows: vi.fn(() => []),
}));
vi.mock('./_utils/phoneListTitle', () => ({
	phoneListTitle: vi.fn(() => 'From your saved recipes'),
}));
vi.mock('./_components/PhoneSavedListHeader/PhoneSavedListHeader', () => ({
	PhoneSavedListHeader: vi.fn(({ title }) => <div>{title}</div>),
}));
vi.mock('./_components/PhoneTagRow/PhoneTagRow', () => ({
	PhoneTagRow: vi.fn(() => <div data-testid="tag-row" />),
}));
vi.mock('../PhoneSavedResultRow/PhoneSavedResultRow', () => ({
	PhoneSavedResultRow: vi.fn(() => null),
}));
vi.mock('../AddAsNewDishRow/AddAsNewDishRow', () => ({
	AddAsNewDishRow: vi.fn(() => <div data-testid="add-as-new" />),
}));

const tacos = makeSavedItem({ name: 'Black Bean Tacos' });
const oats = makeSavedItem({ name: 'Overnight Oats' });

// The dish's name is what's typed in its field, so it's the list's search.
const withDish = ({
	search = '',
	...overrides
}: Partial<Dish> & { search?: string } = {}) => {
	const dish = makeDish({
		dish: makeDishDraft({ key: 'soup', name: search }),
		...overrides,
	});
	vi.mocked(useDish).mockReturnValue(dish);
	return dish;
};

const title = () => screen.queryByText('From your saved recipes');
const addAsNew = () => screen.queryByTestId('add-as-new');
const tagRow = () => screen.queryByTestId('tag-row');
const pickTags = (tagIds: string[]) =>
	act(() => vi.mocked(PhoneTagRow).mock.lastCall?.[0].onChange(tagIds));
const headerProps = () => vi.mocked(PhoneSavedListHeader).mock.lastCall?.[0];

describe('PhoneSavedList', () => {
	// The list renders again once its ref is set, so each test's rows hold across renders.
	beforeEach(() => {
		vi.mocked(phoneListRows).mockReturnValue([]);
		vi.mocked(narrowSavedItems).mockReturnValue({
			results: [],
			tagOptions: [],
		});
		vi.mocked(PhoneSavedResultRow).mockClear();
		vi.mocked(PhoneSavedListHeader).mockClear();
		withDish();
	});

	it('lists the rows with their title, and marks the ones already on the meal', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos, oats]);
		vi.mocked(phoneListRows).mockReturnValue([tacos, oats]);
		withDish({ linkedIds: new Set(['Overnight Oats']) });
		render(<PhoneSavedList fieldNode={null} />);

		expect(title()).not.toBeNull();
		expect(vi.mocked(PhoneSavedResultRow)).toHaveBeenCalledWith(
			expect.objectContaining({ item: tacos, added: false }),
			undefined,
		);
		expect(vi.mocked(PhoneSavedResultRow)).toHaveBeenCalledWith(
			expect.objectContaining({ item: oats, added: true }),
			undefined,
		);
	});

	it("picks its rows from the planner's saved recipes narrowed by what's typed", () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos, oats]);
		vi.mocked(narrowSavedItems).mockReturnValue({
			results: [tacos],
			tagOptions: [],
		});
		withDish({ search: 'taco' });
		render(<PhoneSavedList fieldNode={null} />);

		const criteria = { search: 'taco', tagIds: [] };
		expect(narrowSavedItems).toHaveBeenLastCalledWith([tacos, oats], criteria);
		expect(phoneListRows).toHaveBeenLastCalledWith([tacos], criteria);
	});

	it('uses the tapped recipe', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		vi.mocked(phoneListRows).mockReturnValue([tacos]);
		const dish = withDish();
		render(<PhoneSavedList fieldNode={null} />);

		vi.mocked(PhoneSavedResultRow).mock.calls[0][0].onUse();

		expect(dish.chooseRecipe).toHaveBeenCalledWith('soup', tacos);
	});

	it('closes the list from its last row, keeping what was typed', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		const dish = withDish({ search: 'Soup' });
		render(<PhoneSavedList fieldNode={null} />);

		vi.mocked(AddAsNewDishRow).mock.lastCall?.[0].onAdd();

		expect(dish.closeList).toHaveBeenCalled();
	});

	it('shows only the last row, untitled, when nothing matches', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		withDish({ search: 'zzz' });
		render(<PhoneSavedList fieldNode={null} />);

		expect(title()).toBeNull();
		expect(addAsNew()).not.toBeNull();
	});

	it('narrows by the picked tags, together with what is typed', () => {
		vi.mocked(usePlannerSavedItems).mockReturnValue([tacos]);
		vi.mocked(phoneListRows).mockReturnValue([tacos]);
		withDish({ search: 'taco' });
		render(<PhoneSavedList fieldNode={null} />);

		pickTags(['quick', 'vegetarian']);

		const criteria = { search: 'taco', tagIds: ['quick', 'vegetarian'] };
		expect(narrowSavedItems).toHaveBeenLastCalledWith([tacos], criteria);
		expect(phoneListRows).toHaveBeenLastCalledWith([], criteria);
	});

	it('titles the list from the search, the rows and the selected tags, in the order the chips give them', () => {
		vi.mocked(phoneListRows).mockReturnValue([tacos]);
		withDish({ search: 'ta' });
		vi.mocked(narrowSavedItems).mockReturnValue({
			results: [tacos],
			tagOptions: [
				option('Quick', true),
				option('Thai', true),
				option('Spicy'),
			],
		});
		render(<PhoneSavedList fieldNode={null} />);

		expect(phoneListTitle).toHaveBeenLastCalledWith({
			search: 'ta',
			selectedTagNames: ['Quick', 'Thai'],
			rows: [tacos],
		});
	});

	it('offers Clear tags only while a tag is selected, and it unselects them all', () => {
		vi.mocked(phoneListRows).mockReturnValue([tacos]);
		render(<PhoneSavedList fieldNode={null} />);
		expect(headerProps()?.onClearTags).toBeUndefined();

		pickTags(['quick']);
		expect(headerProps()?.onClearTags).toBeDefined();
		act(() => headerProps()?.onClearTags?.());

		expect(narrowSavedItems).toHaveBeenLastCalledWith([tacos], {
			search: '',
			tagIds: [],
		});
		expect(headerProps()?.onClearTags).toBeUndefined();
	});

	it('keeps the title, Clear tags and the chips when a selected tag leaves nothing matching', () => {
		vi.mocked(phoneListRows).mockReturnValue([tacos]);
		withDish({ search: 'tacos' });
		render(<PhoneSavedList fieldNode={null} />);

		vi.mocked(phoneListRows).mockReturnValue([]);
		pickTags(['cold']);

		expect(title()).not.toBeNull();
		expect(headerProps()?.onClearTags).toBeDefined();
		expect(tagRow()).not.toBeNull();
		expect(addAsNew()).not.toBeNull();
	});
});
