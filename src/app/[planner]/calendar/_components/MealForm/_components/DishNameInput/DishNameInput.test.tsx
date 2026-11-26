import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TextInput } from '@mantine/core';

import { makeDish, makeDishDraft } from '#fixtures/dish';

import { DishNameInput } from './DishNameInput';

import { useDish } from '../../_hooks/useDish';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);

describe('DishNameInput', () => {
	it('renames the dish as the user types', () => {
		const dish = makeDish({
			dish: makeDishDraft({ key: 'soup', name: 'Soup' }),
		});
		vi.mocked(useDish).mockReturnValue(dish);
		render(<DishNameInput />);

		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Tomato Soup' },
		});

		expect(dish.renameDish).toHaveBeenCalledWith('soup', 'Tomato Soup');
	});

	it.each([
		true,
		false,
	])('draws the field red only for a nameless dish (%s)', (nameless) => {
		vi.mocked(useDish).mockReturnValue(makeDish({ nameless }));
		render(<DishNameInput />);

		expect(vi.mocked(TextInput)).toHaveBeenLastCalledWith(
			expect.objectContaining({ error: nameless }),
			undefined,
		);
	});
});
