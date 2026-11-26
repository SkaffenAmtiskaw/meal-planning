import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeDish, makeDishDraft } from '#fixtures/dish';

import { DishPanel } from './DishPanel';

import { useDish } from '../../_hooks/useDish';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../_hooks/useDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_hooks/useDish'
		),
);
vi.mock('../DishRecipeSection/DishRecipeSection', () => ({
	DishRecipeSection: vi.fn(() => null),
}));

describe('DishPanel', () => {
	it("sets the dish's note to what is typed", () => {
		const dish = makeDish({ dish: makeDishDraft({ key: 'soup' }) });
		vi.mocked(useDish).mockReturnValue(dish);
		render(<DishPanel noteRef={{ current: null }} />);

		fireEvent.change(screen.getByPlaceholderText(/Prep reminders/), {
			target: { value: 'Buy bread' },
		});

		expect(dish.setNote).toHaveBeenCalledWith('soup', 'Buy bread');
	});
});
