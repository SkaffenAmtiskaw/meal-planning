import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDishDraft, makeMealDraft } from '#fixtures/dish';
import { useEscapeLayer, useFormFeedback, useIsMobile } from '@/_hooks';

import { MealForm } from './MealForm';

import { DishList } from './_components/DishList/DishList';
import { MealFields } from './_components/MealFields/MealFields';
import { MealFormFooter } from './_components/MealFormFooter/MealFormFooter';
import { SavedRecipesColumn } from './_components/SavedRecipesColumn/SavedRecipesColumn';
import { MealDishesProvider } from './_hooks/useDish';
import { findNamelessDishes } from './_utils/findNamelessDishes';
import { isBlankDish } from './_utils/isBlankDish';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@/_components', () => ({
	FormFeedbackAlert: vi.fn(() => null),
}));
vi.mock('./_components/MealFormLayout/MealFormLayout', () => ({
	MealFormLayout: vi.fn(({ meal, dishes, saved, footer }) => (
		<>
			{meal}
			{dishes}
			{saved}
			{footer}
			<button type="submit">Add Meal</button>
		</>
	)),
}));
vi.mock('./_components/MealFields/MealFields', () => ({
	MealFields: vi.fn(() => null),
}));
vi.mock(
	'./_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);
vi.mock('./_components/DishList/DishList', () => ({
	DishList: vi.fn(() => null),
}));
vi.mock('./_components/MealFormFooter/MealFormFooter', () => ({
	MealFormFooter: vi.fn(() => null),
}));
vi.mock('./_components/SavedRecipesColumn/SavedRecipesColumn', () => ({
	SavedRecipesColumn: vi.fn(() => null),
}));
vi.mock(
	'./_utils/isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_utils/isBlankDish'
		),
);
vi.mock('./_utils/findNamelessDishes', () => ({
	findNamelessDishes: vi.fn(() => []),
}));

const draft = makeMealDraft({
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [makeDishDraft({ name: 'Tacos' })],
});

const savedInput = {
	date: '2026-11-27',
	mealName: 'Taco Night',
	dishes: [{ name: 'Tacos' }],
};

const ok = { ok: true as const, data: undefined };

const chicken = {
	_id: 'saved-1',
	name: 'Lemon Herb Chicken',
	kind: 'recipe' as const,
	tags: [],
};

const dishListProps = () => vi.mocked(DishList).mock.lastCall?.[0];
// What the form gives the rows of its dish list.
const mealDishes = () => vi.mocked(MealDishesProvider).mock.lastCall?.[0].value;
const columnProps = () => vi.mocked(SavedRecipesColumn).mock.lastCall?.[0];

const setField = (field: string, value: string) =>
	act(() =>
		vi
			.mocked(MealFields)
			.mock.lastCall?.[0].onFieldChange(field as 'mealName', value),
	);

describe('MealForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(findNamelessDishes).mockReturnValue([]);
		vi.mocked(isBlankDish).mockReturnValue(false);
		vi.mocked(useIsMobile).mockReturnValue(false);
		// Back to the factory's empty column, after a test that draws the search.
		vi.mocked(SavedRecipesColumn).mockReset();
	});

	it('saves the draft through the save it was given, then reports the saved meal', async () => {
		const save = vi.fn(async () => ok);
		const onSuccess = vi.fn();
		render(
			<MealForm
				initialDraft={draft}
				save={save}
				onSuccess={onSuccess}
				onCancel={vi.fn()}
			/>,
		);

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }));
		});

		expect(save).toHaveBeenCalledWith(savedInput);
		expect(onSuccess).toHaveBeenCalledWith(savedInput);
	});

	it("stops the save while a dish has something in it but no name, and marks that dish's row", async () => {
		const nameless = makeDishDraft({ key: 'nameless', note: 'Buy rolls' });
		vi.mocked(findNamelessDishes).mockReturnValue([nameless]);
		const save = vi.fn(async () => ok);
		render(
			<MealForm
				initialDraft={draft}
				save={save}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(mealDishes()?.namelessKeys).toEqual(new Set());

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }));
		});

		expect(save).not.toHaveBeenCalled();
		expect(mealDishes()?.namelessKeys).toEqual(new Set(['nameless']));
	});

	it("clears a row's mark once its dish has a name", async () => {
		const nameless = makeDishDraft({ key: 'nameless', note: 'Buy rolls' });
		vi.mocked(findNamelessDishes).mockReturnValue([nameless]);
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }));
		});

		vi.mocked(findNamelessDishes).mockReturnValue([]);
		setField('mealName', 'Lunch');

		expect(mealDishes()?.namelessKeys).toEqual(new Set());
	});

	it('leaves blank rows out of the dish list and footer counts', () => {
		const blank = makeDishDraft({ key: 'blank' });
		vi.mocked(isBlankDish).mockImplementation((dish) => dish === blank);
		render(
			<MealForm
				initialDraft={makeMealDraft({
					dishes: [blank, makeDishDraft({ key: 'b', name: 'Soup' })],
				})}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(vi.mocked(MealFormFooter).mock.lastCall?.[0].dishCount).toBe(1);
		expect(vi.mocked(DishList).mock.lastCall?.[0].dishCount).toBe(1);
	});

	it('closes at once after a save, with no countdown', () => {
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(vi.mocked(useFormFeedback)).toHaveBeenCalledWith({
			successDuration: 0,
		});
	});

	it('lets Add Meal be pressed only once Date and Meal name are filled', () => {
		render(
			<MealForm
				initialDraft={makeMealDraft({ date: '2026-11-27' })}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(vi.mocked(MealFormFooter).mock.lastCall?.[0].canSubmit).toBe(false);

		setField('mealName', 'Supper');

		expect(vi.mocked(MealFormFooter).mock.lastCall?.[0].canSubmit).toBe(true);
	});

	it('tells its frame each date picked, and nothing else', () => {
		const onDateChange = vi.fn();
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
				onDateChange={onDateChange}
			/>,
		);
		expect(onDateChange).not.toHaveBeenCalled();

		setField('mealName', 'Burrito Night');
		expect(onDateChange).not.toHaveBeenCalled();

		setField('date', '2026-12-10');
		expect(onDateChange).toHaveBeenCalledExactlyOnceWith('2026-12-10');
	});

	it('works without a frame listening for its date', () => {
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		setField('date', '2026-12-10');

		expect(vi.mocked(MealFields).mock.lastCall?.[0].values.date).toBe(
			'2026-12-10',
		);
	});
	it("adds the saved recipe picked in the column, and tells the column it's on the meal", () => {
		render(
			<MealForm
				initialDraft={draft}
				save={vi.fn()}
				onSuccess={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(vi.mocked(SavedRecipesColumn).mock.lastCall?.[0].linkedIds).toEqual(
			new Set(),
		);

		act(() => columnProps()?.onPick(chicken));

		expect(vi.mocked(DishList).mock.lastCall?.[0].dishes[1]).toMatchObject({
			name: 'Lemon Herb Chicken',
			source: { kind: 'saved', savedId: 'saved-1' },
		});
		expect(vi.mocked(SavedRecipesColumn).mock.lastCall?.[0].linkedIds).toEqual(
			new Set(['saved-1']),
		);
	});

	describe('linking a dish', () => {
		const soup = makeDishDraft({
			key: 'soup',
			name: 'chicken',
			source: { kind: 'reference', text: 'p. 12' },
		});
		const linkingDraft = makeMealDraft({
			date: '2026-11-27',
			mealName: 'Supper',
			dishes: [soup, makeDishDraft({ key: 'bread', name: 'Bread' })],
		});

		const renderForm = () =>
			render(
				<MealForm
					initialDraft={linkingDraft}
					save={vi.fn()}
					onSuccess={vi.fn()}
					onCancel={vi.fn()}
				/>,
			);
		const startLinking = () => act(() => mealDishes()?.startLinking('soup'));

		it('marks the dish, focuses the search, tells the column, and takes Esc from the frame', () => {
			vi.mocked(SavedRecipesColumn).mockImplementation(({ searchRef }) => (
				<input aria-label="Search" ref={searchRef} />
			));
			renderForm();
			expect(useEscapeLayer).toHaveBeenLastCalledWith(false);

			startLinking();

			expect(mealDishes()?.linkingKey).toBe('soup');
			expect(columnProps()?.linkingDish).toEqual(soup);
			expect(document.activeElement).toBe(screen.getByLabelText('Search'));
			expect(useEscapeLayer).toHaveBeenLastCalledWith(true);
		});

		it("opens the dish's saved list on a phone, which has no column to link from", () => {
			vi.mocked(useIsMobile).mockReturnValue(true);
			renderForm();

			startLinking();

			expect(mealDishes()?.linkingKey).toBeNull();
			expect(mealDishes()?.openDishList?.key).toBe('soup');
		});

		it("starts the dish's list afresh on a phone, even while it's open", () => {
			vi.mocked(useIsMobile).mockReturnValue(true);
			renderForm();
			act(() => mealDishes()?.openList('soup'));
			const open = mealDishes()?.openDishList;

			startLinking();

			expect(mealDishes()?.openDishList?.key).toBe('soup');
			expect(mealDishes()?.openDishList?.id).not.toBe(open?.id);
		});

		it('links the picked recipe to the dish, then leaves link mode', () => {
			renderForm();
			startLinking();

			act(() => columnProps()?.onPick(chicken));

			expect(dishListProps()?.dishes).toHaveLength(2);
			expect(dishListProps()?.dishes[0]).toMatchObject({
				name: 'chicken',
				source: { kind: 'saved', savedId: 'saved-1' },
			});
			expect(mealDishes()?.linkingKey).toBeNull();
			expect(columnProps()?.linkingDish).toBeNull();
			expect(useEscapeLayer).toHaveBeenLastCalledWith(false);
		});

		it('leaves link mode on Cancel with the dish unchanged', () => {
			renderForm();
			startLinking();

			act(() => columnProps()?.onCancelLinking());

			expect(mealDishes()?.linkingKey).toBeNull();
			expect(dishListProps()?.dishes[0]).toEqual(soup);
			expect(columnProps()?.linkingDish).toBeNull();
		});
	});

	describe("a phone's saved lists", () => {
		const renderForm = () =>
			render(
				<MealForm
					initialDraft={makeMealDraft({
						dishes: [makeDishDraft({ key: 'soup', name: 'pas' })],
					})}
					save={vi.fn()}
					onSuccess={vi.fn()}
					onCancel={vi.fn()}
				/>,
			);
		const addDish = () => act(() => dishListProps()?.onAddDish());

		it("opens the new dish's list from Add dish", () => {
			vi.mocked(useIsMobile).mockReturnValue(true);
			renderForm();

			addDish();

			const dishes = dishListProps()?.dishes ?? [];
			expect(dishes).toHaveLength(2);
			expect(mealDishes()?.openDishList?.key).toBe(dishes[1].key);
		});

		it('opens no list from Add dish on desktop', () => {
			renderForm();

			addDish();

			expect(mealDishes()?.openDishList).toBeNull();
		});

		it('names and links the dish from the recipe chosen in its list, then closes the list', () => {
			vi.mocked(useIsMobile).mockReturnValue(true);
			renderForm();
			act(() => mealDishes()?.openList('soup'));

			act(() => mealDishes()?.chooseRecipe('soup', chicken));

			expect(dishListProps()?.dishes[0]).toMatchObject({
				name: 'Lemon Herb Chicken',
				source: { kind: 'saved', savedId: 'saved-1' },
			});
			expect(mealDishes()?.openDishList).toBeNull();
			expect(mealDishes()?.linkedIds).toEqual(new Set(['saved-1']));
		});

		it('closes the open list', () => {
			vi.mocked(useIsMobile).mockReturnValue(true);
			renderForm();
			act(() => mealDishes()?.openList('soup'));

			act(() => mealDishes()?.closeList());

			expect(mealDishes()?.openDishList).toBeNull();
		});
	});
});
