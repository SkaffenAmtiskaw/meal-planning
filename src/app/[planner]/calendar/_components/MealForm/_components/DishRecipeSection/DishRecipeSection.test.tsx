import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeDish, makeDishDraft } from '#fixtures/dish';
import type { DishSource } from '@/_actions/calendar/types';

import { DishRecipeSection } from './DishRecipeSection';

import { useDish } from '../../_hooks/useDish';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
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

const renderSection = (source: DishSource | null) => {
	const dish = makeDish({ dish: makeDishDraft({ key: 'soup', source }) });
	vi.mocked(useDish).mockReturnValue(dish);
	render(<DishRecipeSection />);
	return dish;
};

describe('DishRecipeSection', () => {
	it('starts linking the dish from Change', () => {
		const dish = renderSection({ kind: 'saved', savedId: 'saved-1' });

		fireEvent.click(screen.getByRole('button', { name: 'Change' }));

		expect(dish.startLinking).toHaveBeenCalledWith('soup');
	});

	it('starts linking the dish from "Link a saved recipe"', () => {
		const dish = renderSection(null);

		fireEvent.click(
			screen.getByRole('button', { name: 'Link a saved recipe' }),
		);

		expect(dish.startLinking).toHaveBeenCalledWith('soup');
	});

	it('unlinks a saved recipe from Remove', () => {
		const dish = renderSection({ kind: 'saved', savedId: 'saved-1' });

		fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

		expect(dish.unlinkDish).toHaveBeenCalledWith('soup');
		expect(screen.queryByPlaceholderText('URL, or book and page')).toBeNull();
	});

	it("shows the reference field, filled with the reference, and sets the dish's reference to what is typed", () => {
		const dish = renderSection({ kind: 'reference', text: 'p. 12' });
		const field = screen.getByPlaceholderText(
			'URL, or book and page',
		) as HTMLInputElement;
		expect(field.value).toBe('p. 12');

		fireEvent.change(field, { target: { value: 'p. 14' } });

		expect(dish.setReference).toHaveBeenCalledWith('soup', 'p. 14');
	});

	it('leaves the reference field empty while nothing is linked', () => {
		renderSection(null);

		const field = screen.getByPlaceholderText(
			'URL, or book and page',
		) as HTMLInputElement;
		expect(field.value).toBe('');
	});
});
