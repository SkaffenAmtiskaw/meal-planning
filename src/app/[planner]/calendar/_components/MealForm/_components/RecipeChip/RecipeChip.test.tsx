import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ButtonHTMLAttributes } from 'react';

import { makeDish, makeDishDraft } from '#fixtures/dish';
import type { DishSource } from '@/_actions/calendar/types';

import { RecipeChip } from './RecipeChip';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useDish } from '../../_hooks/useDish';

vi.mock('@/_components', () => ({
	PillButton: vi.fn((props: ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button type="button" {...props} />
	)),
}));
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

const onTogglePanel = vi.fn();

const renderChip = (source: DishSource | null) => {
	const dish = makeDish({ dish: makeDishDraft({ key: 'soup', source }) });
	vi.mocked(useDish).mockReturnValue(dish);
	render(<RecipeChip onTogglePanel={onTogglePanel} />);
	return dish;
};

describe('RecipeChip', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('reads "Link recipe" while nothing is linked, and starts linking the dish rather than opening the panel', () => {
		const dish = renderChip(null);

		fireEvent.click(screen.getByRole('button', { name: 'Link recipe' }));

		expect(dish.startLinking).toHaveBeenCalledWith('soup');
		expect(onTogglePanel).not.toHaveBeenCalled();
	});

	it("shows a saved recipe's name, in full on hover", () => {
		vi.mocked(usePlannerSavedItems).mockReturnValueOnce([
			{ _id: 'saved-1', name: 'Lemon Herb Chicken', kind: 'recipe', tags: [] },
		]);
		renderChip({ kind: 'saved', savedId: 'saved-1' });

		const chip = screen.getByRole('button', { name: 'Lemon Herb Chicken' });
		expect(chip.getAttribute('title')).toBe('Lemon Herb Chicken');
	});

	it('shows a reference without its protocol, and in full on hover', () => {
		renderChip({ kind: 'reference', text: 'https://example.com/soup' });

		const chip = screen.getByRole('button', { name: 'example.com/soup' });
		expect(chip.getAttribute('title')).toBe('https://example.com/soup');
	});

	it('opens or closes the panel once something is linked', () => {
		const dish = renderChip({ kind: 'reference', text: 'p. 12' });

		fireEvent.click(screen.getByRole('button', { name: 'p. 12' }));

		expect(onTogglePanel).toHaveBeenCalledTimes(1);
		expect(dish.startLinking).not.toHaveBeenCalled();
	});
});
