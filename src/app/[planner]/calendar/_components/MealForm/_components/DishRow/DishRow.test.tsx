import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDish, makeDishDraft } from '#fixtures/dish';
import { useFocusOnExpand, useIsMobile } from '@/_hooks';

import { DishRow } from './DishRow';
import classes from './DishRow.module.css';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import type { Dish } from '../../_hooks/useDish';
import { useDish } from '../../_hooks/useDish';
import { DishNameInput } from '../DishNameInput/DishNameInput';
import { DishNameSearch } from '../DishNameSearch/DishNameSearch';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
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
vi.mock('../DishNameInput/DishNameInput', () => ({
	DishNameInput: vi.fn(() => null),
}));
vi.mock('../DishNameSearch/DishNameSearch', () => ({
	DishNameSearch: vi.fn(() => null),
}));
vi.mock('../PhoneSavedList/PhoneSavedList', () => ({
	PhoneSavedList: vi.fn(() => <div data-testid="phone-list" />),
}));
vi.mock('../DeleteDishButton/DeleteDishButton', () => ({
	DeleteDishButton: vi.fn(() => <button type="button">Delete dish</button>),
}));
vi.mock('../RecipeChip/RecipeChip', () => ({
	RecipeChip: vi.fn(({ onTogglePanel }: { onTogglePanel: () => void }) => (
		<button type="button" onClick={onTogglePanel}>
			Recipe chip
		</button>
	)),
}));
vi.mock('../NoteChip/NoteChip', () => ({
	NoteChip: vi.fn(({ onTogglePanel }: { onTogglePanel: () => void }) => (
		<button type="button" onClick={onTogglePanel}>
			Note chip
		</button>
	)),
}));
vi.mock('../DishPanel/DishPanel', () => ({
	DishPanel: vi.fn(() => <div data-testid="dish-panel" />),
}));

const soup = makeDishDraft({ name: 'Soup' });

const withDish = (overrides: Partial<Dish> = {}) =>
	vi.mocked(useDish).mockReturnValue(makeDish({ dish: soup, ...overrides }));

const panel = () => screen.queryByTestId('dish-panel');
const phoneList = () => screen.queryByTestId('phone-list');
const recipeChip = () => screen.queryByRole('button', { name: 'Recipe chip' });
const rowHasClass = (className: string) =>
	screen.getByTestId('dish-row').classList.contains(className);

describe('DishRow', () => {
	beforeEach(() => {
		withDish();
	});

	it('shows the delete button when the dish can be deleted', () => {
		render(<DishRow canDelete />);

		expect(screen.getByRole('button', { name: 'Delete dish' })).toBeDefined();
	});

	it("hides the delete button when it's the meal's last dish", () => {
		render(<DishRow canDelete={false} />);

		expect(screen.queryByRole('button', { name: 'Delete dish' })).toBeNull();
	});

	it('opens and closes the panel from the arrow', () => {
		render(<DishRow canDelete />);
		expect(panel()).toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Expand dish' }));
		expect(panel()).not.toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Collapse dish' }));
		expect(panel()).toBeNull();
	});

	it('opens and closes the panel from the recipe chip', () => {
		render(<DishRow canDelete />);

		fireEvent.click(screen.getByRole('button', { name: 'Recipe chip' }));
		expect(panel()).not.toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Recipe chip' }));
		expect(panel()).toBeNull();
	});

	it('focuses the note when the note chip opens the panel, but not when it closes it', () => {
		const focusNote = vi.fn();
		vi.mocked(useFocusOnExpand).mockReturnValue({
			ref: { current: null },
			requestFocus: focusNote,
		});
		render(<DishRow canDelete />);

		fireEvent.click(screen.getByRole('button', { name: 'Note chip' }));
		expect(panel()).not.toBeNull();
		expect(focusNote).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole('button', { name: 'Note chip' }));
		expect(panel()).toBeNull();
		expect(focusNote).toHaveBeenCalledTimes(1);
	});

	it('shows the note under the row only while the panel is closed', () => {
		withDish({ dish: makeDishDraft({ note: 'Buy bread' }) });
		render(<DishRow canDelete />);
		expect(screen.queryByText('Buy bread')).not.toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Expand dish' }));

		expect(screen.queryByText('Buy bread')).toBeNull();
	});

	it('shows no note line for a dish without a note', () => {
		const { container } = render(<DishRow canDelete />);

		expect(container.querySelector('p')).toBeNull();
	});

	it('marks a nameless dish with a red border and its message', () => {
		withDish({ nameless: true });
		render(<DishRow canDelete />);

		expect(rowHasClass(classes.nameless)).toBe(true);
		expect(screen.queryByText('Name this dish, or delete it.')).not.toBeNull();
	});

	it('shows no error on a dish that has a name or is blank', () => {
		render(<DishRow canDelete />);

		expect(rowHasClass(classes.nameless)).toBe(false);
		expect(screen.queryByText('Name this dish, or delete it.')).toBeNull();
	});

	it('marks the dish being linked, and no other', () => {
		withDish({ linking: true });
		const { rerender } = render(<DishRow canDelete />);
		expect(rowHasClass(classes.linking)).toBe(true);

		withDish();
		rerender(<DishRow canDelete />);

		expect(rowHasClass(classes.linking)).toBe(false);
	});

	describe('on a phone', () => {
		beforeEach(() => {
			vi.mocked(useIsMobile).mockReturnValue(true);
		});

		afterEach(() => {
			vi.mocked(useIsMobile).mockReturnValue(false);
			vi.mocked(usePlannerSavedItems).mockReturnValue([]);
		});

		it('searches saved recipes from the name field instead of the desktop field', () => {
			vi.mocked(DishNameInput).mockClear();
			render(<DishRow canDelete />);

			expect(vi.mocked(DishNameSearch)).toHaveBeenCalled();
			expect(vi.mocked(DishNameInput)).not.toHaveBeenCalled();
		});

		it('shows its open list in place of the chips', () => {
			vi.mocked(usePlannerSavedItems).mockReturnValue([
				{ _id: 'oats', name: 'Overnight Oats', kind: 'recipe', tags: [] },
			]);
			const { rerender } = render(<DishRow canDelete />);
			expect(phoneList()).toBeNull();
			expect(recipeChip()).not.toBeNull();

			withDish({ listOpenId: 1 });
			rerender(<DishRow canDelete />);

			expect(phoneList()).not.toBeNull();
			expect(recipeChip()).toBeNull();
			expect(screen.queryByRole('button', { name: 'Expand dish' })).toBeNull();
		});

		it('keeps an open list hidden, and the chips showing, in a planner with no saved recipes until something is typed', () => {
			withDish({ dish: makeDishDraft({ name: ' ' }), listOpenId: 1 });
			const { rerender } = render(<DishRow canDelete />);
			expect(phoneList()).toBeNull();
			expect(recipeChip()).not.toBeNull();

			withDish({ dish: makeDishDraft({ name: 'Soup' }), listOpenId: 1 });
			rerender(<DishRow canDelete />);

			expect(phoneList()).not.toBeNull();
			expect(recipeChip()).toBeNull();
		});

		it('keeps the list through the same open, and starts it afresh on a new one', () => {
			withDish({ listOpenId: 1 });
			const { rerender } = render(<DishRow canDelete />);
			const first = phoneList();

			rerender(<DishRow canDelete />);
			expect(phoneList()).toBe(first);

			withDish({ listOpenId: 2 });
			rerender(<DishRow canDelete />);

			expect(phoneList()).not.toBeNull();
			expect(phoneList()).not.toBe(first);
		});
	});

	it('never shows the phone list on desktop', () => {
		withDish({ listOpenId: 1 });
		render(<DishRow canDelete />);

		expect(phoneList()).toBeNull();
		expect(recipeChip()).not.toBeNull();
	});
});
