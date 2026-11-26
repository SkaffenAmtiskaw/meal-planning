import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TextInput } from '@mantine/core';

import { makeDish, makeDishDraft } from '#fixtures/dish';

import { DishNameSearch } from './DishNameSearch';

import type { Dish } from '../../_hooks/useDish';
import { useDish } from '../../_hooks/useDish';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);

const chicken = makeDishDraft({ key: 'chicken', name: 'Lemon Herb Chicken' });

const withDish = (overrides: Partial<Dish> = {}) => {
	const dish = makeDish({ dish: chicken, ...overrides });
	vi.mocked(useDish).mockReturnValue(dish);
	return dish;
};

const field = () => screen.getByRole('textbox', { name: 'Dish name' });

describe('DishNameSearch', () => {
	it('renames the dish and opens its list as the user types', () => {
		const dish = withDish();
		render(<DishNameSearch />);

		fireEvent.change(field(), { target: { value: 'Soup' } });

		expect(dish.renameDish).toHaveBeenCalledWith('chicken', 'Soup');
		expect(dish.openList).toHaveBeenCalledWith('chicken');
		expect(dish.unlinkDish).not.toHaveBeenCalled();
	});

	it('unlinks a dish linked to a saved recipe once its name is edited', () => {
		const dish = withDish({
			dish: { ...chicken, source: { kind: 'saved', savedId: 's1' } },
		});
		render(<DishNameSearch />);

		fireEvent.change(field(), { target: { value: 'Lemon Herb Chickens' } });

		expect(dish.unlinkDish).toHaveBeenCalledWith('chicken');
	});

	it('keeps a reference when the name is edited', () => {
		const dish = withDish({
			dish: { ...chicken, source: { kind: 'reference', text: 'p. 12' } },
		});
		render(<DishNameSearch />);

		fireEvent.change(field(), { target: { value: 'Soup' } });

		expect(dish.unlinkDish).not.toHaveBeenCalled();
	});

	it.each([
		true,
		false,
	])('draws the field red only for a nameless dish (%s)', (nameless) => {
		withDish({ nameless });
		render(<DishNameSearch />);

		expect(vi.mocked(TextInput)).toHaveBeenLastCalledWith(
			expect.objectContaining({ error: nameless }),
			undefined,
		);
	});

	it.each(['focus', 'click'] as const)('opens its list on %s', (event) => {
		const dish = withDish();
		render(<DishNameSearch />);

		fireEvent[event](field());

		expect(dish.openList).toHaveBeenCalledWith('chicken');
	});

	it('puts the cursor in the field when its list opens from elsewhere', () => {
		withDish();
		const { rerender } = render(<DishNameSearch />);
		expect(document.activeElement).not.toBe(field());

		withDish({ listOpenId: 1 });
		rerender(<DishNameSearch />);

		expect(document.activeElement).toBe(field());
	});
});
