import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TextInput } from '@mantine/core';

import {
	makeDish,
	makeDishLinking,
	makeDishValues,
	makeMealDishes,
} from '#fixtures/dish';

import { DishNameSearch } from './DishNameSearch';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';
import { useDishLinkingContext } from '../../_hooks/useDishLinking';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);
vi.mock(
	'../../_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);
vi.mock(
	'../../_hooks/useDishLinking',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDishLinking'
		),
);

const chicken = makeDishValues({ key: 'chicken', name: 'Lemon Herb Chicken' });

const setUp = ({
	nameError = null,
	openKey = null,
}: {
	nameError?: string | null;
	openKey?: string | null;
} = {}) => {
	vi.mocked(useDish).mockReturnValue(makeDish({ dish: chicken, nameError }));
	const mealDishes = makeMealDishes();
	vi.mocked(useMealDishes).mockReturnValue(mealDishes);
	const linking = makeDishLinking({
		openDishList: openKey === null ? null : { key: openKey, id: 1 },
	});
	vi.mocked(useDishLinkingContext).mockReturnValue(linking);
	return { mealDishes, linking };
};

const field = () => screen.getByRole('textbox', { name: 'Dish name' });

describe('DishNameSearch', () => {
	it('renames the dish by the rule that unlinks a saved recipe, and opens its list, as the user types', () => {
		const { mealDishes, linking } = setUp();
		render(<DishNameSearch />);

		fireEvent.change(field(), { target: { value: 'Soup' } });

		expect(mealDishes.renameAndUnlinkDish).toHaveBeenCalledWith(
			'chicken',
			'Soup',
		);
		expect(linking.openList).toHaveBeenCalledWith('chicken');
	});

	it.each([
		{ nameError: 'Name this dish, or delete it.', error: true },
		{ nameError: null, error: false },
	])('draws the field red only while the dish has a message ($error)', ({
		nameError,
		error,
	}) => {
		setUp({ nameError });
		render(<DishNameSearch />);

		expect(vi.mocked(TextInput)).toHaveBeenLastCalledWith(
			expect.objectContaining({ error }),
			undefined,
		);
	});

	it.each(['focus', 'click'] as const)('opens its list on %s', (event) => {
		const { linking } = setUp();
		render(<DishNameSearch />);

		fireEvent[event](field());

		expect(linking.openList).toHaveBeenCalledWith('chicken');
	});

	it('puts the cursor in the field when its own list opens from elsewhere', () => {
		setUp({ openKey: 'bread' });
		const { rerender } = render(<DishNameSearch />);
		expect(document.activeElement).not.toBe(field());

		setUp({ openKey: 'chicken' });
		rerender(<DishNameSearch />);

		expect(document.activeElement).toBe(field());
	});
});
