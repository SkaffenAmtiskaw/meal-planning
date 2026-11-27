import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useForm } from '@mantine/form';

import { makeDishValues, makeMealValues } from '#fixtures/dish';
import type { SavedItem } from '@/_actions/library/types';

import { useMealDishes } from './useMealDishes';
import { useMealFormContext } from './useMealForm';
import type { DishValues } from './types';

import { isBlankDish } from '../../_utils/isBlankDish';

vi.mock('@mantine/form', async () => await import('#mocks/@mantine/form'));
vi.mock('./useMealForm', () => ({ useMealFormContext: vi.fn() }));
vi.mock(
	'../../_utils/isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_utils/isBlankDish'
		),
);

const soup = makeDishValues({ key: 'soup', name: 'Soup' });
const bread = makeDishValues({ key: 'bread', name: 'Bread' });

const chicken: SavedItem = {
	_id: 'saved-1',
	name: 'Lemon Herb Chicken',
	kind: 'recipe',
	tags: [],
};

// A form holding these dishes, as the meal form's provider would give it.
const withDishes = (dishes: DishValues[]) => {
	const form = useForm({ initialValues: makeMealValues({ dishes }) });
	vi.mocked(useMealFormContext).mockReturnValue(
		form as unknown as ReturnType<typeof useMealFormContext>,
	);
	return form;
};

const renderDishes = () => renderHook(() => useMealDishes()).result.current;

/**
 * Runs the change the hook gave setFieldValue on a dish, as Mantine would on
 * the dish as it is at that moment, and gives back the path and the new dish.
 */
const appliedChange = (
	form: ReturnType<typeof withDishes>,
	dish: DishValues,
) => {
	const [path, change] = vi.mocked(form.setFieldValue).mock.lastCall ?? [];
	return { path, dish: (change as (dish: DishValues) => DishValues)(dish) };
};

describe('useMealDishes', () => {
	beforeEach(() => {
		vi.mocked(isBlankDish).mockReturnValue(false);
	});

	it('adds an empty dish at the end, and gives back its key', () => {
		const form = withDishes([soup]);

		const key = renderDishes().addDish();

		expect(form.insertListItem).toHaveBeenCalledWith('dishes', {
			key,
			name: '',
			source: null,
			note: '',
		});
	});

	it('adds a dish at the end, named after the saved recipe and linked to it', () => {
		const form = withDishes([soup]);

		renderDishes().addLinkedDish(chicken);

		expect(form.insertListItem).toHaveBeenCalledWith(
			'dishes',
			expect.objectContaining({
				name: 'Lemon Herb Chicken',
				source: { kind: 'saved', savedId: 'saved-1' },
				note: '',
			}),
		);
	});

	it('deletes only the dish with that key', () => {
		const form = withDishes([soup, bread]);

		renderDishes().deleteDish('bread');

		expect(form.removeListItem).toHaveBeenCalledWith('dishes', 1);
	});

	it('changes the dish at the place its key is found', () => {
		const form = withDishes([soup, bread]);

		renderDishes().unlinkDish('bread');

		expect(appliedChange(form, bread).path).toBe('dishes.1');
	});

	it('changes the dish as it is when the change runs, not as it was drawn', () => {
		const form = withDishes([soup]);
		renderDishes().setReference('soup', 'p. 12');

		const renamedSince = { ...soup, name: 'Tomato Soup' };

		expect(appliedChange(form, renamedSince).dish).toEqual({
			...renamedSince,
			source: { kind: 'reference', text: 'p. 12' },
		});
	});

	it('names a dish after the chosen recipe and links it, replacing what it had', () => {
		const form = withDishes([soup]);
		const referenced = {
			...soup,
			name: 'pas',
			source: { kind: 'reference', text: 'p. 12' } as const,
		};

		renderDishes().chooseRecipe('soup', chicken);

		expect(appliedChange(form, referenced).dish).toEqual({
			...referenced,
			name: 'Lemon Herb Chicken',
			source: { kind: 'saved', savedId: 'saved-1' },
		});
	});

	it('unlinks a dish, keeping its name', () => {
		const linked = {
			...soup,
			source: { kind: 'saved', savedId: 's1' } as const,
		};
		const form = withDishes([linked]);

		renderDishes().unlinkDish('soup');

		expect(appliedChange(form, linked).dish).toEqual({
			...linked,
			source: null,
		});
	});

	it('leaves a dish with nothing linked once its reference is cleared', () => {
		const referenced = {
			...soup,
			source: { kind: 'reference', text: 'p. 12' } as const,
		};
		const form = withDishes([referenced]);

		renderDishes().setReference('soup', '');

		expect(appliedChange(form, referenced).dish.source).toBeNull();
	});

	describe('renameAndUnlinkDish', () => {
		it('renames the dish and unlinks a saved recipe, since it is now a different dish', () => {
			const linked = {
				...soup,
				source: { kind: 'saved', savedId: 's1' } as const,
			};
			const form = withDishes([linked]);

			renderDishes().renameAndUnlinkDish('soup', 'Pad See Ew');

			expect(appliedChange(form, linked).dish).toEqual({
				...linked,
				name: 'Pad See Ew',
				source: null,
			});
		});

		it('keeps a reference', () => {
			const referenced = {
				...soup,
				source: { kind: 'reference', text: 'p. 12' } as const,
			};
			const form = withDishes([referenced]);

			renderDishes().renameAndUnlinkDish('soup', 'Tomato Soup');

			expect(appliedChange(form, referenced).dish).toEqual({
				...referenced,
				name: 'Tomato Soup',
			});
		});
	});

	describe('linkDish', () => {
		it("links the saved recipe and keeps the dish's name, replacing its reference", () => {
			const referenced = {
				...soup,
				name: 'chicken',
				source: { kind: 'reference', text: 'p. 12' } as const,
			};
			const form = withDishes([referenced]);

			renderDishes().linkDish('soup', chicken);

			expect(appliedChange(form, referenced).dish).toEqual({
				...referenced,
				source: { kind: 'saved', savedId: 'saved-1' },
			});
		});

		it.each([
			'',
			'  ',
		])('names a dish with no name after the recipe (%j)', (name) => {
			const unnamed = { ...soup, name };
			const form = withDishes([unnamed]);

			renderDishes().linkDish('soup', chicken);

			expect(appliedChange(form, unnamed).dish.name).toBe('Lemon Herb Chicken');
		});
	});

	it('gives the saved recipes already on the meal', () => {
		withDishes([
			{ ...soup, source: { kind: 'saved', savedId: 's1' } },
			{ ...bread, source: { kind: 'reference', text: 'p. 12' } },
		]);

		expect(renderDishes().linkedIds).toEqual(new Set(['s1']));
	});

	it('leaves blank rows out of the count', () => {
		const blank = makeDishValues({ key: 'blank' });
		vi.mocked(isBlankDish).mockImplementation((dish) => dish === blank);
		withDishes([blank, soup]);

		expect(renderDishes().dishCount).toBe(1);
	});
});
