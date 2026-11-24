import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';
import { useFocusOnExpand } from '@/_hooks';

import { DishRow } from './DishRow';
import classes from './DishRow.module.css';

import { DishNameInput } from '../DishNameInput/DishNameInput';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('../DishNameInput/DishNameInput', () => ({
	DishNameInput: vi.fn(() => null),
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

const props = {
	dish: makeDishDraft({ name: 'Soup' }),
	canDelete: true,
	onRename: vi.fn(),
	onDelete: vi.fn(),
	onUnlink: vi.fn(),
	onReferenceChange: vi.fn(),
	onNoteChange: vi.fn(),
	onStartLinking: vi.fn(),
};

const panel = () => screen.queryByTestId('dish-panel');

describe('DishRow', () => {
	it('shows the delete button when the dish can be deleted', () => {
		render(<DishRow {...props} />);

		expect(screen.getByRole('button', { name: 'Delete dish' })).toBeDefined();
	});

	it("hides the delete button when it's the meal's last dish", () => {
		render(<DishRow {...props} canDelete={false} />);

		expect(screen.queryByRole('button', { name: 'Delete dish' })).toBeNull();
	});

	it('opens and closes the panel from the arrow', () => {
		render(<DishRow {...props} />);
		expect(panel()).toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Expand dish' }));
		expect(panel()).not.toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Collapse dish' }));
		expect(panel()).toBeNull();
	});

	it('opens and closes the panel from the recipe chip', () => {
		render(<DishRow {...props} />);

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
		render(<DishRow {...props} />);

		fireEvent.click(screen.getByRole('button', { name: 'Note chip' }));
		expect(panel()).not.toBeNull();
		expect(focusNote).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole('button', { name: 'Note chip' }));
		expect(panel()).toBeNull();
		expect(focusNote).toHaveBeenCalledTimes(1);
	});

	it('shows the note under the row only while the panel is closed', () => {
		render(<DishRow {...props} dish={makeDishDraft({ note: 'Buy bread' })} />);
		expect(screen.queryByText('Buy bread')).not.toBeNull();

		fireEvent.click(screen.getByRole('button', { name: 'Expand dish' }));

		expect(screen.queryByText('Buy bread')).toBeNull();
	});

	it('shows no note line for a dish without a note', () => {
		const { container } = render(<DishRow {...props} />);

		expect(container.querySelector('p')).toBeNull();
	});

	it('marks a nameless dish with a red border, a red name field and its message', () => {
		render(<DishRow {...props} nameless />);

		expect(
			screen.getByTestId('dish-row').classList.contains(classes.nameless),
		).toBe(true);
		expect(vi.mocked(DishNameInput)).toHaveBeenLastCalledWith(
			expect.objectContaining({ error: true }),
			undefined,
		);
		expect(screen.queryByText('Name this dish, or delete it.')).not.toBeNull();
	});

	it('shows no error on a dish that has a name or is blank', () => {
		render(<DishRow {...props} />);

		expect(
			screen.getByTestId('dish-row').classList.contains(classes.nameless),
		).toBe(false);
		expect(vi.mocked(DishNameInput)).toHaveBeenLastCalledWith(
			expect.objectContaining({ error: false }),
			undefined,
		);
		expect(screen.queryByText('Name this dish, or delete it.')).toBeNull();
	});

	it('marks the dish being linked, and no other', () => {
		const { rerender } = render(<DishRow {...props} linking />);
		expect(
			screen.getByTestId('dish-row').classList.contains(classes.linking),
		).toBe(true);

		rerender(<DishRow {...props} />);

		expect(
			screen.getByTestId('dish-row').classList.contains(classes.linking),
		).toBe(false);
	});
});
