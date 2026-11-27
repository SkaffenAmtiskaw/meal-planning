import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
	makeDish,
	makeDishLinking,
	makeDishValues,
	makeMealDishes,
} from '#fixtures/dish';
import type { DishSource } from '@/_actions/calendar/types';

import { DishRecipeSection } from './DishRecipeSection';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';
import { useDishLinkingContext } from '../../_hooks/useDishLinking';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);
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

const renderSection = (source: DishSource | null) => {
	vi.mocked(useDish).mockReturnValue(
		makeDish({ dish: makeDishValues({ key: 'soup', source }) }),
	);
	const mealDishes = makeMealDishes();
	vi.mocked(useMealDishes).mockReturnValue(mealDishes);
	const linking = makeDishLinking();
	vi.mocked(useDishLinkingContext).mockReturnValue(linking);
	render(<DishRecipeSection />);
	return { mealDishes, linking };
};

describe('DishRecipeSection', () => {
	it('starts linking the dish from Change', () => {
		const { linking } = renderSection({ kind: 'saved', savedId: 'saved-1' });

		fireEvent.click(screen.getByRole('button', { name: 'Change' }));

		expect(linking.startLinking).toHaveBeenCalledWith('soup');
	});

	it('starts linking the dish from "Link a saved recipe"', () => {
		const { linking } = renderSection(null);

		fireEvent.click(
			screen.getByRole('button', { name: 'Link a saved recipe' }),
		);

		expect(linking.startLinking).toHaveBeenCalledWith('soup');
	});

	it('unlinks a saved recipe from Remove', () => {
		const { mealDishes } = renderSection({ kind: 'saved', savedId: 'saved-1' });

		fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

		expect(mealDishes.unlinkDish).toHaveBeenCalledWith('soup');
		expect(screen.queryByPlaceholderText('URL, or book and page')).toBeNull();
	});

	it("shows the reference field, filled with the reference, and sets the dish's reference to what is typed", () => {
		const { mealDishes } = renderSection({ kind: 'reference', text: 'p. 12' });
		const field = screen.getByPlaceholderText(
			'URL, or book and page',
		) as HTMLInputElement;
		expect(field.value).toBe('p. 12');

		fireEvent.change(field, { target: { value: 'p. 14' } });

		expect(mealDishes.setReference).toHaveBeenCalledWith('soup', 'p. 14');
	});

	it('leaves the reference field empty while nothing is linked', () => {
		renderSection(null);

		const field = screen.getByPlaceholderText(
			'URL, or book and page',
		) as HTMLInputElement;
		expect(field.value).toBe('');
	});
});
